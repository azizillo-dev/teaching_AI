from rest_framework import viewsets, permissions, status
from rest_framework.response import Response

from mentor_ai.library.models import Book
from mentor_ai.library.serializers import BookSerializer
from mentor_ai.library.permissions import IsTeacher
from mentor_ai.library.selectors import book_list, book_get
from mentor_ai.library.services import book_create

class BookViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BookSerializer

    def list(self, request):
        books = book_list(user=request.user)
        page = self.paginate_queryset(books)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(books, many=True)
        return Response(serializer.data)

    def create(self, request):
        if request.user.role != 'teacher':
            return Response({"detail": "Faqat o'qituvchilar kitob yuklashi mumkin"}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            book = book_create(
                teacher=request.user,
                title=serializer.validated_data.get('title'),
                subject=serializer.validated_data.get('subject', ''),
                file=serializer.validated_data.get('file'),
            )
            return Response(self.get_serializer(book).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        if request.user.role == 'teacher':
            book = book_get(pk=pk, teacher=request.user)
        else:
            books = book_list(user=request.user)
            book = books.filter(pk=pk).first()
            if not book:
                return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(book)
        return Response(serializer.data)

    def destroy(self, request, pk=None):
        if request.user.role != 'teacher':
            return Response({"detail": "Faqat o'qituvchilar o'chira oladi"}, status=status.HTTP_403_FORBIDDEN)
        book = book_get(pk=pk, teacher=request.user)
        book.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
