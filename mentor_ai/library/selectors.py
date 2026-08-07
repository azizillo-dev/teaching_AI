from django.shortcuts import get_object_or_404
from django.db.models import QuerySet

from mentor_ai.library.models import Book
from mentor_ai.users.models import User

def book_list(*, teacher: User) -> QuerySet[Book]:
    return Book.objects.filter(teacher=teacher)

def book_get(*, pk, teacher: User) -> Book:
    return get_object_or_404(Book, pk=pk, teacher=teacher)
