import pytest
from django.core.cache import cache
from rest_framework import status

from mentor_ai.assignments.models import Assignment, Submission
from mentor_ai.classrooms.models import Group, GroupMembership, StudentProfile
from mentor_ai.grading.models import CheckResult


@pytest.fixture(autouse=True)
def clear_cache():
    cache.clear()


@pytest.mark.django_db
def test_dashboard_empty_state(teacher_client):
    response = teacher_client.get("/api/v1/dashboard/teacher/")
    assert response.status_code == status.HTTP_200_OK
    data = response.data

    assert data["overview"]["total_groups"] == 0
    assert data["overview"]["total_students"] == 0
    assert data["overview"]["total_assignments"] == 0
    assert data["overview"]["total_submissions"] == 0

    assert data["ai_statistics"]["average_score"] == 0.0
    assert data["ai_statistics"]["highest_score"] == 0
    assert data["ai_statistics"]["lowest_score"] == 0
    assert data["ai_statistics"]["submissions_checked"] == 0
    assert data["ai_statistics"]["submissions_pending"] == 0
    assert data["ai_statistics"]["submissions_failed"] == 0

    assert data["group_ranking"] == []
    assert data["student_ranking"] == []
    assert data["common_mistakes"] == []
    assert data["recent_activity"] == []


@pytest.mark.django_db
def test_dashboard_permissions(student_client, api_client):
    response = student_client.get("/api/v1/dashboard/teacher/")
    assert response.status_code == status.HTTP_403_FORBIDDEN

    response = api_client.get("/api/v1/dashboard/teacher/")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_dashboard_success_and_cache(
    teacher_client, teacher_user, student_user, django_assert_max_num_queries
):
    # Setup some data
    group = Group.objects.create(name="Math 101", owner=teacher_user)
    student_profile = StudentProfile.objects.create(user=student_user, created_by=teacher_user)
    GroupMembership.objects.create(group=group, student_profile=student_profile)
    
    from django.utils import timezone
    assignment = Assignment.objects.create(
        group=group,
        title="Algebra",
        description="Solve",
        deadline=timezone.now() + timezone.timedelta(days=1),
        created_by=teacher_user
    )
    
    submission = Submission.objects.create(
        assignment=assignment,
        student=student_user,
        status=Submission.Status.CHECKED
    )
    
    CheckResult.objects.create(
        submission=submission,
        score=95,
        mistakes=[{"reason": "Missed minus sign"}, {"reason": "Calculation error"}, {"reason": "Missed minus sign"}],
        feedback="Good",
        ai_model="gemini-2.0-flash",
        processing_time_ms=1000,
    )

    # The dashboard does 6 queries (overview, ai_stats, group_rank, student_rank, common_mistakes, recent) + maybe auth/session.
    # Let's just assert a reasonable max to ensure no N+1
    with django_assert_max_num_queries(10):
        response = teacher_client.get("/api/v1/dashboard/teacher/")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.data
    
    assert data["overview"]["total_groups"] == 1
    assert data["overview"]["total_students"] == 1
    assert data["overview"]["total_assignments"] == 1
    assert data["overview"]["total_submissions"] == 1

    assert data["ai_statistics"]["average_score"] == 95.0
    assert data["ai_statistics"]["submissions_checked"] == 1

    assert len(data["group_ranking"]) == 1
    assert data["group_ranking"][0]["group_name"] == "Math 101"
    assert data["group_ranking"][0]["average_score"] == 95.0
    assert data["group_ranking"][0]["student_count"] == 1

    assert len(data["student_ranking"]) == 1
    assert data["student_ranking"][0]["average_score"] == 95.0
    assert data["student_ranking"][0]["completed_assignments"] == 1

    assert len(data["common_mistakes"]) == 2
    assert data["common_mistakes"][0]["mistake"] == "Missed minus sign"
    assert data["common_mistakes"][0]["count"] == 2
    
    assert len(data["recent_activity"]) == 1
    assert data["recent_activity"][0]["score"] == 95
    assert data["recent_activity"][0]["status"] == Submission.Status.CHECKED

    # Test Caching
    # Second request should have exactly 0 or 1 query (if session/auth is checked again, though cache hits skip view logic)
    # Actually DRF auth might do 1-2 queries for session/user, but business logic is 0.
    with django_assert_max_num_queries(2):
        cached_response = teacher_client.get("/api/v1/dashboard/teacher/")
    
    assert cached_response.status_code == status.HTTP_200_OK
    assert cached_response.data == response.data
