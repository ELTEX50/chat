// Rules Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initParticleBackground();
    initProhibited();
    initReportForm();
    initSmoothScrolling();
    initAnimations();
    initThemeToggle();
    initLiveChat();
    
    // Add loading states and error handling
    initLoadingStates();
});

// Particle Background
function initParticleBackground() {
    const particleBg = document.getElementById('particleBg');
    if (!particleBg) return;

    const particleCount = 50;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '2px';
        particle.style.height = '2px';
        particle.style.background = 'rgba(102, 126, 234, 0.6)';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        
        // Random position
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Random animation
        const duration = 3 + Math.random() * 4;
        const delay = Math.random() * 2;
        
        particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
        
        particleBg.appendChild(particle);
        particles.push(particle);
    }

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
            50% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
        }
    `;
    document.head.appendChild(style);
}

// Prohibited Content Toggle
function initProhibited() {
    const prohibitedItems = document.querySelectorAll('.prohibited-item');
    
    console.log('Found prohibited items:', prohibitedItems.length);
    
    prohibitedItems.forEach((item, index) => {
        const question = item.querySelector('.prohibited-question');
        const answer = item.querySelector('.prohibited-answer');
        
        console.log(`Item ${index + 1}:`, { question: !!question, answer: !!answer });
        
        if (question && answer) {
            // Ensure answer is hidden by default
            answer.style.display = 'none';
            answer.style.maxHeight = '0';
            answer.style.opacity = '0';
            
            question.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isActive = item.classList.contains('active');
                console.log(`Toggling item ${index + 1}, currently active:`, isActive);
                
                // Close all other items
                prohibitedItems.forEach((otherItem, otherIndex) => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherAnswer = otherItem.querySelector('.prohibited-answer');
                        if (otherAnswer) {
                            otherAnswer.style.display = 'none';
                            otherAnswer.style.maxHeight = '0';
                            otherAnswer.style.opacity = '0';
                        }
                        console.log(`Closing item ${otherIndex + 1}`);
                    }
                });
                
                // Toggle current item
                if (isActive) {
                    item.classList.remove('active');
                    answer.style.display = 'none';
                    answer.style.maxHeight = '0';
                    answer.style.opacity = '0';
                    console.log(`Deactivating item ${index + 1}`);
                } else {
                    item.classList.add('active');
                    answer.style.display = 'block';
                    answer.style.maxHeight = '1000px';
                    answer.style.opacity = '1';
                    console.log(`Activating item ${index + 1}`);
                }
            });
            
            // Add visual feedback
            question.style.cursor = 'pointer';
            question.addEventListener('mouseenter', () => {
                question.style.backgroundColor = 'var(--rules-bg-secondary)';
            });
            question.addEventListener('mouseleave', () => {
                if (!item.classList.contains('active')) {
                    question.style.backgroundColor = '';
                }
            });
        }
    });
}

// Report Form (Removed - No longer needed)
function initReportForm() {
    // Form functionality removed as requested
    console.log('Report form functionality removed');
}

// Smooth Scrolling
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 100;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Animations
function initAnimations() {
    const animatedElements = document.querySelectorAll('.rule-card, .guideline-item, .prohibited-item, .quick-nav-card, .technical-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
}

// Theme Toggle
function initThemeToggle() {
    const themeButtons = document.querySelectorAll('[onclick*="setTheme"]');
    
    themeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const theme = this.getAttribute('onclick').match(/setTheme\('([^']+)'\)/)[1];
            setTheme(theme);
        });
    });
}

// Live Chat
function initLiveChat() {
    const chatToggle = document.createElement('div');
    chatToggle.className = 'live-chat-toggle';
    chatToggle.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span>پشتیبانی زنده</span>
    `;
    
    chatToggle.style.cssText = `
        position: fixed;
        bottom: 2rem;
        left: 2rem;
        background: var(--rules-primary-gradient);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--rules-radius-lg);
        cursor: pointer;
        box-shadow: var(--rules-shadow-lg);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        transition: all var(--rules-transition-normal);
    `;
    
    chatToggle.addEventListener('click', () => {
        showNotification('در حال اتصال به پشتیبانی...', 'info');
    });
    
    chatToggle.addEventListener('mouseenter', () => {
        chatToggle.style.transform = 'translateY(-2px)';
        chatToggle.style.boxShadow = 'var(--rules-shadow-xl)';
    });
    
    chatToggle.addEventListener('mouseleave', () => {
        chatToggle.style.transform = 'translateY(0)';
        chatToggle.style.boxShadow = 'var(--rules-shadow-lg)';
    });
    
    document.body.appendChild(chatToggle);
}

// Loading States
function initLoadingStates() {
    // Add loading states to all interactive elements
    const interactiveElements = document.querySelectorAll('button, a, .quick-nav-card');
    
    interactiveElements.forEach(element => {
        element.addEventListener('click', function() {
            if (this.classList.contains('loading')) return;
            
            this.classList.add('loading');
            this.style.pointerEvents = 'none';
            
            setTimeout(() => {
                this.classList.remove('loading');
                this.style.pointerEvents = 'auto';
            }, 1000);
        });
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: var(--rules-bg-primary);
        border: 1px solid var(--rules-border-color);
        border-radius: var(--rules-radius-lg);
        padding: 1rem 1.5rem;
        box-shadow: var(--rules-shadow-lg);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Utility Functions
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// Initialize theme on load
const savedTheme = localStorage.getItem('theme') || 'system';
setTheme(savedTheme);

// Export for global access
window.RulesPage = {
    showNotification,
    setTheme,
    initProhibited,
    initReportForm
}; 