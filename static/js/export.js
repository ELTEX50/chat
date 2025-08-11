// Export/Import JavaScript

// Global state
const exportState = {
    currentLanguage: 'fa',
    importHistory: [],
    backupSettings: {
        frequency: 'weekly',
        retention: '30',
        autoBackup: true,
        encryptBackup: true
    },
    isUploading: false,
    uploadProgress: 0
};

// Initialize export page
function initExport() {
    loadState();
    setupEventListeners();
    loadImportHistory();
    updateUI();
}

// Load state from localStorage
function loadState() {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
        exportState.currentLanguage = savedLanguage;
        document.getElementById('languageSelect').value = savedLanguage;
    }
    
    const savedSettings = localStorage.getItem('backupSettings');
    if (savedSettings) {
        exportState.backupSettings = { ...exportState.backupSettings, ...JSON.parse(savedSettings) };
    }
    
    const savedHistory = localStorage.getItem('importHistory');
    if (savedHistory) {
        exportState.importHistory = JSON.parse(savedHistory);
    }
}

// Setup event listeners
function setupEventListeners() {
    // File input
    document.getElementById('fileInput')?.addEventListener('change', handleFileSelect);
    
    // Drop zone
    const dropZone = document.getElementById('dropZone');
    if (dropZone) {
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleDrop);
        dropZone.addEventListener('click', () => document.getElementById('fileInput').click());
    }
    
    // Language change
    document.getElementById('languageSelect')?.addEventListener('change', handleLanguageChange);
    
    // Modal outside click
    document.getElementById('importPreviewModal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('importPreviewModal')) {
            hideImportPreview();
        }
    });
    
    document.getElementById('backupSettingsModal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('backupSettingsModal')) {
            hideBackupSettings();
        }
    });
}

// Handle language change
function handleLanguageChange() {
    const newLanguage = document.getElementById('languageSelect').value;
    exportState.currentLanguage = newLanguage;
    
    document.documentElement.lang = newLanguage;
    document.documentElement.dir = newLanguage === 'fa' ? 'rtl' : 'ltr';
    
    localStorage.setItem('language', newLanguage);
    updateUI();
}

// Update UI
function updateUI() {
    // Update page title
    const title = exportState.currentLanguage === 'fa' ? 'خروجی و ورودی' : 'Export/Import';
    document.title = title + ' - PIMXCHAT';
}

// Export functions
function exportAllChats() {
    showNotification('در حال آماده‌سازی خروجی چت‌ها...', 'info');
    
    // Simulate export process
    setTimeout(() => {
        const chatData = generateMockChatData();
        downloadFile(chatData, 'pimxchat-chats.json', 'application/json');
        showNotification('خروجی چت‌ها با موفقیت دانلود شد', 'success');
    }, 2000);
}

function exportSettings() {
    showNotification('در حال آماده‌سازی تنظیمات...', 'info');
    
    setTimeout(() => {
        const settings = {
            user: {
                name: 'کاربر نمونه',
                email: 'user@example.com',
                preferences: {
                    language: 'fa',
                    theme: 'light',
                    notifications: true
                }
            },
            chat: {
                autoSave: true,
                maxHistory: 100,
                defaultModel: 'gpt-4'
            },
            export: exportState.backupSettings
        };
        
        downloadFile(JSON.stringify(settings, null, 2), 'pimxchat-settings.json', 'application/json');
        showNotification('تنظیمات با موفقیت دانلود شد', 'success');
    }, 1000);
}

function exportStats() {
    showNotification('در حال آماده‌سازی گزارش آماری...', 'info');
    
    setTimeout(() => {
        const stats = generateMockStats();
        downloadFile(stats, 'pimxchat-stats.csv', 'text/csv');
        showNotification('گزارش آماری با موفقیت دانلود شد', 'success');
    }, 1500);
}

function exportFullBackup() {
    showNotification('در حال ایجاد پشتیبان کامل...', 'info');
    
    setTimeout(() => {
        const backup = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            chats: generateMockChatData(),
            settings: JSON.parse(localStorage.getItem('userSettings') || '{}'),
            stats: generateMockStats()
        };
        
        downloadFile(JSON.stringify(backup, null, 2), 'pimxchat-backup.json', 'application/json');
        showNotification('پشتیبان کامل با موفقیت دانلود شد', 'success');
    }, 3000);
}

function customExport() {
    const format = document.getElementById('exportFormat').value;
    const dateRange = document.getElementById('dateRange').value;
    
    showNotification(`در حال خروجی گرفتن با فرمت ${format}...`, 'info');
    
    setTimeout(() => {
        const data = generateCustomExportData(format, dateRange);
        const filename = `pimxchat-custom-${Date.now()}.${format}`;
        const mimeType = getMimeType(format);
        
        downloadFile(data, filename, mimeType);
        showNotification('خروجی سفارشی با موفقیت دانلود شد', 'success');
    }, 2000);
}

// Generate mock data
function generateMockChatData() {
    const chats = [];
    for (let i = 1; i <= 20; i++) {
        chats.push({
            id: i,
            title: `چت ${i}`,
            messages: [
                { role: 'user', content: 'سلام!', timestamp: new Date().toISOString() },
                { role: 'assistant', content: 'سلام! چطور می‌تونم کمکتون کنم؟', timestamp: new Date().toISOString() }
            ],
            topic: 'general',
            rating: Math.floor(Math.random() * 5) + 1
        });
    }
    return chats;
}

function generateMockStats() {
    const stats = [
        'تاریخ,تعداد چت,زمان استفاده,موضوع محبوب',
        '2024-01-01,15,120 دقیقه,برنامه‌نویسی',
        '2024-01-02,12,95 دقیقه,ریاضی',
        '2024-01-03,18,140 دقیقه,زبان‌های خارجی',
        '2024-01-04,10,80 دقیقه,علوم',
        '2024-01-05,22,180 دقیقه,برنامه‌نویسی'
    ];
    return stats.join('\n');
}

function generateCustomExportData(format, dateRange) {
    if (format === 'json') {
        return JSON.stringify(generateMockChatData(), null, 2);
    } else if (format === 'csv') {
        return generateMockStats();
    } else if (format === 'txt') {
        return generateMockChatData().map(chat => 
            `چت ${chat.id}: ${chat.title}\n${chat.messages.map(m => `${m.role}: ${m.content}`).join('\n')}\n`
        ).join('\n');
    } else {
        return JSON.stringify(generateMockChatData(), null, 2);
    }
}

function getMimeType(format) {
    const mimeTypes = {
        'json': 'application/json',
        'csv': 'text/csv',
        'txt': 'text/plain',
        'pdf': 'application/pdf'
    };
    return mimeTypes[format] || 'application/json';
}

// Download file
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import functions
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processFile(file);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function processFile(file) {
    if (exportState.isUploading) return;
    
    exportState.isUploading = true;
    exportState.uploadProgress = 0;
    
    showNotification('در حال پردازش فایل...', 'info');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const fileType = getFileType(file.name);
            
            if (fileType === 'json') {
                const data = JSON.parse(content);
                showImportPreview(data, file.name);
            } else if (fileType === 'csv') {
                const data = parseCSV(content);
                showImportPreview(data, file.name);
            } else {
                showImportPreview(content, file.name);
            }
            
            addToImportHistory(file.name, 'success');
        } catch (error) {
            showNotification('خطا در پردازش فایل', 'error');
            addToImportHistory(file.name, 'error');
        }
        
        exportState.isUploading = false;
        exportState.uploadProgress = 0;
    };
    
    reader.onerror = function() {
        showNotification('خطا در خواندن فایل', 'error');
        exportState.isUploading = false;
        exportState.uploadProgress = 0;
    };
    
    // Simulate progress
    const progressInterval = setInterval(() => {
        exportState.uploadProgress += 10;
        if (exportState.uploadProgress >= 100) {
            clearInterval(progressInterval);
        }
    }, 100);
    
    reader.readAsText(file);
}

function getFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    return extension;
}

function parseCSV(content) {
    const lines = content.split('\n');
    const headers = lines[0].split(',');
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = lines[i].split(',');
            const row = {};
            headers.forEach((header, index) => {
                row[header.trim()] = values[index]?.trim() || '';
            });
            data.push(row);
        }
    }
    
    return data;
}

function showImportPreview(data, filename) {
    const preview = document.getElementById('importPreview');
    const modal = document.getElementById('importPreviewModal');
    
    let previewContent = '';
    
    if (typeof data === 'object') {
        previewContent = `<h4>فایل: ${filename}</h4><pre>${JSON.stringify(data, null, 2)}</pre>`;
    } else {
        previewContent = `<h4>فایل: ${filename}</h4><pre>${data}</pre>`;
    }
    
    preview.innerHTML = previewContent;
    modal.classList.add('show');
}

function hideImportPreview() {
    document.getElementById('importPreviewModal').classList.remove('show');
}

function confirmImport() {
    showNotification('در حال ورودی گرفتن...', 'info');
    
    setTimeout(() => {
        showNotification('فایل با موفقیت وارد شد', 'success');
        hideImportPreview();
    }, 2000);
}

// Import history
function loadImportHistory() {
    const historyList = document.getElementById('importHistory');
    if (!historyList) return;
    
    historyList.innerHTML = exportState.importHistory.map(item => `
        <div class="history-item">
            <div class="history-info">
                <div class="history-name">${item.name}</div>
                <div class="history-date">${formatDate(item.date)}</div>
            </div>
            <span class="history-status ${item.status}">
                ${item.status === 'success' ? 'موفق' : 'ناموفق'}
            </span>
        </div>
    `).join('');
}

function addToImportHistory(filename, status) {
    const historyItem = {
        name: filename,
        date: new Date(),
        status: status
    };
    
    exportState.importHistory.unshift(historyItem);
    
    // Keep only last 10 items
    if (exportState.importHistory.length > 10) {
        exportState.importHistory = exportState.importHistory.slice(0, 10);
    }
    
    localStorage.setItem('importHistory', JSON.stringify(exportState.importHistory));
    loadImportHistory();
}

// Backup functions
function createBackup() {
    showNotification('در حال ایجاد پشتیبان خودکار...', 'info');
    
    setTimeout(() => {
        const backup = {
            timestamp: new Date().toISOString(),
            data: generateMockChatData(),
            settings: exportState.backupSettings
        };
        
        localStorage.setItem('autoBackup', JSON.stringify(backup));
        showNotification('پشتیبان خودکار ایجاد شد', 'success');
    }, 3000);
}

function showBackupSettings() {
    const modal = document.getElementById('backupSettingsModal');
    
    // Set current values
    document.getElementById('backupFrequency').value = exportState.backupSettings.frequency;
    document.getElementById('backupRetention').value = exportState.backupSettings.retention;
    document.getElementById('autoBackup').checked = exportState.backupSettings.autoBackup;
    document.getElementById('encryptBackup').checked = exportState.backupSettings.encryptBackup;
    
    modal.classList.add('show');
}

function hideBackupSettings() {
    document.getElementById('backupSettingsModal').classList.remove('show');
}

function saveBackupSettings() {
    exportState.backupSettings = {
        frequency: document.getElementById('backupFrequency').value,
        retention: document.getElementById('backupRetention').value,
        autoBackup: document.getElementById('autoBackup').checked,
        encryptBackup: document.getElementById('encryptBackup').checked
    };
    
    localStorage.setItem('backupSettings', JSON.stringify(exportState.backupSettings));
    hideBackupSettings();
    showNotification('تنظیمات پشتیبان‌گیری ذخیره شد', 'success');
}

// Utility functions
function formatDate(date) {
    const now = new Date();
    const diffTime = Math.abs(now - new Date(date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return 'دیروز';
    } else if (diffDays < 7) {
        return `${diffDays} روز پیش`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} هفته پیش`;
    } else {
        const months = Math.floor(diffDays / 30);
        return `${months} ماه پیش`;
    }
}

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
    initExport();
}); 