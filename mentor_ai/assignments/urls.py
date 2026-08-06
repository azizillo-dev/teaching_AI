from django.urls import include, path
from rest_framework.routers import DefaultRouter

from mentor_ai.assignments.views import (
    StudentAssignmentViewSet,
    StudentSubmissionViewSet,
    TeacherAssignmentViewSet,
    TeacherSubmissionViewSet,
)

router = DefaultRouter()
router.register(
    "teacher/assignments",
    TeacherAssignmentViewSet,
    basename="teacher-assignment",
)
router.register(
    "teacher/submissions",
    TeacherSubmissionViewSet,
    basename="teacher-submission",
)
router.register(
    "student/assignments",
    StudentAssignmentViewSet,
    basename="student-assignment",
)
router.register(
    "student/submissions",
    StudentSubmissionViewSet,
    basename="student-submission",
)

urlpatterns = [
    path("", include(router.urls)),
]
