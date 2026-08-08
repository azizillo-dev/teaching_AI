import collections
from datetime import timedelta

from django.utils import timezone

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
                "submission_id": str(sub.id),
                "assignment_id": str(sub.assignment.id),
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

from mentor_ai.library.models import Book

def get_student_dashboard_data(*, student: User) -> dict:
    try:
        profile = student.student_profile
    except StudentProfile.DoesNotExist:
        return {}

    memberships = profile.memberships.select_related("group__owner")
    if not memberships.exists():
        teacher = profile.created_by
        return {
            "groups": [],
            "assignments": {"pending": [], "submitted": [], "completed": []},
            "library": [],
            "leaderboard": [],
            "my_rank": 0,
            "rank_change": 0,
        }

    groups = []
    teachers = set()
    for membership in memberships:
        groups.append({
            "id": str(membership.group.id),
            "name": membership.group.name,
            "teacher_name": f"{membership.group.owner.first_name} {membership.group.owner.last_name}".strip() or membership.group.owner.email,
        })
        teachers.add(membership.group.owner)

    # Assignments
    assignments = Assignment.objects.filter(group__in=[m.group for m in memberships], is_active=True).order_by("deadline")
    pending = []
    submitted = []
    completed = []
    
    for a in assignments:
        sub = a.submissions.filter(student=student).first()
        item = {
            "id": str(a.id),
            "title": a.title,
            "deadline": a.deadline.isoformat(),
            "group_name": a.group.name
        }
        if not sub or sub.status == Submission.Status.PENDING:
            pending.append(item)
        elif sub.status in [Submission.Status.SUBMITTED, Submission.Status.CHECKING]:
            submitted.append(item)
        elif sub.status == Submission.Status.CHECKED:
            item["score"] = sub.check_result.score if hasattr(sub, "check_result") and sub.check_result else 0
            completed.append(item)

    # Library
    books = Book.objects.filter(teacher__in=teachers)
    library = [
        {
            "id": str(b.id),
            "title": b.title,
            "subject": b.subject,
            "teacher_name": f"{b.teacher.first_name} {b.teacher.last_name}".strip() or b.teacher.email
        }
        for b in books
    ]

    # Leaderboard (use first group for now)
    group = memberships.first().group
    group_students = (
        User.objects.filter(student_profile__memberships__group=group)
        .annotate(
            average_score=Coalesce(Avg("submissions__check_result__score", filter=Q(submissions__assignment__group=group)), 0.0)
        )
        .order_by("-average_score")
    )

    leaderboard = []
    my_rank = 0
    for i, s in enumerate(group_students):
        is_me = s.id == student.id
        if is_me:
            my_rank = i + 1
        leaderboard.append({
            "student_id": str(s.id),
            "full_name": f"{s.first_name} {s.last_name}".strip() or s.email,
            "average_score": round(float(s.average_score), 2),
            "is_me": is_me,
        })

    return {
        "groups": groups,
        "assignments": {
            "pending": pending,
            "submitted": submitted,
            "completed": completed
        },
        "library": library,
        "leaderboard": leaderboard,
        "my_rank": my_rank,
        "rank_change": 0, # Since we don't have historical data, return 0 for now
    }

def get_teacher_analytics_data(*, teacher: User, group_id: str | None = None) -> dict:
    # 1. Fetch available groups
    groups = Group.objects.filter(owner=teacher).values("id", "name")
    
    selected_group = None
    if group_id:
        selected_group = Group.objects.filter(owner=teacher, id=group_id).first()
    elif groups:
        selected_group = Group.objects.filter(owner=teacher, id=groups[0]["id"]).first()

    top_students = []
    if selected_group:
        student_qs = User.objects.filter(
            student_profile__memberships__group=selected_group,
            is_active=True
        ).annotate(
            average_score=Coalesce(Avg("submissions__check_result__score", filter=Q(submissions__assignment__group=selected_group)), 0.0)
        ).order_by("-average_score")
        
        top_students = [
            {
                "student_id": str(s.id),
                "full_name": f"{s.first_name} {s.last_name}".strip() or s.email,
                "average_score": round(float(s.average_score), 2),
                "initials": f"{s.first_name[0] if s.first_name else ''}{s.last_name[0] if s.last_name else ''}".strip().upper() or "S"
            }
            for s in student_qs
        ]

    # Weekly and Monthly Stats scoped to selected group
    now = timezone.now()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    
    assignment_filter = Q(created_by=teacher)
    if selected_group:
        assignment_filter &= Q(group=selected_group)

    # Weekly
    weekly_assignments = Assignment.objects.filter(assignment_filter, created_at__gte=week_ago)
    weekly_expected = sum(a.group.memberships.filter(student_profile__user__is_active=True).count() for a in weekly_assignments)
    weekly_completed = Submission.objects.filter(
        assignment__in=weekly_assignments,
        status__in=[Submission.Status.SUBMITTED, Submission.Status.CHECKING, Submission.Status.CHECKED]
    ).count()
    weekly_not_completed = max(0, weekly_expected - weekly_completed)
    
    # Monthly
    monthly_assignments = Assignment.objects.filter(assignment_filter, created_at__gte=month_ago)
    monthly_expected = sum(a.group.memberships.filter(student_profile__user__is_active=True).count() for a in monthly_assignments)
    monthly_completed = Submission.objects.filter(
        assignment__in=monthly_assignments,
        status__in=[Submission.Status.SUBMITTED, Submission.Status.CHECKING, Submission.Status.CHECKED]
    ).count()
    monthly_not_completed = max(0, monthly_expected - monthly_completed)
    
    return {
        "groups": [{"id": str(g["id"]), "name": g["name"]} for g in groups],
        "selected_group_id": str(selected_group.id) if selected_group else None,
        "selected_group_name": selected_group.name if selected_group else None,
        "top_students": top_students,
        "weekly_stats": {
            "completed": weekly_completed,
            "not_completed": weekly_not_completed,
            "total": weekly_expected
        },
        "monthly_stats": {
            "completed": monthly_completed,
            "not_completed": monthly_not_completed,
            "total": monthly_expected
        }
    }

