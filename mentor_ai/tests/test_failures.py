from unittest.mock import patch

import pytest
from mentor_ai.assignments.models import Submission, SubmissionImage
from mentor_ai.grading.tasks import grade_submission_task


@pytest.mark.django_db
def test_mock_gemini_failure_and_celery_retry(submission, dummy_image):
    # Create image so submission is eligible
    SubmissionImage.objects.create(submission=submission, image=dummy_image)
    
    # Mock Gemini to raise an exception
    with patch("mentor_ai.grading.services.genai.Client") as MockClient, \
         patch("mentor_ai.grading.tasks.grade_submission_task.retry") as mock_retry:
        
        mock_instance = MockClient.return_value
        mock_instance.models.generate_content.side_effect = Exception("Gemini API Error")
        
        grade_submission_task(submission.id)
        
        # Ensure it attempted to retry
        mock_retry.assert_called_once()
        submission.refresh_from_db()
        assert submission.status == Submission.Status.CHECKING


@pytest.mark.django_db
def test_submission_status_failed_after_max_retries(submission, dummy_image):
    SubmissionImage.objects.create(submission=submission, image=dummy_image)
    
    with patch("mentor_ai.grading.services.genai.Client") as MockClient, \
         patch("mentor_ai.grading.tasks.grade_submission_task.retry") as mock_retry:
        
        mock_instance = MockClient.return_value
        mock_instance.models.generate_content.side_effect = Exception("Gemini API Error")
        
        from celery.exceptions import MaxRetriesExceededError
        mock_retry.side_effect = MaxRetriesExceededError("Max retries exceeded")
        
        grade_submission_task(submission.id)
        
        # It should catch MaxRetriesExceededError and set status to FAILED
        submission.refresh_from_db()
        assert submission.status == Submission.Status.FAILED
