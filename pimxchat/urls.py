from django.urls import path
from . import views

app_name = 'pimxchat'

urlpatterns = [
    path('', views.home_view, name='home'),
    path('about/', views.about_view, name='about'),
    path('rules/', views.rules_view, name='rules'),
    path('terms/', views.terms_view, name='terms'),
    path('chat/', views.chat_view, name='chat'),
    path('set-language/', views.set_language, name='set_language'),
    
    # API endpoints for chat functionality
    path('api/chat/sessions/', views.api_chat_sessions, name='api_chat_sessions'),
    path('api/chat/sessions/<uuid:session_id>/messages/', views.api_chat_messages, name='api_chat_messages'),
    path('api/chat/send/', views.api_send_message, name='api_send_message'),
    path('api/chat/new/', views.api_new_chat, name='api_new_chat'),
    path('api/chat/sessions/<uuid:session_id>/delete/', views.api_delete_session, name='api_delete_session'),
    path('api/chat/sessions/<uuid:session_id>/clear/', views.api_clear_chat, name='api_clear_chat'),
    path('api/chat/sessions/<uuid:session_id>/rename/', views.api_rename_session, name='api_rename_session'),
] 