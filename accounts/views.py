from django.shortcuts import render, redirect
from django.contrib import messages
from django.utils import timezone
from django.core.mail import send_mail
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from .forms import UserRegisterForm, EmailVerificationForm
from .models import User
import random
from django.contrib.auth import login as auth_login
from django.http import HttpRequest
import requests
from .forms import EmailLoginForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth import logout as auth_logout
from .forms import PasswordResetRequestForm, PasswordResetCodeForm, SetNewPasswordForm
from .utils import is_code_expired, get_remaining_time, format_remaining_time
import json
from django.urls import reverse
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from .forms import ProfileEditForm, EmailChangeForm, EmailChangeVerificationForm
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from datetime import timedelta
from .models import UserRating
from django.db.models import Count, Q
from django.views.decorators.http import require_http_methods
import uuid
from django.core.files.storage import default_storage
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view
from rest_framework.response import Response
from pimxchat.models import ChatMessage
from accounts.models import UserRating
from django.db.models import Avg

def should_prompt_for_feedback(user):
    if not user.is_authenticated:
        return False
    last_rating = UserRating.objects.filter(user=user).order_by('-submitted_at').first()
    if not last_rating:
        return True
    return (timezone.now() - last_rating.submitted_at) > timedelta(days=30)

# Create your views here.

def register_view(request):
    if request.method == 'POST':
        form = UserRegisterForm(request.POST, request.FILES)
        if form.is_valid():
            try:
                # Prepare registration data
                registration_data = {
                    'email': form.cleaned_data['email'],
                    'username': form.cleaned_data['username'],
                    'age': form.cleaned_data['age'],
                    'password': form.cleaned_data['password1'],
                }
                # Handle profile picture (if present) - Save to temp file instead of session
                if form.cleaned_data.get('profile_picture'):
                    profile_picture = form.cleaned_data['profile_picture']
                    tmp_filename = f"profile_pics/tmp_{uuid.uuid4().hex}_{profile_picture.name}"
                    tmp_path = default_storage.save(tmp_filename, profile_picture)
                    registration_data['profile_picture_tmp_path'] = tmp_path
                    registration_data['profile_picture_name'] = profile_picture.name
                # Generate code
                code = '{:06d}'.format(random.randint(0, 999999))
                registration_data['verification_code'] = code
                registration_data['code_sent_at'] = timezone.now().isoformat()
                # Store in session
                request.session['registration_data'] = registration_data
                request.session.modified = True
                # Send verification email
                verify_url = request.build_absolute_uri(reverse('accounts:verify_email', args=['session', 'session']))
                context = {
                    'user': registration_data,
                    'code': code,
                    'verify_url': verify_url,
                    'logo_url': request.build_absolute_uri('/static/img/logo.png'),
                }
                html_content = render_to_string('accounts/email_verification.html', context)
                text_content = strip_tags(html_content)
                email = EmailMultiAlternatives(
                    subject='تایید ایمیل شما در PIMXCHAT',
                    body=text_content,
                    to=[registration_data['email']]
                )
                email.attach_alternative(html_content, "text/html")
                email.send()
                messages.success(request, 'ثبت نام با موفقیت انجام شد! کد تایید به ایمیل شما ارسال شد.')
                return redirect('accounts:verify_email', uidb64='session', token='session')
            except Exception as e:
                messages.error(request, 'خطا در ثبت نام یا ارسال ایمیل. لطفاً دوباره تلاش کنید.')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    if field == '__all__':
                        messages.error(request, error)
                    else:
                        field_name = form.fields[field].label or field
                        messages.error(request, f'{field_name}: {error}')
    else:
        form = UserRegisterForm()
    return render(request, 'accounts/register.html', {'form': form})

def verify_email_view(request, uidb64, token):
    # If session-based verification
    if uidb64 == 'session' and token == 'session':
        registration_data = request.session.get('registration_data')
        if not registration_data:
            messages.error(request, 'اطلاعات ثبت‌نام یافت نشد. لطفاً دوباره ثبت‌نام کنید.')
            return redirect('accounts:register')
        # Calculate remaining_seconds for code validity and resend cooldown
        from .utils import get_remaining_time, format_remaining_time
        import datetime
        code_sent_at = registration_data.get('code_sent_at')
        if code_sent_at:
            code_sent_at_dt = datetime.datetime.fromisoformat(code_sent_at)
        else:
            code_sent_at_dt = None
        remaining_seconds = get_remaining_time(code_sent_at_dt, expiration_minutes=2)
        remaining_time_formatted = format_remaining_time(remaining_seconds)
        # --- ADDED: Send email if code missing or expired ---
        if not code_sent_at_dt or remaining_seconds <= 0:
            # Generate new code and send email
            code = '{:06d}'.format(random.randint(0, 999999))
            registration_data['verification_code'] = code
            registration_data['code_sent_at'] = datetime.datetime.now().isoformat()
            request.session['registration_data'] = registration_data
            request.session.modified = True
            from .utils import send_verification_email
            send_verification_email(registration_data['email'], registration_data['username'], code)
            # Recalculate times
            code_sent_at_dt = datetime.datetime.fromisoformat(registration_data['code_sent_at'])
            remaining_seconds = get_remaining_time(code_sent_at_dt, expiration_minutes=2)
            remaining_time_formatted = format_remaining_time(remaining_seconds)
        if request.method == 'POST':
            form = EmailVerificationForm(request.POST)
            if form.is_valid():
                code = form.cleaned_data['code']
                if code != registration_data['verification_code']:
                    messages.error(request, 'کد تایید نامعتبر است. لطفاً دوباره تلاش کنید.')
                    return redirect('accounts:verify_email', uidb64='session', token='session')
                else:
                    # Create user now
                    user = User(
                        email=registration_data['email'],
                        username=registration_data['username'],
                        age=registration_data['age'],
                        is_active=True,
                        is_verified=True
                    )
                    user.set_password(registration_data['password'])
                    # Handle profile picture if present
                    if registration_data.get('profile_picture_tmp_path'):
                        from django.core.files import File
                        tmp_path = registration_data['profile_picture_tmp_path']
                        with default_storage.open(tmp_path, 'rb') as f:
                            user.profile_picture.save(
                                registration_data['profile_picture_name'],
                                File(f)
                            )
                        # Clean up temporary file
                        default_storage.delete(tmp_path)
                    user.save()
                    # Clean up session
                    del request.session['registration_data']
                    messages.success(request, 'ایمیل تایید شد! حالا می‌توانید وارد شوید.')
                    return redirect('accounts:login')
            else:
                for field, errors in form.errors.items():
                    for error in errors:
                        messages.error(request, f'{field}: {error}')
                return redirect('accounts:verify_email', uidb64='session', token='session')
        else:
            form = EmailVerificationForm()
        return render(request, 'accounts/verify_email.html', {
            'form': form,
            'email': registration_data['email'],
            'remaining_time': remaining_time_formatted,
            'remaining_seconds': remaining_seconds,
            'uidb64': 'session',
            'token': 'session'
        })
    # Fallback to old logic for existing users
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    if user is not None and default_token_generator.check_token(user, token):
        if request.method == 'POST':
            form = EmailVerificationForm(request.POST)
            if form.is_valid():
                code = form.cleaned_data['code']
                if is_code_expired(user.code_sent_at, expiration_minutes=2):
                    messages.error(request, 'کد تایید منقضی شده است. لطفاً دوباره ثبت نام کنید.')
                    user.delete()
                    return redirect('accounts:register')
                if code == user.verification_code:
                    user.is_active = True
                    user.is_verified = True
                    user.verification_code = ''
                    user.save()
                    messages.success(request, 'ایمیل تایید شد! حالا می‌توانید وارد شوید.')
                    return redirect('accounts:login')
                else:
                    messages.error(request, 'کد تایید نامعتبر است. لطفاً دوباره تلاش کنید.')
                    return redirect('accounts:verify_email', uidb64=uidb64, token=token)
            else:
                for field, errors in form.errors.items():
                    for error in errors:
                        messages.error(request, f'{field}: {error}')
                return redirect('accounts:verify_email', uidb64=uidb64, token=token)
        else:
            form = EmailVerificationForm()
        remaining_seconds = get_remaining_time(user.code_sent_at, expiration_minutes=2)
        remaining_time_formatted = format_remaining_time(remaining_seconds)
        return render(request, 'accounts/verify_email.html', {
            'form': form,
            'email': user.email,
            'remaining_time': remaining_time_formatted,
            'remaining_seconds': remaining_seconds,
            'uidb64': uidb64,
            'token': token
        })
    else:
        messages.error(request, 'لینک تایید نامعتبر است یا منقضی شده است.')
        return redirect('accounts:register')

def login_view(request: HttpRequest):
    from django.utils import timezone
    from datetime import timedelta
    if request.method == 'POST':
        form = EmailLoginForm(request.POST, request.FILES)
        if form.is_valid():
            try:
                user = form.cleaned_data['user']
                now = timezone.now()
                # 2FA logic: Only require code if enabled
                require_code = False
                if user.two_factor_enabled:
                    if not user.last_verification_code_time or (now - user.last_verification_code_time) > timedelta(hours=24):
                        require_code = True
                if require_code:
                    # Generate and send code
                    code = '{:06d}'.format(random.randint(0, 999999))
                    user.verification_code = code
                    user.code_sent_at = now
                    user.save(update_fields=['verification_code', 'code_sent_at'])
                    # Store user id in session for verification
                    request.session['pending_verification_user_id'] = user.pk
                    # Send code email
                    context = {
                        'user': user,
                        'code': code,
                        'logo_url': request.build_absolute_uri('/static/img/logo.png'),
                    }
                    html_content = render_to_string('accounts/email_verification.html', context)
                    text_content = strip_tags(html_content)
                    email = EmailMultiAlternatives(
                        subject='کد تایید ورود - PIMXCHAT',
                        body=text_content,
                        to=[user.email]
                    )
                    email.attach_alternative(html_content, "text/html")
                    email.send()
                    messages.info(request, 'کد تایید به ایمیل شما ارسال شد. لطفاً کد را وارد کنید.')
                    return redirect('accounts:login_code_verify')
                # If no code required, proceed as before
                auth_login(request, user)
                # Gather detailed login information
                login_time = now
                ip = request.META.get('REMOTE_ADDR') or request.META.get('HTTP_X_FORWARDED_FOR', 'Unknown')
                user_agent = request.META.get('HTTP_USER_AGENT', 'Unknown')
                # Get location from IP using multiple services for better accuracy
                location = 'Unknown'
                try:
                    geo_response = requests.get(f'https://ipapi.co/{ip}/json/', timeout=5)
                    if geo_response.status_code == 200:
                        geo_data = geo_response.json()
                        city = geo_data.get('city', '')
                        country = geo_data.get('country_name', '')
                        region = geo_data.get('region', '')
                        location_parts = [part for part in [city, region, country] if part]
                        location = ', '.join(location_parts) if location_parts else 'Unknown'
                    else:
                        geo_response = requests.get(f'https://ipinfo.io/{ip}/json', timeout=5)
                        if geo_response.status_code == 200:
                            geo_data = geo_response.json()
                            location = geo_data.get('loc', 'Unknown')
                except Exception as e:
                    location = 'Unknown (Error: ' + str(e) + ')'
                user.update_login_info(ip, location, user_agent)
                # Send detailed email notification only if enabled
                if user.login_notifications_enabled:
                    context = {
                        'user': user,
                        'login_time': login_time.strftime('%H:%M:%S %d-%m-%Y'),
                        'login_date': login_time.strftime('%d-%m-%Y'),
                        'ip': ip,
                        'location': location,
                        'user_agent': user_agent,
                        'login_count': user.login_count,
                    }
                    html_content = render_to_string('accounts/email_login_notification.html', context)
                    text_content = strip_tags(html_content)
                    email = EmailMultiAlternatives(
                        subject='ورود جدید به حساب شما - PIMXCHAT',
                        body=text_content,
                        to=[user.email]
                    )
                    email.attach_alternative(html_content, "text/html")
                    email.send()
                messages.success(request, 'ورود موفقیت‌آمیز بود!')
                return redirect('/')
            except Exception as e:
                messages.error(request, 'خطا در ورود. لطفاً دوباره تلاش کنید.')
        else:
            # Display detailed form errors
            for field, errors in form.errors.items():
                for error in errors:
                    if field == '__all__':
                        messages.error(request, error)
                    else:
                        field_name = form.fields[field].label or field
                        messages.error(request, f'{field_name}: {error}')
    else:
        form = EmailLoginForm()
    return render(request, 'accounts/login.html', {'form': form})

def login_code_verify_view(request):
    """View for verifying login verification code"""
    # Check if user is in session for verification
    user_id = request.session.get('pending_verification_user_id')
    if not user_id:
        messages.error(request, 'درخواست تایید نامعتبر است.')
        return redirect('accounts:login')
    
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        messages.error(request, 'کاربر یافت نشد.')
        return redirect('accounts:login')
    
    if request.method == 'POST':
        form = EmailVerificationForm(request.POST)
        if form.is_valid():
            code = form.cleaned_data['code']
            if is_code_expired(user.code_sent_at, expiration_minutes=2):
                messages.error(request, 'کد تایید منقضی شده است. لطفاً دوباره وارد شوید.')
                # Clear session and redirect to login
                if 'pending_verification_user_id' in request.session:
                    del request.session['pending_verification_user_id']
                return redirect('accounts:login')
            
            if code == user.verification_code:
                # Clear verification code and login user
                user.verification_code = ''
                user.last_verification_code_time = timezone.now()
                user.save()
                
                # Clear session
                if 'pending_verification_user_id' in request.session:
                    del request.session['pending_verification_user_id']
                
                # Login user
                auth_login(request, user)
                
                # Gather detailed login information
                login_time = timezone.now()
                ip = request.META.get('REMOTE_ADDR') or request.META.get('HTTP_X_FORWARDED_FOR', 'Unknown')
                user_agent = request.META.get('HTTP_USER_AGENT', 'Unknown')
                
                # Get location from IP using multiple services for better accuracy
                location = 'Unknown'
                try:
                    geo_response = requests.get(f'https://ipapi.co/{ip}/json/', timeout=5)
                    if geo_response.status_code == 200:
                        geo_data = geo_response.json()
                        city = geo_data.get('city', '')
                        country = geo_data.get('country_name', '')
                        region = geo_data.get('region', '')
                        location_parts = [part for part in [city, region, country] if part]
                        location = ', '.join(location_parts) if location_parts else 'Unknown'
                    else:
                        geo_response = requests.get(f'https://ipinfo.io/{ip}/json', timeout=5)
                        if geo_response.status_code == 200:
                            geo_data = geo_response.json()
                            location = geo_data.get('loc', 'Unknown')
                except Exception as e:
                    location = 'Unknown (Error: ' + str(e) + ')'
                
                user.update_login_info(ip, location, user_agent)
                
                # Send detailed email notification only if enabled
                if user.login_notifications_enabled:
                    context = {
                        'user': user,
                        'login_time': login_time.strftime('%H:%M:%S %d-%m-%Y'),
                        'login_date': login_time.strftime('%d-%m-%Y'),
                        'ip': ip,
                        'location': location,
                        'user_agent': user_agent,
                        'login_count': user.login_count,
                    }
                    html_content = render_to_string('accounts/email_login_notification.html', context)
                    text_content = strip_tags(html_content)
                    email = EmailMultiAlternatives(
                        subject='ورود جدید به حساب شما - PIMXCHAT',
                        body=text_content,
                        to=[user.email]
                    )
                    email.attach_alternative(html_content, "text/html")
                    email.send()
                
                messages.success(request, 'ورود موفقیت‌آمیز بود!')
                return redirect('/')
            else:
                messages.error(request, 'کد تایید نامعتبر است. لطفاً دوباره تلاش کنید.')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{field}: {error}')
    else:
        form = EmailVerificationForm()
    
    remaining_seconds = get_remaining_time(user.code_sent_at, expiration_minutes=2)
    remaining_time_formatted = format_remaining_time(remaining_seconds)
    
    return render(request, 'accounts/login_code_verify.html', {
        'form': form,
        'email': user.email,
        'remaining_time': remaining_time_formatted,
        'remaining_seconds': remaining_seconds
    })

@login_required
def change_password_view(request):
    if request.method == 'POST':
        form = PasswordChangeForm(user=request.user, data=request.POST)
        if form.is_valid():
            try:
                user = form.save()
                update_session_auth_hash(request, user)
                # Send password changed email only if notifications are enabled
                if user.login_notifications_enabled:
                    context = {
                        'user': user,
                        'logo_url': request.build_absolute_uri('/static/img/logo.png'),
                    }
                    html_content = render_to_string('accounts/email_password_changed.html', context)
                    text_content = strip_tags(html_content)
                    email = EmailMultiAlternatives(
                        subject='رمز عبور شما تغییر یافت - PIMXCHAT',
                        body=text_content,
                        to=[user.email]
                    )
                    email.attach_alternative(html_content, "text/html")
                    email.send()
                messages.success(request, 'رمز عبور شما با موفقیت تغییر یافت!')
                return redirect('/')
            except Exception as e:
                messages.error(request, 'خطا در تغییر رمز عبور. لطفاً دوباره تلاش کنید.')
        else:
            # Display detailed form errors
            for field, errors in form.errors.items():
                for error in errors:
                    if field == '__all__':
                        messages.error(request, error)
                    else:
                        field_name = form.fields[field].label or field
                        messages.error(request, f'{field_name}: {error}')
    else:
        form = PasswordChangeForm(user=request.user)
    return render(request, 'accounts/change_password.html', {'form': form})

def password_reset_request_view(request):
    if request.method == 'POST':
        form = PasswordResetRequestForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            try:
                user = User.objects.get(email=email)
                if user.two_factor_enabled:
                    code = '{:06d}'.format(random.randint(0, 999999))
                    user.verification_code = code
                    user.code_sent_at = timezone.now()
                    user.save()
                    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
                    token = default_token_generator.make_token(user)
                    try:
                        reset_url = request.build_absolute_uri(
                            reverse('accounts:password_reset_code', args=[uidb64, token])
                        )
                        context = {
                            'user': user,
                            'code': code,
                            'reset_url': reset_url,
                            'logo_url': request.build_absolute_uri('/static/img/logo.png'),
                        }
                        html_content = render_to_string('accounts/email_password_reset.html', context)
                        text_content = strip_tags(html_content)
                        email_obj = EmailMultiAlternatives(
                            subject='درخواست بازیابی رمز عبور - PIMXCHAT',
                            body=text_content,
                            to=[user.email]
                        )
                        email_obj.attach_alternative(html_content, "text/html")
                        email_obj.send()
                        messages.success(request, 'کد بازیابی رمز عبور به ایمیل شما ارسال شد.')
                    except Exception as e:
                        messages.error(request, 'خطا در ارسال ایمیل بازیابی رمز عبور.')
                else:
                    messages.success(request, 'درخواست بازیابی رمز عبور ثبت شد. (۲FA غیرفعال است، ایمیلی ارسال نشد)')
                return redirect('accounts:login')
            except User.DoesNotExist:
                messages.error(request, 'کاربری با این ایمیل یافت نشد.')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{field}: {error}')
    else:
        form = PasswordResetRequestForm()
    return render(request, 'accounts/password_reset_email.html', {'form': form})

def password_reset_code_view(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    if user is not None and default_token_generator.check_token(user, token):
        if request.method == 'POST':
            form = PasswordResetCodeForm(request.POST)
            if form.is_valid():
                code = form.cleaned_data['code']
                if is_code_expired(user.code_sent_at, expiration_minutes=2):
                    messages.error(request, 'کد بازنشانی منقضی شده است. لطفاً دوباره تلاش کنید.')
                    return redirect('accounts:password_reset_request')
                if code == user.verification_code:
                    # Pass uidb64 and token to confirm view
                    return redirect('accounts:password_reset_confirm', uidb64=uidb64, token=token)
                else:
                    messages.error(request, 'کد نامعتبر است. لطفاً دوباره تلاش کنید.')
                    return redirect('accounts:password_reset_code', uidb64=uidb64, token=token)
            else:
                for field, errors in form.errors.items():
                    for error in errors:
                        messages.error(request, f'{field}: {error}')
                return redirect('accounts:password_reset_code', uidb64=uidb64, token=token)
        else:
            form = PasswordResetCodeForm()
        remaining_seconds = get_remaining_time(user.code_sent_at, expiration_minutes=2)
        remaining_time_formatted = format_remaining_time(remaining_seconds)
        return render(request, 'accounts/password_reset_code.html', {
            'form': form,
            'email': user.email,
            'remaining_time': remaining_time_formatted,
            'remaining_seconds': remaining_seconds
        })
    else:
        messages.error(request, 'لینک بازنشانی نامعتبر است یا منقضی شده است.')
        return redirect('accounts:password_reset_request')

def password_reset_confirm_view(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    if user is not None and default_token_generator.check_token(user, token):
        if request.method == 'POST':
            form = SetNewPasswordForm(request.POST)
            if form.is_valid():
                try:
                    user.set_password(form.cleaned_data['new_password1'])
                    user.verification_code = ''
                    user.save()
                    # Send password changed email only if notifications are enabled
                    if user.login_notifications_enabled:
                        context = {
                            'user': user,
                            'logo_url': request.build_absolute_uri('/static/img/logo.png'),
                        }
                        html_content = render_to_string('accounts/email_password_changed.html', context)
                        text_content = strip_tags(html_content)
                        email = EmailMultiAlternatives(
                            subject='رمز عبور شما تغییر یافت - PIMXCHAT',
                            body=text_content,
                            to=[user.email]
                        )
                        email.attach_alternative(html_content, "text/html")
                        email.send()
                    messages.success(request, 'رمز عبور با موفقیت بازنشانی شد! حالا می‌توانید وارد شوید.')
                    return redirect('accounts:login')
                except Exception as e:
                    messages.error(request, 'خطا در بازنشانی رمز عبور. لطفاً دوباره تلاش کنید.')
            else:
                for field, errors in form.errors.items():
                    for error in errors:
                        messages.error(request, f'{field}: {error}')
        else:
            form = SetNewPasswordForm()
        return render(request, 'accounts/password_reset_confirm.html', {'form': form, 'email': user.email})
    else:
        messages.error(request, 'لینک بازنشانی نامعتبر است یا منقضی شده است.')
        return redirect('accounts:password_reset_request')

def logout_view(request):
    if request.user.is_authenticated and should_prompt_for_feedback(request.user):
        return redirect('accounts:logout_rating')
    # Otherwise, send logout email if notifications are enabled and then log out
    if request.user.is_authenticated and request.user.login_notifications_enabled:
        try:
            context = {
                'user': request.user,
                'logo_url': request.build_absolute_uri('/static/img/logo.png'),
            }
            html_content = render_to_string('accounts/email_logout_notification.html', context)
            text_content = strip_tags(html_content)
            email = EmailMultiAlternatives(
                subject='خروج از حساب کاربری - PIMXCHAT',
                body=text_content,
                to=[request.user.email]
            )
            email.attach_alternative(html_content, "text/html")
            email.send()
        except Exception as e:
            print('LOGOUT EMAIL ERROR:', e)
    auth_logout(request)
    messages.success(request, 'شما با موفقیت خارج شدید.')
    return redirect('/')

@login_required
def profile_view(request):
    if should_prompt_for_feedback(request.user):
        return redirect('accounts:logout_rating')
    return render(request, 'accounts/profile.html', {
        'user': request.user
    })

@login_required
def settings_view(request):
    return render(request, 'accounts/settings.html', {
        'user': request.user,
        'two_factor_enabled': request.user.two_factor_enabled,
        'login_notifications_enabled': request.user.login_notifications_enabled,
    })

@login_required
def edit_profile_view(request):
    """View for editing user profile information"""
    if request.method == 'POST':
        form = ProfileEditForm(request.POST, request.FILES, user=request.user, instance=request.user)
        if form.is_valid():
            try:
                # Update user information
                user = request.user
                user.username = form.cleaned_data['username']
                
                # Handle profile picture
                if form.cleaned_data.get('profile_picture'):
                    user.profile_picture = form.cleaned_data['profile_picture']
                    user.profile_picture_captured = True
                    user.profile_picture_capture_time = timezone.now()
                
                user.save()
                messages.success(request, 'اطلاعات پروفایل با موفقیت بروزرسانی شد!')
                return redirect('accounts:profile')
            except Exception as e:
                messages.error(request, 'خطا در بروزرسانی اطلاعات. لطفاً دوباره تلاش کنید.')
        else:
            # Display detailed form errors
            for field, errors in form.errors.items():
                for error in errors:
                    if field == '__all__':
                        messages.error(request, error)
                    else:
                        field_name = form.fields[field].label or field
                        messages.error(request, f'{field_name}: {error}')
    else:
        form = ProfileEditForm(user=request.user, instance=request.user)
    
    return render(request, 'accounts/edit_profile.html', {'form': form})

@login_required
def change_email_view(request):
    """View for initiating email change"""
    if request.method == 'POST':
        form = EmailChangeForm(request.POST, user=request.user)
        if form.is_valid():
            try:
                new_email = form.cleaned_data['new_email']
                
                # Generate verification code
                code = '{:06d}'.format(random.randint(0, 999999))
                request.user.verification_code = code
                request.user.code_sent_at = timezone.now()
                request.user.save()
                
                # Generate token and uidb64 for email change verification
                uidb64 = urlsafe_base64_encode(force_bytes(request.user.pk))
                token = default_token_generator.make_token(request.user)
                
                # Send verification email
                try:
                    verify_url = request.build_absolute_uri(
                        reverse('accounts:verify_email_change', args=[uidb64, token])
                    )
                    context = {
                        'user': request.user,
                        'code': code,
                        'verify_url': verify_url,
                        'new_email': new_email,
                        'logo_url': request.build_absolute_uri('/static/img/logo.png'),
                    }
                    html_content = render_to_string('accounts/email_change.html', context)
                    text_content = strip_tags(html_content)
                    email_obj = EmailMultiAlternatives(
                        subject='تایید تغییر ایمیل - PIMXCHAT',
                        body=text_content,
                        to=[new_email]
                    )
                    email_obj.attach_alternative(html_content, "text/html")
                    email_obj.send()
                    
                    # Store new email in session for verification
                    request.session['pending_email_change'] = new_email
                    
                    messages.success(request, 'کد تایید به ایمیل جدید شما ارسال شد.')
                    return redirect('accounts:verify_email_change', uidb64=uidb64, token=token)
                except Exception as e:
                    print('EMAIL SEND ERROR:', e)
                    messages.error(request, 'خطا در ارسال ایمیل. لطفاً دوباره تلاش کنید.')
            except Exception as e:
                messages.error(request, 'خطا در تغییر ایمیل. لطفاً دوباره تلاش کنید.')
        else:
            # Display detailed form errors
            for field, errors in form.errors.items():
                for error in errors:
                    if field == '__all__':
                        messages.error(request, error)
                    else:
                        field_name = form.fields[field].label or field
                        messages.error(request, f'{field_name}: {error}')
    else:
        form = EmailChangeForm(user=request.user)
    
    return render(request, 'accounts/change_email.html', {'form': form})

def verify_email_change_view(request, uidb64, token):
    """View for verifying email change with verification code"""
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    
    if user is not None and default_token_generator.check_token(user, token):
        # Get pending email from session
        pending_email = request.session.get('pending_email_change')
        if not pending_email:
            messages.error(request, 'درخواست تغییر ایمیل نامعتبر است.')
            return redirect('accounts:profile')
        
        if request.method == 'POST':
            form = EmailChangeVerificationForm(request.POST)
            if form.is_valid():
                code = form.cleaned_data['code']
                if is_code_expired(user.code_sent_at, expiration_minutes=2):
                    messages.error(request, 'کد تایید منقضی شده است. لطفاً دوباره تلاش کنید.')
                    # Clear session data
                    if 'pending_email_change' in request.session:
                        del request.session['pending_email_change']
                    return redirect('accounts:change_email')
                
                if code == user.verification_code:
                    try:
                        # Save old email before changing
                        old_email = user.email
                        # Update user's email
                        user.email = pending_email
                        user.verification_code = ''
                        user.save()
                        # Send notification to old email only if notifications are enabled
                        if old_email and old_email != pending_email and user.login_notifications_enabled:
                            context = {
                                'user': user,
                                'new_email': pending_email,
                                'logo_url': request.build_absolute_uri('/static/img/logo.png'),
                            }
                            html_content = render_to_string('accounts/email_email_changed.html', context)
                            text_content = strip_tags(html_content)
                            email_obj = EmailMultiAlternatives(
                                subject='تغییر ایمیل حساب کاربری - PIMXCHAT',
                                body=text_content,
                                to=[old_email]
                            )
                            email_obj.attach_alternative(html_content, "text/html")
                            email_obj.send()
                        # Clear session data
                        if 'pending_email_change' in request.session:
                            del request.session['pending_email_change']
                        messages.success(request, 'ایمیل شما با موفقیت تغییر یافت.')
                        return redirect('accounts:profile')
                    except Exception as e:
                        messages.error(request, 'خطا در تغییر ایمیل. لطفاً دوباره تلاش کنید.')
                else:
                    messages.error(request, 'کد تایید نامعتبر است. لطفاً دوباره تلاش کنید.')
            else:
                for field, errors in form.errors.items():
                    for error in errors:
                        messages.error(request, f'{field}: {error}')
        else:
            form = EmailChangeVerificationForm()
        
        remaining_seconds = get_remaining_time(user.code_sent_at, expiration_minutes=2)
        remaining_time_formatted = format_remaining_time(remaining_seconds)
        
        return render(request, 'accounts/verify_email_change.html', {
            'form': form,
            'email': pending_email,
            'remaining_time': remaining_time_formatted,
            'remaining_seconds': remaining_seconds,
            'uidb64': uidb64,
            'token': token
        })
    else:
        messages.error(request, 'لینک تایید نامعتبر است یا منقضی شده است.')
        return redirect('accounts:profile')

def resend_email_change_code_view(request, uidb64, token):
    """View for resending email change verification code"""
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    
    if user is not None and default_token_generator.check_token(user, token):
        # Get pending email from session
        pending_email = request.session.get('pending_email_change')
        if not pending_email:
            messages.error(request, 'درخواست تغییر ایمیل نامعتبر است.')
            return redirect('accounts:profile')
        
        # Generate new code
        code = '{:06d}'.format(random.randint(0, 999999))
        user.verification_code = code
        user.code_sent_at = timezone.now()
        user.save()
        
        # Send verification email
        try:
            verify_url = request.build_absolute_uri(
                reverse('accounts:verify_email_change', args=[uidb64, token])
            )
            context = {
                'user': user,
                'code': code,
                'verify_url': verify_url,
                'logo_url': request.build_absolute_uri('/static/img/logo.png'),
            }
            html_content = render_to_string('accounts/email_change.html', context)
            text_content = strip_tags(html_content)
            email_obj = EmailMultiAlternatives(
                subject='کد تایید تغییر ایمیل - PIMXCHAT',
                body=text_content,
                to=[pending_email]
            )
            email_obj.attach_alternative(html_content, "text/html")
            email_obj.send()
            messages.success(request, 'کد تایید جدید به ایمیل شما ارسال شد.')
            return redirect('accounts:verify_email_change', uidb64=uidb64, token=token)
        except Exception as e:
            print('EMAIL SEND ERROR:', e)
            messages.error(request, 'خطا در ارسال ایمیل. لطفاً دوباره تلاش کنید.')
            return redirect('accounts:change_email')
    else:
        messages.error(request, 'لینک تایید نامعتبر است یا منقضی شده است.')
        return redirect('accounts:profile')

def resend_verification_code_view(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    if user is not None and default_token_generator.check_token(user, token):
        # Generate new code
        code = '{:06d}'.format(random.randint(0, 999999))
        user.verification_code = code
        user.code_sent_at = timezone.now()
        user.save()
        # Send verification email with unique link
        verify_url = request.build_absolute_uri(
            reverse('accounts:verify_email', args=[uidb64, token])
        )
        context = {
            'user': user,
            'code': code,
            'verify_url': verify_url,
            'logo_url': request.build_absolute_uri('/static/img/logo.png'),
        }
        html_content = render_to_string('accounts/email_verification.html', context)
        text_content = strip_tags(html_content)
        email = EmailMultiAlternatives(
            subject='کد تایید ثبت نام - PIMXCHAT',
            body=text_content,
            to=[user.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
        messages.success(request, 'کد تایید جدید به ایمیل شما ارسال شد.')
        return redirect('accounts:verify_email', uidb64=uidb64, token=token)
    else:
        messages.error(request, 'لینک تایید نامعتبر است یا منقضی شده است.')
        return redirect('accounts:register')

@login_required
def toggle_two_factor(request):
    if request.method == 'POST':
        enable = request.POST.get('enable')
        if enable is None:
            return JsonResponse({'error': 'Missing "enable" parameter.'}, status=400)
        request.user.two_factor_enabled = (enable == 'true' or enable == '1' or enable is True)
        request.user.save(update_fields=['two_factor_enabled'])
        return JsonResponse({'two_factor_enabled': request.user.two_factor_enabled})
    return JsonResponse({'error': 'Invalid request method.'}, status=405)

@login_required
def toggle_login_notifications(request):
    if request.method == 'POST':
        enable = request.POST.get('enable')
        if enable is None:
            return JsonResponse({'error': 'Missing "enable" parameter.'}, status=400)
        request.user.login_notifications_enabled = (enable == 'true' or enable == '1' or enable is True)
        request.user.save(update_fields=['login_notifications_enabled'])
        return JsonResponse({'login_notifications_enabled': request.user.login_notifications_enabled})
    return JsonResponse({'error': 'Invalid request method.'}, status=405)

@login_required
def save_settings(request):
    if request.method == 'POST':
        try:
            language = request.POST.get('language')
            theme = request.POST.get('theme')
            font_size = request.POST.get('font_size')

            # Validate and save language
            if language in ['fa', 'en']:
                request.user.language = language

            # Validate and save theme
            if theme in ['dark', 'light', 'system']:
                request.user.theme = theme

            # Save font size to session (or to user model if you add it)
            if font_size in ['normal', 'small', 'large']:
                request.session['font_size'] = font_size
            else:
                request.session['font_size'] = 'normal'

            request.user.save(update_fields=['language', 'theme'])

            return JsonResponse({
                'success': True,
                'message': 'تنظیمات با موفقیت ذخیره شد.',
                'settings': {
                    'language': request.user.language,
                    'theme': request.user.theme,
                    'font_size': request.session.get('font_size', 'normal')
                }
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': 'خطا در ذخیره تنظیمات: ' + str(e)
            }, status=500)
    return JsonResponse({'error': 'Invalid request method.'}, status=405)

@csrf_exempt
def ajax_resend_verification_code(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method.'}, status=405)
    flow = request.POST.get('flow')
    now = timezone.now()
    # Registration (session-based)
    if flow == 'registration':
        reg_data = request.session.get('registration_data')
        if not reg_data:
            return JsonResponse({'error': 'No registration data found.'}, status=400)
        last_sent = reg_data.get('code_sent_at')
        if last_sent:
            last_sent = timezone.datetime.fromisoformat(last_sent)
            if (now - last_sent) < timedelta(minutes=2):
                remaining = 120 - int((now - last_sent).total_seconds())
                return JsonResponse({'error': 'Please wait before resending.', 'remaining': remaining}, status=429)
        # Generate and send new code
        code = '{:06d}'.format(random.randint(0, 999999))
        reg_data['verification_code'] = code
        reg_data['code_sent_at'] = now.isoformat()
        request.session['registration_data'] = reg_data
        from .utils import send_verification_email
        send_verification_email(reg_data['email'], reg_data['username'], code)
        return JsonResponse({'success': True, 'remaining': 120})
    # Email change (user-based)
    elif flow == 'email_change':
        from .models import User
        uid = request.POST.get('uid')
        token = request.POST.get('token')
        from django.utils.http import urlsafe_base64_decode
        from django.contrib.auth.tokens import default_token_generator
        try:
            user = User.objects.get(pk=urlsafe_base64_decode(uid))
        except Exception:
            return JsonResponse({'error': 'User not found.'}, status=404)
        if not default_token_generator.check_token(user, token):
            return JsonResponse({'error': 'Invalid token.'}, status=403)
        last_sent = user.code_sent_at
        if last_sent and (now - last_sent) < timedelta(minutes=2):
            remaining = 120 - int((now - last_sent).total_seconds())
            return JsonResponse({'error': 'Please wait before resending.', 'remaining': remaining}, status=429)
        code = '{:06d}'.format(random.randint(0, 999999))
        user.verification_code = code
        user.code_sent_at = now
        user.save(update_fields=['verification_code', 'code_sent_at'])
        pending_email = request.session.get('pending_email_change')
        from .utils import send_verification_email
        send_verification_email(pending_email, user.username, code)
        return JsonResponse({'success': True, 'remaining': 120})
    # Password reset (user-based)
    elif flow == 'password_reset':
        from .models import User
        email = request.POST.get('email')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found.'}, status=404)
        last_sent = user.code_sent_at
        if last_sent and (now - last_sent) < timedelta(minutes=2):
            remaining = 120 - int((now - last_sent).total_seconds())
            return JsonResponse({'error': 'Please wait before resending.', 'remaining': remaining}, status=429)
        code = '{:06d}'.format(random.randint(0, 999999))
        user.verification_code = code
        user.code_sent_at = now
        user.save(update_fields=['verification_code', 'code_sent_at'])
        from .utils import send_verification_email
        send_verification_email(user.email, user.username, code)
        return JsonResponse({'success': True, 'remaining': 120})
    # Login code verification (user-based)
    elif flow == 'login_code':
        from .models import User
        user_id = request.POST.get('user_id')
        if not user_id:
            return JsonResponse({'error': 'User ID is required.'}, status=400)
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found.'}, status=404)
        last_sent = user.code_sent_at
        if last_sent and (now - last_sent) < timedelta(minutes=2):
            remaining = 120 - int((now - last_sent).total_seconds())
            return JsonResponse({'error': 'Please wait before resending.', 'remaining': remaining}, status=429)
        code = '{:06d}'.format(random.randint(0, 999999))
        user.verification_code = code
        user.code_sent_at = now
        user.save(update_fields=['verification_code', 'code_sent_at'])
        # Send code email
        context = {
            'user': user,
            'code': code,
            'logo_url': request.build_absolute_uri('/static/img/logo.png'),
        }
        html_content = render_to_string('accounts/email_verification.html', context)
        text_content = strip_tags(html_content)
        email = EmailMultiAlternatives(
            subject='کد تایید ورود - PIMXCHAT',
            body=text_content,
            to=[user.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
        return JsonResponse({'success': True, 'remaining': 120})
    return JsonResponse({'error': 'Invalid flow.'}, status=400)

@csrf_exempt
def submit_rating_view(request):
    if request.method == 'POST':
        rating = request.POST.get('rating')
        user_id = request.POST.get('user_id')
        try:
            rating = int(rating)
            if rating < 1 or rating > 5:
                return JsonResponse({'success': False, 'error': 'امتیاز نامعتبر است.'}, status=400)
        except (ValueError, TypeError):
            return JsonResponse({'success': False, 'error': 'امتیاز نامعتبر است.'}, status=400)
        user = None
        if request.user.is_authenticated:
            user = request.user
        elif user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                user = None
        UserRating.objects.create(user=user, rating=rating)
        return JsonResponse({'success': True})
    return JsonResponse({'success': False, 'error': 'درخواست نامعتبر.'}, status=405)

@csrf_exempt
def satisfaction_percentage_view(request):
    total = UserRating.objects.count()
    satisfied = UserRating.objects.filter(rating__gte=4).count()
    percent = int((satisfied / total) * 100) if total > 0 else 0
    return JsonResponse({'satisfaction_percentage': percent})

@login_required
def logout_rating_view(request):
    if request.method == 'POST':
        rating = request.POST.get('rating')
        try:
            rating = int(rating)
            if rating < 1 or rating > 5:
                raise ValueError
        except (ValueError, TypeError):
            return render(request, 'accounts/logout_rating.html', {'error': 'امتیاز نامعتبر است.'})
        # Save rating
        from .models import UserRating
        UserRating.objects.create(user=request.user, rating=rating)
        # Send logout email only if notifications are enabled
        try:
            if request.user.login_notifications_enabled:
                context = {
                    'user': request.user,
                    'logo_url': request.build_absolute_uri('/static/img/logo.png'),
                }
                html_content = render_to_string('accounts/email_logout_notification.html', context)
                text_content = strip_tags(html_content)
                email = EmailMultiAlternatives(
                    subject='خروج از حساب کاربری - PIMXCHAT',
                    body=text_content,
                    to=[request.user.email]
                )
                email.attach_alternative(html_content, "text/html")
                email.send()
        except Exception as e:
            print('LOGOUT EMAIL ERROR:', e)
        # Log out
        auth_logout(request)
        messages.success(request, 'شما با موفقیت خارج شدید.')
        return redirect('/')
    # GET: show rating page
    return render(request, 'accounts/logout_rating.html')

@api_view(['GET'])
def site_stats(request):
    User = get_user_model()
    user_count = User.objects.count()
    chat_count = ChatMessage.objects.count()
    satisfaction = UserRating.objects.aggregate(avg_rating=Avg('rating'))['avg_rating']
    if satisfaction is None:
        satisfaction_percent = 0
    else:
        satisfaction_percent = round((satisfaction / 5) * 100, 2)
    return Response({
        'user_count': user_count,
        'chat_count': chat_count,
        'satisfaction': satisfaction_percent,
    })
