from rest_framework import serializers
from .models import Todo, Meeting

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
