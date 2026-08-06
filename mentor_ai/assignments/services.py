from django.core.exceptions import ValidationError
from django.utils import timezone

from mentor_ai.assignments.models import Assignment
from mentor_ai.classrooms.models import Group
from mentor_ai.users.models import User


def _validate_deadline(deadline):
    if deadline <= timezone.now():
        raise ValidationError("Muddat o'tgan vaqtni ko'rsatib bo'lmaydi.")


def _validate_group_ownership(group: Group, teacher: User):
    if group.owner_id != teacher.id:
        raise ValidationError("Siz faqat o'z guruhlaringizga topshiriq yaratishingiz mumkin.")


def assignment_create(
    *,
    group: Group,
    title: str,
    description: str,
    deadline,
    created_by: User,
) -> Assignment:
    _validate_group_ownership(group, created_by)
    _validate_deadline(deadline)

    assignment = Assignment(
        group=group,
        title=title,
        description=description,
        deadline=deadline,
        created_by=created_by,
    )
    assignment.full_clean()
    assignment.save()
    return assignment


def assignment_update(
    *,
    assignment: Assignment,
    title: str | None = None,
    description: str | None = None,
    deadline=None,
    is_active: bool | None = None,
) -> Assignment:
    if title is not None:
        assignment.title = title
    if description is not None:
        assignment.description = description
    if deadline is not None:
        _validate_deadline(deadline)
        assignment.deadline = deadline
    if is_active is not None:
        assignment.is_active = is_active

    assignment.full_clean()
    assignment.save()
    return assignment


def assignment_delete(*, assignment: Assignment) -> None:
    assignment.delete()
