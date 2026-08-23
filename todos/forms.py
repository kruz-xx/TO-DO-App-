"""
Form Definitions and ModelForm Validators for TODO IST.

Provides HTML form representations and server-side validation for:
- UserRegisterForm: User registration extending Django's UserCreationForm.
- TodoForm, MeetingForm, MoodLogForm: ModelForms with styled CSS widgets.
"""

from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Todo, MoodLog, Meeting


# Extends Django's built-in UserCreationForm to optionally capture email during registration
class UserRegisterForm(UserCreationForm):
    class Meta:
        model = User
        fields = ['username', 'email']


# ModelForms automatically derive field validation rules directly from models.py
class TodoForm(forms.ModelForm):
    class Meta:
        model = Todo
        fields = ['title', 'description', 'priority', 'labels', 'due_date', 'due_time', 'completed']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'What needs to be done?'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Add details...'}),
            'priority': forms.Select(attrs={'class': 'form-control'}),
            'labels': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Work, Personal'}),
            'due_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'due_time': forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
            'completed': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }


class MeetingForm(forms.ModelForm):
    class Meta:
        model = Meeting
        fields = ['title', 'date', 'time', 'attendees', 'notes']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Meeting title'}),
            'date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'time': forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
            'attendees': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Attendees'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Agenda & notes...'}),
        }


class MoodLogForm(forms.ModelForm):
    class Meta:
        model = MoodLog
        fields = ['mood', 'note']
        widgets = {
            'mood': forms.Select(attrs={'class': 'form-control'}),
            'note': forms.Textarea(attrs={'class': 'form-control', 'rows': 2, 'placeholder': 'How are you feeling today?'}),
        }
