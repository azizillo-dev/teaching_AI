from django.contrib import admin

from mentor_ai.grading.models import CheckResult


@admin.register(CheckResult)
class CheckResultAdmin(admin.ModelAdmin):
    list_display = (
        "submission",
        "score",
        "ai_model",
        "processing_time_ms",
        "created_at",
    )
    list_filter = ("ai_model", "created_at")
    search_fields = (
        "submission__student__email",
        "submission__assignment__title",
    )
    ordering = ("-created_at",)
    raw_id_fields = ("submission",)
