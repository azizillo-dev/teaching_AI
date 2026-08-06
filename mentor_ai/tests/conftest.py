import io
from datetime import timedelta
from unittest.mock import patch

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from rest_framework.test import APIClient

from mentor_ai.assignments.models import Assignment, Submission, SubmissionImage
from mentor_ai.classrooms.models import Group, GroupMembership, StudentProfile
from mentor_ai.users.models import User


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def teacher_user(db):
    user = User.objects.create_user(
        email="teacher@mentor.local",
        password="testpassword123",
        role=User.Role.TEACHER,
    )
    return user


@pytest.fixture
def teacher_client(teacher_user):
    client = APIClient()
    client.force_authenticate(user=teacher_user)
    return client


@pytest.fixture
def teacher2_user(db):
    user = User.objects.create_user(
        email="teacher2@mentor.local",
        password="testpassword123",
        role=User.Role.TEACHER,
    )
    return user


@pytest.fixture
def teacher2_client(teacher2_user):
    client = APIClient()
    client.force_authenticate(user=teacher2_user)
    return client


@pytest.fixture
def student_user(db):
    user = User.objects.create_user(
        email="student@mentor.local",
        password="testpassword123",
        role=User.Role.STUDENT,
    )
    return user


@pytest.fixture
def student_client(student_user):
    client = APIClient()
    client.force_authenticate(user=student_user)
    return client


@pytest.fixture
def group(db, teacher_user):
    return Group.objects.create(
        owner=teacher_user,
        name="Test Group",
        description="Test Group Description",
    )


@pytest.fixture
def student_profile(db, student_user, teacher_user):
    return StudentProfile.objects.create(
        user=student_user,
        created_by=teacher_user,
    )


@pytest.fixture
def group_membership(db, group, student_profile):
    return GroupMembership.objects.create(
        group=group,
        student_profile=student_profile,
    )


@pytest.fixture
def assignment(db, group, teacher_user):
    return Assignment.objects.create(
        group=group,
        title="Test Assignment",
        description="Test Assignment Description",
        deadline=timezone.now() + timedelta(days=1),
        created_by=teacher_user,
        is_active=True,
    )


@pytest.fixture
def submission(db, assignment, student_user):
    return Submission.objects.create(
        assignment=assignment,
        student=student_user,
        status=Submission.Status.PENDING,
    )


@pytest.fixture
def dummy_image():
    import io
    from PIL import Image
    from django.core.files.uploadedfile import SimpleUploadedFile
    
    file_obj = io.BytesIO()
    image = Image.new("RGB", (100, 100), color="red")
    image.save(file_obj, "PNG")
    file_obj.seek(0)
    
    return SimpleUploadedFile(
        name="test_image.png",
        content=file_obj.read(),
        content_type="image/png",
    )


@pytest.fixture
def mock_celery_task():
    with patch("mentor_ai.grading.tasks.grade_submission_task.delay") as mock_task:
        yield mock_task


@pytest.fixture
def mock_gemini():
    with patch("mentor_ai.grading.services.genai.Client") as MockClient:
        mock_client_instance = MockClient.return_value
        mock_response = mock_client_instance.models.generate_content.return_value
        # Default successful response
        mock_response.text = '{"score": 95, "mistakes": [], "feedback": "Great job!"}'
        yield mock_client_instance
