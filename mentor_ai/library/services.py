import logging
import pymupdf as fitz  # PyMuPDF
from django.core.files.uploadedfile import UploadedFile

from mentor_ai.library.models import Book

logger = logging.getLogger(__name__)

def book_create(*, teacher, title: str, subject: str, pdf_file: UploadedFile) -> Book:
    book = Book.objects.create(
        teacher=teacher,
        title=title,
        subject=subject,
        pdf_file=pdf_file,
        status=Book.Status.PROCESSING
    )
    
    try:
        # Read the file to determine total_pages
        # pdf_file is a Django File object
        pdf_bytes = pdf_file.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        book.total_pages = len(doc)
        book.status = Book.Status.READY
        book.save(update_fields=['total_pages', 'status'])
        doc.close()
    except Exception as e:
        logger.error(f"Failed to open PDF for Book ID {book.id}: {e}")
        book.status = Book.Status.FAILED
        book.save(update_fields=['status'])
        raise ValueError("PDF fayl buzilgan yoki o'qib bo'lmaydi")
    
    # reset file pointer if needed by other components
    pdf_file.seek(0)
    return book

def extract_pages_as_images(*, book: Book, page_start: int, page_end: int) -> list[bytes]:
    if not book.total_pages:
        raise ValueError("Kitob varaqalari soni aniqlanmagan")
        
    if page_start < 1 or page_end > book.total_pages or page_start > page_end:
        raise ValueError("Noto'g'ri sahifa oralig'i kiritildi")
    
    images_bytes = []
    try:
        with book.pdf_file.open("rb") as f:
            pdf_bytes = f.read()
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            
            # fitz pages are 0-indexed
            for page_num in range(page_start - 1, page_end):
                page = doc.load_page(page_num)
                # Zoom for better quality
                zoom = 2.0
                mat = fitz.Matrix(zoom, zoom)
                pix = page.get_pixmap(matrix=mat)
                img_bytes = pix.tobytes("png")
                images_bytes.append(img_bytes)
                
            doc.close()
    except Exception as e:
        logger.error(f"Failed to extract images for Book ID {book.id}: {e}")
        raise ValueError("PDF dan sahifalarni ajratib olishda xatolik yuz berdi")
        
    return images_bytes
