from rest_framework import serializers

from mentor_ai.grading.models import CheckResult


class CheckResultReadSerializer(serializers.ModelSerializer):
    submission_id = serializers.UUIDField(source="submission.id", read_only=True)
    assignment_title = serializers.CharField(
        source="submission.assignment.title", read_only=True
    )
    student_email = serializers.CharField(
        source="submission.student.email", read_only=True
    )

    class Meta:
        model = CheckResult
        fields = (
            "id",
            "submission_id",
            "assignment_title",
            "student_email",
            "score",
            "mistakes",
            "feedback",
            "ai_model",
            "processing_time_ms",
            "raw_response",
            "created_at",
            "updated_at",
        )
