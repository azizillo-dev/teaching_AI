from rest_framework import permissions

class IsTeacher(permissions.BasePermission):
    """
    Custom permission to only allow teachers to access the views.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'teacher')
