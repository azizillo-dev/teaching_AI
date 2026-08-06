from rest_framework import status, viewsets
from rest_framework.response import Response

from mentor_ai.grading.models import CheckResult
from mentor_ai.grading.permissions import (
    IsStudentForGrading,
    IsTeacherForGrading,
)
from mentor_ai.grading.selectors import (
    check_result_get_for_student,
    check_result_get_for_teacher,
    check_result_list_for_student,
    check_result_list_for_teacher,
)
from mentor_ai.grading.serializers import CheckResultReadSerializer


class TeacherCheckResultViewSet(viewsets.ViewSet):
    permission_classes = (IsTeacherForGrading,)

    def list(self, request):
        results = check_result_list_for_teacher(teacher=request.user)
        serializer = CheckResultReadSerializer(results, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        try:
            result = check_result_get_for_teacher(pk=pk, teacher=request.user)
        except CheckResult.DoesNotExist:
            return Response(
                {"detail": "Natija topilmadi."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = CheckResultReadSerializer(result)
        return Response(serializer.data)


class StudentCheckResultViewSet(viewsets.ViewSet):
    permission_classes = (IsStudentForGrading,)

    def list(self, request):
        results = check_result_list_for_student(student=request.user)
        serializer = CheckResultReadSerializer(results, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        try:
            result = check_result_get_for_student(pk=pk, student=request.user)
        except CheckResult.DoesNotExist:
            return Response(
                {"detail": "Natija topilmadi."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = CheckResultReadSerializer(result)
        return Response(serializer.data)
