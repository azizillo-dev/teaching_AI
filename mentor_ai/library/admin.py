from django.contrib import admin
from mentor_ai.library.models import Book

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'teacher', 'total_pages', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('title', 'teacher__email', 'teacher__first_name', 'teacher__last_name')
    readonly_fields = ('total_pages', 'status')
