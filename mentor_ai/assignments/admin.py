from django.contrib import admin

from mentor_ai.assignments.models import Assignment


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "group",
        "created_by",
        "deadline",
        "is_active",
        "created_at",
    )
    list_filter = ("is_active", "deadline", "created_at")
    search_fields = ("title", "group__name", "created_by__email")
    ordering = ("-created_at",)
    raw_id_fields = ("group", "created_by")
