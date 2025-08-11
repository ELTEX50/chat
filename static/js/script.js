// PIMXCHAT Application - Vanilla JavaScript Version

// Global state
const state = {
    currentLanguage: 'fa',
    currentTheme: 'light',
    messages: [],
    conversations: [
        {
            id: 'conv1',
            title: 'Exploring AI Concepts',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
            messages: []
        },
        {
            id: 'conv2',
            title: 'Persian Poetry Discussion',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
            messages: []
        },
        {
            id: 'conv3',
            title: 'Planning a trip to Tehran',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
            messages: []
        }
    ],
    currentConversationId: null,
    isLoading: false,
    sidebarCollapsed: false
};

// Language configurations
const languages = {
    fa: {
        direction: 'rtl',
        newChat: 'چت جدید',
        placeholder: 'پیام خود را اینجا تایپ کنید...',
        send: 'ارسال',
        disclaimer: 'PIMXCHAT ممکن است خطا کند. اطلاعات مهم را بررسی کنید.',
        errorMessage: 'متاسفانه با خطا مواجه شدم. لطفا دوباره تلاش کنید.',
        defaultUserName: 'کاربر'
    },
    en: {
        direction: 'ltr',
        newChat: 'New Chat',
        placeholder: 'Type your message here...',
        send: 'Send',
        disclaimer: 'PIMXCHAT may display inaccurate info. Please double-check its responses.',
        errorMessage: 'Sorry, an error occurred. Please try again.',
        defaultUserName: 'User'
    },
    fr: {
        direction: 'ltr',
        newChat: 'Nouveau chat',
        placeholder: 'Tapez votre message ici...',
        send: 'Envoyer',
        disclaimer: 'PIMXCHAT peut afficher des informations inexactes. Veuillez vérifier ses réponses.',
        errorMessage: 'Désolé, une erreur est survenue. Veuillez réessayer.',
        defaultUserName: 'Utilisateur'
    },
    it: {
        direction: 'ltr',
        newChat: 'Nuova chat',
        placeholder: 'Scrivi il tuo messaggio qui...',
        send: 'Invia',
        disclaimer: 'PIMXCHAT potrebbe visualizzare informazioni imprecise. Si prega di ricontrollare le sue risposte.',
        errorMessage: 'Spiacenti, si è verificato un errore. Riprova.',
        defaultUserName: 'Utente'
    },
    es: {
        direction: 'ltr',
        newChat: 'Nuevo chat',
        placeholder: 'Escribe tu mensaje aquí...',
        send: 'Enviar',
        disclaimer: 'PIMXCHAT puede mostrar información incorrecta. Por favor, verifique sus respuestas.',
        errorMessage: 'Lo sentimos, ha ocurrido un error. Por favor, inténtelo de nuevo.',
        defaultUserName: 'Usuario'
    },
    de: {
        direction: 'ltr',
        newChat: 'Neuer Chat',
        placeholder: 'Schreiben Sie Ihre Nachricht hier...',
        send: 'Senden',
        disclaimer: 'PIMXCHAT zeigt möglicherweise ungenaue Informationen an. Bitte überprüfen Sie die Antworten.',
        errorMessage: 'Entschuldigung, ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
        defaultUserName: 'Benutzer'
    },
    ko: {
        direction: 'ltr',
        newChat: '새 채팅',
        placeholder: '여기에 메시지를 입력하세요...',
        send: '보내기',
        disclaimer: 'PIMXCHAT에 부정확한 정보가 표시될 수 있습니다. 응답을 다시 확인하십시오.',
        errorMessage: '죄송합니다, 오류가 발생했습니다. 다시 시도하십시오.',
        defaultUserName: '사용자'
    },
    ja: {
        direction: 'ltr',
        newChat: '新しいチャット',
        placeholder: 'ここにメッセージを入力してください...',
        send: '送信',
        disclaimer: 'PIMXCHATは不正確な情報を表示する場合があります。応答を再確認してください。',
        errorMessage: '申し訳ありませんが、エラーが 발생しました。もう一度お試しください。',
        defaultUserName: 'ユーザー'
    },
    he: {
        direction: 'rtl',
        newChat: 'צ\'אט חדש',
        placeholder: 'הקלד את ההודעה שלך כאן...',
        send: 'שלח',
        disclaimer: 'PIMXCHAT עשוי להציג מידע לא מדויק. אנא בדוק שוב את תגובותיו.',
        errorMessage: 'מצטערים, אירעה שגיאה. אנא נסה שוב.',
        defaultUserName: 'משתמש'
    },
    ar: {
        direction: 'rtl',
        newChat: 'دردشة جديدة',
        placeholder: 'اكتب رسالتك هنا...',
        send: 'إرسال',
        disclaimer: 'قد يعرض PIMXCHAT معلومات غير دقيقة. يرجى التحقق مرة أخرى من إجاباته.',
        errorMessage: 'عذرًا، حدث خطأ. يرجى المحاولة مرة أخرى.',
        defaultUserName: 'مستخدم'
    }
};

// DOM Elements
const elements = {
    sidebar: null,
    sidebarToggle: null,
    mobileSidebarToggle: null,
    newChatBtn: null,
    conversationsList: null,
    chatMessages: null,
    chatInput: null,
    chatInputForm: null,
    sendBtn: null,
    chatTitle: null,
    themeToggle: null,
    languageSelect: null
};

// Initialize the application
function init() {
    loadElements();
    loadState();
    setupEventListeners();
    renderConversations();
    generateWelcomeMessage();
    updateUI();
}

// Load DOM elements
function loadElements() {
    elements.sidebar = document.getElementById('sidebar');
    elements.sidebarToggle = document.getElementById('sidebarToggle');
    elements.mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
    elements.newChatBtn = document.getElementById('newChatBtn');
    elements.conversationsList = document.getElementById('conversationsList');
    elements.chatMessages = document.getElementById('chatMessages');
    elements.chatInput = document.getElementById('chatInput');
    elements.chatInputForm = document.getElementById('chatInputForm');
    elements.sendBtn = document.getElementById('sendBtn');
    elements.chatTitle = document.getElementById('chatTitle');
    elements.themeToggle = document.getElementById('themeToggle');
    elements.languageSelect = document.getElementById('languageSelect');
}

// Load state from localStorage
function loadState() {
    const savedTheme = localStorage.getItem('theme');
    const savedLanguage = localStorage.getItem('language');
    const savedSidebarCollapsed = localStorage.getItem('sidebarCollapsed');
    
    if (savedTheme) {
        state.currentTheme = savedTheme;
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
    
    if (savedLanguage) {
        state.currentLanguage = savedLanguage;
        elements.languageSelect.value = savedLanguage;
    }
    
    if (savedSidebarCollapsed) {
        state.sidebarCollapsed = JSON.parse(savedSidebarCollapsed);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Sidebar toggle
    elements.sidebarToggle?.addEventListener('click', toggleSidebar);
    elements.mobileSidebarToggle?.addEventListener('click', toggleMobileSidebar);
    
    // New chat
    elements.newChatBtn?.addEventListener('click', startNewChat);
    
    // Chat input
    elements.chatInputForm?.addEventListener('submit', handleSendMessage);
    elements.chatInput?.addEventListener('input', handleInputChange);
    elements.chatInput?.addEventListener('keydown', handleKeyDown);
    
    // Theme toggle
    elements.themeToggle?.addEventListener('click', toggleTheme);
    
    // Language change
    elements.languageSelect?.addEventListener('change', handleLanguageChange);
    
    // Auto-resize textarea
    elements.chatInput?.addEventListener('input', autoResizeTextarea);
}

// Toggle sidebar
function toggleSidebar() {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    elements.sidebar.classList.toggle('collapsed', state.sidebarCollapsed);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(state.sidebarCollapsed));
}

// Toggle mobile sidebar
function toggleMobileSidebar() {
    elements.sidebar.classList.toggle('open');
}

// Start new chat
function startNewChat() {
    state.currentConversationId = null;
    state.messages = [];
    renderMessages();
    updateChatTitle();
    updateUI();
}

// Handle send message
async function handleSendMessage(e) {
    e.preventDefault();
    const input = elements.chatInput.value.trim();
    if (!input || state.isLoading) return;
    
    // Add user message
    const userMessage = {
        id: generateId(),
        role: 'user',
        content: input,
        createdAt: new Date()
    };
    
    state.messages.push(userMessage);
    elements.chatInput.value = '';
    elements.chatInput.style.height = 'auto';
    
    renderMessages();
    updateUI();
    
    // Show loading
    state.isLoading = true;
    renderLoading();
    
    try {
        // Simulate AI response
        const response = await simulateAIResponse(input);
        
        const botMessage = {
            id: generateId(),
            role: 'assistant',
            content: response,
            createdAt: new Date()
        };
        
        state.messages.push(botMessage);
        renderMessages();
        
        // Save to conversation if exists
        if (state.currentConversationId) {
            const conversation = state.conversations.find(c => c.id === state.currentConversationId);
            if (conversation) {
                conversation.messages = [...state.messages];
            }
        }
        
    } catch (error) {
        console.error('Error getting response:', error);
        const errorMessage = {
            id: generateId(),
            role: 'assistant',
            content: languages[state.currentLanguage].errorMessage,
            createdAt: new Date()
        };
        state.messages.push(errorMessage);
        renderMessages();
    } finally {
        state.isLoading = false;
        updateUI();
    }
}

// Handle input change
function handleInputChange() {
    const hasText = elements.chatInput.value.trim().length > 0;
    elements.sendBtn.disabled = !hasText || state.isLoading;
}

// Handle key down
function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        elements.chatInputForm.dispatchEvent(new Event('submit'));
    }
}

// Auto-resize textarea
function autoResizeTextarea() {
    elements.chatInput.style.height = 'auto';
    elements.chatInput.style.height = Math.min(elements.chatInput.scrollHeight, 120) + 'px';
}

// Toggle theme
function toggleTheme() {
    state.currentTheme = state.currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', state.currentTheme === 'dark');
    localStorage.setItem('theme', state.currentTheme);
}

// Handle language change
function handleLanguageChange() {
    const newLanguage = elements.languageSelect.value;
    state.currentLanguage = newLanguage;
    
    const langConfig = languages[newLanguage];
    document.documentElement.lang = newLanguage;
    document.documentElement.dir = langConfig.direction;
    
    // Update UI text
    elements.newChatBtn.querySelector('span').textContent = langConfig.newChat;
    elements.chatInput.placeholder = langConfig.placeholder;
    document.querySelector('.disclaimer').textContent = langConfig.disclaimer;
    
    localStorage.setItem('language', newLanguage);
    updateUI();
}

// Generate welcome message
async function generateWelcomeMessage() {
    if (state.messages.length === 0) {
        const welcomeMessages = {
            fa: `خوش آمدی! من PIMXCHAT هستم، دستیار هوش مصنوعی شما. چطور می‌تونم کمکتون کنم؟`,
            en: `Welcome! I'm PIMXCHAT, your AI assistant. How can I help you today?`,
            fr: `Bienvenue ! Je suis PIMXCHAT, votre assistant IA. Comment puis-je vous aider ?`,
            it: `Benvenuto! Sono PIMXCHAT, il tuo assistente IA. Come posso aiutarti?`,
            es: `¡Bienvenido! Soy PIMXCHAT, tu asistente de IA. ¿Cómo puedo ayudarte?`,
            de: `Willkommen! Ich bin PIMXCHAT, Ihr KI-Assistent. Wie kann ich Ihnen helfen?`,
            ko: `환영합니다! 저는 PIMXCHAT, 당신의 AI 어시스턴트입니다. 어떻게 도와드릴까요?`,
            ja: `ようこそ！私はPIMXCHAT、あなたのAIアシスタントです。どのようにお手伝いできますか？`,
            he: `ברוכים הבאים! אני PIMXCHAT, העוזר האינטליגנטי שלכם. איך אני יכול לעזור לכם?`,
            ar: `مرحباً! أنا PIMXCHAT، مساعد الذكاء الاصطناعي الخاص بك. كيف يمكنني مساعدتك؟`
        };
        
        const welcomeMessage = {
            id: generateId(),
            role: 'assistant',
            content: welcomeMessages[state.currentLanguage],
            createdAt: new Date()
        };
        
        state.messages.push(welcomeMessage);
        renderMessages();
    }
}

// Simulate AI response
async function simulateAIResponse(input) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const responses = {
        fa: [
            'بله، می‌تونم کمکتون کنم!',
            'این سوال جالبیه. بذارید توضیح بدم...',
            'ممنون از سوالتون. در این مورد...',
            'بله، درست متوجه شدم. بذارید بگم...',
            'این موضوع خیلی مهمه. نظر من اینه که...'
        ],
        en: [
            'Yes, I can help you with that!',
            'That\'s an interesting question. Let me explain...',
            'Thank you for your question. Regarding this...',
            'Yes, I understand. Let me tell you...',
            'This is very important. My opinion is that...'
        ]
    };
    
    const currentResponses = responses[state.currentLanguage] || responses.en;
    return currentResponses[Math.floor(Math.random() * currentResponses.length)];
}

// Render conversations
function renderConversations() {
    if (!elements.conversationsList) return;
    
    elements.conversationsList.innerHTML = state.conversations.map(conversation => `
        <div class="conversation-item ${conversation.id === state.currentConversationId ? 'active' : ''}" 
             onclick="loadConversation('${conversation.id}')">
            <span>${conversation.title}</span>
        </div>
    `).join('');
}

// Load conversation
function loadConversation(conversationId) {
    const conversation = state.conversations.find(c => c.id === conversationId);
    if (conversation) {
        state.currentConversationId = conversationId;
        state.messages = [...conversation.messages];
        renderMessages();
        updateChatTitle();
        renderConversations();
        updateUI();
    }
}

// Render messages
function renderMessages() {
    if (!elements.chatMessages) return;
    
    elements.chatMessages.innerHTML = state.messages.map(message => `
        <div class="message ${message.role === 'user' ? 'user' : ''}">
            ${message.role === 'assistant' ? `
                <div class="message-avatar bot">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 8V4H8"></path>
                        <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                        <path d="M2 14h2"></path>
                        <path d="M20 14h2"></path>
                        <path d="M15 13v2"></path>
                        <path d="M9 13v2"></path>
                    </svg>
                </div>
            ` : ''}
            <div class="message-content ${message.role === 'user' ? 'user' : 'bot'}">
                ${message.content}
            </div>
            ${message.role === 'user' ? `
                <div class="message-avatar user">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
            ` : ''}
        </div>
    `).join('');
    
    // Scroll to bottom
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// Render loading indicator
function renderLoading() {
    const loadingHtml = `
        <div class="loading-indicator">
            <div class="message-avatar bot">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 8V4H8"></path>
                    <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                    <path d="M2 14h2"></path>
                    <path d="M20 14h2"></path>
                    <path d="M15 13v2"></path>
                    <path d="M9 13v2"></path>
                </svg>
            </div>
            <div class="loading-dots">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
        </div>
    `;
    
    elements.chatMessages.insertAdjacentHTML('beforeend', loadingHtml);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// Update chat title
function updateChatTitle() {
    if (state.currentConversationId) {
        const conversation = state.conversations.find(c => c.id === state.currentConversationId);
        elements.chatTitle.textContent = conversation ? conversation.title : languages[state.currentLanguage].newChat;
    } else {
        elements.chatTitle.textContent = languages[state.currentLanguage].newChat;
    }
}

// Update UI
function updateUI() {
    // Update sidebar state
    elements.sidebar.classList.toggle('collapsed', state.sidebarCollapsed);
    
    // Update input state
    handleInputChange();
    
    // Update chat title
    updateChatTitle();
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 