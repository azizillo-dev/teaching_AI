from django.contrib import admin

from mentor_ai.assignments.models import (
    Assignment,
    Submission,
    SubmissionImage,
)


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


class SubmissionImageInline(admin.TabularInline):
    model = SubmissionImage
    extra = 0
    readonly_fields = ("id", "image", "created_at")


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "assignment",
        "status",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = (
        "student__email",
        "assignment__title",
    )
    ordering = ("-created_at",)
    raw_id_fields = ("assignment", "student")
    inlines = (SubmissionImageInline,)


@admin.register(SubmissionImage)
class SubmissionImageAdmin(admin.ModelAdmin):
    list_display = ("submission", "image", "created_at")
    ordering = ("-created_at",)
    raw_id_fields = ("submission",)
