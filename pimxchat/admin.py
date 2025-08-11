from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import ChatSession, ChatMessage

admin.site.site_header = 'مدیریت PIMXCHAT'
admin.site.site_title = 'پنل مدیریت PIMXCHAT'
admin.site.index_title = 'خوش آمدید به پنل مدیریت PIMXCHAT'

class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'created_at', 'updated_at', 'is_active', 'message_count')
    list_filter = ('is_active', 'created_at', 'updated_at')
    search_fields = ('user__username', 'user__email', 'title')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-updated_at',)
    
    def message_count(self, obj):
        return obj.messages.count()
    message_count.short_description = 'تعداد پیام‌ها'
    
    class Meta:
        verbose_name = _('جلسه چت')
        verbose_name_plural = _('جلسات چت')

class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('session', 'message_type', 'content_preview', 'timestamp', 'is_welcome_message')
    list_filter = ('message_type', 'timestamp', 'is_welcome_message')
    search_fields = ('content', 'session__user__username')
    readonly_fields = ('timestamp',)
    ordering = ('-timestamp',)
    
    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'پیش‌نمایش محتوا'
    
    class Meta:
        verbose_name = _('پیام چت')
        verbose_name_plural = _('پیام‌های چت')
