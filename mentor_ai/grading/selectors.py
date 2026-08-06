from django.db.models import QuerySet

from mentor_ai.grading.models import CheckResult
from mentor_ai.users.models import User


def check_result_list_for_teacher(*, teacher: User) -> QuerySet[CheckResult]:
    return (
        CheckResult.objects
        .filter(submission__assignment__created_by=teacher)
        .select_related(
            "submission",
            "submission__assignment",
            "submission__student",
        )
    )


def check_result_get_for_teacher(*, pk, teacher: User) -> CheckResult:
    return (
        CheckResult.objects
        .select_related(
            "submission",
            "submission__assignment",
            "submission__student",
        )
        .get(pk=pk, submission__assignment__created_by=teacher)
    )


def check_result_list_for_student(*, student: User) -> QuerySet[CheckResult]:
    return (
        CheckResult.objects
        .filter(submission__student=student)
        .select_related("submission", "submission__assignment")
    )


def check_result_get_for_student(*, pk, student: User) -> CheckResult:
    return (
        CheckResult.objects
        .select_related("submission", "submission__assignment")
        .get(pk=pk, submission__student=student)
    )
