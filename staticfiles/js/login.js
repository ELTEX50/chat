// Login Page JavaScript

// Global state
const authState = {
    currentForm: 'login',
    isLoading: false,
    currentLanguage: 'fa'
};

// Language configurations
const authTexts = {
    fa: {
        login: {
            title: 'خوش آمدید',
            subtitle: 'برای ادامه وارد حساب کاربری خود شوید',
            email: 'ایمیل',
            password: 'رمز عبور',
            emailPlaceholder: 'ایمیل خود را وارد کنید',
            passwordPlaceholder: 'رمز عبور خود را وارد کنید',
            rememberMe: 'مرا به خاطر بسپار',
            forgotPassword: 'فراموشی رمز عبور؟',
            loginBtn: 'ورود',
            noAccount: 'حساب کاربری ندارید؟',
            signupLink: 'ثبت‌نام کنید',
            orLoginWith: 'یا ورود با'
        },
        register: {
            title: 'ثبت‌نام',
            subtitle: 'حساب کاربری جدید ایجاد کنید',
            fullName: 'نام کامل',
            email: 'ایمیل',
            password: 'رمز عبور',
            confirmPassword: 'تأیید رمز عبور',
            fullNamePlaceholder: 'نام کامل خود را وارد کنید',
            emailPlaceholder: 'ایمیل خود را وارد کنید',
            passwordPlaceholder: 'رمز عبور قوی انتخاب کنید',
            confirmPasswordPlaceholder: 'رمز عبور را تکرار کنید',
            agreeTerms: 'با شرایط استفاده و حریم خصوصی موافقم',
            newsletter: 'می‌خواهم از اخبار و به‌روزرسانی‌ها مطلع شوم',
            registerBtn: 'ثبت‌نام',
            hasAccount: 'قبلاً حساب کاربری دارید؟',
            loginLink: 'ورود کنید',
            orSignupWith: 'یا ثبت‌نام با'
        },
        passwordStrength: {
            weak: 'ضعیف',
            fair: 'متوسط',
            good: 'خوب',
            strong: 'قوی'
        },
        errors: {
            required: 'این فیلد الزامی است',
            invalidEmail: 'ایمیل معتبر نیست',
            passwordMismatch: 'رمز عبور و تأیید آن مطابقت ندارند',
            passwordTooShort: 'رمز عبور باید حداقل 6 کاراکتر باشد',
            termsRequired: 'باید با شرایط استفاده موافقت کنید'
        },
        success: {
            loginSuccess: 'ورود موفقیت‌آمیز بود',
            registerSuccess: 'ثبت‌نام موفقیت‌آمیز بود',
            resetLinkSent: 'لینک بازنشانی رمز عبور ارسال شد'
        }
    },
    en: {
        login: {
            title: 'Welcome Back',
            subtitle: 'Sign in to your account to continue',
            email: 'Email',
            password: 'Password',
            emailPlaceholder: 'Enter your email',
            passwordPlaceholder: 'Enter your password',
            rememberMe: 'Remember me',
            forgotPassword: 'Forgot password?',
            loginBtn: 'Sign In',
            noAccount: "Don't have an account?",
            signupLink: 'Sign up',
            orLoginWith: 'Or sign in with'
        },
        register: {
            title: 'Sign Up',
            subtitle: 'Create a new account',
            fullName: 'Full Name',
            email: 'Email',
            password: 'Password',
            confirmPassword: 'Confirm Password',
            fullNamePlaceholder: 'Enter your full name',
            emailPlaceholder: 'Enter your email',
            passwordPlaceholder: 'Choose a strong password',
            confirmPasswordPlaceholder: 'Repeat your password',
            agreeTerms: 'I agree to the Terms of Service and Privacy Policy',
            newsletter: 'I want to receive news and updates',
            registerBtn: 'Sign Up',
            hasAccount: 'Already have an account?',
            loginLink: 'Sign in',
            orSignupWith: 'Or sign up with'
        },
        passwordStrength: {
            weak: 'Weak',
            fair: 'Fair',
            good: 'Good',
            strong: 'Strong'
        },
        errors: {
            required: 'This field is required',
            invalidEmail: 'Invalid email address',
            passwordMismatch: 'Passwords do not match',
            passwordTooShort: 'Password must be at least 6 characters',
            termsRequired: 'You must agree to the terms'
        },
        success: {
            loginSuccess: 'Login successful',
            registerSuccess: 'Registration successful',
            resetLinkSent: 'Password reset link sent'
        }
    }
};

// DOM Elements
const elements = {
    loginForm: null,
    registerForm: null,
    loginFormElement: null,
    registerFormElement: null,
    loginEmail: null,
    loginPassword: null,
    loginPasswordToggle: null,
    registerName: null,
    registerEmail: null,
    registerPassword: null,
    registerPasswordToggle: null,
    confirmPassword: null,
    confirmPasswordToggle: null,
    passwordStrength: null,
    strengthFill: null,
    strengthText: null,
    rememberMe: null,
    agreeTerms: null,
    newsletter: null,
    loginBtn: null,
    registerBtn: null,
    forgotPasswordLink: null,
    forgotPasswordModal: null,
    closeForgotModal: null,
    forgotEmail: null,
    sendResetLink: null,
    cancelForgot: null,
    termsModal: null,
    closeTermsModal: null,
    acceptTerms: null,
    languageSelect: null,
    switchFormLinks: null
};

// Initialize login page
function initLogin() {
    loadElements();
    loadState();
    setupEventListeners();
    updateUI();
}

// Load DOM elements
function loadElements() {
    elements.loginForm = document.getElementById('loginForm');
    elements.registerForm = document.getElementById('registerForm');
    elements.loginFormElement = document.getElementById('loginFormElement');
    elements.registerFormElement = document.getElementById('registerFormElement');
    elements.loginEmail = document.getElementById('loginEmail');
    elements.loginPassword = document.getElementById('loginPassword');
    elements.loginPasswordToggle = document.getElementById('loginPasswordToggle');
    elements.registerName = document.getElementById('registerName');
    elements.registerEmail = document.getElementById('registerEmail');
    elements.registerPassword = document.getElementById('registerPassword');
    elements.registerPasswordToggle = document.getElementById('registerPasswordToggle');
    elements.confirmPassword = document.getElementById('confirmPassword');
    elements.confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    elements.passwordStrength = document.getElementById('passwordStrength');
    elements.strengthFill = document.getElementById('strengthFill');
    elements.strengthText = document.getElementById('strengthText');
    elements.rememberMe = document.getElementById('rememberMe');
    elements.agreeTerms = document.getElementById('agreeTerms');
    elements.newsletter = document.getElementById('newsletter');
    elements.loginBtn = document.getElementById('loginBtn');
    elements.registerBtn = document.getElementById('registerBtn');
    elements.forgotPasswordLink = document.getElementById('forgotPasswordLink');
    elements.forgotPasswordModal = document.getElementById('forgotPasswordModal');
    elements.closeForgotModal = document.getElementById('closeForgotModal');
    elements.forgotEmail = document.getElementById('forgotEmail');
    elements.sendResetLink = document.getElementById('sendResetLink');
    elements.cancelForgot = document.getElementById('cancelForgot');
    elements.termsModal = document.getElementById('termsModal');
    elements.closeTermsModal = document.getElementById('closeTermsModal');
    elements.acceptTerms = document.getElementById('acceptTerms');
    elements.languageSelect = document.getElementById('languageSelect');
    elements.switchFormLinks = document.querySelectorAll('.switch-form');
}

// Load state from localStorage
function loadState() {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
        authState.currentLanguage = savedLanguage;
        elements.languageSelect.value = savedLanguage;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Form submissions
    elements.loginFormElement?.addEventListener('submit', handleLogin);
    elements.registerFormElement?.addEventListener('submit', handleRegister);
    
    // Password toggles
    elements.loginPasswordToggle?.addEventListener('click', () => togglePassword('loginPassword'));
    elements.registerPasswordToggle?.addEventListener('click', () => togglePassword('registerPassword'));
    elements.confirmPasswordToggle?.addEventListener('click', () => togglePassword('confirmPassword'));
    
    // Password strength
    elements.registerPassword?.addEventListener('input', checkPasswordStrength);
    elements.confirmPassword?.addEventListener('input', checkPasswordMatch);
    
    // Form switching
    elements.switchFormLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const form = e.target.dataset.form;
            switchForm(form);
        });
    });
    
    // Forgot password
    elements.forgotPasswordLink?.addEventListener('click', (e) => {
        e.preventDefault();
        showForgotPasswordModal();
    });
    
    elements.closeForgotModal?.addEventListener('click', hideForgotPasswordModal);
    elements.cancelForgot?.addEventListener('click', hideForgotPasswordModal);
    elements.sendResetLink?.addEventListener('click', handleForgotPassword);
    
    // Terms modal
    document.querySelectorAll('.terms-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showTermsModal();
        });
    });
    
    elements.closeTermsModal?.addEventListener('click', hideTermsModal);
    elements.acceptTerms?.addEventListener('click', hideTermsModal);
    
    // Language change
    elements.languageSelect?.addEventListener('change', handleLanguageChange);
    
    // Modal outside click
    elements.forgotPasswordModal?.addEventListener('click', (e) => {
        if (e.target === elements.forgotPasswordModal) {
            hideForgotPasswordModal();
        }
    });
    
    elements.termsModal?.addEventListener('click', (e) => {
        if (e.target === elements.termsModal) {
            hideTermsModal();
        }
    });
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    if (authState.isLoading) return;
    
    const email = elements.loginEmail.value.trim();
    const password = elements.loginPassword.value;
    const rememberMe = elements.rememberMe.checked;
    
    // Validation
    if (!validateEmail(email)) {
        showError(elements.loginEmail, authTexts[authState.currentLanguage].errors.invalidEmail);
        return;
    }
    
    if (!password) {
        showError(elements.loginPassword, authTexts[authState.currentLanguage].errors.required);
        return;
    }
    
    // Start loading
    setLoading(true);
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Store user data
        const userData = {
            id: '1',
            name: 'Alex',
            email: email,
            avatar: 'https://placehold.co/100x100.png',
            rememberMe: rememberMe
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        
        // Show success message
        showNotification(authTexts[authState.currentLanguage].success.loginSuccess, 'success');
        
        // Redirect to main app
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        showNotification('خطا در ورود. لطفا دوباره تلاش کنید.', 'error');
    } finally {
        setLoading(false);
    }
}

// Handle register
async function handleRegister(e) {
    e.preventDefault();
    
    if (authState.isLoading) return;
    
    const name = elements.registerName.value.trim();
    const email = elements.registerEmail.value.trim();
    const password = elements.registerPassword.value;
    const confirmPassword = elements.confirmPassword.value;
    const agreeTerms = elements.agreeTerms.checked;
    const newsletter = elements.newsletter.checked;
    
    // Validation
    if (!name) {
        showError(elements.registerName, authTexts[authState.currentLanguage].errors.required);
        return;
    }
    
    if (!validateEmail(email)) {
        showError(elements.registerEmail, authTexts[authState.currentLanguage].errors.invalidEmail);
        return;
    }
    
    if (password.length < 6) {
        showError(elements.registerPassword, authTexts[authState.currentLanguage].errors.passwordTooShort);
        return;
    }
    
    if (password !== confirmPassword) {
        showError(elements.confirmPassword, authTexts[authState.currentLanguage].errors.passwordMismatch);
        return;
    }
    
    if (!agreeTerms) {
        showError(elements.agreeTerms, authTexts[authState.currentLanguage].errors.termsRequired);
        return;
    }
    
    // Start loading
    setLoading(true);
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Store user data
        const userData = {
            id: '1',
            name: name,
            email: email,
            avatar: 'https://placehold.co/100x100.png',
            newsletter: newsletter
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        
        // Show success message
        showNotification(authTexts[authState.currentLanguage].success.registerSuccess, 'success');
        
        // Redirect to main app
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        showNotification('خطا در ثبت‌نام. لطفا دوباره تلاش کنید.', 'error');
    } finally {
        setLoading(false);
    }
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(inputId + 'Toggle');
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
        `;
    } else {
        input.type = 'password';
        toggle.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `;
    }
}

// Check password strength
function checkPasswordStrength() {
    const password = elements.registerPassword.value;
    const strengthFill = elements.strengthFill;
    const strengthText = elements.strengthText;
    
    if (!password) {
        elements.passwordStrength.style.display = 'none';
        return;
    }
    
    elements.passwordStrength.style.display = 'flex';
    
    let strength = 0;
    let text = '';
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // Set strength level
    if (strength <= 2) {
        strengthFill.className = 'strength-fill weak';
        text = authTexts[authState.currentLanguage].passwordStrength.weak;
    } else if (strength <= 4) {
        strengthFill.className = 'strength-fill fair';
        text = authTexts[authState.currentLanguage].passwordStrength.fair;
    } else if (strength <= 6) {
        strengthFill.className = 'strength-fill good';
        text = authTexts[authState.currentLanguage].passwordStrength.good;
    } else {
        strengthFill.className = 'strength-fill strong';
        text = authTexts[authState.currentLanguage].passwordStrength.strong;
    }
    
    strengthText.textContent = text;
}

// Check password match
function checkPasswordMatch() {
    const password = elements.registerPassword.value;
    const confirmPassword = elements.confirmPassword.value;
    
    if (confirmPassword && password !== confirmPassword) {
        showError(elements.confirmPassword, authTexts[authState.currentLanguage].errors.passwordMismatch);
    } else {
        clearError(elements.confirmPassword);
    }
}

// Switch between forms
function switchForm(form) {
    authState.currentForm = form;
    
    if (form === 'login') {
        elements.loginForm.style.display = 'block';
        elements.registerForm.style.display = 'none';
    } else {
        elements.loginForm.style.display = 'none';
        elements.registerForm.style.display = 'block';
    }
    
    updateUI();
}

// Show forgot password modal
function showForgotPasswordModal() {
    elements.forgotPasswordModal.classList.add('show');
    elements.forgotEmail.focus();
}

// Hide forgot password modal
function hideForgotPasswordModal() {
    elements.forgotPasswordModal.classList.remove('show');
    elements.forgotEmail.value = '';
}

// Handle forgot password
async function handleForgotPassword() {
    const email = elements.forgotEmail.value.trim();
    
    if (!validateEmail(email)) {
        showNotification(authTexts[authState.currentLanguage].errors.invalidEmail, 'error');
        return;
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    showNotification(authTexts[authState.currentLanguage].success.resetLinkSent, 'success');
    hideForgotPasswordModal();
}

// Show terms modal
function showTermsModal() {
    elements.termsModal.classList.add('show');
}

// Hide terms modal
function hideTermsModal() {
    elements.termsModal.classList.remove('show');
}

// Handle language change
function handleLanguageChange() {
    const newLanguage = elements.languageSelect.value;
    authState.currentLanguage = newLanguage;
    
    const langConfig = languages[newLanguage];
    document.documentElement.lang = newLanguage;
    document.documentElement.dir = langConfig.direction;
    
    localStorage.setItem('language', newLanguage);
    updateUI();
}

// Set loading state
function setLoading(loading) {
    authState.isLoading = loading;
    
    const btn = authState.currentForm === 'login' ? elements.loginBtn : elements.registerBtn;
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');
    
    if (loading) {
        btn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
    } else {
        btn.disabled = false;
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
    }
}

// Validate email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show error
function showError(element, message) {
    const wrapper = element.closest('.input-wrapper') || element.closest('.checkbox-label');
    wrapper.classList.add('error');
    
    // Remove existing error message
    const existingError = wrapper.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    wrapper.appendChild(errorDiv);
}

// Clear error
function clearError(element) {
    const wrapper = element.closest('.input-wrapper') || element.closest('.checkbox-label');
    wrapper.classList.remove('error');
    
    const errorMessage = wrapper.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
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
    // Update form texts based on language
    updateFormTexts();
}

// Update form texts
function updateFormTexts() {
    const texts = authTexts[authState.currentLanguage];
    
    // Update login form
    if (elements.loginForm) {
        const loginHeader = elements.loginForm.querySelector('.form-header h2');
        const loginSubtitle = elements.loginForm.querySelector('.form-header p');
        const loginBtn = elements.loginForm.querySelector('.btn-text');
        const noAccount = elements.loginForm.querySelector('.form-footer p');
        const orLoginWith = elements.loginForm.querySelector('.divider');
        
        if (loginHeader) loginHeader.textContent = texts.login.title;
        if (loginSubtitle) loginSubtitle.textContent = texts.login.subtitle;
        if (loginBtn) loginBtn.textContent = texts.login.loginBtn;
        if (noAccount) noAccount.innerHTML = `${texts.login.noAccount} <a href="#" class="switch-form" data-form="register">${texts.login.signupLink}</a>`;
        if (orLoginWith) orLoginWith.textContent = texts.login.orLoginWith;
    }
    
    // Update register form
    if (elements.registerForm) {
        const registerHeader = elements.registerForm.querySelector('.form-header h2');
        const registerSubtitle = elements.registerForm.querySelector('.form-header p');
        const registerBtn = elements.registerForm.querySelector('.btn-text');
        const hasAccount = elements.registerForm.querySelector('.form-footer p');
        const orSignupWith = elements.registerForm.querySelector('.divider');
        
        if (registerHeader) registerHeader.textContent = texts.register.title;
        if (registerSubtitle) registerSubtitle.textContent = texts.register.subtitle;
        if (registerBtn) registerBtn.textContent = texts.register.registerBtn;
        if (hasAccount) hasAccount.innerHTML = `${texts.register.hasAccount} <a href="#" class="switch-form" data-form="login">${texts.register.loginLink}</a>`;
        if (orSignupWith) orSignupWith.textContent = texts.register.orSignupWith;
    }
    
    // Update placeholders
    if (elements.loginEmail) elements.loginEmail.placeholder = texts.login.emailPlaceholder;
    if (elements.loginPassword) elements.loginPassword.placeholder = texts.login.passwordPlaceholder;
    if (elements.registerName) elements.registerName.placeholder = texts.register.fullNamePlaceholder;
    if (elements.registerEmail) elements.registerEmail.placeholder = texts.register.emailPlaceholder;
    if (elements.registerPassword) elements.registerPassword.placeholder = texts.register.passwordPlaceholder;
    if (elements.confirmPassword) elements.confirmPassword.placeholder = texts.register.confirmPasswordPlaceholder;
    
    // Update labels
    const labels = document.querySelectorAll('label');
    labels.forEach(label => {
        const forAttr = label.getAttribute('for');
        if (forAttr === 'loginEmail') label.textContent = texts.login.email;
        if (forAttr === 'loginPassword') label.textContent = texts.login.password;
        if (forAttr === 'registerName') label.textContent = texts.register.fullName;
        if (forAttr === 'registerEmail') label.textContent = texts.register.email;
        if (forAttr === 'registerPassword') label.textContent = texts.register.password;
        if (forAttr === 'confirmPassword') label.textContent = texts.register.confirmPassword;
    });
    
    // Update checkboxes
    if (elements.rememberMe) {
        const rememberMeLabel = elements.rememberMe.nextElementSibling.nextSibling;
        if (rememberMeLabel) rememberMeLabel.textContent = texts.login.rememberMe;
    }
    
    if (elements.agreeTerms) {
        const agreeTermsLabel = elements.agreeTerms.nextElementSibling.nextSibling;
        if (agreeTermsLabel) {
            agreeTermsLabel.innerHTML = texts.register.agreeTerms.replace('شرایط استفاده', '<a href="#" class="terms-link">شرایط استفاده</a>').replace('حریم خصوصی', '<a href="#" class="terms-link">حریم خصوصی</a>');
        }
    }
    
    if (elements.newsletter) {
        const newsletterLabel = elements.newsletter.nextElementSibling.nextSibling;
        if (newsletterLabel) newsletterLabel.textContent = texts.register.newsletter;
    }
    
    // Update forgot password link
    if (elements.forgotPasswordLink) {
        elements.forgotPasswordLink.textContent = texts.login.forgotPassword;
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

// Check if user is already logged in
function checkAuthStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        window.location.href = 'index.html';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    initLogin();
}); 