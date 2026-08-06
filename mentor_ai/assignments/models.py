from django.conf import settings
from django.core.validators import FileExtensionValidator
from django.db import models

from mentor_ai.classrooms.models import Group
from mentor_ai.core.models import BaseModel


class Assignment(BaseModel):
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name="assignments",
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    deadline = models.DateTimeField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_assignments",
        limit_choices_to={"role": "teacher"},
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Assignment"
        verbose_name_plural = "Assignments"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} — {self.group.name}"


class Submission(BaseModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SUBMITTED = "submitted", "Submitted"
        CHECKING = "checking", "Checking"
        CHECKED = "checked", "Checked"
        FAILED = "failed", "Failed"

    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name="submissions",
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="submissions",
        limit_choices_to={"role": "student"},
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )

    class Meta:
        verbose_name = "Submission"
        verbose_name_plural = "Submissions"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["assignment", "student"],
                name="unique_submission_per_student_assignment",
            )
        ]

    def __str__(self):
        return f"{self.student.email} → {self.assignment.title}"


def submission_image_upload_path(instance, filename):
    return f"submissions/{instance.submission.id}/{filename}"


class SubmissionImage(BaseModel):
    submission = models.ForeignKey(
        Submission,
        on_delete=models.CASCADE,
        related_name="images",
    )
    image = models.ImageField(
        upload_to=submission_image_upload_path,
        validators=[
            FileExtensionValidator(allowed_extensions=["jpg", "jpeg", "png"]),
        ],
    )

    class Meta:
        verbose_name = "Submission Image"
        verbose_name_plural = "Submission Images"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Image — {self.submission}"

