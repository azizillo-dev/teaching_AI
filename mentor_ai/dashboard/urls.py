from django.urls import path

from mentor_ai.dashboard.views import TeacherDashboardAPIView, StudentDashboardAPIView, AnalyticsAPIView

urlpatterns = [
    path(
        "teacher/",
        TeacherDashboardAPIView.as_view(),
        name="teacher-dashboard",
    ),
    path(
        "student/",
        StudentDashboardAPIView.as_view(),
        name="student-dashboard",
    ),
    path(
        "analytics/",
        AnalyticsAPIView.as_view(),
        name="teacher-analytics",
    ),
]
