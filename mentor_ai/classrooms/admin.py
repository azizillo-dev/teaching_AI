from django.contrib import admin

from mentor_ai.classrooms.models import Group, GroupMembership, StudentProfile


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "created_at")
    list_filter = ("created_at",)
    search_fields = ("name", "owner__email")
    ordering = ("-created_at",)
    raw_id_fields = ("owner",)


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "created_by", "is_active", "created_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("user__email", "user__first_name", "user__last_name")
    ordering = ("-created_at",)
    raw_id_fields = ("user", "created_by")


@admin.register(GroupMembership)
class GroupMembershipAdmin(admin.ModelAdmin):
    list_display = ("student_profile", "group", "joined_at")
    list_filter = ("joined_at",)
    search_fields = (
        "student_profile__user__email",
        "group__name",
    )
    ordering = ("-joined_at",)
    raw_id_fields = ("group", "student_profile")
