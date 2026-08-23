"""
Django REST Framework Serializers for the TODO IST Application.

Handles serialization (converting model instances to JSON) and
deserialization (validating and parsing incoming JSON requests) for:
- TodoSerializer: Serializes Todo model instances.
- MeetingSerializer: Serializes Meeting model instances.
"""

from rest_framework import serializers
from .models import Todo, Meeting

# Serializers convert Django ORM model instances to JSON and validate incoming JSON payloads
class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = [
            'id',
            'title',
            'description',
            'completed',
            'priority',
            'labels',
            'due_date',
            'due_time',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class MeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = [
            'id',
            'title',
            'date',
            'time',
            'attendees',
            'notes',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
