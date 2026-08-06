from django.db.models import QuerySet

from mentor_ai.classrooms.models import Group, StudentProfile
from mentor_ai.users.models import User


from django.db.models import Avg, Count
from django.db.models.functions import Coalesce

def group_list(*, owner: User) -> QuerySet[Group]:
    return Group.objects.filter(owner=owner).annotate(
        student_count=Count("memberships", distinct=True),
        assignment_count=Count("assignments", distinct=True),
        average_score=Coalesce(Avg("assignments__submissions__check_result__score"), 0.0),
    )


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
