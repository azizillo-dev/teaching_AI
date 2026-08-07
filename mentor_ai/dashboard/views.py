from django.core.cache import cache
from rest_framework.response import Response
from rest_framework.views import APIView

from mentor_ai.dashboard.permissions import IsTeacherForDashboard, IsStudentForDashboard
from mentor_ai.dashboard.selectors import get_teacher_dashboard_data, get_student_dashboard_data, get_teacher_analytics_data


class TeacherDashboardAPIView(APIView):
    permission_classes = (IsTeacherForDashboard,)

    def get(self, request):
        cache_key = f"dashboard_teacher_{request.user.id}"
        data = cache.get(cache_key)

        if data is None:
            data = get_teacher_dashboard_data(teacher=request.user)
            cache.set(cache_key, data, 60)  # Cache for 60 seconds

        return Response(data)

class StudentDashboardAPIView(APIView):
    permission_classes = (IsStudentForDashboard,)

    def get(self, request):
        cache_key = f"dashboard_student_{request.user.id}"
        data = cache.get(cache_key)

        if data is None:
            data = get_student_dashboard_data(student=request.user)
            cache.set(cache_key, data, 60)

        return Response(data)

class AnalyticsAPIView(APIView):
    permission_classes = (IsTeacherForDashboard,)

    def get(self, request):
        group_id = request.query_params.get("group_id")
        
        # We can cache based on teacher and group_id
        cache_key = f"analytics_teacher_{request.user.id}_{group_id or 'all'}"
        data = cache.get(cache_key)

        if data is None:
            data = get_teacher_analytics_data(teacher=request.user, group_id=group_id)
            cache.set(cache_key, data, 60)

        return Response(data)
