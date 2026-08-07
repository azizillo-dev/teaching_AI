from rest_framework import viewsets, permissions, status
from rest_framework.response import Response

from mentor_ai.library.models import Book
from mentor_ai.library.serializers import BookSerializer
from mentor_ai.library.permissions import IsTeacher
from mentor_ai.library.selectors import book_list, book_get
from mentor_ai.library.services import book_create

class BookViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated, IsTeacher]
    serializer_class = BookSerializer

    def list(self, request):
        books = book_list(teacher=request.user)
        page = self.paginate_queryset(books)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(books, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            book = book_create(
                teacher=request.user,
                title=serializer.validated_data.get('title'),
                subject=serializer.validated_data.get('subject', ''),
                pdf_file=serializer.validated_data.get('pdf_file'),
            )
            return Response(self.get_serializer(book).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        book = book_get(pk=pk, teacher=request.user)
        serializer = self.get_serializer(book)
        return Response(serializer.data)
