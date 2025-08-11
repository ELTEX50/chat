from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.core import mail
from django.utils import timezone
from datetime import timedelta
import tempfile
import os
from PIL import Image
from .utils import is_code_expired, get_remaining_time, format_remaining_time
from django.template import Template, Context
from django.test import override_settings
import jdatetime

User = get_user_model()

class ComprehensiveErrorHandlingTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!',
            age=25,
            is_verified=True
        )

    def create_test_image(self):
        """Create a test image file"""
        image = Image.new('RGB', (100, 100), color='red')
        tmp_file = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
        image.save(tmp_file.name, 'JPEG')
        return tmp_file.name

    def test_registration_form_validation_errors(self):
        """Test comprehensive form validation errors during registration"""
        
        # Test invalid email format
        response = self.client.post(reverse('accounts:register'), {
            'email': 'invalid-email',
            'username': 'testuser',
            'age': 25,
            'password1': 'TestPass123!',
            'password2': 'TestPass123!'
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'فرمت ایمیل نامعتبر است')

        # Test existing email
        response = self.client.post(reverse('accounts:register'), {
            'email': 'test@example.com',
            'username': 'newuser',
            'age': 25,
            'password1': 'TestPass123!',
            'password2': 'TestPass123!'
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'این ایمیل قبلاً ثبت شده است')

        # Test existing username
        response = self.client.post(reverse('accounts:register'), {
            'email': 'new@example.com',
            'username': 'testuser',
            'age': 25,
            'password1': 'TestPass123!',
            'password2': 'TestPass123!'
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'این نام کاربری قبلاً استفاده شده است')

        # Test short username
        response = self.client.post(reverse('accounts:register'), {
            'email': 'new@example.com',
            'username': 'ab',
            'age': 25,
            'password1': 'TestPass123!',
            'password2': 'TestPass123!'
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'نام کاربری باید حداقل 3 کاراکتر باشد')

        # Test invalid username characters
        response = self.client.post(reverse('accounts:register'), {
            'email': 'new@example.com',
            'username': 'test-user@',
            'age': 25,
            'password1': 'TestPass123!',
            'password2': 'TestPass123!'
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'نام کاربری فقط می‌تواند شامل حروف، اعداد و _ باشد')

        # Test invalid age
        response = self.client.post(reverse('accounts:register'), {
            'email': 'new@example.com',
            'username': 'newuser',
            'age': 10,
            'password1': 'TestPass123!',
            'password2': 'TestPass123!'
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'حداقل سن برای ثبت نام 13 سال است')

        # Test large age
        response = self.client.post(reverse('accounts:register'), {
            'email': 'new@example.com',
            'username': 'newuser',
            'age': 150,
            'password1': 'TestPass123!',
            'password2': 'TestPass123!'
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'سن وارد شده نامعتبر است')

    def test_login_form_validation_errors(self):
        """Test comprehensive form validation errors during login"""
        
        # Test non-existent email
        response = self.client.post(reverse('accounts:login'), {
            'email': 'nonexistent@example.com',
            'password': 'TestPass123!'
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'کاربری با این ایمیل یافت نشد')

        # Test wrong password
        response = self.client.post(reverse('accounts:login'), {
            'email': 'test@example.com',
            'password': 'WrongPass123!'
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'رمز عبور اشتباه است')

        # Test inactive user
        self.user.is_active = False
        self.user.save()
        
        response = self.client.post(reverse('accounts:login'), {
            'email': 'test@example.com',
            'password': 'TestPass123!'
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Your account has been deactivated by the admin.')

        # Test unverified user
        self.user.is_active = True
        self.user.is_verified = False
        self.user.save()
        
        response = self.client.post(reverse('accounts:login'), {
            'email': 'test@example.com',
            'password': 'TestPass123!'
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'حساب کاربری شما هنوز تایید نشده است')

    def test_verification_code_validation_errors(self):
        """Test verification code validation errors"""
        
        # Create a user with verification code
        user = User.objects.create_user(
            username='verifyuser',
            email='verify@example.com',
            password='TestPass123!',
            age=25,
            is_active=False,
            verification_code='123456',
            code_sent_at=timezone.now()
        )
        
        # Set session
        session = self.client.session
        session['pending_user_id'] = user.id
        session.save()
        
        # Test invalid code format
        response = self.client.post(reverse('accounts:verify_email'), {
            'code': '12345'  # 5 digits instead of 6
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'کد تایید باید دقیقاً 6 رقم باشد')

        # Test non-numeric code
        response = self.client.post(reverse('accounts:verify_email'), {
            'code': '12345a'
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'کد تایید باید فقط شامل اعداد باشد')

        # Test expired code
        user.code_sent_at = timezone.now() - timedelta(minutes=3)
        user.save()
        
        response = self.client.post(reverse('accounts:verify_email'), {
            'code': '123456'
        })
        self.assertEqual(response.status_code, 302)  # Redirect to register
        self.assertRedirects(response, reverse('accounts:register'))

    def test_password_reset_validation_errors(self):
        """Test password reset validation errors"""
        
        # Test non-existent email
        response = self.client.post(reverse('accounts:password_reset_request'), {
            'email': 'nonexistent@example.com'
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'کاربری با این ایمیل یافت نشد')

        # Test inactive user
        self.user.is_active = False
        self.user.save()
        
        response = self.client.post(reverse('accounts:password_reset_request'), {
            'email': 'test@example.com'
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'حساب کاربری غیرفعال است')

    def test_new_password_validation_errors(self):
        """Test new password validation errors"""
        
        # Set up password reset session
        session = self.client.session
        session['reset_user_id'] = self.user.id
        session['reset_verified'] = True
        session.save()
        
        # Test short password
        response = self.client.post(reverse('accounts:password_reset_confirm'), {
            'new_password1': 'short',
            'new_password2': 'short'
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'رمز عبور باید حداقل 8 کاراکتر باشد')

        # Test password without uppercase
        response = self.client.post(reverse('accounts:password_reset_confirm'), {
            'new_password1': 'testpass123',
            'new_password2': 'testpass123'
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'رمز عبور باید حداقل یک حرف بزرگ داشته باشد')

        # Test password without lowercase
        response = self.client.post(reverse('accounts:password_reset_confirm'), {
            'new_password1': 'TESTPASS123',
            'new_password2': 'TESTPASS123'
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'رمز عبور باید حداقل یک حرف کوچک داشته باشد')

        # Test password without numbers
        response = self.client.post(reverse('accounts:password_reset_confirm'), {
            'new_password1': 'TestPass',
            'new_password2': 'TestPass'
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'رمز عبور باید حداقل یک عدد داشته باشد')

        # Test common password
        response = self.client.post(reverse('accounts:password_reset_confirm'), {
            'new_password1': 'password',
            'new_password2': 'password'
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'رمز عبور انتخاب شده بسیار ساده است')

        # Test password mismatch
        response = self.client.post(reverse('accounts:password_reset_confirm'), {
            'new_password1': 'TestPass123!',
            'new_password2': 'TestPass456!'
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'رمزهای عبور مطابقت ندارند')

    def test_profile_picture_validation_errors(self):
        """Test profile picture validation errors"""
        
        # Test large file size (would need to create a large file)
        # This is more of an integration test that would require file creation
        
        # Test invalid file type
        with tempfile.NamedTemporaryFile(suffix='.txt', delete=False) as tmp_file:
            tmp_file.write(b'This is not an image')
            tmp_file.flush()
            
            with open(tmp_file.name, 'rb') as file:
                response = self.client.post(reverse('accounts:register'), {
                    'email': 'new@example.com',
                    'username': 'newuser',
                    'age': 25,
                    'password1': 'TestPass123!',
                    'password2': 'TestPass123!',
                    'profile_picture': file
                })
            
            os.unlink(tmp_file.name)
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'فقط فایل‌های تصویری (JPG, PNG, GIF) مجاز هستند')

    def test_profile_picture_display(self):
        """Test that profile pictures are displayed correctly on profile page"""
        
        # Login the user
        self.client.login(email='test@example.com', password='TestPass123!')
        
        # Test profile page without profile picture (should show text avatar)
        response = self.client.get(reverse('accounts:profile'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'T')  # First letter of username
        self.assertNotContains(response, 'profile-picture')  # No image tag
        
        # Add a profile picture to the user
        image_path = self.create_test_image()
        with open(image_path, 'rb') as img:
            self.user.profile_picture.save('test_profile.jpg', img, save=True)
        
        # Test profile page with profile picture (should show image)
        response = self.client.get(reverse('accounts:profile'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'profile-picture')  # CSS class for image
        self.assertContains(response, self.user.profile_picture.url)  # Image URL
        
        # Clean up the test image file
        os.unlink(image_path)

    def test_successful_error_handling(self):
        """Test that successful operations don't show error messages"""
        
        # Test successful registration
        response = self.client.post(reverse('accounts:register'), {
            'email': 'success@example.com',
            'username': 'successuser',
            'age': 25,
            'password1': 'TestPass123!',
            'password2': 'TestPass123!'
        })
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('accounts:verify_email'))

        # Test successful login
        self.user.is_verified = True
        self.user.save()
        
        response = self.client.post(reverse('accounts:login'), {
            'email': 'test@example.com',
            'password': 'TestPass123!'
        })
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, '/')

    def test_middleware_error_handling(self):
        """Test that the custom middleware handles errors properly"""
        
        # Test 404 error handling
        response = self.client.get('/nonexistent-page/')
        self.assertEqual(response.status_code, 404)
        self.assertContains(response, 'صفحه یافت نشد')
        self.assertContains(response, '404')

        # Test 403 error handling (would need to trigger permission denied)
        # This would require more complex setup with permissions

    def test_message_display_functionality(self):
        """Test that error messages are properly displayed"""
        
        # Test registration error message display
        response = self.client.post(reverse('accounts:register'), {
            'email': 'invalid-email',
            'username': 'testuser',
            'age': 25,
            'password1': 'TestPass123!',
            'password2': 'TestPass123!'
        })
        
        self.assertEqual(response.status_code, 200)
        # Check that the message is in the response
        self.assertContains(response, 'فرمت ایمیل نامعتبر است')

    def tearDown(self):
        # Clean up any temporary files
        pass

class TwoMinuteCodeExpirationTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!',
            age=25,
            is_verified=True
        )

    def create_test_image(self):
        """Create a test image file"""
        image = Image.new('RGB', (100, 100), color='red')
        tmp_file = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
        image.save(tmp_file.name, 'JPEG')
        tmp_file.close()
        return tmp_file.name

    def test_code_expiration_utility_functions(self):
        """Test the utility functions for code expiration"""
        now = timezone.now()
        
        # Test is_code_expired function
        self.assertFalse(is_code_expired(now, expiration_minutes=2))
        self.assertTrue(is_code_expired(now - timedelta(minutes=3), expiration_minutes=2))
        self.assertTrue(is_code_expired(None, expiration_minutes=2))
        
        # Test get_remaining_time function
        remaining = get_remaining_time(now, expiration_minutes=2)
        self.assertGreater(remaining, 0)
        self.assertLessEqual(remaining, 120)  # Should be 2 minutes or less
        
        # Test format_remaining_time function
        formatted = format_remaining_time(65)  # 1 minute 5 seconds
        self.assertIn('1 دقیقه', formatted)
        self.assertIn('5 ثانیه', formatted)
        
        formatted = format_remaining_time(30)  # 30 seconds
        self.assertIn('30 ثانیه', formatted)
        
        formatted = format_remaining_time(0)  # Expired
        self.assertEqual(formatted, 'منقضی شده')

    def test_registration_code_expiration(self):
        """Test that registration codes expire after exactly 2 minutes"""
        # Register a new user
        response = self.client.post(reverse('accounts:register'), {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password1': 'TestPass123!',
            'password2': 'TestPass123!',
            'age': 25,
        })
        
        self.assertEqual(response.status_code, 302)  # Redirect to verification
        self.assertIn('pending_user_id', self.client.session)
        
        # Get the user and verify code was set
        user = User.objects.get(email='newuser@example.com')
        self.assertIsNotNone(user.verification_code)
        self.assertIsNotNone(user.code_sent_at)
        
        # Test code is valid immediately
        self.assertFalse(is_code_expired(user.code_sent_at, expiration_minutes=2))
        
        # Simulate code sent 3 minutes ago (expired)
        user.code_sent_at = timezone.now() - timedelta(minutes=3)
        user.save()
        
        # Try to verify with expired code
        response = self.client.post(reverse('accounts:verify_email'), {
            'code': user.verification_code
        })
        
        self.assertEqual(response.status_code, 302)  # Redirect to register
        self.assertNotIn('pending_user_id', self.client.session)

    def test_password_reset_code_expiration(self):
        """Test that password reset codes expire after exactly 2 minutes"""
        # Request password reset
        response = self.client.post(reverse('accounts:password_reset_request'), {
            'email': 'test@example.com'
        })
        
        self.assertEqual(response.status_code, 302)  # Redirect to code page
        self.assertIn('reset_user_id', self.client.session)
        
        # Get the user and verify code was set
        user = User.objects.get(email='test@example.com')
        self.assertIsNotNone(user.verification_code)
        self.assertIsNotNone(user.code_sent_at)
        
        # Test code is valid immediately
        self.assertFalse(is_code_expired(user.code_sent_at, expiration_minutes=2))
        
        # Simulate code sent 3 minutes ago (expired)
        user.code_sent_at = timezone.now() - timedelta(minutes=3)
        user.save()
        
        # Try to verify with expired code
        response = self.client.post(reverse('accounts:password_reset_code'), {
            'code': user.verification_code
        })
        
        self.assertEqual(response.status_code, 302)  # Redirect to reset request
        self.assertNotIn('reset_user_id', self.client.session)

    def test_code_expiration_edge_cases(self):
        """Test edge cases for code expiration"""
        now = timezone.now()
        
        # Test exactly 2 minutes (should be expired)
        code_sent_at = now - timedelta(minutes=2)
        self.assertTrue(is_code_expired(code_sent_at, expiration_minutes=2))
        
        # Test 1 minute 59 seconds (should be valid)
        code_sent_at = now - timedelta(minutes=1, seconds=59)
        self.assertFalse(is_code_expired(code_sent_at, expiration_minutes=2))
        
        # Test None code_sent_at
        self.assertTrue(is_code_expired(None, expiration_minutes=2))

    def test_countdown_display_in_templates(self):
        """Test that countdown timer is displayed in verification templates"""
        # Register a new user
        response = self.client.post(reverse('accounts:register'), {
            'username': 'countdownuser',
            'email': 'countdown@example.com',
            'password1': 'TestPass123!',
            'password2': 'TestPass123!',
            'age': 25,
        })
        
        # Access verification page
        response = self.client.get(reverse('accounts:verify_email'))
        self.assertEqual(response.status_code, 200)
        
        # Check that countdown elements are present
        self.assertIn('countdown-container', response.content.decode())
        self.assertIn('countdown-timer', response.content.decode())
        self.assertIn('remaining_time', response.context)

    def test_password_reset_countdown_display(self):
        """Test that countdown timer is displayed in password reset templates"""
        # Request password reset
        response = self.client.post(reverse('accounts:password_reset_request'), {
            'email': 'test@example.com'
        })
        
        # Access password reset code page
        response = self.client.get(reverse('accounts:password_reset_code'))
        self.assertEqual(response.status_code, 200)
        
        # Check that countdown elements are present
        self.assertIn('countdown-container', response.content.decode())
        self.assertIn('countdown-timer', response.content.decode())
        self.assertIn('remaining_time', response.context)

    def test_email_messages_mention_2_minutes(self):
        """Test that email messages mention the 2-minute expiration"""
        # Register a new user
        response = self.client.post(reverse('accounts:register'), {
            'username': 'emailuser',
            'email': 'email@example.com',
            'password1': 'TestPass123!',
            'password2': 'TestPass123!',
            'age': 25,
        })
        
        # Check that email was sent with 2-minute mention
        self.assertEqual(len(mail.outbox), 1)
        email_content = mail.outbox[0].body
        self.assertIn('2 دقیقه', email_content)
        self.assertIn('دقیقاً', email_content)

    def test_password_reset_email_mentions_2_minutes(self):
        """Test that password reset emails mention the 2-minute expiration"""
        # Request password reset
        response = self.client.post(reverse('accounts:password_reset_request'), {
            'email': 'test@example.com'
        })
        
        # Check that email was sent with 2-minute mention
        self.assertEqual(len(mail.outbox), 1)
        email_content = mail.outbox[0].body
        self.assertIn('2 دقیقه', email_content)
        self.assertIn('دقیقاً', email_content)

    def test_remaining_time_calculation_accuracy(self):
        """Test that remaining time calculation is accurate"""
        now = timezone.now()
        
        # Test 1 minute remaining
        code_sent_at = now - timedelta(minutes=1)
        remaining = get_remaining_time(code_sent_at, expiration_minutes=2)
        self.assertGreater(remaining, 0)
        self.assertLessEqual(remaining, 60)
        
        # Test 30 seconds remaining
        code_sent_at = now - timedelta(minutes=1, seconds=30)
        remaining = get_remaining_time(code_sent_at, expiration_minutes=2)
        self.assertGreater(remaining, 0)
        self.assertLessEqual(remaining, 30)
        
        # Test expired
        code_sent_at = now - timedelta(minutes=3)
        remaining = get_remaining_time(code_sent_at, expiration_minutes=2)
        self.assertEqual(remaining, 0)

class JalaliDateFilterTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )

    def test_jalali_date_filter(self):
        """Test that the jalali_date filter converts dates correctly"""
        # Create a template with the jalali_date filter
        template = Template(
            '{% load jalali_filters %}'
            '{{ user.date_joined|jalali_date }}'
        )
        
        context = Context({'user': self.user})
        result = template.render(context)
        
        # Convert the user's date_joined to Jalali manually for comparison
        gregorian_date = self.user.date_joined
        if timezone.is_naive(gregorian_date):
            gregorian_date = timezone.make_aware(gregorian_date)
        
        jalali_date = jdatetime.datetime.fromgregorian(datetime=gregorian_date)
        expected = jalali_date.strftime("%Y/%m/%d")
        
        self.assertEqual(result.strip(), expected)

    def test_jalali_date_verbose_filter(self):
        """Test that the jalali_date_verbose filter works correctly"""
        template = Template(
            '{% load jalali_filters %}'
            '{{ user.date_joined|jalali_date_verbose }}'
        )
        
        context = Context({'user': self.user})
        result = template.render(context)
        
        # The result should contain Persian text
        self.assertIn('', result)  # Should contain Persian characters
        self.assertNotEqual(result.strip(), '')

    def test_jalali_date_with_format(self):
        """Test jalali_date filter with custom format"""
        template = Template(
            '{% load jalali_filters %}'
            '{{ user.date_joined|jalali_date:"%Y/%m/%d %H:%M" }}'
        )
        
        context = Context({'user': self.user})
        result = template.render(context)
        
        # Should contain both date and time
        self.assertIn('/', result)
        self.assertIn(':', result)

    def test_jalali_date_with_none_value(self):
        """Test jalali_date filter with None value"""
        template = Template(
            '{% load jalali_filters %}'
            '{{ none_value|jalali_date }}'
        )
        
        context = Context({'none_value': None})
        result = template.render(context)
        
        self.assertEqual(result.strip(), '')

    def test_user_jalali_date_methods(self):
        """Test User model Jalali date methods"""
        # Test get_jalali_date_joined
        jalali_date = self.user.get_jalali_date_joined()
        self.assertIsInstance(jalali_date, str)
        self.assertIn('/', jalali_date)
        
        # Test get_jalali_date_joined with custom format
        jalali_date_with_time = self.user.get_jalali_date_joined("%Y/%m/%d %H:%M")
        self.assertIn(':', jalali_date_with_time)
        
        # Test get_jalali_date_joined_verbose
        verbose_date = self.user.get_jalali_date_joined_verbose()
        self.assertIsInstance(verbose_date, str)
        self.assertNotEqual(verbose_date, '')
        
        # Test with None date_joined
        user_without_date = User.objects.create_user(
            email='test2@example.com',
            username='testuser2',
            password='testpass123'
        )
        user_without_date.date_joined = None
        user_without_date.save()
        
        self.assertEqual(user_without_date.get_jalali_date_joined(), '')
        self.assertEqual(user_without_date.get_jalali_date_joined_verbose(), '')


class LoginCodeVerificationTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='TestPass123!',
            age=25,
            is_verified=True
        )

    def test_login_code_verification_flow(self):
        """Test the complete login code verification flow"""
        # First, login with a user that requires verification
        self.user.last_verification_code_time = None
        self.user.save()
        
        response = self.client.post(reverse('accounts:login'), {
            'email': 'test@example.com',
            'password': 'TestPass123!'
        })
        
        # Should redirect to login code verify page
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('accounts:login_code_verify'))
        
        # Check that user is in session
        self.assertIn('pending_verification_user_id', self.client.session)
        
        # Access the login code verify page
        response = self.client.get(reverse('accounts:login_code_verify'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'تایید ورود')
        self.assertContains(response, 'test@example.com')
        
        # Get the verification code from the user
        self.user.refresh_from_db()
        verification_code = self.user.verification_code
        
        # Submit the correct verification code
        response = self.client.post(reverse('accounts:login_code_verify'), {
            'code': verification_code
        })
        
        # Should redirect to home page on success
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, '/')
        
        # Check that user is logged in
        self.assertTrue(self.client.session.get('_auth_user_id'))
        
        # Check that session is cleared
        self.assertNotIn('pending_verification_user_id', self.client.session)

    def test_login_code_verification_invalid_code(self):
        """Test login code verification with invalid code"""
        # Setup user for verification
        self.user.last_verification_code_time = None
        self.user.verification_code = '123456'
        self.user.code_sent_at = timezone.now()
        self.user.save()
        
        # Set session
        session = self.client.session
        session['pending_verification_user_id'] = self.user.pk
        session.save()
        
        # Submit wrong code
        response = self.client.post(reverse('accounts:login_code_verify'), {
            'code': '654321'
        })
        
        # Should stay on the same page with error
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'کد تایید نامعتبر است')

    def test_login_code_verification_expired_code(self):
        """Test login code verification with expired code"""
        # Setup user with expired code
        self.user.last_verification_code_time = None
        self.user.verification_code = '123456'
        self.user.code_sent_at = timezone.now() - timedelta(minutes=3)
        self.user.save()
        
        # Set session
        session = self.client.session
        session['pending_verification_user_id'] = self.user.pk
        session.save()
        
        # Submit code
        response = self.client.post(reverse('accounts:login_code_verify'), {
            'code': '123456'
        })
        
        # Should redirect to login with error
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('accounts:login'))

    def test_login_code_verification_no_session(self):
        """Test login code verification without session"""
        response = self.client.get(reverse('accounts:login_code_verify'))
        
        # Should redirect to login
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('accounts:login'))

    def test_login_code_verification_invalid_user(self):
        """Test login code verification with invalid user in session"""
        # Set invalid user ID in session
        session = self.client.session
        session['pending_verification_user_id'] = 99999
        session.save()
        
        response = self.client.get(reverse('accounts:login_code_verify'))
        
        # Should redirect to login
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('accounts:login'))

    def test_login_without_verification_after_24_hours(self):
        """Test that login requires verification after 24 hours"""
        # Set last verification time to more than 24 hours ago
        self.user.last_verification_code_time = timezone.now() - timedelta(hours=25)
        self.user.save()
        
        response = self.client.post(reverse('accounts:login'), {
            'email': 'test@example.com',
            'password': 'TestPass123!'
        })
        
        # Should redirect to login code verify
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('accounts:login_code_verify'))

    def test_login_without_verification_within_24_hours(self):
        """Test that login doesn't require verification within 24 hours"""
        # Set last verification time to less than 24 hours ago
        self.user.last_verification_code_time = timezone.now() - timedelta(hours=23)
        self.user.save()
        
        response = self.client.post(reverse('accounts:login'), {
            'email': 'test@example.com',
            'password': 'TestPass123!'
        })
        
        # Should redirect to home page (no verification needed)
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, '/')
