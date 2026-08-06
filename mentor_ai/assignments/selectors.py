from django.db.models import QuerySet

from mentor_ai.assignments.models import Assignment
from mentor_ai.classrooms.models import GroupMembership
from mentor_ai.users.models import User


def assignment_list_for_teacher(*, teacher: User) -> QuerySet[Assignment]:
    return (
        Assignment.objects
        .filter(created_by=teacher)
        .select_related("group")
    )


def assignment_get_for_teacher(*, pk, teacher: User) -> Assignment:
    return (
        Assignment.objects
        .select_related("group")
        .get(pk=pk, created_by=teacher)
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
