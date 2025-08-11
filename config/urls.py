"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls.i18n import i18n_patterns
from accounts.admin import user_detail_view, custom_admin_site
from config.error_handlers import custom_404, custom_500, custom_403, custom_400
from django.views.static import serve as static_serve
import os

urlpatterns = [
    path('admin/', custom_admin_site.urls),
    path('accounts/', include('accounts.urls', namespace='accounts')),
    path('', include('pimxchat.urls')),
    # Custom admin URLs
    path('admin/user/<int:user_id>/detail/', user_detail_view, name='admin_user_detail'),
]

urlpatterns += [
    path('i18n/', include('django.conf.urls.i18n')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Serve media files even if DEBUG=False (for development/testing only)
if os.environ.get('DJANGO_ALLOW_MEDIA', '1') == '1':
    urlpatterns += [
        path('media/<path:path>', static_serve, {'document_root': settings.MEDIA_ROOT}),
    ]

# Custom error handlers
handler404 = 'config.error_handlers.custom_404'
handler500 = 'config.error_handlers.custom_500'
handler403 = 'config.error_handlers.custom_403'
handler400 = 'config.error_handlers.custom_400'
