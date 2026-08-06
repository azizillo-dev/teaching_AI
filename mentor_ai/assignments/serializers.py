from rest_framework import serializers

from mentor_ai.assignments.models import Assignment


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
