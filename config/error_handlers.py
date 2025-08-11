from django.shortcuts import render
from django.http import Http404, HttpResponseServerError, HttpResponseForbidden, HttpResponseBadRequest

def custom_404(request, exception=None):
    """Custom 404 error handler"""
    context = {
        'error_message': str(exception) if exception else None,
        'user': request.user,
    }
    return render(request, 'errors/404.html', context, status=404)

def custom_500(request, *args, **argv):
    """Custom 500 error handler"""
    context = {
        'error_message': 'خطای داخلی سرور',
        'user': request.user,
    }
    return render(request, 'errors/500.html', context, status=500)

def custom_403(request, exception=None):
    """Custom 403 error handler"""
    context = {
        'error_message': str(exception) if exception else None,
        'user': request.user,
    }
    return render(request, 'errors/403.html', context, status=403)

def custom_400(request, exception=None):
    """Custom 400 error handler"""
    context = {
        'error_message': str(exception) if exception else None,
        'user': request.user,
    }
    return render(request, 'errors/400.html', context, status=400) 