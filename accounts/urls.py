from django.urls import path
from . import views
from .views import site_stats

app_name = 'accounts'

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('verify-email/<uidb64>/<token>/', views.verify_email_view, name='verify_email'),
    path('resend-verification/<uidb64>/<token>/', views.resend_verification_code_view, name='resend_verification_code'),
    path('ajax/resend-verification-code/', views.ajax_resend_verification_code, name='ajax_resend_verification_code'),
    path('login/', views.login_view, name='login'),
    path('login/code-verify/', views.login_code_verify_view, name='login_code_verify'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile_view, name='profile'),
    path('profile/edit/', views.edit_profile_view, name='edit_profile'),
    path('settings/', views.settings_view, name='settings'),
    path('settings/two-factor/', views.toggle_two_factor, name='toggle_two_factor'),
    path('settings/login-notifications/', views.toggle_login_notifications, name='toggle_login_notifications'),
    path('settings/save/', views.save_settings, name='save_settings'),
    path('change-password/', views.change_password_view, name='change_password'),
    path('change-email/', views.change_email_view, name='change_email'),
    path('verify-email-change/<uidb64>/<token>/', views.verify_email_change_view, name='verify_email_change'),
    path('resend-email-change-code/<uidb64>/<token>/', views.resend_email_change_code_view, name='resend_email_change_code'),
    path('password-reset/', views.password_reset_request_view, name='password_reset_request'),
    path('password-reset/code/<uidb64>/<token>/', views.password_reset_code_view, name='password_reset_code'),
    path('password-reset/confirm/<uidb64>/<token>/', views.password_reset_confirm_view, name='password_reset_confirm'),
    path('submit-rating/', views.submit_rating_view, name='submit_rating'),
    path('satisfaction-percentage/', views.satisfaction_percentage_view, name='satisfaction_percentage'),
    path('logout-rating/', views.logout_rating_view, name='logout_rating'),
]

urlpatterns += [
    path('api/site-stats/', site_stats, name='site-stats'),
] 