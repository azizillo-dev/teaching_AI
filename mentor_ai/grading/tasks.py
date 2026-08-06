import logging

from celery import shared_task
from django.db import transaction

from mentor_ai.assignments.models import Submission
from mentor_ai.grading.services import GeminiGradingService

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def grade_submission_task(self, submission_id):
    try:
        submission = Submission.objects.get(id=submission_id)
    except Submission.DoesNotExist:
        logger.error(f"Submission {submission_id} does not exist.")
        return

    # Skip if already checked or no images
    if submission.status == Submission.Status.CHECKED:
        return

    if not submission.images.exists():
        logger.warning(f"Submission {submission_id} has no images to grade.")
        return

    # Update status to checking
    submission.status = Submission.Status.CHECKING
    submission.save(update_fields=["status"])

    try:
        service = GeminiGradingService()
        service.grade_submission(submission)
    except Exception as exc:
        logger.error(f"Error grading submission {submission_id}: {exc}")
        try:
            self.retry(exc=exc)
        except self.MaxRetriesExceededError:
            submission.status = Submission.Status.FAILED
            submission.save(update_fields=["status"])
            logger.error(f"Max retries exceeded for submission {submission_id}.")
