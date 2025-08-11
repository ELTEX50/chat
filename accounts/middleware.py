from django.http import HttpResponse
from django.shortcuts import render
from django.core.exceptions import ValidationError, PermissionDenied
from django.http import Http404
import logging

logger = logging.getLogger(__name__)

class ErrorHandlingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        """Handle exceptions and provide user-friendly error messages"""
        
        if isinstance(exception, Http404):
            return render(request, 'errors/404.html', {
                'error_message': 'صفحه مورد نظر یافت نشد.',
                'suggestions': [
                    'آدرس URL را بررسی کنید',
                    'از منوی اصلی استفاده کنید',
                    'با پشتیبانی تماس بگیرید'
                ]
            }, status=404)
        
        elif isinstance(exception, PermissionDenied):
            return render(request, 'errors/403.html', {
                'error_message': 'شما مجوز دسترسی به این صفحه را ندارید.',
                'suggestions': [
                    'وارد حساب کاربری خود شوید',
                    'با مدیر تماس بگیرید',
                    'به صفحه اصلی بازگردید'
                ]
            }, status=403)
        
        elif isinstance(exception, ValidationError):
            # Handle validation errors
            error_message = 'خطا در اعتبارسنجی داده‌ها.'
            if hasattr(exception, 'message_dict'):
                error_message = 'لطفاً خطاهای زیر را برطرف کنید:'
                for field, errors in exception.message_dict.items():
                    error_message += f'\n- {field}: {", ".join(errors)}'
            else:
                error_message = str(exception)
            
            return render(request, 'errors/400.html', {
                'error_message': error_message,
                'suggestions': [
                    'اطلاعات وارد شده را بررسی کنید',
                    'دوباره تلاش کنید',
                    'با پشتیبانی تماس بگیرید'
                ]
            }, status=400)
        
        else:
            # Log the exception for debugging
            logger.error(f'Unhandled exception: {exception}', exc_info=True)
            
            return render(request, 'errors/500.html', {
                'error_message': 'خطای داخلی سرور رخ داد.',
                'suggestions': [
                    'لطفاً دوباره تلاش کنید',
                    'صفحه را رفرش کنید',
                    'با پشتیبانی تماس بگیرید'
                ]
            }, status=500) 