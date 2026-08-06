from django.urls import include, path
from rest_framework.routers import DefaultRouter

from mentor_ai.assignments.views import (
    StudentAssignmentViewSet,
    TeacherAssignmentViewSet,
)

router = DefaultRouter()
router.register(
    "teacher/assignments",
    TeacherAssignmentViewSet,
    basename="teacher-assignment",
)
router.register(
    "student/assignments",
    StudentAssignmentViewSet,
    basename="student-assignment",
)

urlpatterns = [
    path("", include(router.urls)),
]
