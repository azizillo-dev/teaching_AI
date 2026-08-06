import pytest
from rest_framework import status


@pytest.mark.django_db
def test_student_cannot_access_teacher_endpoints(student_client):
    response = student_client.get("/api/v1/assignments/teacher/assignments/")
    assert response.status_code == status.HTTP_403_FORBIDDEN

    response = student_client.get("/api/v1/grading/teacher/results/")
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_teacher_cannot_access_student_endpoints(teacher_client):
    response = teacher_client.get("/api/v1/assignments/student/assignments/")
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_teacher_cannot_access_another_teachers_data(
    teacher2_client,
    assignment,
    submission,
):
    # assignment belongs to teacher 1
    response = teacher2_client.get(f"/api/v1/assignments/teacher/assignments/{assignment.id}/")
    assert response.status_code == status.HTTP_404_NOT_FOUND

    response = teacher2_client.get(f"/api/v1/assignments/teacher/submissions/{submission.id}/")
    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_student_can_access_only_own_data(api_client, student_user, assignment, db):
    from mentor_ai.users.models import User
    student2 = User.objects.create_user(
        email="student2@mentor.local",
        password="testpassword123",
        role=User.Role.STUDENT,
    )
    api_client.force_authenticate(user=student2)
    
    response = api_client.get(f"/api/v1/assignments/student/assignments/{assignment.id}/")
    assert response.status_code == status.HTTP_404_NOT_FOUND
