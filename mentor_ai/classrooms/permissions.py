from rest_framework import permissions

from mentor_ai.users.models import User


class IsTeacher(permissions.BasePermission):
    """Faqat Teacher roli bilan kirish mumkin."""

    message = "Faqat o'qituvchilar uchun ruxsat berilgan."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.Role.TEACHER
        )
