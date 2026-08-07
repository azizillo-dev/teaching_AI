from rest_framework import serializers

from mentor_ai.assignments.models import Assignment, Submission, SubmissionImage


# ──────────────────────────────────────────────
# Assignment Serializers
# ──────────────────────────────────────────────


class AssignmentReadSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(source="group.name", read_only=True)
    submitted_count = serializers.IntegerField(required=False, default=0)
    total_students = serializers.IntegerField(required=False, default=0)
    average_score = serializers.FloatField(required=False, default=0.0)

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
            "submitted_count",
            "total_students",
            "average_score",
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
    student_id = serializers.UUIDField(
        source="student.id", read_only=True,
    )
    student_email = serializers.CharField(
        source="student.email", read_only=True,
    )
    student_first_name = serializers.CharField(
        source="student.first_name", read_only=True,
    )
    student_last_name = serializers.CharField(
        source="student.last_name", read_only=True,
    )
    score = serializers.IntegerField(
        source="check_result.score", read_only=True, default=0,
    )
    feedback = serializers.CharField(
        source="check_result.feedback", read_only=True, default="",
    )
    mistakes = serializers.SerializerMethodField()

    def get_mistakes(self, obj):
        if not hasattr(obj, "check_result") or not obj.check_result:
            return []
            
        mistakes = obj.check_result.mistakes
        if not isinstance(mistakes, list):
            return []
            
        normalized = []
        for m in mistakes:
            if isinstance(m, dict):
                normalized.append({
                    "question": m.get("question", ""),
                    "student_answer": m.get("student_answer", ""),
                    "correct_answer": m.get("correct_answer", ""),
                    "ai_explanation": m.get("ai_explanation", ""),
                    "suggestion": m.get("suggestion", ""),
                })
            elif isinstance(m, str):
                normalized.append({
                    "question": "",
                    "student_answer": "",
                    "correct_answer": "",
                    "ai_explanation": m,
                    "suggestion": "",
                })
        return normalized

    class Meta:
        model = Submission
        fields = (
            "id",
            "assignment",
            "assignment_title",
            "group_name",
            "student_id",
            "student_email",
            "student_first_name",
            "student_last_name",
            "status",
            "score",
            "feedback",
            "mistakes",
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
