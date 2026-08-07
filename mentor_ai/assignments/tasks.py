import logging
import time

from celery import shared_task
from django.conf import settings
from google import genai
from google.genai import types

from mentor_ai.assignments.models import Assignment
from mentor_ai.library.services import extract_pages_as_images

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=2, default_retry_delay=60)
def extract_assignment_content(self, assignment_id):
    try:
        assignment = Assignment.objects.get(id=assignment_id)
    except Assignment.DoesNotExist:
        logger.error(f"Assignment {assignment_id} does not exist.")
        return

    # Check for cache hit
    existing = Assignment.objects.filter(
        book=assignment.book,
        page_start=assignment.page_start,
        page_end=assignment.page_end,
        extraction_status=Assignment.ExtractionStatus.DONE
    ).exclude(id=assignment.id).first()

    if existing and existing.extracted_content:
        logger.info(f"Cache hit for assignment {assignment_id}. Copying content from {existing.id}.")
        assignment.extracted_content = existing.extracted_content
        assignment.extraction_status = Assignment.ExtractionStatus.DONE
        assignment.save(update_fields=['extracted_content', 'extraction_status'])
        return

    # Cache miss: generate content
    try:
        images_bytes = extract_pages_as_images(
            book=assignment.book, 
            page_start=assignment.page_start, 
            page_end=assignment.page_end
        )
        
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not configured.")
            
        client = genai.Client(api_key=api_key)
        
        prompt_text = "Bu sahifalardagi barcha masala/mashqlarni to'liq matn ko'rinishida ro'yxat qil, har birini raqamlab"
        
        contents = [prompt_text]
        for img_bytes in images_bytes:
            contents.append(
                types.Part.from_bytes(
                    data=img_bytes,
                    mime_type="image/png",
                )
            )

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL_NAME,
            contents=contents,
            config=types.GenerateContentConfig(
                temperature=0.1,
            )
        )
        
        assignment.extracted_content = response.text
        assignment.extraction_status = Assignment.ExtractionStatus.DONE
        assignment.save(update_fields=['extracted_content', 'extraction_status'])
        
    except Exception as exc:
        logger.error(f"Error extracting content for assignment {assignment_id}: {exc}")
        try:
            self.retry(exc=exc)
        except self.MaxRetriesExceededError:
            assignment.extraction_status = Assignment.ExtractionStatus.FAILED
            assignment.save(update_fields=["extraction_status"])
            logger.error(f"Max retries exceeded for assignment {assignment_id} extraction.")
