from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TodoViewSet, MeetingViewSet, home_view, monthly_view, daily_view,
    mood_view, log_mood_view, settings_view, profile_view, register_view
)

router = DefaultRouter()
router.register(r'todos', TodoViewSet, basename='todo')
router.register(r'meetings', MeetingViewSet, basename='meeting')

urlpatterns = [
    path('', home_view, name='home'),
    path('monthly/', monthly_view, name='monthly'),
    path('daily/', daily_view, name='daily'),
    path('mood/', mood_view, name='mood'),
    path('mood/log/', log_mood_view, name='log_mood'),
    path('settings/', settings_view, name='settings'),
    path('profile/', profile_view, name='profile'),
    path('api/', include(router.urls)),
    path('accounts/', include('django.contrib.auth.urls')),
    path('accounts/register/', register_view, name='register'),
]

