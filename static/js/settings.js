// Settings Page JavaScript

// Global state for settings
const settingsState = {
    currentLanguage: 'fa',
    currentTheme: 'light',
    sidebarCollapsed: false,
    settings: {
        userName: 'Alex',
        userEmail: 'alex@example.com',
        avatar: 'https://placehold.co/100x100.png',
        language: 'fa',
        theme: 'light',
        fontSize: 'medium',
        autoSave: true,
        notifications: true,
        soundEnabled: false,
        messageHistory: '30',
        dataCollection: true,
        twoFactorAuth: false
    }
};

// Language configurations for settings page
const settingsTexts = {
    fa: {
        settingsTitle: 'تنظیمات',
        accountSettings: 'حساب کاربری',
        preferences: 'ترجیحات',
        chatSettings: 'تنظیمات چت',
        privacySecurity: 'حریم خصوصی و امنیت',
        dataManagement: 'مدیریت داده‌ها',
        saveSettings: 'ذخیره تنظیمات',
        resetSettings: 'بازنشانی',
        changePassword: 'تغییر رمز عبور',
        deleteAccount: 'حذف حساب کاربری',
        exportData: 'خروجی گرفتن از داده‌ها',
        importData: 'وارد کردن داده‌ها',
        clearData: 'پاک کردن تمام داده‌ها',
        settingsSaved: 'تنظیمات با موفقیت ذخیره شد',
        settingsReset: 'تنظیمات بازنشانی شد',
        confirmDelete: 'آیا مطمئن هستید که می‌خواهید حساب کاربری خود را حذف کنید؟',
        confirmClear: 'آیا مطمئن هستید که می‌خواهید تمام داده‌ها را پاک کنید؟',
        passwordChanged: 'رمز عبور با موفقیت تغییر یافت',
        errorOccurred: 'خطایی رخ داد. لطفا دوباره تلاش کنید.'
    },
    en: {
        settingsTitle: 'Settings',
        accountSettings: 'Account Settings',
        preferences: 'Preferences',
        chatSettings: 'Chat Settings',
        privacySecurity: 'Privacy & Security',
        dataManagement: 'Data Management',
        saveSettings: 'Save Settings',
        resetSettings: 'Reset',
        changePassword: 'Change Password',
        deleteAccount: 'Delete Account',
        exportData: 'Export Data',
        importData: 'Import Data',
        clearData: 'Clear All Data',
        settingsSaved: 'Settings saved successfully',
        settingsReset: 'Settings reset successfully',
        confirmDelete: 'Are you sure you want to delete your account?',
        confirmClear: 'Are you sure you want to clear all data?',
        passwordChanged: 'Password changed successfully',
        errorOccurred: 'An error occurred. Please try again.'
    }
};

// DOM Elements
const elements = {
    sidebar: null,
    sidebarToggle: null,
    mobileSidebarToggle: null,
    themeToggle: null,
    languageSelect: null,
    languageSelectSettings: null,
    themeSelect: null,
    fontSize: null,
    userName: null,
    userEmail: null,
    avatarPreview: null,
    uploadBtn: null,
    autoSave: null,
    notifications: null,
    soundEnabled: null,
    messageHistory: null,
    dataCollection: null,
    twoFactorAuth: null,
    saveSettingsBtn: null,
    resetSettingsBtn: null,
    changePasswordBtn: null,
    deleteAccountBtn: null,
    exportDataBtn: null,
    importDataBtn: null,
    clearDataBtn: null,
    passwordModal: null,
    closePasswordModal: null,
    currentPassword: null,
    newPassword: null,
    confirmPassword: null,
    confirmPasswordChange: null,
    cancelPasswordChange: null
};

// Initialize settings page
function initSettings() {
    loadElements();
    loadSettings();
    setupEventListeners();
    updateUI();
}

// Load DOM elements
function loadElements() {
    elements.sidebar = document.getElementById('sidebar');
    elements.sidebarToggle = document.getElementById('sidebarToggle');
    elements.mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
    elements.themeToggle = document.getElementById('themeToggle');
    elements.languageSelect = document.getElementById('languageSelect');
    elements.languageSelectSettings = document.getElementById('languageSelectSettings');
    elements.themeSelect = document.getElementById('themeSelect');
    elements.fontSize = document.getElementById('fontSize');
    elements.userName = document.getElementById('userName');
    elements.userEmail = document.getElementById('userEmail');
    elements.avatarPreview = document.getElementById('avatarPreview');
    elements.uploadBtn = document.querySelector('.upload-btn');
    elements.autoSave = document.getElementById('autoSave');
    elements.notifications = document.getElementById('notifications');
    elements.soundEnabled = document.getElementById('soundEnabled');
    elements.messageHistory = document.getElementById('messageHistory');
    elements.dataCollection = document.getElementById('dataCollection');
    elements.twoFactorAuth = document.getElementById('twoFactorAuth');
    elements.saveSettingsBtn = document.getElementById('saveSettingsBtn');
    elements.resetSettingsBtn = document.getElementById('resetSettingsBtn');
    elements.changePasswordBtn = document.getElementById('changePasswordBtn');
    elements.deleteAccountBtn = document.getElementById('deleteAccountBtn');
    elements.exportDataBtn = document.getElementById('exportDataBtn');
    elements.importDataBtn = document.getElementById('importDataBtn');
    elements.clearDataBtn = document.getElementById('clearDataBtn');
    elements.passwordModal = document.getElementById('passwordModal');
    elements.closePasswordModal = document.getElementById('closePasswordModal');
    elements.currentPassword = document.getElementById('currentPassword');
    elements.newPassword = document.getElementById('newPassword');
    elements.confirmPassword = document.getElementById('confirmPassword');
    elements.confirmPasswordChange = document.getElementById('confirmPasswordChange');
    elements.cancelPasswordChange = document.getElementById('cancelPasswordChange');
}

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('pimxchat_settings');
    const savedTheme = localStorage.getItem('theme');
    const savedLanguage = localStorage.getItem('language');
    const savedSidebarCollapsed = localStorage.getItem('sidebarCollapsed');
    
    if (savedSettings) {
        settingsState.settings = { ...settingsState.settings, ...JSON.parse(savedSettings) };
    }
    
    if (savedTheme) {
        settingsState.currentTheme = savedTheme;
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
    
    if (savedLanguage) {
        settingsState.currentLanguage = savedLanguage;
        settingsState.settings.language = savedLanguage;
    }
    
    if (savedSidebarCollapsed) {
        settingsState.sidebarCollapsed = JSON.parse(savedSidebarCollapsed);
    }
    
    // Populate form fields
    populateFormFields();
}

// Populate form fields with current settings
function populateFormFields() {
    if (elements.userName) elements.userName.value = settingsState.settings.userName;
    if (elements.userEmail) elements.userEmail.value = settingsState.settings.userEmail;
    if (elements.avatarPreview) elements.avatarPreview.src = settingsState.settings.avatar;
    if (elements.languageSelect) elements.languageSelect.value = settingsState.settings.language;
    if (elements.languageSelectSettings) elements.languageSelectSettings.value = settingsState.settings.language;
    if (elements.themeSelect) elements.themeSelect.value = settingsState.settings.theme;
    if (elements.fontSize) elements.fontSize.value = settingsState.settings.fontSize;
    if (elements.autoSave) elements.autoSave.checked = settingsState.settings.autoSave;
    if (elements.notifications) elements.notifications.checked = settingsState.settings.notifications;
    if (elements.soundEnabled) elements.soundEnabled.checked = settingsState.settings.soundEnabled;
    if (elements.messageHistory) elements.messageHistory.value = settingsState.settings.messageHistory;
    if (elements.dataCollection) elements.dataCollection.checked = settingsState.settings.dataCollection;
    if (elements.twoFactorAuth) elements.twoFactorAuth.checked = settingsState.settings.twoFactorAuth;
}

// Setup event listeners
function setupEventListeners() {
    // Sidebar toggle
    elements.sidebarToggle?.addEventListener('click', toggleSidebar);
    elements.mobileSidebarToggle?.addEventListener('click', toggleMobileSidebar);
    
    // Theme toggle
    elements.themeToggle?.addEventListener('click', toggleTheme);
    
    // Language change
    elements.languageSelect?.addEventListener('change', handleLanguageChange);
    elements.languageSelectSettings?.addEventListener('change', handleLanguageChange);
    
    // Theme select
    elements.themeSelect?.addEventListener('change', handleThemeChange);
    
    // Font size change
    elements.fontSize?.addEventListener('change', handleFontSizeChange);
    
    // Avatar upload
    elements.uploadBtn?.addEventListener('click', handleAvatarUpload);
    
    // Settings actions
    elements.saveSettingsBtn?.addEventListener('click', saveSettings);
    elements.resetSettingsBtn?.addEventListener('click', resetSettings);
    elements.changePasswordBtn?.addEventListener('click', showPasswordModal);
    elements.deleteAccountBtn?.addEventListener('click', handleDeleteAccount);
    elements.exportDataBtn?.addEventListener('click', exportData);
    elements.importDataBtn?.addEventListener('click', importData);
    elements.clearDataBtn?.addEventListener('click', handleClearData);
    
    // Password modal
    elements.closePasswordModal?.addEventListener('click', hidePasswordModal);
    elements.cancelPasswordChange?.addEventListener('click', hidePasswordModal);
    elements.confirmPasswordChange?.addEventListener('click', handlePasswordChange);
    
    // Close modal on outside click
    elements.passwordModal?.addEventListener('click', (e) => {
        if (e.target === elements.passwordModal) {
            hidePasswordModal();
        }
    });
}

// Toggle sidebar
function toggleSidebar() {
    settingsState.sidebarCollapsed = !settingsState.sidebarCollapsed;
    elements.sidebar.classList.toggle('collapsed', settingsState.sidebarCollapsed);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(settingsState.sidebarCollapsed));
}

// Toggle mobile sidebar
function toggleMobileSidebar() {
    elements.sidebar.classList.toggle('open');
}

// Toggle theme
function toggleTheme() {
    settingsState.currentTheme = settingsState.currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', settingsState.currentTheme === 'dark');
    localStorage.setItem('theme', settingsState.currentTheme);
}

// Handle language change
function handleLanguageChange() {
    const newLanguage = elements.languageSelect?.value || elements.languageSelectSettings?.value;
    if (newLanguage && newLanguage !== settingsState.currentLanguage) {
        settingsState.currentLanguage = newLanguage;
        settingsState.settings.language = newLanguage;
        
        const langConfig = languages[newLanguage];
        document.documentElement.lang = newLanguage;
        document.documentElement.dir = langConfig.direction;
        
        // Update UI text
        updateSettingsTexts();
        
        localStorage.setItem('language', newLanguage);
    }
}

// Handle theme change
function handleThemeChange() {
    const newTheme = elements.themeSelect.value;
    settingsState.settings.theme = newTheme;
    
    if (newTheme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDark);
    } else {
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
    
    localStorage.setItem('theme', newTheme);
}

// Handle font size change
function handleFontSizeChange() {
    const newFontSize = elements.fontSize.value;
    settingsState.settings.fontSize = newFontSize;
    
    // Apply font size to body
    document.body.className = document.body.className.replace(/font-\w+/, '');
    document.body.classList.add(`font-${newFontSize}`);
}

// Handle avatar upload
function handleAvatarUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newAvatar = e.target.result;
                elements.avatarPreview.src = newAvatar;
                settingsState.settings.avatar = newAvatar;
            };
            reader.readAsDataURL(file);
        }
    };
    
    input.click();
}

// Save settings
async function saveSettings() {
    // Collect all settings
    const newSettings = {
        userName: elements.userName?.value || settingsState.settings.userName,
        userEmail: elements.userEmail?.value || settingsState.settings.userEmail,
        avatar: settingsState.settings.avatar,
        language: settingsState.settings.language,
        theme: settingsState.settings.theme,
        fontSize: settingsState.settings.fontSize,
        autoSave: elements.autoSave?.checked || false,
        notifications: elements.notifications?.checked || false,
        soundEnabled: elements.soundEnabled?.checked || false,
        messageHistory: elements.messageHistory?.value || '30',
        dataCollection: elements.dataCollection?.checked || false,
        twoFactorAuth: elements.twoFactorAuth?.checked || false
    };
    
    // Update state
    settingsState.settings = { ...settingsState.settings, ...newSettings };
    
    // Save to localStorage
    localStorage.setItem('pimxchat_settings', JSON.stringify(settingsState.settings));
    
    // Show success message
    showNotification(settingsTexts[settingsState.currentLanguage].settingsSaved, 'success');
    
    // Update UI
    updateUI();
}

// Reset settings
function resetSettings() {
    if (confirm(settingsTexts[settingsState.currentLanguage].confirmClear)) {
        // Reset to defaults
        settingsState.settings = {
            userName: 'Alex',
            userEmail: 'alex@example.com',
            avatar: 'https://placehold.co/100x100.png',
            language: 'fa',
            theme: 'light',
            fontSize: 'medium',
            autoSave: true,
            notifications: true,
            soundEnabled: false,
            messageHistory: '30',
            dataCollection: true,
            twoFactorAuth: false
        };
        
        // Clear localStorage
        localStorage.removeItem('pimxchat_settings');
        
        // Repopulate form
        populateFormFields();
        
        // Show success message
        showNotification(settingsTexts[settingsState.currentLanguage].settingsReset, 'success');
    }
}

// Show password modal
function showPasswordModal() {
    elements.passwordModal.classList.add('show');
    elements.currentPassword.focus();
}

// Hide password modal
function hidePasswordModal() {
    elements.passwordModal.classList.remove('show');
    elements.currentPassword.value = '';
    elements.newPassword.value = '';
    elements.confirmPassword.value = '';
}

// Handle password change
async function handlePasswordChange() {
    const currentPassword = elements.currentPassword.value;
    const newPassword = elements.newPassword.value;
    const confirmPassword = elements.confirmPassword.value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('لطفا تمام فیلدها را پر کنید', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('رمز عبور جدید و تأیید آن مطابقت ندارند', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('رمز عبور باید حداقل 6 کاراکتر باشد', 'error');
        return;
    }
    
    // Simulate password change
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        showNotification(settingsTexts[settingsState.currentLanguage].passwordChanged, 'success');
        hidePasswordModal();
    } catch (error) {
        showNotification(settingsTexts[settingsState.currentLanguage].errorOccurred, 'error');
    }
}

// Handle delete account
function handleDeleteAccount() {
    if (confirm(settingsTexts[settingsState.currentLanguage].confirmDelete)) {
        // Simulate account deletion
        showNotification('حساب کاربری شما در حال حذف شدن است...', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }
}

// Export data
function exportData() {
    const data = {
        settings: settingsState.settings,
        conversations: JSON.parse(localStorage.getItem('conversations') || '[]'),
        messages: JSON.parse(localStorage.getItem('messages') || '[]')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pimxchat-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('داده‌ها با موفقیت خروجی گرفته شد', 'success');
}

// Import data
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (data.settings) {
                        settingsState.settings = { ...settingsState.settings, ...data.settings };
                        localStorage.setItem('pimxchat_settings', JSON.stringify(settingsState.settings));
                    }
                    
                    if (data.conversations) {
                        localStorage.setItem('conversations', JSON.stringify(data.conversations));
                    }
                    
                    if (data.messages) {
                        localStorage.setItem('messages', JSON.stringify(data.messages));
                    }
                    
                    populateFormFields();
                    showNotification('داده‌ها با موفقیت وارد شد', 'success');
                } catch (error) {
                    showNotification('خطا در خواندن فایل', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
}

// Handle clear data
function handleClearData() {
    if (confirm(settingsTexts[settingsState.currentLanguage].confirmClear)) {
        localStorage.clear();
        showNotification('تمام داده‌ها پاک شد', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

// Update settings texts
function updateSettingsTexts() {
    const texts = settingsTexts[settingsState.currentLanguage];
    
    // Update page title
    document.title = `${texts.settingsTitle} - PIMXCHAT`;
    
    // Update section titles
    const sectionTitles = document.querySelectorAll('.section-title');
    if (sectionTitles.length >= 5) {
        sectionTitles[0].textContent = texts.accountSettings;
        sectionTitles[1].textContent = texts.preferences;
        sectionTitles[2].textContent = texts.chatSettings;
        sectionTitles[3].textContent = texts.privacySecurity;
        sectionTitles[4].textContent = texts.dataManagement;
    }
    
    // Update button texts
    if (elements.saveSettingsBtn) elements.saveSettingsBtn.textContent = texts.saveSettings;
    if (elements.resetSettingsBtn) elements.resetSettingsBtn.textContent = texts.resetSettings;
    if (elements.changePasswordBtn) elements.changePasswordBtn.textContent = texts.changePassword;
    if (elements.deleteAccountBtn) elements.deleteAccountBtn.textContent = texts.deleteAccount;
    if (elements.exportDataBtn) elements.exportDataBtn.textContent = texts.exportData;
    if (elements.importDataBtn) elements.importDataBtn.textContent = texts.importData;
    if (elements.clearDataBtn) elements.clearDataBtn.textContent = texts.clearData;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: var(--radius);
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = 'hsl(142 76% 36%)';
            break;
        case 'error':
            notification.style.backgroundColor = 'hsl(var(--destructive))';
            break;
        case 'warning':
            notification.style.backgroundColor = 'hsl(38 92% 50%)';
            break;
        default:
            notification.style.backgroundColor = 'hsl(var(--primary))';
    }
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Update UI
function updateUI() {
    // Update sidebar state
    elements.sidebar.classList.toggle('collapsed', settingsState.sidebarCollapsed);
    
    // Update theme
    document.documentElement.classList.toggle('dark', settingsState.currentTheme === 'dark');
    
    // Update language
    if (elements.languageSelect) elements.languageSelect.value = settingsState.currentLanguage;
    if (elements.languageSelectSettings) elements.languageSelectSettings.value = settingsState.currentLanguage;
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
    
    .font-small { font-size: 0.875rem; }
    .font-medium { font-size: 1rem; }
    .font-large { font-size: 1.125rem; }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initSettings); 