from django.db.models import QuerySet

from mentor_ai.classrooms.models import Group, StudentProfile
from mentor_ai.users.models import User


def group_list(*, owner: User) -> QuerySet[Group]:
    return Group.objects.filter(owner=owner)


def group_get(*, pk, owner: User) -> Group:
    return Group.objects.get(pk=pk, owner=owner)


def student_list(*, teacher: User) -> QuerySet[StudentProfile]:
    return (
        StudentProfile.objects
        .filter(created_by=teacher)
        .select_related("user")
    )


def student_get(*, pk, teacher: User) -> StudentProfile:
    return (
        StudentProfile.objects
        .select_related("user")
        .get(pk=pk, created_by=teacher)
    )
