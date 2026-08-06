from django.urls import include, path
from rest_framework.routers import DefaultRouter

from mentor_ai.grading.views import (
    StudentCheckResultViewSet,
    TeacherCheckResultViewSet,
)

router = DefaultRouter()
router.register(
    "teacher/results",
    TeacherCheckResultViewSet,
    basename="teacher-result",
)
router.register(
    "student/results",
    StudentCheckResultViewSet,
    basename="student-result",
)

urlpatterns = [
    path("", include(router.urls)),
]
