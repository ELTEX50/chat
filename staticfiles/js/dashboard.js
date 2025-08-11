// Dashboard JavaScript

// Global state
const dashboardState = {
    currentLanguage: 'fa',
    dateRange: 30,
    charts: {},
    isLoading: false
};

// Initialize dashboard
function initDashboard() {
    loadState();
    setupEventListeners();
    loadDashboardData();
    initializeCharts();
    updateUI();
}

// Load state from localStorage
function loadState() {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
        dashboardState.currentLanguage = savedLanguage;
        document.getElementById('languageSelect').value = savedLanguage;
    }
    
    const savedDateRange = localStorage.getItem('dashboardDateRange');
    if (savedDateRange) {
        dashboardState.dateRange = parseInt(savedDateRange);
        document.getElementById('dateRange').value = savedDateRange;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Date range change
    document.getElementById('dateRange')?.addEventListener('change', handleDateRangeChange);
    
    // Chart period buttons
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', handleChartPeriodChange);
    });
    
    // Refresh insights
    document.getElementById('refreshInsights')?.addEventListener('click', refreshInsights);
    
    // Language change
    document.getElementById('languageSelect')?.addEventListener('change', handleLanguageChange);
}

// Handle date range change
function handleDateRangeChange(e) {
    dashboardState.dateRange = parseInt(e.target.value);
    localStorage.setItem('dashboardDateRange', dashboardState.dateRange);
    loadDashboardData();
}

// Handle chart period change
function handleChartPeriodChange(e) {
    const period = e.target.dataset.period;
    
    // Update active button
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Update chart data
    updateChartData(period);
}

// Handle language change
function handleLanguageChange() {
    const newLanguage = document.getElementById('languageSelect').value;
    dashboardState.currentLanguage = newLanguage;
    
    document.documentElement.lang = newLanguage;
    document.documentElement.dir = newLanguage === 'fa' ? 'rtl' : 'ltr';
    
    localStorage.setItem('language', newLanguage);
    updateUI();
}

// Load dashboard data
function loadDashboardData() {
    // Simulate loading
    setLoading(true);
    
    setTimeout(() => {
        updateStats();
        updateInsights();
        updateActivity();
        updateMetrics();
        setLoading(false);
    }, 1000);
}

// Update statistics
function updateStats() {
    const stats = generateStats();
    
    document.getElementById('totalChats').textContent = stats.totalChats.toLocaleString();
    document.getElementById('avgRating').textContent = stats.avgRating.toFixed(1);
    document.getElementById('totalTokens').textContent = stats.totalTokens;
    document.getElementById('activeDays').textContent = stats.activeDays;
    
    // Update change indicators
    updateChangeIndicators(stats);
}

// Generate mock stats
function generateStats() {
    const baseStats = {
        totalChats: 1247,
        avgRating: 4.8,
        totalTokens: '15.2K',
        activeDays: 28
    };
    
    // Add some variation based on date range
    const multiplier = dashboardState.dateRange / 30;
    
    return {
        totalChats: Math.floor(baseStats.totalChats * multiplier),
        avgRating: baseStats.avgRating + (Math.random() - 0.5) * 0.4,
        totalTokens: Math.floor(15.2 * multiplier) + 'K',
        activeDays: Math.min(30, Math.floor(baseStats.activeDays * multiplier))
    };
}

// Update change indicators
function updateChangeIndicators(stats) {
    const changes = document.querySelectorAll('.stat-change');
    changes.forEach((change, index) => {
        const isPositive = Math.random() > 0.3;
        const value = (Math.random() * 20 + 5).toFixed(1);
        
        change.className = `stat-change ${isPositive ? 'positive' : 'negative'}`;
        change.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="${isPositive ? '18,15 12,9 6,15' : '6,9 12,15 18,9'}"/>
            </svg>
            ${isPositive ? '+' : '-'}${value}%
        `;
    });
}

// Initialize charts
function initializeCharts() {
    initializeChatActivityChart();
    initializeTopicsChart();
}

// Initialize chat activity chart
function initializeChatActivityChart() {
    const ctx = document.getElementById('chatActivityChart');
    if (!ctx) return;
    
    const data = generateChatActivityData('month');
    
    dashboardState.charts.chatActivity = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'تعداد چت‌ها',
                data: data.values,
                borderColor: 'hsl(275 100% 41.4%)',
                backgroundColor: 'hsl(275 100% 41.4% / 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'hsl(var(--border))'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Initialize topics chart
function initializeTopicsChart() {
    const ctx = document.getElementById('topicsChart');
    if (!ctx) return;
    
    const data = generateTopicsData();
    
    dashboardState.charts.topics = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: [
                    'hsl(275 100% 41.4%)',
                    'hsl(142 76% 36%)',
                    'hsl(38 92% 50%)',
                    'hsl(199 89% 48%)',
                    'hsl(0 84% 60%)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                }
            }
        }
    });
}

// Generate chat activity data
function generateChatActivityData(period) {
    const periods = {
        week: { days: 7, labels: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'] },
        month: { days: 30, labels: Array.from({length: 30}, (_, i) => i + 1) },
        year: { days: 12, labels: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'] }
    };
    
    const config = periods[period];
    const values = Array.from({length: config.days}, () => Math.floor(Math.random() * 50 + 20));
    
    return {
        labels: config.labels,
        values: values
    };
}

// Generate topics data
function generateTopicsData() {
    return {
        labels: ['برنامه‌نویسی', 'ریاضی', 'زبان‌های خارجی', 'علوم', 'سایر'],
        values: [35, 25, 20, 15, 5]
    };
}

// Update chart data
function updateChartData(period) {
    if (dashboardState.charts.chatActivity) {
        const data = generateChatActivityData(period);
        dashboardState.charts.chatActivity.data.labels = data.labels;
        dashboardState.charts.chatActivity.data.datasets[0].data = data.values;
        dashboardState.charts.chatActivity.update();
    }
}

// Update insights
function updateInsights() {
    const insights = generateInsights();
    const insightsList = document.getElementById('insightsList');
    
    if (!insightsList) return;
    
    insightsList.innerHTML = insights.map(insight => `
        <div class="insight-item ${insight.type}">
            <div class="insight-icon">
                ${insight.icon}
            </div>
            <div class="insight-content">
                <div class="insight-title">${insight.title}</div>
                <div class="insight-description">${insight.description}</div>
            </div>
        </div>
    `).join('');
}

// Generate insights
function generateInsights() {
    const insights = [
        {
            type: 'positive',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
            title: 'بهبود عملکرد',
            description: 'سرعت پاسخ‌دهی شما 15% بهبود یافته است'
        },
        {
            type: 'info',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
            title: 'پیشنهاد امنیتی',
            description: 'فعال‌سازی احراز هویت دو مرحله‌ای توصیه می‌شود'
        },
        {
            type: 'warning',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            title: 'هشدار مصرف',
            description: 'مصرف توکن شما 20% بیشتر از ماه گذشته است'
        }
    ];
    
    // Randomly shuffle insights
    return insights.sort(() => Math.random() - 0.5);
}

// Update activity timeline
function updateActivity() {
    const activities = generateActivities();
    const timeline = document.getElementById('activityTimeline');
    
    if (!timeline) return;
    
    timeline.innerHTML = activities.map(activity => `
        <div class="timeline-item">
            <div class="timeline-marker ${activity.type}"></div>
            <div class="timeline-content">
                <div class="timeline-title">${activity.title}</div>
                <div class="timeline-time">${activity.time}</div>
                <div class="timeline-details">${activity.details}</div>
            </div>
        </div>
    `).join('');
}

// Generate activities
function generateActivities() {
    return [
        {
            type: 'chat',
            title: 'چت جدید با موضوع "برنامه‌نویسی"',
            time: '2 ساعت پیش',
            details: '45 پیام تبادل شده'
        },
        {
            type: 'rating',
            title: 'امتیازدهی به چت',
            time: '4 ساعت پیش',
            details: 'امتیاز: 5 ستاره'
        },
        {
            type: 'settings',
            title: 'تغییر تنظیمات پروفایل',
            time: '1 روز پیش',
            details: 'به‌روزرسانی اطلاعات شخصی'
        },
        {
            type: 'export',
            title: 'خروجی گرفتن از چت',
            time: '2 روز پیش',
            details: 'فایل PDF دانلود شد'
        }
    ];
}

// Update metrics
function updateMetrics() {
    const metrics = generateMetrics();
    
    // Update progress bars
    document.querySelectorAll('.metric-item').forEach((item, index) => {
        const progressBar = item.querySelector('.progress-bar');
        const value = metrics[index].value;
        
        if (progressBar) {
            progressBar.style.width = `${value}%`;
        }
    });
}

// Generate metrics
function generateMetrics() {
    return [
        { label: 'میانگین طول چت', value: 75 },
        { label: 'زمان پاسخ‌دهی', value: 90 },
        { label: 'رضایت کاربر', value: 96 },
        { label: 'نرخ تکمیل چت', value: 89 }
    ];
}

// Refresh insights
function refreshInsights() {
    const refreshBtn = document.getElementById('refreshInsights');
    if (refreshBtn) {
        refreshBtn.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            refreshBtn.style.transform = 'rotate(0deg)';
        }, 500);
    }
    
    updateInsights();
    showNotification('بینش‌ها به‌روزرسانی شد', 'success');
}

// Set loading state
function setLoading(loading) {
    dashboardState.isLoading = loading;
    
    const elements = document.querySelectorAll('.chart-container, .insights-list, .activity-timeline');
    elements.forEach(element => {
        if (loading) {
            element.classList.add('loading');
        } else {
            element.classList.remove('loading');
        }
    });
}

// Update UI
function updateUI() {
    // Update page title
    const title = dashboardState.currentLanguage === 'fa' ? 'داشبورد' : 'Dashboard';
    document.title = title + ' - PIMXCHAT';
    
    // Update chart labels if needed
    if (dashboardState.charts.chatActivity) {
        const data = generateChatActivityData('month');
        dashboardState.charts.chatActivity.data.labels = data.labels;
        dashboardState.charts.chatActivity.update();
    }
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
    initDashboard();
});