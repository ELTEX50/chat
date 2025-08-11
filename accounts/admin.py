from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.shortcuts import render, get_object_or_404
from django.contrib.admin.views.decorators import staff_member_required
from django.http import HttpResponse, HttpResponseRedirect, HttpResponseNotAllowed
from django.contrib import messages
from django.contrib.auth import logout as auth_logout
from django.shortcuts import redirect
from .models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from pimxchat.models import ChatSession, ChatMessage
from pimxchat.admin import ChatSessionAdmin, ChatMessageAdmin
from django.contrib.auth.forms import UserCreationForm
from .forms import CustomUserCreationForm, CustomUserChangeForm
from django.contrib.auth.models import Group, Permission
from django.urls import path
from .models import User, UserRating
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.db.models import Q

# Custom admin site with proper logout handling
class CustomAdminSite(admin.AdminSite):
    def logout(self, request, extra_context=None):
        """Override admin logout to handle both GET and POST requests"""
        if request.method in ['GET', 'POST']:
            try:
                auth_logout(request)
                messages.success(request, 'شما با موفقیت از پنل مدیریت خارج شدید.')
            except Exception as e:
                messages.error(request, f'خطا در خروج: {str(e)}')
            
            # Always redirect to homepage
            return redirect('/')
        
        # For any other method, return method not allowed
        return HttpResponseNotAllowed(['GET', 'POST'])

# Create custom admin site instance
custom_admin_site = CustomAdminSite(name='admin')

# Custom admin view for detailed user information
@staff_member_required
def user_detail_view(request, user_id):
    user = get_object_or_404(User, id=user_id)
    
    # Handle clear chat action
    if request.method == 'POST' and request.POST.get('action') == 'clear_user_chat':
        from pimxchat.models import ChatMessage
        deleted_count, _ = ChatMessage.objects.filter(user=user).delete()
        if deleted_count == 1:
            messages.success(request, f'پیام چت کاربر پاک شد.')
        else:
            messages.success(request, f'{deleted_count} پیام چت کاربر پاک شد.')
        return HttpResponseRedirect(reverse('admin_user_detail', args=[user.id]))
    
    # Get user's password hash (for admin viewing)
    password_hash = user.password
    
    context = {
        'user': user,
        'password_hash': password_hash,
        'title': f'جزئیات کاربر: {user.email}',
        'opts': User._meta,
    }
    
    return render(request, 'admin/accounts/user/detail.html', context)

@staff_member_required
def satisfaction_stats_view(request):
    from django.db.models import Count
    # Count unique users per rating (one per user per score)
    stats = UserRating.objects.filter(user__isnull=False).values('rating', 'user').distinct()
    rating_counts = {i: 0 for i in range(1, 6)}
    user_lists = {i: [] for i in range(1, 6)}
    user_emails = {}
    # Build a map of user id to email
    from accounts.models import User
    for user in User.objects.all():
        user_emails[user.id] = user.email
    for stat in stats:
        rating = stat['rating']
        user_id = stat['user']
        if user_id:
            rating_counts[rating] += 1
            if user_emails.get(user_id) and user_emails[user_id] not in user_lists[rating]:
                user_lists[rating].append(user_emails[user_id])
    total = len(set([stat['user'] for stat in stats if stat['user']]))
    percentages = {i: (rating_counts[i] / total * 100 if total else 0) for i in range(1, 6)}
    range_1_5 = [1, 2, 3, 4, 5]
    context = {
        'rating_counts': rating_counts,
        'percentages': percentages,
        'total': total,
        'range_1_5': range_1_5,
        'user_lists': user_lists,
    }
    return render(request, 'admin/accounts/satisfaction_stats.html', context)

@staff_member_required
def user_ratings_view(request):
    from django.utils import timezone
    from datetime import timedelta
    from django.http import JsonResponse
    User = get_user_model()
    
    # Only show ratings from the last 3 months
    three_months_ago = timezone.now() - timedelta(days=90)
    ratings_qs = UserRating.objects.select_related('user').filter(submitted_at__gte=three_months_ago)
    
    # Handle filtering and sorting
    sort_by = request.GET.get('sort', '-submitted_at')
    rating_filter = request.GET.get('rating', '')
    search_query = request.GET.get('search', '')
    
    # Apply filters
    if rating_filter:
        ratings_qs = ratings_qs.filter(rating=rating_filter)
    
    if search_query:
        ratings_qs = ratings_qs.filter(
            Q(user__username__icontains=search_query) |
            Q(user__email__icontains=search_query)
        )
    
    # Apply sorting
    ratings_qs = ratings_qs.order_by(sort_by)
    
    # Handle AJAX requests
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        ratings_data = []
        for rating in ratings_qs:
            rating_emoji = {
                1: '😡', 2: '😞', 3: '😐', 4: '🙂', 5: '😍'
            }.get(rating.rating, '😐')
            
            rating_text = {
                1: 'خیلی بد', 2: 'بد', 3: 'معمولی', 4: 'خوب', 5: 'عالی'
            }.get(rating.rating, 'معمولی')
            
            ratings_data.append({
                'username': rating.user.username,
                'email': rating.user.email,
                'rating': rating.rating,
                'rating_emoji': rating_emoji,
                'rating_text': rating_text,
                'submitted_at': rating.submitted_at.strftime('%Y/%m/%d %H:%M')
            })
        
        return JsonResponse({'ratings': ratings_data})
    
    # Regular request - render template
    users = User.objects.all()
    rating_choices = [(i, emoji) for i, emoji in zip(range(1, 6), ['😡', '😞', '😐', '🙂', '😍'])]

    context = {
        'ratings': ratings_qs,
        'users': users,
        'rating_choices': rating_choices,
        'sort_by': sort_by,
        'selected_rating': rating_filter,
        'search_query': search_query,
    }
    return render(request, 'admin/accounts/user_ratings.html', context)


class UserAdmin(BaseUserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = User
    list_display = ('email', 'username', 'is_active', 'is_verified', 'login_count', 'last_login_time', 'profile_picture_display', 'view_details_link')
    list_filter = ('is_active', 'is_verified', 'is_staff', 'is_superuser', 'language', 'theme', 'date_joined')
    search_fields = ('email', 'username', 'last_login_ip', 'last_login_location')
    readonly_fields = ('login_count', 'last_login_time', 'last_login_ip', 'last_login_location', 'last_login_device', 
                      'profile_picture_captured', 'profile_picture_capture_time', 'date_joined')
    ordering = ('-date_joined',)
    
    # Persian translations
    class Meta:
        verbose_name = _('کاربر')
        verbose_name_plural = _('کاربران')
    
    fieldsets = (
        ('اطلاعات اصلی', {
            'fields': ('email', 'username', 'password', 'age', 'profile_picture')
        }),
        ('وضعیت حساب', {
            'fields': ('is_active', 'is_verified', 'is_staff', 'is_superuser', 'two_factor_enabled')
        }),
        ('تنظیمات شخصی', {
            'fields': ('language', 'theme')
        }),
        ('اطلاعات ورود', {
            'fields': ('login_count', 'last_login_time', 'last_login_ip', 'last_login_location', 'last_login_device')
        }),
        ('تصویر پروفایل', {
            'fields': ('profile_picture_captured', 'profile_picture_capture_time')
        }),
        ('تایید ایمیل', {
            'fields': ('verification_code', 'code_sent_at')
        }),
        ('دسترسی‌ها', {
            'fields': ('groups', 'user_permissions')
        }),
        ('تاریخ‌ها', {
            'fields': ('date_joined', 'last_login')
        }),
    )
    
    add_fieldsets = (
        ('اطلاعات اصلی', {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'age', 'profile_picture')
        }),
        ('وضعیت حساب', {
            'fields': ('is_active', 'is_verified', 'is_staff', 'is_superuser', 'two_factor_enabled')
        }),
        ('تنظیمات شخصی', {
            'fields': ('language', 'theme')
        }),
    )
    
    def profile_picture_display(self, obj):
        if obj.profile_picture:
            return format_html(
                '<img src="{}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" />',
                obj.profile_picture.url
            )
        return "بدون تصویر"
    profile_picture_display.short_description = 'تصویر پروفایل'
    
    def view_details_link(self, obj):
        return format_html(
            '<a class="button" href="{}">مشاهده جزئیات</a>',
            reverse('admin_user_detail', args=[obj.id])
        )
    view_details_link.short_description = 'جزئیات'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()
    
    def get_readonly_fields(self, request, obj=None):
        readonly_fields = list(super().get_readonly_fields(request, obj))
        if obj:  # Editing existing object
            readonly_fields.extend(['password'])
        return readonly_fields
    
    def save_model(self, request, obj, form, change):
        if not change:  # Creating new object
            # For new users, the password is already set by the form's clean method
            # The form handles password1/password2 validation and sets the password
            pass
        super().save_model(request, obj, form, change)
    
    # Custom admin actions
    actions = ['activate_users', 'deactivate_users', 'verify_users', 'unverify_users', 'view_user_details', 'clear_user_chat']
    
    def activate_users(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} کاربر فعال شد.')
    activate_users.short_description = "فعال کردن کاربران انتخاب شده"
    
    def deactivate_users(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} کاربر غیرفعال شد.')
    deactivate_users.short_description = "غیرفعال کردن کاربران انتخاب شده"
    
    def verify_users(self, request, queryset):
        updated = queryset.update(is_verified=True)
        self.message_user(request, f'{updated} کاربر تایید شد.')
    verify_users.short_description = "تایید کاربران انتخاب شده"
    
    def unverify_users(self, request, queryset):
        updated = queryset.update(is_verified=False)
        self.message_user(request, f'{updated} کاربر تایید نشد.')
    unverify_users.short_description = "عدم تایید کاربران انتخاب شده"
    
    def view_user_details(self, request, queryset):
        if queryset.count() == 1:
            user = queryset.first()
            return HttpResponseRedirect(reverse('admin_user_detail', args=[user.id]))
        else:
            self.message_user(request, 'لطفاً فقط یک کاربر را انتخاب کنید.')
    view_user_details.short_description = "مشاهده جزئیات کاربر انتخاب شده"
    
    def clear_user_chat(self, request, queryset):
        total_deleted = 0
        for user in queryset:
            deleted_count, _ = ChatMessage.objects.filter(user=user).delete()
            total_deleted += deleted_count
        
        if total_deleted == 1:
            self.message_user(request, f'پیام چت {total_deleted} کاربر پاک شد.')
        else:
            self.message_user(request, f'پیام‌های چت {total_deleted} کاربر پاک شد.')
    clear_user_chat.short_description = "پاک کردن پیام‌های چت کاربران انتخاب شده"

# Register the User model with the custom admin site
custom_admin_site.register(User, UserAdmin)

# Register models with the custom admin site
custom_admin_site.register(ChatSession, ChatSessionAdmin)
custom_admin_site.register(ChatMessage, ChatMessageAdmin)

# Register default Django auth models
custom_admin_site.register(Group)
custom_admin_site.register(Permission)

# Register custom admin URLs
def get_custom_admin_urls():
    return [
        path('satisfaction-stats/', satisfaction_stats_view, name='satisfaction_stats'),
        path('user-ratings/', user_ratings_view, name='user_ratings'),
    ] + CustomAdminSite.get_urls(custom_admin_site)

custom_admin_site.get_urls = get_custom_admin_urls
