from django.shortcuts import get_object_or_404
from django.db.models import QuerySet

from mentor_ai.library.models import Book
from mentor_ai.users.models import User

from mentor_ai.classrooms.models import GroupMembership

def book_list(*, user: User) -> QuerySet[Book]:
    if user.role == 'teacher':
        return Book.objects.filter(teacher=user)
    elif user.role == 'student':
        teacher_ids = GroupMembership.objects.filter(student_profile__user=user).values_list('group__owner_id', flat=True).distinct()
        return Book.objects.filter(teacher_id__in=teacher_ids)
    return Book.objects.none()

def book_get(*, pk, teacher: User) -> Book:
    return get_object_or_404(Book, pk=pk, teacher=teacher)
