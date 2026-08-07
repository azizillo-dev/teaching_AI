from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from mentor_ai.classrooms.models import Group, StudentProfile
from mentor_ai.classrooms.permissions import IsTeacher
from mentor_ai.classrooms.selectors import (
    group_get,
    group_list,
    student_get,
    student_list,
)
from mentor_ai.classrooms.serializers import (
    GroupCreateSerializer,
    GroupOutputSerializer,
    GroupUpdateSerializer,
    StudentCreateOutputSerializer,
    StudentCreateSerializer,
    StudentOutputSerializer,
    StudentUpdateSerializer,
    JoinGroupSerializer,
)
from mentor_ai.classrooms.services import (
    group_create,
    group_delete,
    group_update,
    student_create,
    student_update,
    student_delete,
    student_join_group,
)


class GroupViewSet(viewsets.ViewSet):
    permission_classes = (IsTeacher,)

    def list(self, request):
        groups = group_list(owner=request.user)
        serializer = GroupOutputSerializer(groups, many=True)
        return Response(serializer.data)

    def create(self, request):
        input_serializer = GroupCreateSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        try:
            group = group_create(
                owner=request.user,
                **input_serializer.validated_data,
            )
        except DjangoValidationError as exc:
            return Response(
                {"detail": exc.messages},
                status=status.HTTP_400_BAD_REQUEST,
            )

        output_serializer = GroupOutputSerializer(group)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        try:
            group = group_get(pk=pk, owner=request.user)
        except (Group.DoesNotExist, ValueError):
            return Response(
                {"detail": "Guruh topilmadi."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = GroupOutputSerializer(group)
        return Response(serializer.data)

    def partial_update(self, request, pk=None):
        try:
            group = group_get(pk=pk, owner=request.user)
        except (Group.DoesNotExist, ValueError):
            return Response(
                {"detail": "Guruh topilmadi."},
                status=status.HTTP_404_NOT_FOUND,
            )

        input_serializer = GroupUpdateSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        try:
            group = group_update(
                group=group,
                **input_serializer.validated_data,
            )
        except DjangoValidationError as exc:
            return Response(
                {"detail": exc.messages},
                status=status.HTTP_400_BAD_REQUEST,
            )

        output_serializer = GroupOutputSerializer(group)
        return Response(output_serializer.data)

    def destroy(self, request, pk=None):
        try:
            group = group_get(pk=pk, owner=request.user)
        except (Group.DoesNotExist, ValueError):
            return Response(
                {"detail": "Guruh topilmadi."},
                status=status.HTTP_404_NOT_FOUND,
            )

        group_delete(group=group)
        return Response(status=status.HTTP_204_NO_CONTENT)


class StudentViewSet(viewsets.ViewSet):
    permission_classes = (IsTeacher,)

    def list(self, request):
        students = student_list(teacher=request.user)
        serializer = StudentOutputSerializer(students, many=True)
        return Response(serializer.data)

    def create(self, request):
        input_serializer = StudentCreateSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        result = student_create(
            teacher=request.user,
            **input_serializer.validated_data,
        )

        output_serializer = StudentCreateOutputSerializer(result)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        try:
            student_profile = student_get(pk=pk, teacher=request.user)
        except (StudentProfile.DoesNotExist, ValueError):
            return Response(
                {"detail": "Talaba topilmadi."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = StudentOutputSerializer(student_profile)
        return Response(serializer.data)

    def partial_update(self, request, pk=None):
        try:
            student_profile = student_get(pk=pk, teacher=request.user)
        except (StudentProfile.DoesNotExist, ValueError):
            return Response(
                {"detail": "Talaba topilmadi."},
                status=status.HTTP_404_NOT_FOUND,
            )

        input_serializer = StudentUpdateSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        try:
            student_profile = student_update(
                student_profile=student_profile,
                **input_serializer.validated_data,
            )
        except DjangoValidationError as exc:
            return Response(
                {"detail": exc.messages},
                status=status.HTTP_400_BAD_REQUEST,
            )

        output_serializer = StudentOutputSerializer(student_profile)
        return Response(output_serializer.data)

    def destroy(self, request, pk=None):
        try:
            student_profile = student_get(pk=pk, teacher=request.user)
        except (StudentProfile.DoesNotExist, ValueError):
            return Response(
                {"detail": "Talaba topilmadi."},
                status=status.HTTP_404_NOT_FOUND,
            )

        student_delete(student_profile=student_profile)
        return Response(status=status.HTTP_204_NO_CONTENT)


class JoinGroupAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        input_serializer = JoinGroupSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        try:
            group = student_join_group(
                student=request.user,
                **input_serializer.validated_data,
            )
        except DjangoValidationError as exc:
            return Response(
                {"detail": exc.messages},
                status=status.HTTP_400_BAD_REQUEST,
            )

        output_serializer = GroupOutputSerializer(group)
        return Response(output_serializer.data, status=status.HTTP_200_OK)

