from django.conf import settings
from django.db import models

from mentor_ai.core.models import BaseModel


class Group(BaseModel):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owned_groups",
        limit_choices_to={"role": "teacher"},
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")

    class Meta:
        verbose_name = "Group"
        verbose_name_plural = "Groups"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["owner", "name"],
                name="unique_group_name_per_teacher",
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.owner.email})"


class StudentProfile(BaseModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_profile",
        limit_choices_to={"role": "student"},
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_students",
        limit_choices_to={"role": "teacher"},
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Student Profile"
        verbose_name_plural = "Student Profiles"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} (by {self.created_by.email})"


class GroupMembership(models.Model):
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name="memberships",
    )
    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="memberships",
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Group Membership"
        verbose_name_plural = "Group Memberships"
        ordering = ["-joined_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["group", "student_profile"],
                name="unique_student_per_group",
            )
        ]

    def __str__(self):
        return f"{self.student_profile.user.email} → {self.group.name}"
