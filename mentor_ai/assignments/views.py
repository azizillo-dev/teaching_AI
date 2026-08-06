from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status, viewsets
from rest_framework.response import Response

from mentor_ai.assignments.models import Assignment
from mentor_ai.assignments.permissions import (
    IsStudentForAssignment,
    IsTeacherForAssignment,
)
from mentor_ai.assignments.selectors import (
    assignment_get_for_student,
    assignment_get_for_teacher,
    assignment_list_for_student,
    assignment_list_for_teacher,
)
from mentor_ai.assignments.serializers import (
    AssignmentCreateSerializer,
    AssignmentReadSerializer,
    AssignmentUpdateSerializer,
)
from mentor_ai.assignments.services import (
    assignment_create,
    assignment_delete,
    assignment_update,
)
from mentor_ai.classrooms.models import Group


class TeacherAssignmentViewSet(viewsets.ViewSet):
    permission_classes = (IsTeacherForAssignment,)

    def list(self, request):
        assignments = assignment_list_for_teacher(teacher=request.user)
        serializer = AssignmentReadSerializer(assignments, many=True)
        return Response(serializer.data)

    def create(self, request):
        input_serializer = AssignmentCreateSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        try:
            group = Group.objects.get(
                pk=input_serializer.validated_data["group"],
            )
        except Group.DoesNotExist:
            return Response(
                {"detail": "Guruh topilmadi."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            assignment = assignment_create(
                group=group,
                title=input_serializer.validated_data["title"],
                description=input_serializer.validated_data["description"],
                deadline=input_serializer.validated_data["deadline"],
                created_by=request.user,
            )
        except DjangoValidationError as exc:
            return Response(
                {"detail": exc.messages},
                status=status.HTTP_400_BAD_REQUEST,
            )

        output_serializer = AssignmentReadSerializer(assignment)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        try:
            assignment = assignment_get_for_teacher(pk=pk, teacher=request.user)
        except Assignment.DoesNotExist:
            return Response(
                {"detail": "Topshiriq topilmadi."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AssignmentReadSerializer(assignment)
        return Response(serializer.data)

    def partial_update(self, request, pk=None):
        try:
            assignment = assignment_get_for_teacher(pk=pk, teacher=request.user)
        except Assignment.DoesNotExist:
            return Response(
                {"detail": "Topshiriq topilmadi."},
                status=status.HTTP_404_NOT_FOUND,
            )

        input_serializer = AssignmentUpdateSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        try:
            assignment = assignment_update(
                assignment=assignment,
                **input_serializer.validated_data,
            )
        except DjangoValidationError as exc:
            return Response(
                {"detail": exc.messages},
                status=status.HTTP_400_BAD_REQUEST,
            )

        output_serializer = AssignmentReadSerializer(assignment)
        return Response(output_serializer.data)

    def destroy(self, request, pk=None):
        try:
            assignment = assignment_get_for_teacher(pk=pk, teacher=request.user)
        except Assignment.DoesNotExist:
            return Response(
                {"detail": "Topshiriq topilmadi."},
                status=status.HTTP_404_NOT_FOUND,
            )

        assignment_delete(assignment=assignment)
        return Response(status=status.HTTP_204_NO_CONTENT)


class StudentAssignmentViewSet(viewsets.ViewSet):
    permission_classes = (IsStudentForAssignment,)

    def list(self, request):
        assignments = assignment_list_for_student(student=request.user)
        serializer = AssignmentReadSerializer(assignments, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        try:
            assignment = assignment_get_for_student(pk=pk, student=request.user)
        except Assignment.DoesNotExist:
            return Response(
                {"detail": "Topshiriq topilmadi."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AssignmentReadSerializer(assignment)
        return Response(serializer.data)
