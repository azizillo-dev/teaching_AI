from rest_framework import serializers

from mentor_ai.classrooms.models import Group, StudentProfile


# ──────────────────────────────────────────────
# Group Serializers
# ──────────────────────────────────────────────


class GroupOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = (
            "id",
            "name",
            "description",
            "created_at",
            "updated_at",
        )


class GroupCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, default="")


class GroupUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, required=False)
    description = serializers.CharField(required=False)


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


class StudentCreateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)


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
