"""
Database Models for the TODO IST Application.

Defines the core data schema including:
- Todo: Personal task items with priorities, completion status, labels, and due dates.
- MoodLog: Daily emotional tracker enforcing one log per user per calendar day.
- Meeting: Scheduled calendar events with date, time, attendees, and notes.

All models maintain a foreign key relationship with the Django User model
for strict per-user multi-tenancy and data isolation.
"""

from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class Todo(models.Model):
    # Foreign key links each task to a specific user; cascading deletes tasks when a user is removed
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    completed = models.BooleanField(default=False)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    labels = models.CharField(max_length=200, blank=True, default='')
    due_date = models.DateField(null=True, blank=True)
    due_time = models.TimeField(null=True, blank=True)

    # auto_now_add sets timestamp on creation; auto_now updates timestamp on every save
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']


class MoodLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
    MOOD_CHOICES = [
        ('happy', '😊 Happy'),
        ('calm', '😌 Calm'),
        ('productive', '⚡ Productive'),
        ('tired', '😴 Tired'),
        ('sad', '😢 Sad'),
    ]
    date = models.DateField(default=timezone.now)
    mood = models.CharField(max_length=20, choices=MOOD_CHOICES)
    note = models.TextField(blank=True, default='')

    def __str__(self):
        return f"{self.date}: {self.get_mood_display()}"

    class Meta:
        ordering = ['-date']
        # Enforces only one mood entry per user per day at the database constraint level
        unique_together = ['user', 'date']


class Meeting(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
    title = models.CharField(max_length=200)
    date = models.DateField()
    time = models.TimeField(null=True, blank=True)
    attendees = models.CharField(max_length=200, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['date', 'time']

