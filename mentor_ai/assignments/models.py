from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.db import models

from mentor_ai.classrooms.models import Group
from mentor_ai.core.models import BaseModel


class Assignment(BaseModel):
    class ExtractionStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        DONE = "done", "Done"
        FAILED = "failed", "Failed"

    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name="assignments",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    book = models.ForeignKey(
        "library.Book",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assignments"
    )
    page_start = models.IntegerField(null=True, blank=True)
    page_end = models.IntegerField(null=True, blank=True)
    extracted_content = models.TextField(blank=True)
    extraction_status = models.CharField(
        max_length=10,
        choices=ExtractionStatus.choices,
        default=ExtractionStatus.PENDING,
    )
    
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

    def clean(self):
        super().clean()
        has_description = bool(self.description and self.description.strip())
        has_book = bool(self.book and self.page_start and self.page_end)
        # Note: source_image check depends on if we add image fields here, but MVP logic says: 
        # "source_image, description, book - kamida bittasi to'ldirilmagan bo'lsa ValidationError"
        # Since source_image is not in the model right now (it might be added later), we just check description or book
        
        if not (has_description or has_book):
            raise ValidationError("Kamida tavsif yoki kitob sahifasini kiriting")

        if has_book:
            if self.page_start < 1:
                raise ValidationError({"page_start": "Boshlanish sahifasi 1 dan kichik bo'lishi mumkin emas"})
            if self.page_end < self.page_start:
                raise ValidationError({"page_end": "Tugash sahifasi boshlanish sahifasidan kichik bo'lishi mumkin emas"})

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

