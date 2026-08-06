from django.urls import include, path
from rest_framework.routers import DefaultRouter

from mentor_ai.classrooms.views import GroupViewSet, StudentViewSet

router = DefaultRouter()
router.register("groups", GroupViewSet, basename="group")
router.register("students", StudentViewSet, basename="student")

urlpatterns = [
    path("", include(router.urls)),
]
