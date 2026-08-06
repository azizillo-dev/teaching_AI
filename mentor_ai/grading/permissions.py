from rest_framework import permissions

from mentor_ai.users.models import User


class IsTeacherForGrading(permissions.BasePermission):
    """O'qituvchi faqat o'z topshiriqlarining natijalarini ko'ra oladi."""

    message = "Faqat o'qituvchilar baholarni ko'ra oladi."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.Role.TEACHER
        )


class IsStudentForGrading(permissions.BasePermission):
    """Talaba faqat o'z baholarini ko'ra oladi."""

    message = "Faqat talabalar o'z baholarini ko'ra oladi."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.Role.STUDENT
        )
