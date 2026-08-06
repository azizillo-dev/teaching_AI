from datetime import timedelta
import pytest
from django.utils import timezone
from rest_framework import status


@pytest.mark.django_db
def test_duplicate_submission_rejected(student_client, assignment, submission, group_membership):
    # Submission already exists via fixture
    response = student_client.post(
        "/api/v1/assignments/student/submissions/",
        {"assignment": assignment.id},
        format="json",
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Siz bu topshiriqga allaqachon javob yuborgansiz" in str(response.data)


@pytest.mark.django_db
def test_expired_assignment_submission_rejected(student_client, assignment, group_membership):
    assignment.deadline = timezone.now() - timedelta(days=1)
    assignment.save()

    response = student_client.post(
        "/api/v1/assignments/student/submissions/",
        {"assignment": assignment.id},
        format="json",
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Topshiriq muddati tugagan" in str(response.data)


@pytest.mark.django_db
def test_student_not_in_group_rejected(student_client, assignment):
    # No group membership
    response = student_client.post(
        "/api/v1/assignments/student/submissions/",
        {"assignment": assignment.id},
        format="json",
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Siz bu guruhning a'zosi emassiz" in str(response.data)


@pytest.mark.django_db
def test_invalid_image_upload(student_client, submission):
    from django.core.files.uploadedfile import SimpleUploadedFile
    invalid_file = SimpleUploadedFile("test.txt", b"hello", content_type="text/plain")
    
    response = student_client.post(
        f"/api/v1/assignments/student/submissions/{submission.id}/upload/",
        {"images": [invalid_file]},
        format="multipart",
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_inactive_assignment_submission_rejected(student_client, assignment, group_membership):
    assignment.is_active = False
    assignment.save()

    response = student_client.post(
        "/api/v1/assignments/student/submissions/",
        {"assignment": assignment.id},
        format="json",
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Bu topshiriq faol emas" in str(response.data)
