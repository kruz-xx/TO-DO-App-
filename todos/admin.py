"""
Django Administration Site Configuration for the TODO IST Application.

Registers and customizes ModelAdmin interfaces for:
- Todo: With inline status/priority editing, filtering, and relational search.
- MoodLog: With date and mood filtering and user-based search.
- Meeting: With date filtering and attendee/note search.
"""

from django.contrib import admin
from .models import Todo, MoodLog, Meeting


# Customize how Todo records are displayed and managed in Django's built-in Admin panel
@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user', 'priority', 'completed', 'due_date', 'due_time', 'created_at')
    list_filter = ('completed', 'priority', 'user', 'due_date')
    # Use double underscore (user__username) to search through ForeignKey relationships
    search_fields = ('title', 'description', 'labels', 'user__username')
    # Allows fast status/priority editing directly from the table list view
    list_editable = ('completed', 'priority')
    ordering = ('-created_at',)


@admin.register(MoodLog)
class MoodLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'date', 'mood', 'note')
    list_filter = ('mood', 'date', 'user')
    search_fields = ('note', 'user__username')
    ordering = ('-date',)


@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user', 'date', 'time', 'attendees')
    list_filter = ('date', 'user')
    search_fields = ('title', 'attendees', 'notes', 'user__username')
    ordering = ('date', 'time')
