from rest_framework import permissions

from mentor_ai.users.models import User


class IsTeacherForAssignment(permissions.BasePermission):
    """Topshiriq yaratish, tahrirlash va o'chirish faqat Teacher uchun."""

    message = "Faqat o'qituvchilar topshiriq boshqarishi mumkin."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.Role.TEACHER
        )


class IsStudentForAssignment(permissions.BasePermission):
    """Topshiriqlarni ko'rish faqat Student uchun."""

    message = "Faqat talabalar uchun ruxsat berilgan."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.Role.STUDENT
        )
