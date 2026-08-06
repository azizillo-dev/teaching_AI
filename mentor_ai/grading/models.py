from django.db import models

from mentor_ai.assignments.models import Submission
from mentor_ai.core.models import BaseModel


class CheckResult(BaseModel):
    submission = models.OneToOneField(
        Submission,
        on_delete=models.CASCADE,
        related_name="check_result",
    )
    score = models.IntegerField(default=0)
    mistakes = models.JSONField(default=list)
    feedback = models.TextField(default="")
    ai_model = models.CharField(max_length=50)
    processing_time_ms = models.IntegerField(default=0)
    raw_response = models.JSONField(null=True, blank=True)

    class Meta:
        verbose_name = "Check Result"
        verbose_name_plural = "Check Results"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Result for {self.submission}"
