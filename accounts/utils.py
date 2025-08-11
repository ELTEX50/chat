from django.utils import timezone
from datetime import timedelta
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

def is_code_expired(code_sent_at, expiration_minutes=2):
    """
    Check if a verification code has expired.
    
    Args:
        code_sent_at: The timestamp when the code was sent
        expiration_minutes: Number of minutes before expiration (default: 2)
    
    Returns:
        bool: True if code is expired, False otherwise
    """
    if not code_sent_at:
        return True
    
    expiration_time = code_sent_at + timedelta(minutes=expiration_minutes)
    return timezone.now() > expiration_time

def get_code_expiration_time(code_sent_at, expiration_minutes=2):
    """
    Get the exact expiration time for a verification code.
    
    Args:
        code_sent_at: The timestamp when the code was sent
        expiration_minutes: Number of minutes before expiration (default: 2)
    
    Returns:
        datetime: The exact expiration time
    """
    if not code_sent_at:
        return None
    
    return code_sent_at + timedelta(minutes=expiration_minutes)

def get_remaining_time(code_sent_at, expiration_minutes=2):
    """
    Get the remaining time before code expiration.
    
    Args:
        code_sent_at: The timestamp when the code was sent
        expiration_minutes: Number of minutes before expiration (default: 2)
    
    Returns:
        int: Remaining seconds, or 0 if expired
    """
    if not code_sent_at:
        return 0
    
    expiration_time = get_code_expiration_time(code_sent_at, expiration_minutes)
    remaining = (expiration_time - timezone.now()).total_seconds()
    return max(0, int(remaining))

def format_remaining_time(remaining_seconds):
    """
    Format remaining time in a user-friendly way.
    
    Args:
        remaining_seconds: Number of seconds remaining
    
    Returns:
        str: Formatted time string in Persian
    """
    if remaining_seconds <= 0:
        return "منقضی شده"
    
    minutes = remaining_seconds // 60
    seconds = remaining_seconds % 60
    
    if minutes > 0:
        return f"{minutes} دقیقه و {seconds} ثانیه"
    else:
        return f"{seconds} ثانیه" 

def send_verification_email(email, username, code, verify_url=None, template='accounts/email_verification.html'):
    context = {
        'user': {'email': email, 'username': username},
        'code': code,
        'verify_url': verify_url,
        'logo_url': '',  # Add if needed
    }
    html_content = render_to_string(template, context)
    text_content = strip_tags(html_content)
    email_obj = EmailMultiAlternatives(
        subject='کد تایید شما',
        body=text_content,
        to=[email]
    )
    email_obj.attach_alternative(html_content, "text/html")
    email_obj.send() 