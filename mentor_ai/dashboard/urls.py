from django.urls import path

from mentor_ai.dashboard.views import TeacherDashboardAPIView

urlpatterns = [
    path(
        "teacher/",
        TeacherDashboardAPIView.as_view(),
        name="teacher-dashboard",
    ),
]
