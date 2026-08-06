from django.core.cache import cache
from rest_framework.response import Response
from rest_framework.views import APIView

from mentor_ai.dashboard.permissions import IsTeacherForDashboard
from mentor_ai.dashboard.selectors import get_teacher_dashboard_data


class TeacherDashboardAPIView(APIView):
    permission_classes = (IsTeacherForDashboard,)

    def get(self, request):
        cache_key = f"dashboard_teacher_{request.user.id}"
        data = cache.get(cache_key)

        if data is None:
            data = get_teacher_dashboard_data(teacher=request.user)
            cache.set(cache_key, data, 60)  # Cache for 60 seconds

        return Response(data)
