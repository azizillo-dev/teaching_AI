from django.urls import include, path
from rest_framework.routers import DefaultRouter

from mentor_ai.classrooms.views import GroupViewSet, StudentViewSet, JoinGroupAPIView

router = DefaultRouter()
router.register("groups", GroupViewSet, basename="group")
router.register("students", StudentViewSet, basename="student")

urlpatterns = [
    path("groups/join/", JoinGroupAPIView.as_view(), name="group-join"),
    path("", include(router.urls)),
]
