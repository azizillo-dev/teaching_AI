import pytest
from rest_framework import status
from mentor_ai.assignments.models import Submission
from mentor_ai.grading.models import CheckResult


@pytest.mark.django_db(transaction=True)
def test_complete_end_to_end_flow(
    api_client,
    teacher_user,
    teacher_client,
    student_user,
    student_client,
    dummy_image,
    mock_celery_task,
):
    # 1. Create Group (Teacher)
    response = teacher_client.post(
        "/api/v1/classrooms/groups/",
        {"name": "E2E Test Group", "description": "Group for testing"},
        format="json",
    )
    assert response.status_code == status.HTTP_201_CREATED
    group_id = response.data["id"]

    # 2. Create Student (Teacher)
    # The student_user is already created by fixture, but teacher needs to add them to a group
    # Wait, the student creation endpoint actually creates the user.
    # We will use the existing student_user and just create membership, OR we test the endpoint:
    response = teacher_client.post(
        "/api/v1/classrooms/students/",
        {
            "first_name": "E2E",
            "last_name": "Student",
            "group": group_id,
        },
        format="json",
    )
    assert response.status_code == status.HTTP_201_CREATED
    # Since email is generated, let's just use the student_client for upload, 
    # but the assignment requires a group membership.
    # To keep it simple, we'll manually assign the fixture student to the group via membership.
    from mentor_ai.classrooms.models import StudentProfile, GroupMembership
    student_profile = StudentProfile.objects.create(user=student_user, created_by=teacher_user)
    GroupMembership.objects.create(group_id=group_id, student_profile=student_profile)

    # 3. Create Assignment (Teacher)
    from django.utils import timezone
    from datetime import timedelta
    deadline = timezone.now() + timedelta(days=2)
    response = teacher_client.post(
        "/api/v1/assignments/teacher/assignments/",
        {
            "group": group_id,
            "title": "E2E Assignment",
            "description": "Do this homework",
            "deadline": deadline.isoformat(),
        },
        format="json",
    )
    assert response.status_code == status.HTTP_201_CREATED
    assignment_id = response.data["id"]

    # 4. Student views assignments
    response = student_client.get("/api/v1/assignments/student/assignments/")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["id"] == assignment_id

    # 5. Submit Homework (Student)
    response = student_client.post(
        "/api/v1/assignments/student/submissions/",
        {"assignment": assignment_id},
        format="json",
    )
    assert response.status_code == status.HTTP_201_CREATED
    submission_id = response.data["id"]

    # 6. Upload Images (Student)
    response = student_client.post(
        f"/api/v1/assignments/student/submissions/{submission_id}/upload/",
        {"images": [dummy_image]},
        format="multipart",
    )
    print(response.data)
    assert response.status_code == status.HTTP_200_OK
    submission = Submission.objects.get(id=submission_id)
    assert submission.status == Submission.Status.SUBMITTED
    mock_celery_task.assert_called_once_with(submission.id)


    # 7. Mock AI Evaluation Execution
    # We simulate Celery picking up the task
    from mentor_ai.grading.tasks import grade_submission_task
    # We mock Gemini during the execution
    from unittest.mock import patch
    with patch("mentor_ai.grading.services.genai.Client") as MockClient:
        mock_instance = MockClient.return_value
        mock_response = mock_instance.models.generate_content.return_value
        mock_response.text = '{"score": 90, "mistakes": [{"question": "1", "reason": "Typo"}], "feedback": "Good"}'
        
        # Execute the celery task synchronously
        grade_submission_task(submission_id)

    submission.refresh_from_db()
    assert submission.status == Submission.Status.CHECKED

    # 8. Teacher views CheckResult
    response = teacher_client.get("/api/v1/grading/teacher/results/")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["score"] == 90
    assert response.data[0]["submission_id"] == str(submission_id)

    # 9. Student views own CheckResult
    response = student_client.get(f"/api/v1/grading/student/results/{response.data[0]['id']}/")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["feedback"] == "Good"
    assert response.data["raw_response"]["score"] == 90
