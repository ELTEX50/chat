
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
import jdatetime
from django.conf import settings

class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, username, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(_('ایمیل'), unique=True)
    username = models.CharField(_('نام کاربری'), max_length=150, unique=True)
    age = models.PositiveIntegerField(_('سن'), null=True, blank=True)
    profile_picture = models.ImageField(_('تصویر پروفایل'), upload_to='profile_pics/', null=True, blank=True)
    is_active = models.BooleanField(_('فعال'), default=True)
    is_staff = models.BooleanField(_('کارمند'), default=False)
    date_joined = models.DateTimeField(_('تاریخ عضویت'), default=timezone.now)
    is_verified = models.BooleanField(_('تایید شده'), default=False)
    verification_code = models.CharField(_('کد تایید'), max_length=6, blank=True, null=True)
    code_sent_at = models.DateTimeField(_('زمان ارسال کد'), null=True, blank=True)
    language = models.CharField(_('زبان'), max_length=10, choices=[('fa', 'فارسی'), ('en', 'انگلیسی')], default='fa')
    theme = models.CharField(_('تم'), max_length=10, choices=[('dark', 'تاریک'), ('light', 'روشن')], default='dark')
    
    # New fields for login tracking
    last_login_time = models.DateTimeField(_('آخرین ورود'), null=True, blank=True)
    last_login_ip = models.GenericIPAddressField(_('آدرس IP'), null=True, blank=True)
    last_login_location = models.CharField(_('موقعیت'), max_length=255, null=True, blank=True)
    last_login_device = models.CharField(_('دستگاه'), max_length=500, null=True, blank=True)
    login_count = models.PositiveIntegerField(_('تعداد ورود'), default=0)
    profile_picture_captured = models.BooleanField(_('تصویر پروفایل آپلود شده'), default=False)
    profile_picture_capture_time = models.DateTimeField(_('زمان آپلود تصویر'), null=True, blank=True)
    two_factor_enabled = models.BooleanField(_('احراز هویت دو مرحله‌ای'), default=False)
    login_notifications_enabled = models.BooleanField(_('فعال بودن اعلان‌های ورود'), default=True, help_text=_('آیا اعلان‌های ورود برای این کاربر فعال است؟'))
    last_verification_code_time = models.DateTimeField(_('آخرین زمان تایید کد ورود'), null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = UserManager()

    def __str__(self):
        return self.email
    
    class Meta:
        verbose_name = _('کاربر')
        verbose_name_plural = _('کاربران')

    def update_login_info(self, ip_address, location, device_info):
        """Update user's login information"""
        self.last_login_time = timezone.now()
        self.last_login_ip = ip_address
        self.last_login_location = location
        self.last_login_device = device_info
        self.login_count += 1
        self.save(update_fields=['last_login_time', 'last_login_ip', 'last_login_location', 'last_login_device', 'login_count'])

    def capture_profile_picture(self, image_file):
        """Capture and save user's profile picture"""
        if image_file:
            self.profile_picture = image_file
            self.profile_picture_captured = True
            self.profile_picture_capture_time = timezone.now()
            self.save(update_fields=['profile_picture', 'profile_picture_captured', 'profile_picture_capture_time'])
            return True
        return False

    def get_jalali_date_joined(self, format_string="%Y/%m/%d"):
        """Get the user's join date in Jalali calendar format"""
        if self.date_joined is None:
            return ""
        
        # Convert to timezone-aware datetime if it's naive
        if timezone.is_naive(self.date_joined):
            date_joined = timezone.make_aware(self.date_joined)
        else:
            date_joined = self.date_joined
        
        # Convert to Jalali date
        jalali_date = jdatetime.datetime.fromgregorian(datetime=date_joined)
        
        # Format the date
        return jalali_date.strftime(format_string)

    def get_jalali_date_joined_verbose(self):
        """Get the user's join date in verbose Jalali format with Persian text"""
        if self.date_joined is None:
            return ""
        
        # Convert to timezone-aware datetime if it's naive
        if timezone.is_naive(self.date_joined):
            date_joined = timezone.make_aware(self.date_joined)
        else:
            date_joined = self.date_joined
        
        # Convert to Jalali date
        jalali_date = jdatetime.datetime.fromgregorian(datetime=date_joined)
        
        # Persian month names
        persian_months = {
            1: "فروردین",
            2: "اردیبهشت", 
            3: "خرداد",
            4: "تیر",
            5: "مرداد",
            6: "شهریور",
            7: "مهر",
            8: "آبان",
            9: "آذر",
            10: "دی",
            11: "بهمن",
            12: "اسفند"
        }
        
        # Persian day names
        persian_days = {
            0: "شنبه",
            1: "یکشنبه",
            2: "دوشنبه", 
            3: "سه‌شنبه",
            4: "چهارشنبه",
            5: "پنج‌شنبه",
            6: "جمعه"
        }
        
        year = jalali_date.year
        month = persian_months[jalali_date.month]
        day = jalali_date.day
        weekday = persian_days[jalali_date.weekday()]
        
        return f"{weekday} {day} {month} {year}"

class UserRating(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_('کاربر'))
    rating = models.PositiveSmallIntegerField(_('امتیاز'), choices=[(i, str(i)) for i in range(1, 6)])
    submitted_at = models.DateTimeField(_('تاریخ ثبت'), auto_now_add=True)

    class Meta:
        verbose_name = _('امتیاز کاربر')
        verbose_name_plural = _('امتیازهای کاربران')

    def __str__(self):
        return f"{self.user} - {self.rating}"
