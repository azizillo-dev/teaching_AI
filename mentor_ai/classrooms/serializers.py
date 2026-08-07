from rest_framework import serializers

from mentor_ai.classrooms.models import Group, StudentProfile


# ──────────────────────────────────────────────
# Group Serializers
# ──────────────────────────────────────────────


class GroupOutputSerializer(serializers.ModelSerializer):
    student_count = serializers.IntegerField(read_only=True, default=0)
    assignment_count = serializers.IntegerField(read_only=True, default=0)
    average_score = serializers.FloatField(read_only=True, default=0.0)

    class Meta:
        model = Group
        fields = (
            "id",
            "name",
            "description",
            "student_count",
            "assignment_count",
            "average_score",
            "created_at",
            "updated_at",
            "join_code",
            "join_password",
        )


class GroupCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, default="")
    join_password = serializers.CharField(max_length=128, min_length=4)


class GroupUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, required=False)
    description = serializers.CharField(required=False)


class JoinGroupSerializer(serializers.Serializer):
    join_code = serializers.CharField(max_length=10)
    join_password = serializers.CharField(max_length=128)


# ──────────────────────────────────────────────
# Student Serializers
# ──────────────────────────────────────────────


class StudentOutputSerializer(serializers.Serializer):
    id = serializers.UUIDField(source="user.id")
    profile_id = serializers.UUIDField(source="id")
    email = serializers.EmailField(source="user.email")
    first_name = serializers.CharField(source="user.first_name")
    last_name = serializers.CharField(source="user.last_name")
    is_active = serializers.BooleanField()
    created_at = serializers.DateTimeField()
    group_name = serializers.CharField(required=False, allow_null=True)
    average_score = serializers.FloatField(required=False, default=0.0)


class StudentCreateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    group_id = serializers.UUIDField(required=False, allow_null=True)


class StudentCreateOutputSerializer(serializers.Serializer):
    id = serializers.UUIDField(source="user.id")
    profile_id = serializers.UUIDField(source="user.student_profile.id")
    email = serializers.EmailField()
    password = serializers.CharField()
    first_name = serializers.CharField(source="user.first_name")
    last_name = serializers.CharField(source="user.last_name")


class StudentUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=False)
    last_name = serializers.CharField(max_length=150, required=False)
    is_active = serializers.BooleanField(required=False)
