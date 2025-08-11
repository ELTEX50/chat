from django.db import models
from accounts.models import User
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
import uuid

class ChatSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_sessions', verbose_name=_('کاربر'))
    title = models.CharField(_('عنوان'), max_length=200, blank=True)
    created_at = models.DateTimeField(_('تاریخ ایجاد'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاریخ بروزرسانی'), auto_now=True)
    is_active = models.BooleanField(_('فعال'), default=True)
    
    class Meta:
        ordering = ['-updated_at']
        verbose_name = _('جلسه چت')
        verbose_name_plural = _('جلسات چت')
    
    def __str__(self):
        return f"{self.user.username} - {self.title or 'چت جدید'} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
    
    def get_preview_message(self):
        first_message = self.messages.first()
        if first_message:
            return first_message.content[:50] + "..." if len(first_message.content) > 50 else first_message.content
        return ""

class ChatMessage(models.Model):
    MESSAGE_TYPES = [
        ('user', _('پیام کاربر')),
        ('ai', _('پاسخ هوش مصنوعی')),
        ('system', _('پیام سیستم')),
    ]
    
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages', null=True, blank=True, verbose_name=_('جلسه'))
    content = models.TextField(_('محتوا'))
    message_type = models.CharField(_('نوع پیام'), max_length=10, choices=MESSAGE_TYPES, default='user')
    timestamp = models.DateTimeField(_('زمان'), auto_now_add=True)
    is_welcome_message = models.BooleanField(_('پیام خوش‌آمدگویی'), default=False)
    
    class Meta:
        ordering = ['timestamp']
        verbose_name = _('پیام چت')
        verbose_name_plural = _('پیام‌های چت')

    def __str__(self):
        return f"{self.session.user.username} - {self.content[:30]}..."
