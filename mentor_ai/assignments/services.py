from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from mentor_ai.assignments.models import (
    Assignment,
    Submission,
    SubmissionImage,
)
from mentor_ai.classrooms.models import Group, GroupMembership
from mentor_ai.users.models import User

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB


def _validate_deadline(deadline):
    if deadline <= timezone.now():
        raise ValidationError("Muddat o'tgan vaqtni ko'rsatib bo'lmaydi.")


def _validate_group_ownership(group: Group, teacher: User):
    if group.owner_id != teacher.id:
        raise ValidationError("Siz faqat o'z guruhlaringizga topshiriq yaratishingiz mumkin.")


# ──────────────────────────────────────────────
# Assignment Services
# ──────────────────────────────────────────────


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


# ──────────────────────────────────────────────
# Submission Services
# ──────────────────────────────────────────────


def _validate_submission_eligibility(assignment: Assignment, student: User):
    if not assignment.is_active:
        raise ValidationError("Bu topshiriq faol emas.")

    if assignment.deadline <= timezone.now():
        raise ValidationError("Topshiriq muddati tugagan.")

    is_member = GroupMembership.objects.filter(
        group=assignment.group,
        student_profile__user=student,
    ).exists()
    if not is_member:
        raise ValidationError("Siz bu guruhning a'zosi emassiz.")

    if Submission.objects.filter(assignment=assignment, student=student).exists():
        raise ValidationError("Siz bu topshiriqga allaqachon javob yuborgansiz.")


def _validate_image_file(image_file):
    if image_file.size > MAX_IMAGE_SIZE:
        raise ValidationError(
            f"Rasm hajmi 10 MB dan oshmasligi kerak. "
            f"Joriy hajm: {image_file.size / (1024 * 1024):.1f} MB."
        )


@transaction.atomic
def submission_create(*, assignment: Assignment, student: User) -> Submission:
    _validate_submission_eligibility(assignment, student)

    submission = Submission(
        assignment=assignment,
        student=student,
        status=Submission.Status.PENDING,
    )
    submission.full_clean()
    submission.save()
    return submission


@transaction.atomic
def submission_upload_images(*, submission: Submission, images: list) -> list[SubmissionImage]:
    created_images = []

    for image_file in images:
        _validate_image_file(image_file)

        submission_image = SubmissionImage(
            submission=submission,
            image=image_file,
        )
        submission_image.full_clean()
        submission_image.save()
        created_images.append(submission_image)

    submission.status = Submission.Status.SUBMITTED
    submission.save()

    return created_images
