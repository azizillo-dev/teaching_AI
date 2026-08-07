import os
import django
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mentor_ai.settings")
django.setup()

from mentor_ai.users.models import User
from mentor_ai.classrooms.models import Group, StudentProfile, GroupMembership
from mentor_ai.assignments.models import Assignment, Submission
from mentor_ai.grading.models import CheckResult

def run():
    print("Seeding database...")
    
    teacher = User.objects.filter(email='teacher@school.com').first()
    if not teacher:
        print("Teacher not found. Please ensure teacher@school.com exists.")
        return

    student, created = User.objects.get_or_create(
        email='azizillo@student.com',
        defaults={
            'first_name': 'Azizillo',
            'last_name': 'Nabiyev',
            'role': 'student',
            'is_staff': False,
            'is_superuser': False,
        }
    )
    if created:
        student.set_password('student123')
        student.save()
        print("Created student:", student.email)

    profile, _ = StudentProfile.objects.get_or_create(
        user=student,
        defaults={'created_by': teacher}
    )

    group, _ = Group.objects.get_or_create(
        owner=teacher,
        name='11-A',
        defaults={'description': 'Math Class'}
    )
    print("Ensured group:", group.name)

    GroupMembership.objects.get_or_create(
        group=group,
        student_profile=profile
    )

    assignment, _ = Assignment.objects.get_or_create(
        group=group,
        title='Test Assignment',
        defaults={
            'description': 'Solve the math problems.',
            'created_by': teacher,
            'deadline': timezone.now() + timedelta(days=7)
        }
    )
    print("Ensured assignment:", assignment.title)

    submission, _ = Submission.objects.get_or_create(
        assignment=assignment,
        student=student,
        defaults={'status': Submission.Status.CHECKED}
    )
    if submission.status != Submission.Status.CHECKED:
        submission.status = Submission.Status.CHECKED
        submission.save()

    CheckResult.objects.update_or_create(
        submission=submission,
        defaults={
            'score': 30,
            'feedback': 'The uploaded file is a nature photograph. Please submit the actual math homework solving the problem.',
            'ai_model': 'gemini-3-flash',
            'mistakes': [
                {
                    "question": "Solve 2+2",
                    "student_answer": "An image of an autumn landscape",
                    "correct_answer": "4",
                    "ai_explanation": "The submission contains an unrelated photograph instead of the math solution.",
                    "suggestion": "Please upload the correct assignment file."
                }
            ]
        }
    )
    print("Seeded check result matching screenshot.")

if __name__ == "__main__":
    run()
