"""
URL Routing Configuration for the 'todos' Application.

Maps URL patterns to corresponding view functions and DRF router endpoints:
- Web Page Views: '', 'monthly/', 'daily/', 'mood/', 'settings/', 'profile/'
- REST API: 'api/' via DRF DefaultRouter (/api/todos/, /api/meetings/)
- Authentication: 'accounts/' (login, logout) and 'accounts/register/'
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TodoViewSet, MeetingViewSet, home_view, monthly_view, daily_view,
    mood_view, log_mood_view, settings_view, profile_view, register_view
)

# DRF DefaultRouter automatically generates RESTful URL patterns (GET, POST, PUT, DELETE)
router = DefaultRouter()
router.register(r'todos', TodoViewSet, basename='todo')
router.register(r'meetings', MeetingViewSet, basename='meeting')

urlpatterns = [
    # Frontend HTML Views
    path('', home_view, name='home'),
    path('monthly/', monthly_view, name='monthly'),
    path('daily/', daily_view, name='daily'),
    path('mood/', mood_view, name='mood'),
    path('mood/log/', log_mood_view, name='log_mood'),
    path('settings/', settings_view, name='settings'),
    path('profile/', profile_view, name='profile'),
    
    # REST API endpoints (/api/todos/, /api/meetings/)
    path('api/', include(router.urls)),
    
    # Built-in auth routes (/accounts/login/, /accounts/logout/) & custom registration
    path('accounts/', include('django.contrib.auth.urls')),
    path('accounts/register/', register_view, name='register'),
]

