import collections

from django.db.models import Avg, Count, Max, Min, Q
from django.db.models.functions import Coalesce

from mentor_ai.assignments.models import Assignment, Submission
from mentor_ai.classrooms.models import Group, StudentProfile
from mentor_ai.grading.models import CheckResult
from mentor_ai.users.models import User


def get_teacher_dashboard_data(*, teacher: User) -> dict:
    # 1. Overview
    total_groups = Group.objects.filter(owner=teacher).count()
    total_students = StudentProfile.objects.filter(created_by=teacher).count()
    total_assignments = Assignment.objects.filter(created_by=teacher).count()
    total_submissions = Submission.objects.filter(assignment__created_by=teacher).count()

    overview = {
        "total_groups": total_groups,
        "total_students": total_students,
        "total_assignments": total_assignments,
        "total_submissions": total_submissions,
    }

    # 2. AI Statistics
    ai_stats_agg = CheckResult.objects.filter(
        submission__assignment__created_by=teacher
    ).aggregate(
        average_score=Coalesce(Avg("score"), 0.0),
        highest_score=Coalesce(Max("score"), 0),
        lowest_score=Coalesce(Min("score"), 0),
    )

    submission_counts_agg = Submission.objects.filter(
        assignment__created_by=teacher
    ).aggregate(
        checked=Count("id", filter=Q(status=Submission.Status.CHECKED)),
        pending=Count(
            "id",
            filter=Q(
                status__in=[
                    Submission.Status.PENDING,
                    Submission.Status.SUBMITTED,
                    Submission.Status.CHECKING,
                ]
            ),
        ),
        failed=Count("id", filter=Q(status=Submission.Status.FAILED)),
    )

    ai_statistics = {
        "average_score": round(float(ai_stats_agg["average_score"]), 2),
        "highest_score": int(ai_stats_agg["highest_score"]),
        "lowest_score": int(ai_stats_agg["lowest_score"]),
        "submissions_checked": int(submission_counts_agg["checked"]),
        "submissions_pending": int(submission_counts_agg["pending"]),
        "submissions_failed": int(submission_counts_agg["failed"]),
    }

    # 3. Group Ranking
    group_ranking_qs = (
        Group.objects.filter(owner=teacher)
        .annotate(
            average_score=Coalesce(Avg("assignments__submissions__check_result__score"), 0.0),
            student_count=Count("memberships", distinct=True),
        )
        .order_by("-average_score")[:10]
    )

    group_ranking = [
        {
            "group_id": str(group.id),
            "group_name": group.name,
            "average_score": round(float(group.average_score), 2),
            "student_count": int(group.student_count),
        }
        for group in group_ranking_qs
    ]

    # 4. Student Ranking
    student_ranking_qs = (
        User.objects.filter(student_profile__created_by=teacher)
        .annotate(
            average_score=Coalesce(Avg("submissions__check_result__score"), 0.0),
            completed_assignments=Count(
                "submissions",
                filter=Q(submissions__status=Submission.Status.CHECKED),
                distinct=True,
            ),
        )
        .order_by("-average_score")[:10]
    )

    student_ranking = [
        {
            "student_id": str(student.id),
            "full_name": f"{student.first_name} {student.last_name}".strip() or student.email,
            "average_score": round(float(student.average_score), 2),
            "completed_assignments": int(student.completed_assignments),
        }
        for student in student_ranking_qs
    ]

    # 5. Common Mistakes
    mistakes_data = CheckResult.objects.filter(
        submission__assignment__created_by=teacher
    ).values_list("mistakes", flat=True)

    mistake_counter = collections.Counter()
    for mistakes_list in mistakes_data:
        if isinstance(mistakes_list, list):
            for mistake_item in mistakes_list:
                if isinstance(mistake_item, dict):
                    reason = mistake_item.get("reason")
                    if reason:
                        mistake_counter[reason] += 1

    common_mistakes = [
        {"mistake": reason, "count": count}
        for reason, count in mistake_counter.most_common()
    ]

    # 6. Recent Activity
    recent_submissions = (
        Submission.objects.filter(assignment__created_by=teacher)
        .select_related(
            "student",
            "assignment",
            "assignment__group",
            "check_result",
        )
        .order_by("-created_at")[:10]
    )

    recent_activity = []
    for sub in recent_submissions:
        score = 0
        if hasattr(sub, "check_result") and sub.check_result:
            score = sub.check_result.score

        recent_activity.append(
            {
                "student": f"{sub.student.first_name} {sub.student.last_name}".strip()
                or sub.student.email,
                "group": sub.assignment.group.name,
                "assignment": sub.assignment.title,
                "score": score,
                "status": sub.status,
                "submitted_at": sub.created_at.isoformat(),
            }
        )

    return {
        "overview": overview,
        "ai_statistics": ai_statistics,
        "group_ranking": group_ranking,
        "student_ranking": student_ranking,
        "common_mistakes": common_mistakes,
        "recent_activity": recent_activity,
    }
