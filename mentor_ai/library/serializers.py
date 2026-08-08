from rest_framework import serializers
from mentor_ai.library.models import Book

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = (
            "id",
            "title",
            "subject",
            "file",
            "total_pages",
            "status",
            "created_at",
        )
        read_only_fields = ("total_pages", "status", "created_at", "id")
