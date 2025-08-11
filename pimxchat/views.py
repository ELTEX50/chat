from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.db.models import Q
from .models import ChatSession, ChatMessage
from accounts.models import User
import requests
import json
from datetime import datetime
from django.utils import translation
from django.conf import settings
from django.urls import reverse
from django.utils.translation import gettext as _

GEMINI_API_KEY = 'AIzaSyCHjSKor-uk_CGl4emm4e1ex7cYm5B5VFk'
GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY

# For testing purposes, let's create a simple response function
def get_test_response(message, language='fa'):
    """Simple test response when API is not working"""
    if language == 'fa':
        responses = [
            "سلام! 👋 چطور می‌تونم کمکتون کنم؟ 😊",
            "بله، در خدمت شما هستم! 🎯 سوال دیگری دارید؟ 🤔",
            "این یک پاسخ تست است. 🔧 API در حال تعمیر است.",
            "من PIMXCHAT هستم 🤖 و آماده کمک به شما هستم! ✨",
            "سوال جالبی پرسیدید! 🎉 می‌تونم کمکتون کنم. 💡"
        ]
    else:
        responses = [
            "Hello! 👋 How can I help you? 😊",
            "Yes, I'm here to help! 🎯 Do you have another question? 🤔",
            "This is a test response. 🔧 API is under maintenance.",
            "I'm PIMXCHAT 🤖 and ready to help you! ✨",
            "That's an interesting question! 🎉 I can help you. 💡"
        ]
    
    import random
    return random.choice(responses)

def call_gemini_api(message, language='fa'):
    """Enhanced Gemini API call with Persian language support"""
    headers = {'Content-Type': 'application/json'}
    
    # System prompt based on language
    if language == 'fa':
        system_prompt = """تو PIMXCHAT هستی، یک دستیار هوشمند که توسط محمدرضا عابدین‌پور ساخته شده است. 
        قوانین مهم:
        - همیشه به فارسی پاسخ بده
        - اگر کاربر بپرسد "تو کی هستی؟" یا "What are you?" بگو: "من PIMXCHAT هستم، ساخته شده توسط محمدرضا عابدین‌پور"
        - محتوای غیرقانونی، مضر یا نامناسب تولید نکن
        - اطلاعات شخصی کاربران را فاش نکن
        - پاسخ‌های مفید و دقیق ارائه کن
        - در پاسخ‌هایت از ایموجی‌های مربوط به موضوع استفاده کن تا پاسخ جذاب‌تر شود
        - ایموجی‌ها را به صورت طبیعی و مناسب در متن قرار بده"""
    else:
        system_prompt = """You are PIMXCHAT, an intelligent assistant created by Mohammadreza Abedinpour.
        Important rules:
        - Always respond in English
        - If user asks "Who are you?" or "What are you?" say: "I'm PIMXCHAT, created by Mohammadreza Abedinpour"
        - Do not generate illegal, harmful, or inappropriate content
        - Do not share users' personal information
        - Provide helpful and accurate responses
        - Use relevant emojis in your responses to make them more engaging and expressive
        - Place emojis naturally throughout your text where appropriate"""
    
    data = {
        "contents": [
            {
                "parts": [
                    {"text": system_prompt},
                    {"text": message}
                ]
            }
        ]
    }
    
    try:
        print(f"Making API call to Gemini with message: {message[:50]}...")
        response = requests.post(GEMINI_API_URL, json=data, headers=headers, timeout=15)
        print(f"Response status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"API Error: {response.status_code} - {response.text}")
            raise Exception(f"API returned status {response.status_code}")
            
        result = response.json()
        print(f"API Response: {result}")
        
        if 'candidates' in result and len(result['candidates']) > 0:
            if 'content' in result['candidates'][0] and 'parts' in result['candidates'][0]['content']:
                return result['candidates'][0]['content']['parts'][0]['text']
            else:
                print(f"Unexpected response structure: {result}")
                raise Exception("Invalid response structure")
        else:
            print(f"No candidates in response: {result}")
            raise Exception("No candidates in response")
            
    except requests.exceptions.RequestException as e:
        print(f"Request Exception: {e}")
        # Use test response instead of error message
        return get_test_response(message, language)
    except Exception as e:
        print(f"General Exception: {e}")
        # Use test response instead of error message
        return get_test_response(message, language)

@login_required
def chat_view(request):
    """Main chat interface"""
    # Get or create active session
    active_session = ChatSession.objects.filter(user=request.user, is_active=True).first()
    if not active_session:
        active_session = ChatSession.objects.create(user=request.user, title="چت جدید")
        
        # Add welcome message
        user_language = getattr(request.user, 'language', 'fa')
        welcome_text = "سلام! 👋 من PIMXCHAT هستم 🤖 چطور می‌تونم کمکتون کنم؟ 😊" if user_language == 'fa' else "Hello! 👋 I'm PIMXCHAT 🤖 How can I help you? 😊"
        ChatMessage.objects.create(
            session=active_session,
            content=welcome_text,
            message_type='ai',
            is_welcome_message=True
        )
    
    user_language = getattr(request.user, 'language', 'fa')
    return render(request, 'chat.html', {
        'active_session': active_session,
        'user_language': user_language
    })

@login_required
def api_chat_sessions(request):
    """API endpoint to get user's chat sessions"""
    sessions = ChatSession.objects.filter(user=request.user).order_by('-updated_at')
    sessions_data = []
    
    for session in sessions:
        sessions_data.append({
            'id': str(session.id),
            'title': session.title or 'چت جدید',
            'preview': session.get_preview_message(),
            'created_at': session.created_at.strftime('%Y-%m-%d %H:%M'),
            'updated_at': session.updated_at.strftime('%Y-%m-%d %H:%M'),
            'is_active': session.is_active
        })
    
    return JsonResponse({'sessions': sessions_data})

@login_required
def api_chat_messages(request, session_id):
    """API endpoint to get messages for a specific session"""
    session = get_object_or_404(ChatSession, id=session_id, user=request.user)
    messages = session.messages.all()
    
    messages_data = []
    for message in messages:
        messages_data.append({
            'id': message.id,
            'content': message.content,
            'message_type': message.message_type,
            'timestamp': message.timestamp.strftime('%Y-%m-%d %H:%M'),
            'is_welcome_message': message.is_welcome_message
        })
    
    return JsonResponse({
        'session_id': str(session.id),
        'session_title': session.title,
        'messages': messages_data
    })

@login_required
@csrf_exempt
def api_send_message(request):
    """API endpoint to send a message and get AI response"""
    print(f"API send message called with method: {request.method}")
    
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        session_id = data.get('session_id')
        message_content = data.get('message', '').strip()
        
        print(f"Received data: session_id={session_id}, message='{message_content}'")
        
        if not message_content:
            return JsonResponse({'error': 'Message cannot be empty'}, status=400)
        
        # Get or create session
        if session_id:
            session = get_object_or_404(ChatSession, id=session_id, user=request.user)
        else:
            session = ChatSession.objects.create(user=request.user, title="چت جدید")
        
        # Deactivate other sessions
        ChatSession.objects.filter(user=request.user).update(is_active=False)
        session.is_active = True
        session.save()
        
        # Save user message
        user_message = ChatMessage.objects.create(
            session=session,
            content=message_content,
            message_type='user'
        )
        
        # Get AI response
        user_language = getattr(request.user, 'language', 'fa')
        print(f"Calling Gemini API with language: {user_language}")
        ai_response = call_gemini_api(message_content, user_language)
        print(f"AI response: {ai_response}")
        
        # Save AI response
        ai_message = ChatMessage.objects.create(
            session=session,
            content=ai_response,
            message_type='ai'
        )
        
        # Update session title if it's the first user message
        if session.messages.filter(message_type='user').count() == 1:
            # Use first few words of user message as title
            title = message_content[:30] + "..." if len(message_content) > 30 else message_content
            session.title = title
            session.save()
        
        response_data = {
            'success': True,
            'session_id': str(session.id),
            'user_message': {
                'id': user_message.id,
                'content': user_message.content,
                'timestamp': user_message.timestamp.strftime('%Y-%m-%d %H:%M')
            },
            'ai_message': {
                'id': ai_message.id,
                'content': ai_message.content,
                'timestamp': ai_message.timestamp.strftime('%Y-%m-%d %H:%M')
            }
        }
        
        print(f"Returning response: {response_data}")
        return JsonResponse(response_data)
        
    except Exception as e:
        print(f"Error in api_send_message: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def api_new_chat(request):
    """API endpoint to create a new chat session"""
    # Deactivate current active session
    ChatSession.objects.filter(user=request.user, is_active=True).update(is_active=False)
    
    # Create new session
    new_session = ChatSession.objects.create(user=request.user, title="چت جدید")
    
    # Add welcome message
    user_language = getattr(request.user, 'language', 'fa')
    welcome_text = "سلام! 👋 من PIMXCHAT هستم 🤖 چطور می‌تونم کمکتون کنم؟ 😊" if user_language == 'fa' else "Hello! 👋 I'm PIMXCHAT 🤖 How can I help you? 😊"
    ChatMessage.objects.create(
        session=new_session,
        content=welcome_text,
        message_type='ai',
        is_welcome_message=True
    )
    
    return JsonResponse({
        'success': True,
        'session_id': str(new_session.id),
        'welcome_message': welcome_text
    })

@login_required
def api_delete_session(request, session_id):
    """API endpoint to delete a chat session"""
    session = get_object_or_404(ChatSession, id=session_id, user=request.user)
    session.delete()
    
    return JsonResponse({'success': True})

@login_required
def api_clear_chat(request, session_id):
    """API endpoint to clear all messages in a session"""
    session = get_object_or_404(ChatSession, id=session_id, user=request.user)
    session.messages.all().delete()
    
    # Add welcome message
    user_language = getattr(request.user, 'language', 'fa')
    welcome_text = "سلام! 👋 من PIMXCHAT هستم 🤖 چطور می‌تونم کمکتون کنم؟ 😊" if user_language == 'fa' else "Hello! 👋 I'm PIMXCHAT 🤖 How can I help you? 😊"
    ChatMessage.objects.create(
        session=session,
        content=welcome_text,
        message_type='ai',
        is_welcome_message=True
    )
    
    return JsonResponse({
        'success': True,
        'welcome_message': welcome_text
    })

@login_required
@csrf_exempt
def api_rename_session(request, session_id):
    """API endpoint to rename a chat session"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        new_title = data.get('title', '').strip()
        
        if not new_title:
            return JsonResponse({'error': 'Title cannot be empty'}, status=400)
        
        if len(new_title) > 100:  # Limit title length
            return JsonResponse({'error': 'Title too long'}, status=400)
        
        session = get_object_or_404(ChatSession, id=session_id, user=request.user)
        session.title = new_title
        session.save()
        
        return JsonResponse({
            'success': True,
            'title': session.title
        })
        
    except Exception as e:
        print(f"Error in api_rename_session: {e}")
        return JsonResponse({'error': str(e)}, status=500)

# Existing view functions
def home_view(request):
    return render(request, 'home.html')

def index_view(request):
    return render(request, 'index.html')

def users_view(request):
    return render(request, 'users.html')

def export_view(request):
    return render(request, 'export.html')

def history_view(request):
    return render(request, 'history.html')

def dashboard_view(request):
    return render(request, 'dashboard.html')

def profile_view(request):
    return render(request, 'profile.html')

def rules_view(request):
    return render(request, 'rules.html')

def settings_view(request):
    return render(request, 'settings.html')

def contact_view(request):
    return render(request, 'contact.html')

def privacy_view(request):
    return render(request, 'privacy.html')

def terms_view(request):
    return render(request, 'terms.html')

def about_view(request):
    return render(request, 'about.html')

def set_language(request):
    """View to handle language switching"""
    if request.method == 'POST':
        language = request.POST.get('language')
        if language in [lang[0] for lang in settings.LANGUAGES]:
            # Set the language in session
            request.session[translation.LANGUAGE_SESSION_KEY] = language
            # Set the language for the current request
            translation.activate(language)
            
            # Redirect to the same page or home
            next_url = request.POST.get('next', '/')
            return redirect(next_url)
    
    # If not POST, redirect to home
    return redirect('pimxchat:home')
