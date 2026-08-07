from rest_framework import permissions

from mentor_ai.users.models import User


class IsTeacherForDashboard(permissions.BasePermission):
    message = "Faqat o'qituvchilar dashboardga kira oladi."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.Role.TEACHER
        )

class IsStudentForDashboard(permissions.BasePermission):
    message = "Faqat talabalar dashboardga kira oladi."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.Role.STUDENT
        )
