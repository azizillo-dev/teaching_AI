from django.conf import settings
from django.db import models

from mentor_ai.core.models import BaseModel

class Book(BaseModel):
    class Status(models.TextChoices):
        PROCESSING = "processing", "Processing"
        READY = "ready", "Ready"
        FAILED = "failed", "Failed"

    title = models.CharField(max_length=255)
    subject = models.CharField(max_length=255, blank=True)
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="books",
        limit_choices_to={"role": "teacher"},
    )
    pdf_file = models.FileField(upload_to="books/")
    total_pages = models.IntegerField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PROCESSING,
    )

    class Meta:
        verbose_name = "Book"
        verbose_name_plural = "Books"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.teacher.email})"
