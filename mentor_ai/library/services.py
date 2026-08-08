import logging
import pymupdf as fitz  # PyMuPDF
from django.core.files.uploadedfile import UploadedFile

from mentor_ai.library.models import Book

logger = logging.getLogger(__name__)

def book_create(*, teacher, title: str, subject: str, file: UploadedFile) -> Book:
    book = Book.objects.create(
        teacher=teacher,
        title=title,
        subject=subject,
        file=file,
        status=Book.Status.PROCESSING
    )
    
    file_extension = file.name.split('.')[-1].lower() if '.' in file.name else ''
    
    if file_extension == 'pdf':
        try:
            pdf_bytes = file.read()
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
    else:
        # For DOCX and other files, we don't extract total_pages
        book.status = Book.Status.READY
        book.save(update_fields=['status'])
    
    file.seek(0)
    return book

def extract_pages_as_images(*, book: Book, page_start: int, page_end: int) -> list[bytes]:
    if not book.file.name.lower().endswith('.pdf'):
        raise ValueError("Sahifalarni ajratib olish faqat PDF fayllar uchun ishlaydi")
        
    if not book.total_pages:
        raise ValueError("Kitob varaqalari soni aniqlanmagan")
        
    if page_start < 1 or page_end > book.total_pages or page_start > page_end:
        raise ValueError("Noto'g'ri sahifa oralig'i kiritildi")
    
    images_bytes = []
    try:
        with book.file.open("rb") as f:
            pdf_bytes = f.read()
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            
            for page_num in range(page_start - 1, page_end):
                page = doc.load_page(page_num)
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
