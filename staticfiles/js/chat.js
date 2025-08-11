/**
 * PIMXCHAT - Futuristic Chat Interface JavaScript
 * Features: Particle effects, animations, API communication, sound effects
 */

// Global copy message function
window.copyMessage = function(button) {
    const messageBubble = button.closest('.message-bubble');
    const messageText = messageBubble.querySelector('p').textContent;
    
    navigator.clipboard.writeText(messageText).then(() => {
        // Visual feedback
        const originalText = button.innerHTML;
        button.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6L9 17l-5-5"/>
            </svg>
        `;
        button.style.background = '#10b981';
        button.style.color = 'white';
        button.style.borderColor = '#10b981';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
            button.style.color = '';
            button.style.borderColor = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy message:', err);
    });
};

// Global toast notification function
window.showToast = function(message, type = 'success', duration = 3000) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Get icon based on type
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
            break;
        case 'error':
            icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
            break;
        case 'warning':
            icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
            break;
        case 'info':
            icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
            break;
    }

    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

    // Add toast to container
    toastContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Auto remove after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
};

// Jalali date conversion utility
window.convertToJalali = function(gregorianDate) {
    // Convert string date to Date object if needed
    if (typeof gregorianDate === 'string') {
        gregorianDate = new Date(gregorianDate);
    }
    
    // Ensure it's a Date object
    if (!(gregorianDate instanceof Date)) {
        return '';
    }
    
    // Convert to Iran timezone (UTC+3:30)
    const iranTime = new Date(gregorianDate.getTime() + (3.5 * 60 * 60 * 1000));
    
    // Simple Jalali conversion (this is a basic implementation)
    // For production, you might want to use a more robust library
    const gregorianYear = iranTime.getUTCFullYear();
    const gregorianMonth = iranTime.getUTCMonth() + 1;
    const gregorianDay = iranTime.getUTCDate();
    
    // Convert to Jalali
    let jalaliYear = gregorianYear - 621;
    let jalaliMonth = gregorianMonth + 9;
    let jalaliDay = gregorianDay + 22;
    
    if (jalaliMonth > 12) {
        jalaliMonth -= 12;
        jalaliYear += 1;
    }
    
    // Adjust for leap years and month lengths
    const leapYears = [1, 5, 9, 13, 17, 22, 26, 30];
    const isLeapYear = leapYears.includes(jalaliYear % 33);
    
    const monthLengths = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, isLeapYear ? 30 : 29];
    
    if (jalaliDay > monthLengths[jalaliMonth - 1]) {
        jalaliDay -= monthLengths[jalaliMonth - 1];
        jalaliMonth += 1;
        if (jalaliMonth > 12) {
            jalaliMonth = 1;
            jalaliYear += 1;
        }
    }
    
    // Format time in Iran timezone
    const hours = iranTime.getUTCHours().toString().padStart(2, '0');
    const minutes = iranTime.getUTCMinutes().toString().padStart(2, '0');
    
    // Format date
    const formattedDay = jalaliDay.toString().padStart(2, '0');
    const formattedMonth = jalaliMonth.toString().padStart(2, '0');
    const formattedYear = jalaliYear.toString();
    
    return `${hours}:${minutes} ${formattedYear}-${formattedMonth}-${formattedDay}`;
};

class PIMXCHAT {
    constructor() {
        this.currentSessionId = null;
        this.isTyping = false;
        this.particles = [];
        this.soundEnabled = true;
        this.language = 'fa'; // Default to Persian
        this.formattingState = {
            bold: false,
            italic: false
        };
        this.emojis = this.initializeEmojis();
        this.init();
    }

    init() {
        console.log('Initializing PIMXCHAT...');
        this.setupEventListeners();
        this.initParticleSystem();
        this.loadChatHistory();
        this.setupAutoResize();
        this.initEmojiPicker();
        this.playWelcomeSound();
        console.log('PIMXCHAT initialized successfully');
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Message input
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');

        console.log('Message input element:', messageInput);
        console.log('Send button element:', sendBtn);

        if (messageInput) {
            messageInput.addEventListener('input', () => {
                this.handleInputChange();
                this.autoResizeTextarea(messageInput);
                this.updateMessagePreview();
            });

            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        } else {
            console.error('Message input element not found!');
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        } else {
            console.error('Send button element not found!');
        }

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // New chat button
        const newChatBtn = document.getElementById('newChatBtn');
        if (newChatBtn) {
            newChatBtn.addEventListener('click', () => this.createNewChat());
        }

        // Clear chat button
        const clearChatBtn = document.getElementById('clearChatBtn');
        if (clearChatBtn) {
            clearChatBtn.addEventListener('click', () => this.clearCurrentChat());
        }

        // Export chat button
        const exportChatBtn = document.getElementById('exportChatBtn');
        if (exportChatBtn) {
            exportChatBtn.addEventListener('click', () => this.exportChat());
        }

        // Formatting buttons
        const boldBtn = document.getElementById('boldBtn');
        if (boldBtn) {
            boldBtn.addEventListener('click', () => this.toggleFormatting('bold'));
        }

        const italicBtn = document.getElementById('italicBtn');
        if (italicBtn) {
            italicBtn.addEventListener('click', () => this.toggleFormatting('italic'));
        }

        // Emoji picker
        const emojiBtn = document.getElementById('emojiBtn');
        if (emojiBtn) {
            emojiBtn.addEventListener('click', () => this.toggleEmojiPicker());
        }

        // Close emoji picker when clicking outside
        document.addEventListener('click', (e) => {
            const emojiPicker = document.getElementById('emojiPicker');
            const emojiBtn = document.getElementById('emojiBtn');
            if (emojiPicker && !emojiPicker.contains(e.target) && e.target !== emojiBtn) {
                emojiPicker.classList.remove('show');
            }
        });

        // Window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    // Particle System
    initParticleSystem() {
        const particleBg = document.getElementById('particleBg');
        if (!particleBg) {
            console.log('Particle background element not found');
            return;
        }

        // Create particles
        for (let i = 0; i < 50; i++) {
            this.createParticle(particleBg);
        }

        // Animate particles
        this.animateParticles();
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        // Random animation delay
        particle.style.animationDelay = Math.random() * 6 + 's';
        
        container.appendChild(particle);
        this.particles.push(particle);
    }

    animateParticles() {
        this.particles.forEach(particle => {
            // Add subtle movement
            setInterval(() => {
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight;
                
                particle.style.transition = 'all 10s ease-in-out';
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
            }, 10000);
        });
    }

    // Sound Effects
    playSound(type = 'message') {
        if (!this.soundEnabled) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        switch (type) {
            case 'message':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
                break;
            case 'notification':
                oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
                break;
            case 'error':
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.3);
                break;
        }

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    playWelcomeSound() {
        setTimeout(() => {
            this.playSound('notification');
        }, 1000);
    }

    // Input Handling
    handleInputChange() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        if (messageInput && sendBtn) {
            const hasText = messageInput.value.trim().length > 0;
            sendBtn.disabled = !hasText;
            
            if (hasText) {
                sendBtn.style.opacity = '1';
                sendBtn.style.transform = 'scale(1)';
            } else {
                sendBtn.style.opacity = '0.5';
                sendBtn.style.transform = 'scale(0.95)';
            }
        }
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    setupAutoResize() {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('input', () => {
                this.autoResizeTextarea(messageInput);
            });
        }
    }

    // Message Handling
    async sendMessage() {
        console.log('Sending message...');
        const messageInput = document.getElementById('messageInput');
        let message = messageInput.value.trim();
        
        if (!message) {
            console.log('No message to send');
            return;
        }

        // Apply formatting if any formatting buttons are active
        if (this.formattingState.bold || this.formattingState.italic) {
            message = this.applyFormatting(message);
        }

        console.log('Message content:', message);

        // Clear input and reset formatting
        messageInput.value = '';
        this.resetFormatting();
        this.handleInputChange();
        this.autoResizeTextarea(messageInput);
        this.updateMessagePreview();

        // Add user message to UI
        this.addMessageToUI(message, 'user');
        this.playSound('message');

        // Show typing indicator
        this.showTypingIndicator();

        try {
            console.log('Sending message to API...');
            const response = await this.sendMessageToAPI(message);
            console.log('API response:', response);
            
            if (response.success) {
                // Hide typing indicator
                this.hideTypingIndicator();
                
                // Add AI response to UI
                console.log('Adding AI response to UI:', response.ai_message.content);
                this.addMessageToUI(response.ai_message.content, 'ai');
                this.playSound('notification');
                
                // Update current session
                this.currentSessionId = response.session_id;
                
                // Update chat history
                this.loadChatHistory();
            } else {
                console.error('API returned error:', response.error);
                throw new Error(response.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            this.addMessageToUI('متأسفم، خطایی رخ داد. لطفاً دوباره تلاش کنید.', 'ai');
            this.playSound('error');
        }
    }

    async sendMessageToAPI(message) {
        console.log('Making API call to /api/chat/send/');
        console.log('CSRF Token:', this.getCSRFToken());
        console.log('Request body:', {
            session_id: this.currentSessionId,
            message: message
        });
        
        const response = await fetch('/api/chat/send/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCSRFToken()
            },
            body: JSON.stringify({
                session_id: this.currentSessionId,
                message: message
            })
        });

        console.log('Response status:', response.status);
        const responseData = await response.json();
        console.log('Response data:', responseData);
        return responseData;
    }

    addMessageToUI(content, type) {
        console.log(`Adding message to UI: type=${type}, content="${content}"`);
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) {
            console.error('Messages container not found!');
            return;
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const timestamp = new Date().toLocaleTimeString('fa-IR', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Tehran'
        });

        // Different avatar for user vs AI
        const avatar = type === 'user' ? 
            `<div class="message-avatar">
                <div class="avatar-glow"></div>
                <span>${this.getUserInitial()}</span>
            </div>` :
            `<div class="message-avatar">
                <div class="avatar-pulse"></div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
            </div>`;

        // Copy button for both user and AI messages
        const copyButton = `
            <button class="message-copy-btn" onclick="copyMessage(this)" title="کپی کردن پیام">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                </svg>
            </button>
        `;

        messageDiv.innerHTML = `
            ${avatar}
            <div class="message-content">
                <div class="message-bubble">
                    ${copyButton}
                    <p>${this.parseMarkdown(this.escapeHtml(content))}</p>
                </div>
                <div class="message-time">${timestamp}</div>
            </div>
        `;

        console.log('Message HTML:', messageDiv.innerHTML);

        // Add animation
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        
        messagesContainer.appendChild(messageDiv);
        
        // Trigger animation
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease-out';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 10);

        // Scroll to bottom
        this.scrollToBottom();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    parseMarkdown(text) {
        // Simple markdown parsing for bold and italic
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italic
    }

    getUserInitial() {
        // Try to get username from the page
        const userElement = document.querySelector('.user-name');
        if (userElement) {
            return userElement.textContent.charAt(0).toUpperCase();
        }
        return 'U';
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    // Typing Indicator
    showTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'flex';
            this.isTyping = true;
        }
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
            this.isTyping = false;
        }
    }

    // Chat History
    async loadChatHistory() {
        console.log('Loading chat history...');
        try {
            const response = await fetch('/api/chat/sessions/');
            console.log('Chat history response status:', response.status);
            const data = await response.json();
            console.log('Chat history data:', data);
            
            this.renderChatHistory(data.sessions);
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    renderChatHistory(sessions) {
        const chatHistory = document.getElementById('chatHistory');
        if (!chatHistory) return;

        chatHistory.innerHTML = '';

        sessions.forEach(session => {
            const historyItem = this.createHistoryItem(session);
            chatHistory.appendChild(historyItem);
        });
    }

    createHistoryItem(session) {
        const template = document.getElementById('chatHistoryTemplate');
        if (!template) return document.createElement('div');

        const clone = template.content.cloneNode(true);
        const item = clone.querySelector('.chat-history-item');
        
        if (item) {
            item.dataset.sessionId = session.id;
            const titleElement = item.querySelector('.history-title');
            titleElement.textContent = session.title;
            item.querySelector('.history-preview').textContent = session.preview;
            
            // Convert the date to Jalali format with Iran timezone
            const jalaliDate = convertToJalali(session.updated_at);
            item.querySelector('.history-time').textContent = jalaliDate;
            
            // Add click event to load session (but not on action buttons)
            const historyContent = item.querySelector('.history-content');
            if (historyContent) {
                historyContent.addEventListener('click', () => this.loadSession(session.id));
            }
            
            // Add rename event
            const renameBtn = item.querySelector('.rename-btn');
            if (renameBtn) {
                renameBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.startRenameSession(session.id, titleElement);
                });
            }
            
            // Add delete event
            const deleteBtn = item.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteSession(session.id);
                });
            }
        }

        return clone;
    }

    async loadSession(sessionId) {
        try {
            const response = await fetch(`/api/chat/sessions/${sessionId}/messages/`);
            const data = await response.json();
            
            this.currentSessionId = sessionId;
            this.renderMessages(data.messages);
            
            // Update active state in sidebar
            this.updateActiveSession(sessionId);
        } catch (error) {
            console.error('Error loading session:', error);
        }
    }

    renderMessages(messages) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        messagesContainer.innerHTML = '';

        messages.forEach(message => {
            this.addMessageToUI(message.content, message.message_type);
        });
    }

    updateActiveSession(sessionId) {
        const historyItems = document.querySelectorAll('.chat-history-item');
        historyItems.forEach(item => {
            item.classList.remove('active');
        });

        // Find and highlight active session
        const activeItem = document.querySelector(`[data-session-id="${sessionId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    // Chat Management
    async createNewChat() {
        try {
            const response = await fetch('/api/chat/new/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': this.getCSRFToken()
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.currentSessionId = data.session_id;
                this.clearMessages();
                this.addMessageToUI(data.welcome_message, 'ai');
                this.loadChatHistory();
                this.playSound('notification');
            }
        } catch (error) {
            console.error('Error creating new chat:', error);
        }
    }

    async deleteSession(sessionId) {
        try {
            const response = await fetch(`/api/chat/sessions/${sessionId}/delete/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': this.getCSRFToken()
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.loadChatHistory();
                this.playSound('notification');
                showToast('چت با موفقیت حذف شد', 'success');
                
                // If deleted session was current, create new chat
                if (sessionId === this.currentSessionId) {
                    this.createNewChat();
                }
            } else {
                showToast('خطا در حذف چت', 'error');
            }
        } catch (error) {
            console.error('Error deleting session:', error);
            showToast('خطا در حذف چت', 'error');
        }
    }

    startRenameSession(sessionId, titleElement) {
        const currentTitle = titleElement.textContent;
        
        // Create input element
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'rename-input';
        input.value = currentTitle;
        input.maxLength = 100;
        
        // Replace title with input
        titleElement.style.display = 'none';
        titleElement.parentNode.insertBefore(input, titleElement.nextSibling);
        
        // Focus and select text
        input.focus();
        input.select();
        
        // Handle save
        const saveRename = async () => {
            const newTitle = input.value.trim();
            
            if (!newTitle) {
                this.cancelRename(titleElement, input);
                return;
            }
            
            if (newTitle === currentTitle) {
                this.cancelRename(titleElement, input);
                return;
            }
            
            try {
                const response = await this.renameSession(sessionId, newTitle);
                if (response.success) {
                    titleElement.textContent = response.title;
                    this.finishRename(titleElement, input);
                    this.playSound('notification');
                    showToast('نام چت با موفقیت تغییر یافت', 'success');
                } else {
                    showToast('خطا در تغییر نام چت', 'error');
                    this.cancelRename(titleElement, input);
                }
            } catch (error) {
                console.error('Error renaming session:', error);
                showToast('خطا در تغییر نام چت', 'error');
                this.cancelRename(titleElement, input);
            }
        };
        
        // Handle cancel
        const cancelRename = () => {
            this.cancelRename(titleElement, input);
        };
        
        // Event listeners
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveRename();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelRename();
            }
        });
        
        input.addEventListener('blur', saveRename);
    }

    async renameSession(sessionId, newTitle) {
        const response = await fetch(`/api/chat/sessions/${sessionId}/rename/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCSRFToken()
            },
            body: JSON.stringify({
                title: newTitle
            })
        });
        
        return await response.json();
    }

    cancelRename(titleElement, input) {
        titleElement.style.display = '';
        if (input.parentNode) {
            input.parentNode.removeChild(input);
        }
    }

    finishRename(titleElement, input) {
        titleElement.style.display = '';
        if (input.parentNode) {
            input.parentNode.removeChild(input);
        }
    }

    async clearCurrentChat() {
        if (!this.currentSessionId) return;
        
        try {
            const response = await fetch(`/api/chat/sessions/${this.currentSessionId}/clear/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': this.getCSRFToken()
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.clearMessages();
                this.addMessageToUI(data.welcome_message, 'ai');
                this.playSound('notification');
                showToast('چت با موفقیت پاک شد', 'success');
            } else {
                showToast('خطا در پاک کردن چت', 'error');
            }
        } catch (error) {
            console.error('Error clearing chat:', error);
            showToast('خطا در پاک کردن چت', 'error');
        }
    }

    clearMessages() {
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
    }

    // Export Chat
    exportChat() {
        if (!this.currentSessionId) {
            alert('هیچ چتی برای خروجی گرفتن وجود ندارد.');
            return;
        }

        const messages = document.querySelectorAll('.message');
        let exportText = 'PIMXCHAT Chat Export\n';
        exportText += '='.repeat(30) + '\n\n';

        messages.forEach(message => {
            const isUser = message.classList.contains('user-message');
            const content = message.querySelector('.message-bubble p').textContent;
            const time = message.querySelector('.message-time').textContent;
            
            exportText += `[${time}] ${isUser ? 'You' : 'PIMXCHAT'}: ${content}\n\n`;
        });

        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pimxchat-export-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.playSound('notification');
    }

    // Sidebar Management
    toggleSidebar() {
        const sidebar = document.getElementById('chatSidebar');
        if (sidebar) {
            sidebar.classList.toggle('open');
        }
    }

    handleResize() {
        // Adjust particle positions on resize
        this.particles.forEach(particle => {
            if (parseFloat(particle.style.left) > window.innerWidth) {
                particle.style.left = Math.random() * window.innerWidth + 'px';
            }
            if (parseFloat(particle.style.top) > window.innerHeight) {
                particle.style.top = Math.random() * window.innerHeight + 'px';
            }
        });
    }

    // Utility Functions
    getCSRFToken() {
        console.log('Getting CSRF token...');
        const token = document.querySelector('meta[name="csrf-token"]');
        console.log('CSRF token from meta tag:', token);
        if (token) {
            const tokenValue = token.getAttribute('content');
            console.log('CSRF token value from meta:', tokenValue);
            return tokenValue;
        }
        // Fallback: try to get from cookie
        const name = 'csrftoken';
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        console.log('CSRF token from cookie:', cookieValue);
        return cookieValue || '';
    }

    // Theme Management
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        this.playSound('notification');
    }

    // Language Management
    toggleLanguage() {
        this.language = this.language === 'fa' ? 'en' : 'fa';
        localStorage.setItem('language', this.language);
        
        // Reload page to apply language change
        window.location.reload();
    }

    // Performance Optimization
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize theme from localStorage
    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // Initialize language from localStorage
    initLanguage() {
        const savedLanguage = localStorage.getItem('language') || 'fa';
        this.language = savedLanguage;
    }

    // Message Formatting Methods
    toggleFormatting(type) {
        this.formattingState[type] = !this.formattingState[type];
        
        const btn = document.getElementById(type + 'Btn');
        if (btn) {
            if (this.formattingState[type]) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    }

    applyFormatting(text) {
        let formattedText = text;
        
        if (this.formattingState.bold) {
            formattedText = `**${formattedText}**`;
        }
        
        if (this.formattingState.italic) {
            formattedText = `*${formattedText}*`;
        }
        
        return formattedText;
    }

    resetFormatting() {
        this.formattingState.bold = false;
        this.formattingState.italic = false;
        
        // Update button states
        const boldBtn = document.getElementById('boldBtn');
        const italicBtn = document.getElementById('italicBtn');
        
        if (boldBtn) boldBtn.classList.remove('active');
        if (italicBtn) italicBtn.classList.remove('active');
    }

    // Emoji System
    initializeEmojis() {
        return {
            smileys: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
            people: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
            nature: ['🌸', '💐', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌶', '🍄', '🌾', '💐', '🌿', '☘', '🍀', '🍃', '🍂', '🍁', '🌊', '🌀', '🌈', '☀', '🌤', '⛅'],
            food: ['🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🌯', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🥗', '🍿', '🧈', '🧂', '🥨', '🥖', '🍞', '🥜', '🌰', '🥔', '🍠', '🥕', '🌽', '🌶', '🥒', '🥬', '🥦'],
            activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸'],
            travel: ['✈️', '🛫', '🛬', '🪂', '💺', '🚁', '🚟', '🚠', '🚡', '🛰', '🚀', '🛸', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒'],
            objects: ['💡', '🔦', '🏮', '🪔', '📱', '💻', '🖥', '🖨', '⌨', '🖱', '🖲', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎', '📟', '📠', '📺', '📻', '🎙', '🎚'],
            symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮', '✝', '☪', '🕉', '☸', '✡', '🔯', '🕎', '☯', '☦', '🛐']
        };
    }

    initEmojiPicker() {
        this.populateEmojiGrid('smileys');
        this.setupEmojiCategories();
    }

    setupEmojiCategories() {
        const categories = document.querySelectorAll('.emoji-category');
        categories.forEach(category => {
            category.addEventListener('click', (e) => {
                // Remove active class from all categories
                categories.forEach(cat => cat.classList.remove('active'));
                // Add active class to clicked category
                e.target.classList.add('active');
                // Populate grid with selected category
                const categoryName = e.target.dataset.category;
                this.populateEmojiGrid(categoryName);
            });
        });
    }

    populateEmojiGrid(category) {
        const emojiGrid = document.getElementById('emojiGrid');
        if (!emojiGrid || !this.emojis[category]) return;

        emojiGrid.innerHTML = '';
        
        this.emojis[category].forEach(emoji => {
            const emojiBtn = document.createElement('button');
            emojiBtn.className = 'emoji-item';
            emojiBtn.textContent = emoji;
            emojiBtn.title = emoji;
            
            emojiBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.insertEmoji(emoji);
            });
            
            emojiGrid.appendChild(emojiBtn);
        });
    }

    toggleEmojiPicker() {
        const emojiPicker = document.getElementById('emojiPicker');
        if (emojiPicker) {
            emojiPicker.classList.toggle('show');
        }
    }

    insertEmoji(emoji) {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            const start = messageInput.selectionStart;
            const end = messageInput.selectionEnd;
            const text = messageInput.value;
            
            messageInput.value = text.substring(0, start) + emoji + text.substring(end);
            messageInput.focus();
            messageInput.setSelectionRange(start + emoji.length, start + emoji.length);
            
            // Update send button state
            this.handleInputChange();
            this.updateMessagePreview();
            
            // Close emoji picker
            const emojiPicker = document.getElementById('emojiPicker');
            if (emojiPicker) {
                emojiPicker.classList.remove('show');
            }
        }
    }

    // Message Preview
    updateMessagePreview() {
        const messageInput = document.getElementById('messageInput');
        const messagePreview = document.getElementById('messagePreview');
        const messagePreviewContent = document.getElementById('messagePreviewContent');
        
        if (!messageInput || !messagePreview || !messagePreviewContent) return;
        
        const text = messageInput.value.trim();
        
        if (text.length > 0 && (this.formattingState.bold || this.formattingState.italic || text.includes('*'))) {
            const formattedText = this.applyFormatting(text);
            const htmlContent = this.parseMarkdown(this.escapeHtml(formattedText));
            
            messagePreviewContent.innerHTML = htmlContent;
            messagePreview.classList.add('show');
        } else {
            messagePreview.classList.remove('show');
        }
    }
}

// Initialize PIMXCHAT when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pimxchat = new PIMXCHAT();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PIMXCHAT;
} 