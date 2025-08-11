// Chat History JavaScript

// Global state
const historyState = {
    currentLanguage: 'fa',
    viewMode: 'list',
    searchQuery: '',
    filters: {
        date: 'all',
        topic: 'all',
        rating: 'all'
    },
    sortBy: 'date',
    selectedChats: new Set(),
    allChats: [],
    displayedChats: [],
    currentPage: 1,
    itemsPerPage: 20,
    isLoading: false
};

// Initialize history page
function initHistory() {
    loadState();
    loadChatData();
    setupEventListeners();
    updateUI();
}

// Load state from localStorage
function loadState() {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
        historyState.currentLanguage = savedLanguage;
        document.getElementById('languageSelect').value = savedLanguage;
    }
    
    const savedViewMode = localStorage.getItem('historyViewMode');
    if (savedViewMode) {
        historyState.viewMode = savedViewMode;
        updateViewMode(savedViewMode);
    }
}

// Load chat data
function loadChatData() {
    // Generate mock chat data
    historyState.allChats = generateMockChats();
    historyState.displayedChats = [...historyState.allChats];
    renderChats();
    updateResultsSummary();
}

// Generate mock chat data
function generateMockChats() {
    const topics = ['programming', 'math', 'language', 'science', 'other'];
    const topicNames = {
        programming: 'برنامه‌نویسی',
        math: 'ریاضی',
        language: 'زبان‌های خارجی',
        science: 'علوم',
        other: 'سایر'
    };
    
    const chats = [];
    for (let i = 1; i <= 50; i++) {
        const topic = topics[Math.floor(Math.random() * topics.length)];
        const rating = Math.floor(Math.random() * 5) + 1;
        const messages = Math.floor(Math.random() * 50) + 5;
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 365));
        
        chats.push({
            id: i,
            title: `چت ${i}: ${topicNames[topic]} - ${getRandomTitle(topic)}`,
            topic: topic,
            topicName: topicNames[topic],
            rating: rating,
            messages: messages,
            date: date,
            preview: getRandomPreview(),
            selected: false
        });
    }
    
    return chats.sort((a, b) => b.date - a.date);
}

// Get random title based on topic
function getRandomTitle(topic) {
    const titles = {
        programming: [
            'راهنمای React.js',
            'مفاهیم TypeScript',
            'الگوریتم‌های جستجو',
            'پایگاه داده SQL',
            'معماری نرم‌افزار'
        ],
        math: [
            'حساب دیفرانسیل',
            'جبر خطی',
            'احتمال و آمار',
            'هندسه تحلیلی',
            'نظریه اعداد'
        ],
        language: [
            'گرامر انگلیسی',
            'ترجمه متون',
            'مکالمه فرانسه',
            'دستور زبان آلمانی',
            'واژگان تخصصی'
        ],
        science: [
            'فیزیک کوانتوم',
            'شیمی آلی',
            'زیست‌شناسی سلولی',
            'نجوم و کیهان‌شناسی',
            'علوم زمین'
        ],
        other: [
            'تاریخ جهان',
            'فلسفه غرب',
            'اقتصاد کلان',
            'روان‌شناسی شناختی',
            'هنر و معماری'
        ]
    };
    
    const topicTitles = titles[topic] || titles.other;
    return topicTitles[Math.floor(Math.random() * topicTitles.length)];
}

// Get random preview text
function getRandomPreview() {
    const previews = [
        'سلام! می‌خواهم در مورد برنامه‌نویسی React.js سوال کنم...',
        'لطفاً در حل این مسئله ریاضی به من کمک کنید...',
        'آیا می‌توانید این متن را ترجمه کنید؟',
        'در مورد مفاهیم فیزیک کوانتوم توضیح دهید...',
        'می‌خواهم در مورد تاریخ جهان صحبت کنیم...'
    ];
    return previews[Math.floor(Math.random() * previews.length)];
}

// Setup event listeners
function setupEventListeners() {
    // Search
    document.getElementById('searchInput')?.addEventListener('input', handleSearch);
    document.getElementById('clearSearch')?.addEventListener('click', clearSearch);
    
    // Filters
    document.getElementById('dateFilter')?.addEventListener('change', handleFilterChange);
    document.getElementById('topicFilter')?.addEventListener('change', handleFilterChange);
    document.getElementById('ratingFilter')?.addEventListener('change', handleFilterChange);
    
    // Sort
    document.getElementById('sortBy')?.addEventListener('change', handleSortChange);
    
    // View mode
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', handleViewChange);
    });
    
    // Bulk actions
    document.getElementById('selectAllBtn')?.addEventListener('click', toggleSelectAll);
    document.getElementById('deleteSelectedBtn')?.addEventListener('click', showDeleteModal);
    
    // Empty state
    document.getElementById('clearFiltersBtn')?.addEventListener('click', clearAllFilters);
    
    // Load more
    document.getElementById('loadMoreBtn')?.addEventListener('click', loadMoreChats);
    
    // Modals
    document.getElementById('closePreviewModal')?.addEventListener('click', hidePreviewModal);
    document.getElementById('closeDeleteModal')?.addEventListener('click', hideDeleteModal);
    document.getElementById('cancelDelete')?.addEventListener('click', hideDeleteModal);
    document.getElementById('confirmDelete')?.addEventListener('click', deleteSelectedChats);
    document.getElementById('exportChatBtn')?.addEventListener('click', exportChat);
    
    // Language change
    document.getElementById('languageSelect')?.addEventListener('change', handleLanguageChange);
    
    // Modal outside click
    document.getElementById('chatPreviewModal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('chatPreviewModal')) {
            hidePreviewModal();
        }
    });
    
    document.getElementById('deleteModal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('deleteModal')) {
            hideDeleteModal();
        }
    });
}

// Handle search
function handleSearch(e) {
    historyState.searchQuery = e.target.value;
    const clearBtn = document.getElementById('clearSearch');
    
    if (historyState.searchQuery) {
        clearBtn.style.display = 'block';
    } else {
        clearBtn.style.display = 'none';
    }
    
    filterAndRenderChats();
}

// Clear search
function clearSearch() {
    document.getElementById('searchInput').value = '';
    historyState.searchQuery = '';
    document.getElementById('clearSearch').style.display = 'none';
    filterAndRenderChats();
}

// Handle filter change
function handleFilterChange(e) {
    const filterType = e.target.id.replace('Filter', '');
    historyState.filters[filterType] = e.target.value;
    filterAndRenderChats();
}

// Handle sort change
function handleSortChange(e) {
    historyState.sortBy = e.target.value;
    filterAndRenderChats();
}

// Handle view change
function handleViewChange(e) {
    const viewMode = e.target.dataset.view;
    historyState.viewMode = viewMode;
    localStorage.setItem('historyViewMode', viewMode);
    updateViewMode(viewMode);
}

// Update view mode
function updateViewMode(viewMode) {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector(`[data-view="${viewMode}"]`).classList.add('active');
    
    const chatList = document.getElementById('chatList');
    chatList.className = `chat-list ${viewMode}`;
    
    renderChats();
}

// Handle language change
function handleLanguageChange() {
    const newLanguage = document.getElementById('languageSelect').value;
    historyState.currentLanguage = newLanguage;
    
    document.documentElement.lang = newLanguage;
    document.documentElement.dir = newLanguage === 'fa' ? 'rtl' : 'ltr';
    
    localStorage.setItem('language', newLanguage);
    updateUI();
}

// Filter and render chats
function filterAndRenderChats() {
    let filteredChats = [...historyState.allChats];
    
    // Apply search filter
    if (historyState.searchQuery) {
        const query = historyState.searchQuery.toLowerCase();
        filteredChats = filteredChats.filter(chat => 
            chat.title.toLowerCase().includes(query) ||
            chat.preview.toLowerCase().includes(query) ||
            chat.topicName.toLowerCase().includes(query)
        );
    }
    
    // Apply date filter
    if (historyState.filters.date !== 'all') {
        const now = new Date();
        const filterDate = new Date();
        
        switch (historyState.filters.date) {
            case 'today':
                filterDate.setHours(0, 0, 0, 0);
                filteredChats = filteredChats.filter(chat => chat.date >= filterDate);
                break;
            case 'week':
                filterDate.setDate(filterDate.getDate() - 7);
                filteredChats = filteredChats.filter(chat => chat.date >= filterDate);
                break;
            case 'month':
                filterDate.setMonth(filterDate.getMonth() - 1);
                filteredChats = filteredChats.filter(chat => chat.date >= filterDate);
                break;
            case 'year':
                filterDate.setFullYear(filterDate.getFullYear() - 1);
                filteredChats = filteredChats.filter(chat => chat.date >= filterDate);
                break;
        }
    }
    
    // Apply topic filter
    if (historyState.filters.topic !== 'all') {
        filteredChats = filteredChats.filter(chat => chat.topic === historyState.filters.topic);
    }
    
    // Apply rating filter
    if (historyState.filters.rating !== 'all') {
        const rating = parseInt(historyState.filters.rating);
        filteredChats = filteredChats.filter(chat => chat.rating === rating);
    }
    
    // Apply sorting
    filteredChats.sort((a, b) => {
        switch (historyState.sortBy) {
            case 'date':
                return b.date - a.date;
            case 'title':
                return a.title.localeCompare(b.title);
            case 'rating':
                return b.rating - a.rating;
            case 'messages':
                return b.messages - a.messages;
            default:
                return b.date - a.date;
        }
    });
    
    historyState.displayedChats = filteredChats;
    historyState.currentPage = 1;
    renderChats();
    updateResultsSummary();
}

// Render chats
function renderChats() {
    const chatList = document.getElementById('chatList');
    const emptyState = document.getElementById('emptyState');
    const loadMore = document.getElementById('loadMore');
    
    if (historyState.displayedChats.length === 0) {
        chatList.style.display = 'none';
        emptyState.style.display = 'block';
        loadMore.style.display = 'none';
        return;
    }
    
    chatList.style.display = 'flex';
    emptyState.style.display = 'none';
    
    const startIndex = (historyState.currentPage - 1) * historyState.itemsPerPage;
    const endIndex = startIndex + historyState.itemsPerPage;
    const chatsToShow = historyState.displayedChats.slice(startIndex, endIndex);
    
    chatList.innerHTML = chatsToShow.map(chat => createChatItem(chat)).join('');
    
    // Show/hide load more button
    if (endIndex < historyState.displayedChats.length) {
        loadMore.style.display = 'block';
    } else {
        loadMore.style.display = 'none';
    }
    
    // Add event listeners to chat items
    addChatItemListeners();
}

// Create chat item HTML
function createChatItem(chat) {
    const stars = createStars(chat.rating);
    const dateStr = formatDate(chat.date);
    
    return `
        <div class="chat-item" data-chat-id="${chat.id}">
            <div class="checkbox"></div>
            <div class="chat-header">
                <div>
                    <div class="chat-title">${chat.title}</div>
                    <div class="chat-meta">
                        <span class="chat-topic ${chat.topic}">${chat.topicName}</span>
                        <span>${chat.messages} پیام</span>
                        <span>${dateStr}</span>
                    </div>
                </div>
                <div class="chat-rating">
                    <div class="stars">${stars}</div>
                    <span>${chat.rating}/5</span>
                </div>
            </div>
            <div class="chat-preview">${chat.preview}</div>
            <div class="chat-stats">
                <span>${formatDate(chat.date)}</span>
                <span>${chat.messages} پیام</span>
            </div>
            <div class="chat-actions">
                <button class="action-btn preview-btn" title="پیش‌نمایش">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                </button>
                <button class="action-btn export-btn" title="خروجی">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                </button>
                <button class="action-btn delete-btn" title="حذف">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
}

// Create stars HTML
function createStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<span class="star">★</span>';
        } else {
            stars += '<span class="star empty">☆</span>';
        }
    }
    return stars;
}

// Format date
function formatDate(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return 'دیروز';
    } else if (diffDays < 7) {
        return `${diffDays} روز پیش`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} هفته پیش`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} ماه پیش`;
    } else {
        const years = Math.floor(diffDays / 365);
        return `${years} سال پیش`;
    }
}

// Add event listeners to chat items
function addChatItemListeners() {
    document.querySelectorAll('.chat-item').forEach(item => {
        const chatId = parseInt(item.dataset.chatId);
        
        // Checkbox selection
        item.querySelector('.checkbox').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleChatSelection(chatId, item);
        });
        
        // Preview button
        item.querySelector('.preview-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            showChatPreview(chatId);
        });
        
        // Export button
        item.querySelector('.export-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            exportChat(chatId);
        });
        
        // Delete button
        item.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteChat(chatId);
        });
        
        // Item click
        item.addEventListener('click', () => {
            // Navigate to chat or show preview
            showChatPreview(chatId);
        });
    });
}

// Toggle chat selection
function toggleChatSelection(chatId, item) {
    if (historyState.selectedChats.has(chatId)) {
        historyState.selectedChats.delete(chatId);
        item.classList.remove('selected');
    } else {
        historyState.selectedChats.add(chatId);
        item.classList.add('selected');
    }
    
    updateBulkActions();
}

// Update bulk actions visibility
function updateBulkActions() {
    const bulkActions = document.getElementById('bulkActions');
    const selectAllBtn = document.getElementById('selectAllBtn');
    
    if (historyState.selectedChats.size > 0) {
        bulkActions.style.display = 'flex';
        selectAllBtn.textContent = historyState.selectedChats.size === historyState.displayedChats.length ? 
            'لغو انتخاب همه' : 'انتخاب همه';
    } else {
        bulkActions.style.display = 'none';
    }
}

// Toggle select all
function toggleSelectAll() {
    const chatItems = document.querySelectorAll('.chat-item');
    
    if (historyState.selectedChats.size === historyState.displayedChats.length) {
        // Deselect all
        historyState.selectedChats.clear();
        chatItems.forEach(item => item.classList.remove('selected'));
    } else {
        // Select all
        historyState.selectedChats.clear();
        chatItems.forEach(item => {
            const chatId = parseInt(item.dataset.chatId);
            historyState.selectedChats.add(chatId);
            item.classList.add('selected');
        });
    }
    
    updateBulkActions();
}

// Show chat preview
function showChatPreview(chatId) {
    const chat = historyState.allChats.find(c => c.id === chatId);
    if (!chat) return;
    
    document.getElementById('previewTitle').textContent = chat.title;
    
    // Generate mock messages
    const messages = generateMockMessages();
    const previewHtml = messages.map(msg => `
        <div class="message ${msg.type}">
            <div class="message-header">
                <span>${msg.type === 'user' ? 'شما' : 'هوش مصنوعی'}</span>
                <span>${formatDate(msg.date)}</span>
            </div>
            <div class="message-content">${msg.content}</div>
        </div>
    `).join('');
    
    document.getElementById('chatPreview').innerHTML = previewHtml;
    document.getElementById('chatPreviewModal').classList.add('show');
}

// Generate mock messages
function generateMockMessages() {
    return [
        {
            type: 'user',
            content: 'سلام! می‌خواهم در مورد برنامه‌نویسی React.js سوال کنم.',
            date: new Date(Date.now() - 3600000)
        },
        {
            type: 'ai',
            content: 'سلام! خوشحالم که می‌خواهید React.js یاد بگیرید. React یک کتابخانه JavaScript برای ساخت رابط‌های کاربری است.',
            date: new Date(Date.now() - 3500000)
        },
        {
            type: 'user',
            content: 'مفاهیم اصلی React چیست؟',
            date: new Date(Date.now() - 3400000)
        },
        {
            type: 'ai',
            content: 'مفاهیم اصلی React شامل Components، JSX، State، Props، و Virtual DOM است. هر کدام نقش مهمی در ساخت اپلیکیشن‌های React دارند.',
            date: new Date(Date.now() - 3300000)
        }
    ];
}

// Hide preview modal
function hidePreviewModal() {
    document.getElementById('chatPreviewModal').classList.remove('show');
}

// Export chat
function exportChat(chatId) {
    const chat = historyState.allChats.find(c => c.id === chatId);
    if (!chat) return;
    
    // Simulate export
    showNotification(`چت "${chat.title}" در حال خروجی گرفتن...`, 'info');
    
    setTimeout(() => {
        showNotification('فایل با موفقیت دانلود شد', 'success');
    }, 2000);
}

// Delete chat
function deleteChat(chatId) {
    if (confirm('آیا مطمئن هستید که می‌خواهید این چت را حذف کنید؟')) {
        historyState.allChats = historyState.allChats.filter(c => c.id !== chatId);
        historyState.selectedChats.delete(chatId);
        filterAndRenderChats();
        showNotification('چت با موفقیت حذف شد', 'success');
    }
}

// Show delete modal
function showDeleteModal() {
    document.getElementById('deleteModal').classList.add('show');
}

// Hide delete modal
function hideDeleteModal() {
    document.getElementById('deleteModal').classList.remove('show');
}

// Delete selected chats
function deleteSelectedChats() {
    const selectedIds = Array.from(historyState.selectedChats);
    historyState.allChats = historyState.allChats.filter(c => !selectedIds.includes(c.id));
    historyState.selectedChats.clear();
    filterAndRenderChats();
    hideDeleteModal();
    showNotification(`${selectedIds.length} چت با موفقیت حذف شد`, 'success');
}

// Clear all filters
function clearAllFilters() {
    document.getElementById('dateFilter').value = 'all';
    document.getElementById('topicFilter').value = 'all';
    document.getElementById('ratingFilter').value = 'all';
    document.getElementById('sortBy').value = 'date';
    
    historyState.filters = { date: 'all', topic: 'all', rating: 'all' };
    historyState.sortBy = 'date';
    
    filterAndRenderChats();
}

// Load more chats
function loadMoreChats() {
    historyState.currentPage++;
    renderChats();
}

// Update results summary
function updateResultsSummary() {
    const resultsCount = document.getElementById('resultsCount');
    const filterInfo = document.getElementById('filterInfo');
    
    resultsCount.textContent = `${historyState.displayedChats.length.toLocaleString()} چت یافت شد`;
    
    const activeFilters = [];
    if (historyState.filters.date !== 'all') activeFilters.push('تاریخ');
    if (historyState.filters.topic !== 'all') activeFilters.push('موضوع');
    if (historyState.filters.rating !== 'all') activeFilters.push('امتیاز');
    if (historyState.searchQuery) activeFilters.push('جستجو');
    
    if (activeFilters.length > 0) {
        filterInfo.textContent = `فیلتر شده: ${activeFilters.join('، ')}`;
    } else {
        filterInfo.textContent = 'نمایش تمام چت‌ها';
    }
}

// Update UI
function updateUI() {
    // Update page title
    const title = historyState.currentLanguage === 'fa' ? 'تاریخچه چت' : 'Chat History';
    document.title = title + ' - PIMXCHAT';
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        background-color: ${type === 'success' ? 'hsl(142 76% 36%)' : 
                          type === 'error' ? 'hsl(0 84% 60%)' : 
                          type === 'warning' ? 'hsl(38 92% 50%)' : 'hsl(275 100% 41%)'};
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Check authentication
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = 'login.html';
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initHistory();
}); 