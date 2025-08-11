from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from .models import User
from django.contrib.auth import authenticate
import re
from django.contrib.auth import password_validation

class UserRegisterForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
        label='ایمیل',
        widget=forms.EmailInput(attrs={'placeholder': 'example@email.com'})
    )
    age = forms.IntegerField(
        required=True,
        label='سن',
        min_value=13,
        max_value=120,
        widget=forms.NumberInput(attrs={'placeholder': 'سن خود را وارد کنید'})
    )
    profile_picture = forms.ImageField(
        required=False,
        label='تصویر پروفایل',
        help_text='تصویر پروفایل خود را انتخاب کنید (اختیاری)'
    )
    password1 = forms.CharField(
        label='رمز عبور',
        widget=forms.PasswordInput(attrs={'placeholder': 'رمز عبور خود را وارد کنید'}),
        help_text='رمز عبور باید حداقل 8 کاراکتر باشد و شامل حروف و اعداد باشد'
    )
    password2 = forms.CharField(
        label='تأیید رمز عبور',
        widget=forms.PasswordInput(attrs={'placeholder': 'رمز عبور خود را دوباره وارد کنید'}),
        help_text='رمز عبور خود را دوباره وارد کنید'
    )

    class Meta:
        model = User
        fields = ['email', 'username', 'age', 'profile_picture', 'password1', 'password2']
        error_messages = {
            'password_mismatch': 'رمز عبور و تکرار آن یکسان نیستند.',
        }

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if email:
            # Check if email already exists
            if User.objects.filter(email=email).exists():
                raise ValidationError('این ایمیل قبلاً ثبت شده است')
            
            # Validate email format
            email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_regex, email):
                raise ValidationError('فرمت ایمیل نامعتبر است')
        return email

    def clean_username(self):
        username = self.cleaned_data.get('username')
        if username:
            # Check if username already exists
            if User.objects.filter(username=username).exists():
                raise ValidationError('این نام کاربری قبلاً استفاده شده است')
            
            # Validate username format
            if len(username) < 3:
                raise ValidationError('نام کاربری باید حداقل 3 کاراکتر باشد')
            
            if len(username) > 30:
                raise ValidationError('نام کاربری نمی‌تواند بیشتر از 30 کاراکتر باشد')
            
            # Check for valid characters
            if not re.match(r'^[a-zA-Z0-9_]+$', username):
                raise ValidationError('نام کاربری فقط می‌تواند شامل حروف، اعداد و _ باشد')
        return username

    def clean_age(self):
        age = self.cleaned_data.get('age')
        if age:
            if age < 13:
                raise ValidationError('حداقل سن برای ثبت نام 13 سال است')
            if age > 120:
                raise ValidationError('سن وارد شده نامعتبر است')
        return age

    def clean_profile_picture(self):
        profile_picture = self.cleaned_data.get('profile_picture')
        if profile_picture:
            # Check file size (max 5MB)
            if profile_picture.size > 5 * 1024 * 1024:
                raise ValidationError('حجم فایل نمی‌تواند بیشتر از 5 مگابایت باشد')
            
            # Check file type
            allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
            if profile_picture.content_type not in allowed_types:
                raise ValidationError('فقط فایل‌های تصویری (JPG, PNG, GIF) مجاز هستند')
        return profile_picture

    def clean_password2(self):
        password1 = self.cleaned_data.get('password1')
        password2 = self.cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            raise ValidationError('رمز عبور و تکرار آن یکسان نیستند.')
        return password2

    def _post_clean(self):
        super()._post_clean()
        password = self.cleaned_data.get('password2')
        if password:
            try:
                self.instance.username = self.cleaned_data.get('username')
                self.instance.email = self.cleaned_data.get('email')
                self.instance.age = self.cleaned_data.get('age')
                self.instance.profile_picture = self.cleaned_data.get('profile_picture')
                self.instance.clean()
                password_validation.validate_password(password, self.instance)
            except ValidationError as error:
                error_messages = []
                for message in error.messages:
                    if 'too short' in message:
                        error_messages.append('رمز عبور باید حداقل ۸ کاراکتر باشد.')
                    elif 'too common' in message:
                        error_messages.append('رمز عبور بسیار رایج است. لطفاً رمز عبور قوی‌تری انتخاب کنید.')
                    elif 'entirely numeric' in message:
                        error_messages.append('رمز عبور نباید فقط شامل اعداد باشد.')
                    else:
                        error_messages.append('رمز عبور نامعتبر است.')
                self.add_error('password2', error_messages)

class EmailVerificationForm(forms.Form):
    code = forms.CharField(
        max_length=6,
        min_length=6,
        required=True,
        label='کد تایید',
        widget=forms.TextInput(attrs={
            'placeholder': 'کد 6 رقمی را وارد کنید',
            'maxlength': '6',
            'pattern': '[0-9]{6}',
            'autocomplete': 'off',
            'autocorrect': 'off',
            'autocapitalize': 'off',
            'spellcheck': 'false',
        })
    )

    def clean_code(self):
        code = self.cleaned_data.get('code')
        if code:
            # Check if code contains only digits
            if not code.isdigit():
                raise ValidationError('کد تایید باید فقط شامل اعداد باشد')
            
            # Check if code is exactly 6 digits
            if len(code) != 6:
                raise ValidationError('کد تایید باید دقیقاً 6 رقم باشد')
        return code

class EmailLoginForm(forms.Form):
    email = forms.EmailField(
        label='ایمیل',
        required=True,
        widget=forms.EmailInput(attrs={'placeholder': 'ایمیل خود را وارد کنید'})
    )
    password = forms.CharField(
        label='رمز عبور',
        widget=forms.PasswordInput(attrs={'placeholder': 'رمز عبور خود را وارد کنید'})
    )

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if email:
            # Check if email exists
            if not User.objects.filter(email=email).exists():
                raise ValidationError('کاربری با این ایمیل یافت نشد')
        return email

    def clean(self):
        cleaned_data = super().clean()
        email = cleaned_data.get('email')
        password = cleaned_data.get('password')
        
        if email and password:
            try:
                # First, get the user by email to check their status
                user = User.objects.filter(email=email).first()
                if not user:
                    raise ValidationError('کاربری با این ایمیل یافت نشد')
                
                # Check if user is active before attempting authentication
                if not user.is_active:
                    raise ValidationError('حساب کاربری شما توسط مدیر غیرفعال شده است.')
                
                # Check if user is verified
                if not user.is_verified:
                    raise ValidationError('حساب کاربری شما هنوز تایید نشده است. لطفاً ایمیل خود را تایید کنید')
                
                # Now attempt authentication
                authenticated_user = authenticate(email=email, password=password)
                if not authenticated_user:
                    raise ValidationError('رمز عبور اشتباه است')
                
                cleaned_data['user'] = authenticated_user
            except ValidationError:
                # Re-raise ValidationError as is
                raise
            except Exception as e:
                raise ValidationError('خطا در احراز هویت. لطفاً دوباره تلاش کنید')
        return cleaned_data

class PasswordResetRequestForm(forms.Form):
    email = forms.EmailField(
        label='ایمیل',
        required=True,
        widget=forms.EmailInput(attrs={'placeholder': 'ایمیل خود را وارد کنید'})
    )

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if email:
            # Check if email exists
            if not User.objects.filter(email=email).exists():
                raise ValidationError('کاربری با این ایمیل یافت نشد')
            
            # Check if user is active
            user = User.objects.filter(email=email).first()
            if user and not user.is_active:
                raise ValidationError('حساب کاربری غیرفعال است')
        return email

class PasswordResetCodeForm(forms.Form):
    code = forms.CharField(
        max_length=6,
        min_length=6,
        required=True,
        label='کد بازنشانی',
        widget=forms.TextInput(attrs={
            'placeholder': 'کد 6 رقمی را وارد کنید',
            'maxlength': '6',
            'pattern': '[0-9]{6}'
        })
    )

    def clean_code(self):
        code = self.cleaned_data.get('code')
        if code:
            # Check if code contains only digits
            if not code.isdigit():
                raise ValidationError('کد باید فقط شامل اعداد باشد')
            
            # Check if code is exactly 6 digits
            if len(code) != 6:
                raise ValidationError('کد باید دقیقاً 6 رقم باشد')
        return code

class SetNewPasswordForm(forms.Form):
    new_password1 = forms.CharField(
        label='رمز عبور جدید',
        widget=forms.PasswordInput(attrs={'placeholder': 'رمز عبور جدید را وارد کنید'})
    )
    new_password2 = forms.CharField(
        label='تایید رمز عبور',
        widget=forms.PasswordInput(attrs={'placeholder': 'رمز عبور جدید را تکرار کنید'})
    )

    def clean_new_password1(self):
        password = self.cleaned_data.get('new_password1')
        if password:
            # Check password length
            if len(password) < 8:
                raise ValidationError('رمز عبور باید حداقل 8 کاراکتر باشد')
            
            # Check password complexity
            if not re.search(r'[A-Z]', password):
                raise ValidationError('رمز عبور باید حداقل یک حرف بزرگ داشته باشد')
            
            if not re.search(r'[a-z]', password):
                raise ValidationError('رمز عبور باید حداقل یک حرف کوچک داشته باشد')
            
            if not re.search(r'[0-9]', password):
                raise ValidationError('رمز عبور باید حداقل یک عدد داشته باشد')
            
            # Check for common passwords
            common_passwords = ['password', '123456', 'qwerty', 'admin', 'user']
            if password.lower() in common_passwords:
                raise ValidationError('رمز عبور انتخاب شده بسیار ساده است')
        return password

    def clean(self):
        cleaned_data = super().clean()
        p1 = cleaned_data.get('new_password1')
        p2 = cleaned_data.get('new_password2')
        
        if p1 and p2:
            if p1 != p2:
                raise ValidationError('رمزهای عبور مطابقت ندارند')
            
            # Check if new password is same as old password
            if len(p1) < 8:
                raise ValidationError('رمز عبور باید حداقل 8 کاراکتر باشد')
        return cleaned_data 

class CustomUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = User
        fields = ('email', 'username', 'age', 'profile_picture', 'language', 'theme', 'is_active', 'is_verified', 'is_staff', 'is_superuser', 'two_factor_enabled')

class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = ('email', 'username', 'age', 'profile_picture', 'language', 'theme', 'is_active', 'is_verified', 'is_staff', 'is_superuser', 'two_factor_enabled') 

class ProfileEditForm(forms.ModelForm):
    """Form for editing user profile information"""
    current_password = forms.CharField(
        label='رمز عبور فعلی',
        widget=forms.PasswordInput(attrs={
            'placeholder': 'رمز عبور فعلی خود را وارد کنید',
            'class': 'form-input'
        }),
        required=True,
        help_text='برای تایید تغییرات، رمز عبور فعلی خود را وارد کنید'
    )
    
    class Meta:
        model = User
        fields = ['username', 'profile_picture']
        
    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        
        # Add CSS classes to form fields
        self.fields['username'].widget.attrs.update({
            'class': 'form-input',
            'placeholder': 'نام کاربری خود را وارد کنید'
        })
        self.fields['profile_picture'].widget.attrs.update({
            'class': 'form-input'
        })
        
        # Make profile_picture optional
        self.fields['profile_picture'].required = False
        self.fields['profile_picture'].help_text = 'تصویر پروفایل خود را انتخاب کنید (اختیاری)'
        
    def clean_current_password(self):
        password = self.cleaned_data.get('current_password')
        if not self.user.check_password(password):
            raise ValidationError('رمز عبور فعلی اشتباه است')
        return password
        
    def clean_username(self):
        username = self.cleaned_data.get('username')
        if username:
            # Check if username already exists (excluding current user)
            if User.objects.filter(username=username).exclude(pk=self.user.pk).exists():
                raise ValidationError('این نام کاربری قبلاً استفاده شده است')
            
            # Validate username format
            if len(username) < 3:
                raise ValidationError('نام کاربری باید حداقل 3 کاراکتر باشد')
            
            if len(username) > 30:
                raise ValidationError('نام کاربری نمی‌تواند بیشتر از 30 کاراکتر باشد')
            
            # Check for valid characters
            if not re.match(r'^[a-zA-Z0-9_]+$', username):
                raise ValidationError('نام کاربری فقط می‌تواند شامل حروف، اعداد و _ باشد')
        return username
        
    def clean_profile_picture(self):
        profile_picture = self.cleaned_data.get('profile_picture')
        if profile_picture:
            # Check file size (max 5MB)
            if profile_picture.size > 5 * 1024 * 1024:
                raise ValidationError('حجم فایل نمی‌تواند بیشتر از 5 مگابایت باشد')
            
            # Check file type
            allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
            if profile_picture.content_type not in allowed_types:
                raise ValidationError('فقط فایل‌های تصویری (JPG, PNG, GIF) مجاز هستند')
        return profile_picture

class EmailChangeForm(forms.Form):
    """Form for changing email address"""
    new_email = forms.EmailField(
        label='ایمیل جدید',
        widget=forms.EmailInput(attrs={
            'placeholder': 'ایمیل جدید خود را وارد کنید',
            'class': 'form-input'
        }),
        required=True
    )
    current_password = forms.CharField(
        label='رمز عبور فعلی',
        widget=forms.PasswordInput(attrs={
            'placeholder': 'رمز عبور فعلی خود را وارد کنید',
            'class': 'form-input'
        }),
        required=True,
        help_text='برای تایید تغییر ایمیل، رمز عبور فعلی خود را وارد کنید'
    )
    
    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        
    def clean_current_password(self):
        password = self.cleaned_data.get('current_password')
        if not self.user.check_password(password):
            raise ValidationError('رمز عبور فعلی اشتباه است')
        return password
        
    def clean_new_email(self):
        email = self.cleaned_data.get('new_email')
        if email:
            # Check if email already exists
            if User.objects.filter(email=email).exists():
                raise ValidationError('این ایمیل قبلاً ثبت شده است')
            
            # Validate email format
            email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_regex, email):
                raise ValidationError('فرمت ایمیل نامعتبر است')
        return email

class EmailChangeVerificationForm(forms.Form):
    """Form for verifying email change with verification code"""
    code = forms.CharField(
        max_length=6,
        min_length=6,
        required=True,
        label='کد تایید',
        widget=forms.TextInput(attrs={
            'placeholder': 'کد 6 رقمی را وارد کنید',
            'maxlength': '6',
            'pattern': '[0-9]{6}',
            'class': 'form-input'
        })
    )
    
    def clean_code(self):
        code = self.cleaned_data.get('code')
        if code:
            # Check if code contains only digits
            if not code.isdigit():
                raise ValidationError('کد تایید باید فقط شامل اعداد باشد')
            
            # Check if code is exactly 6 digits
            if len(code) != 6:
                raise ValidationError('کد تایید باید دقیقاً 6 رقم باشد')
        return code 