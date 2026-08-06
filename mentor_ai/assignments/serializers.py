from rest_framework import serializers

from mentor_ai.assignments.models import Assignment, Submission, SubmissionImage


# ──────────────────────────────────────────────
# Assignment Serializers
# ──────────────────────────────────────────────


class AssignmentReadSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(source="group.name", read_only=True)

    class Meta:
        model = Assignment
        fields = (
            "id",
            "group",
            "group_name",
            "title",
            "description",
            "deadline",
            "is_active",
            "created_at",
            "updated_at",
        )


class AssignmentCreateSerializer(serializers.Serializer):
    group = serializers.UUIDField()
    title = serializers.CharField(max_length=255)
    description = serializers.CharField()
    deadline = serializers.DateTimeField()


class AssignmentUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255, required=False)
    description = serializers.CharField(required=False)
    deadline = serializers.DateTimeField(required=False)
    is_active = serializers.BooleanField(required=False)


# ──────────────────────────────────────────────
# Submission Serializers
# ──────────────────────────────────────────────


class SubmissionImageReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubmissionImage
        fields = ("id", "image", "created_at")


class SubmissionReadSerializer(serializers.ModelSerializer):
    images = SubmissionImageReadSerializer(many=True, read_only=True)
    assignment_title = serializers.CharField(
        source="assignment.title", read_only=True,
    )
    group_name = serializers.CharField(
        source="assignment.group.name", read_only=True,
    )
    student_email = serializers.CharField(
        source="student.email", read_only=True,
    )

    class Meta:
        model = Submission
        fields = (
            "id",
            "assignment",
            "assignment_title",
            "group_name",
            "student_email",
            "status",
            "images",
            "created_at",
            "updated_at",
        )


class SubmissionCreateSerializer(serializers.Serializer):
    assignment = serializers.UUIDField()


class SubmissionUploadSerializer(serializers.Serializer):
    images = serializers.ListField(
        child=serializers.ImageField(),
        min_length=1,
    )
