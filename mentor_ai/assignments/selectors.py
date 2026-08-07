from django.db.models import QuerySet

from mentor_ai.assignments.models import Assignment, Submission
from mentor_ai.classrooms.models import GroupMembership
from mentor_ai.users.models import User


# ──────────────────────────────────────────────
# Assignment Selectors
# ──────────────────────────────────────────────


def assignment_list_for_teacher(*, teacher: User) -> QuerySet[Assignment]:
    from django.db.models import Count, Avg, Q
    from django.db.models.functions import Coalesce

    return (
        Assignment.objects.filter(created_by=teacher)
        .select_related("group")
        .annotate(
            total_students=Count("group__memberships", distinct=True),
            submitted_count=Count("submissions", filter=~Q(submissions__status="pending"), distinct=True),
            average_score=Coalesce(Avg("submissions__check_result__score", filter=~Q(submissions__status="pending")), 0.0),
        )
    )


def assignment_get_for_teacher(*, pk, teacher: User) -> Assignment:
    from django.db.models import Count, Avg, Q
    from django.db.models.functions import Coalesce

    return (
        Assignment.objects.filter(pk=pk, created_by=teacher)
        .select_related("group")
        .annotate(
            total_students=Count("group__memberships", distinct=True),
            submitted_count=Count("submissions", filter=~Q(submissions__status="pending"), distinct=True),
            average_score=Coalesce(Avg("submissions__check_result__score", filter=~Q(submissions__status="pending")), 0.0),
        )
        .get()
    )


def assignment_list_for_student(*, student: User) -> QuerySet[Assignment]:
    group_ids = (
        GroupMembership.objects
        .filter(student_profile__user=student)
        .values_list("group_id", flat=True)
    )
    return (
        Assignment.objects
        .filter(group_id__in=group_ids, is_active=True)
        .select_related("group")
    )


def assignment_get_for_student(*, pk, student: User) -> Assignment:
    group_ids = (
        GroupMembership.objects
        .filter(student_profile__user=student)
        .values_list("group_id", flat=True)
    )
    return (
        Assignment.objects
        .select_related("group")
        .get(pk=pk, group_id__in=group_ids, is_active=True)
    )


# ──────────────────────────────────────────────
# Submission Selectors
# ──────────────────────────────────────────────


def submission_list_for_teacher(*, teacher: User) -> QuerySet[Submission]:
    return (
        Submission.objects
        .filter(assignment__created_by=teacher)
        .select_related("assignment", "assignment__group", "student")
        .prefetch_related("images")
    )


def submission_get_for_teacher(*, pk, teacher: User) -> Submission:
    return (
        Submission.objects
        .select_related("assignment", "assignment__group", "student")
        .prefetch_related("images")
        .get(pk=pk, assignment__created_by=teacher)
    )


def submission_get_for_student(*, pk, student: User) -> Submission:
    return (
        Submission.objects
        .select_related("assignment", "assignment__group")
        .prefetch_related("images")
        .get(pk=pk, student=student)
    )


def submission_list_for_student(*, student: User) -> QuerySet[Submission]:
    return (
        Submission.objects
        .filter(student=student)
        .select_related("assignment", "assignment__group")
        .prefetch_related("images")
    )
