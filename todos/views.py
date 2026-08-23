"""
View Handlers and API Controllers for the TODO IST Application.

Contains two main categories of views:
1. DRF REST API ViewSets (TodoViewSet, MeetingViewSet) providing complete CRUD
   endpoints with user-scoped querysets and session authentication.
2. Server-Rendered Django Template Views (home, monthly, daily, mood, settings,
   profile, register) for the interactive web frontend.
"""

from django.shortcuts import render, redirect
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Todo, MoodLog, Meeting
from .serializers import TodoSerializer, MeetingSerializer
from .forms import UserRegisterForm, TodoForm, MeetingForm, MoodLogForm

# --- DRF REST API ViewSets ---
class TodoViewSet(viewsets.ModelViewSet):
    serializer_class = TodoSerializer
    permission_classes = [IsAuthenticated]

    # Ensure users can only read/modify their own tasks (data isolation)
    def get_queryset(self):
        return Todo.objects.filter(user=self.request.user)

    # Automatically associate new tasks with the authenticated user server-side
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MeetingViewSet(viewsets.ModelViewSet):
    serializer_class = MeetingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Meeting.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# --- Django HTML Template Page Views ---

@login_required
def home_view(request):
    return render(request, 'todos/home.html', {
        'active_page': 'home'
    })

@login_required
def monthly_view(request):
    return render(request, 'todos/monthly.html', {
        'active_page': 'monthly'
    })

@login_required
def daily_view(request):
    return render(request, 'todos/daily.html', {
        'active_page': 'daily'
    })

@login_required
def mood_view(request):
    today = timezone.localdate()
    today_mood = MoodLog.objects.filter(date=today, user=request.user).first()
    mood_logs = MoodLog.objects.filter(user=request.user)
    return render(request, 'todos/mood.html', {
        'active_page': 'mood',
        'today_mood': today_mood,
        'mood_logs': mood_logs
    })

@login_required
@require_POST
def log_mood_view(request):
    mood = request.POST.get('mood')
    note = request.POST.get('note', '')
    
    if mood:
        today = timezone.localdate()
        # update_or_create updates today's log if it already exists, or inserts a new one
        MoodLog.objects.update_or_create(
            date=today,
            user=request.user,
            defaults={'mood': mood, 'note': note}
        )
    return redirect('mood')

@login_required
def settings_view(request):
    return render(request, 'todos/settings.html', {
        'active_page': 'settings'
    })

@login_required
def profile_view(request):
    return render(request, 'todos/profile.html', {
        'active_page': 'profile'
    })

def register_view(request):
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            # Log the new user in automatically upon successful registration
            login(request, user)
            return redirect('home')
    else:
        form = UserRegisterForm()
    return render(request, 'todos/register.html', {'form': form})



