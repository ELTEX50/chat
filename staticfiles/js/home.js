
// Home Page JavaScript

// Global state
const homeState = {
    currentLanguage: 'fa',
    isMenuOpen: false,
    scrollPosition: 0,
    particles: [],
    animationFrame: null
};

// Initialize home page
function initHome() {
    loadState();
    setupEventListeners();
    setupAnimations();
    setupParticles();
    updateUI();
}

// Load state from localStorage
function loadState() {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
        homeState.currentLanguage = savedLanguage;
        document.getElementById('languageSelect').value = savedLanguage;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Language change
    document.getElementById('languageSelect')?.addEventListener('change', handleLanguageChange);

    // Scroll effects
    window.addEventListener('scroll', handleScroll);

    // Mobile menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    if (navToggle) {
        navToggle.addEventListener('click', toggleMenu);
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-menu') && !e.target.closest('.nav-toggle')) {
            closeMenu();
        }
    });

    // Enhanced hover effects for feature cards
    setupFeatureCardAnimations();
    
    // Parallax effects
    setupParallaxEffects();
}

// Setup feature card animations
function setupFeatureCardAnimations() {
    // Remove JavaScript animations to let CSS handle them
    // CSS animations are more performant and smoother
}

// Setup parallax effects
function setupParallaxEffects() {
    const heroSection = document.querySelector('.hero-section');
    const logoGlow = document.querySelector('.logo-glow');
    
    if (heroSection && logoGlow) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            logoGlow.style.transform = `translateY(${rate}px) scale(${1 + scrolled * 0.0001})`;
        });
    }
}

// Setup particles
function setupParticles() {
    const particleBg = document.getElementById('particleBg');
    if (!particleBg) return;
    
    // Create particles
    for (let i = 0; i < 50; i++) {
        createParticle(particleBg);
    }
    
    // Start animation
    animateParticles();
}

// Create particle
function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random position
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    
    // Random size
    const size = Math.random() * 3 + 1;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    
    // Random color
    const colors = ['#8b5cf6', '#3b82f6', '#ec4899', '#06b6d4', '#10b981'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    
    // Random animation delay
    particle.style.animationDelay = Math.random() * 6 + 's';
    
    container.appendChild(particle);
    homeState.particles.push(particle);
}

// Animate particles
function animateParticles() {
    homeState.particles.forEach(particle => {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        
        particle.style.transform = `translate(${x}px, ${y}px)`;
    });
    
    homeState.animationFrame = requestAnimationFrame(animateParticles);
}

// Handle language change
function handleLanguageChange() {
    const newLanguage = document.getElementById('languageSelect').value;
    homeState.currentLanguage = newLanguage;
    
    document.documentElement.lang = newLanguage;
    document.documentElement.dir = newLanguage === 'fa' ? 'rtl' : 'ltr';
    
    localStorage.setItem('language', newLanguage);
    updateUI();
}

// Handle scroll
function handleScroll() {
    homeState.scrollPosition = window.scrollY;
    
    // Navbar background effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (homeState.scrollPosition > 100) {
            navbar.style.backgroundColor = 'hsl(var(--background) / 0.98)';
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.backgroundColor = 'hsl(var(--background) / 0.95)';
            navbar.style.boxShadow = 'none';
        }
    }
    
    // Animate elements on scroll
    animateOnScroll();
    
    // Parallax effects
    updateParallax();
}

// Update parallax effects
function updateParallax() {
    const scrolled = window.pageYOffset;
    // Remove parallax effect from stat items to prevent floating
    // const elements = document.querySelectorAll('.stat-item');
    
    // elements.forEach((element, index) => {
    //     const speed = 0.5 + (index * 0.1);
    //     const yPos = -(scrolled * speed);
    //     element.style.transform = `translateY(${yPos}px)`;
    // });
}

// Setup animations
function setupAnimations() {
    // Animate hero stats
    animateStats();
    
    // Let CSS handle feature card animations
    // CSS animations are more performant and smoother
    
    // Animate CTA buttons
    animateCTAButtons();
}

// Animate CTA buttons
function animateCTAButtons() {
    const ctaButtons = document.querySelectorAll('.cta-button');
    
    ctaButtons.forEach((button, index) => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
            this.style.boxShadow = '0 10px 25px rgba(139, 92, 246, 0.4)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        });
    });
}

// Animate stats with enhanced effects
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stat = entry.target;
                const dataTarget = stat.getAttribute('data-target');
                
                // Only animate if data-target attribute exists
                if (dataTarget !== null) {
                    const target = parseInt(dataTarget);
                    if (!isNaN(target)) {
                        const suffix = stat.textContent.replace(/[\d]/g, '');
                        animateNumber(stat, 0, target, 2000, suffix);
                    }
                }
                observer.unobserve(stat);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => observer.observe(stat));
}

// Enhanced number animation
function animateNumber(element, start, end, duration, suffix) {
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (end - start) * easeOutQuart(progress));
        element.textContent = current.toLocaleString() + suffix;
        
        // Add glow effect during animation
        element.style.filter = `drop-shadow(0 0 10px rgba(139, 92, 246, ${0.5 + progress * 0.5}))`;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            element.style.filter = 'drop-shadow(0 0 5px rgba(139, 92, 246, 0.3))';
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Easing function
function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
}

// Animate elements on scroll with enhanced effects
function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('animated');
            
            // Add bounce effect
            element.style.animation = 'bounceIn 0.6s ease-out';
        }
    });
}

// Toggle mobile menu with enhanced animation
function toggleMenu() {
    homeState.isMenuOpen = !homeState.isMenuOpen;
    const navMenu = document.querySelector('.nav-menu');
    const navToggle = document.querySelector('.nav-toggle');
    
    if (homeState.isMenuOpen) {
        navMenu.classList.add('open');
        navToggle.classList.add('active');
        navMenu.style.animation = 'slideInDown 0.3s ease-out';
    } else {
        navMenu.classList.remove('open');
        navToggle.classList.remove('active');
        navMenu.style.animation = 'slideOutUp 0.3s ease-out';
    }
}

// Close mobile menu
function closeMenu() {
    homeState.isMenuOpen = false;
    const navMenu = document.querySelector('.nav-menu');
    const navToggle = document.querySelector('.nav-toggle');
    
    navMenu.classList.remove('open');
    navToggle.classList.remove('active');
}

// Enhanced demo function
function playDemo() {
    showNotification('در حال بارگذاری دمو...', 'info');
    
    // Add loading animation
    const demoButton = document.querySelector('.demo-button');
    if (demoButton) {
        demoButton.classList.add('loading');
    }
    
    // Simulate demo loading
    setTimeout(() => {
        showNotification('دمو در دسترس است', 'success');
        if (demoButton) {
            demoButton.classList.remove('loading');
        }
    }, 2000);
}

// Update UI with enhanced effects
function updateUI() {
    // Update page title
    const title = homeState.currentLanguage === 'fa' ? 'PIMXCHAT - هوش مصنوعی هوشمند' : 'PIMXCHAT - Smart AI Chat';
    document.title = title;
    
    // Update content based on language
    updateContent();
    
    // Add smooth transitions
    document.body.style.transition = 'all 0.3s ease';
}

// Update content based on language
function updateContent() {
    const content = getContentByLanguage(homeState.currentLanguage);
    
    // Update hero content with fade effect
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        heroTitle.style.opacity = '0';
        setTimeout(() => {
            heroTitle.innerHTML = content.hero.title;
            heroTitle.style.opacity = '1';
        }, 300);
    }
    
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        heroSubtitle.style.opacity = '0';
        setTimeout(() => {
            heroSubtitle.textContent = content.hero.subtitle;
            heroSubtitle.style.opacity = '1';
        }, 600);
    }
    
    // Update features with staggered animation
    const featureCards = document.querySelectorAll('.feature-card h3');
    featureCards.forEach((card, index) => {
        if (content.features[index]) {
            setTimeout(() => {
                card.style.opacity = '0';
                setTimeout(() => {
                    card.textContent = content.features[index].title;
                    card.style.opacity = '1';
                }, 150);
            }, index * 100);
        }
    });
    
    const featureDescriptions = document.querySelectorAll('.feature-card p');
    featureDescriptions.forEach((desc, index) => {
        if (content.features[index]) {
            setTimeout(() => {
                desc.style.opacity = '0';
                setTimeout(() => {
                    desc.textContent = content.features[index].description;
                    desc.style.opacity = '1';
                }, 150);
            }, index * 100 + 50);
        }
    });
}

// Get content by language
function getContentByLanguage(lang) {
    const content = {
        fa: {
            hero: {
                title: 'هوش مصنوعی هوشمند <span class="gradient-text">برای گفتگو</span>',
                subtitle: 'PIMXCHAT یک دستیار هوش مصنوعی پیشرفته است که به شما کمک می‌کند تا به راحتی و به صورت طبیعی با هوش مصنوعی گفتگو کنید'
            },
            features: [
                {
                    title: 'هوش مصنوعی پیشرفته',
                    description: 'با استفاده از آخرین تکنولوژی‌های هوش مصنوعی، پاسخ‌های دقیق و مفید دریافت کنید'
                },
                {
                    title: 'چت چندزبانه',
                    description: 'پشتیبانی از زبان‌های مختلف شامل فارسی، انگلیسی، عربی و بسیاری زبان‌های دیگر'
                },
                {
                    title: 'امنیت بالا',
                    description: 'تمام گفتگوهای شما با رمزگذاری پیشرفته محافظت می‌شود'
                }
            ]
        },
        en: {
            hero: {
                title: 'Smart AI for <span class="gradient-text">Conversation</span>',
                subtitle: 'PIMXCHAT is an advanced AI assistant that helps you chat naturally and easily with artificial intelligence'
            },
            features: [
                {
                    title: 'Advanced AI',
                    description: 'Get accurate and helpful responses using the latest artificial intelligence technologies'
                },
                {
                    title: 'Multilingual Chat',
                    description: 'Support for multiple languages including English, Persian, Arabic and many other languages'
                },
                {
                    title: 'High Security',
                    description: 'All your conversations are protected with advanced encryption'
                }
            ]
        },
        ar: {
            hero: {
                title: 'ذكاء اصطناعي ذكي <span class="gradient-text">للمحادثة</span>',
                subtitle: 'PIMXCHAT هو مساعد ذكاء اصطناعي متقدم يساعدك على الدردشة بشكل طبيعي وسهل مع الذكاء الاصطناعي'
            },
            features: [
                {
                    title: 'ذكاء اصطناعي متقدم',
                    description: 'احصل على إجابات دقيقة ومفيدة باستخدام أحدث تقنيات الذكاء الاصطناعي'
                },
                {
                    title: 'دردشة متعددة اللغات',
                    description: 'دعم للغات متعددة تشمل العربية والإنجليزية والفارسية والعديد من اللغات الأخرى'
                },
                {
                    title: 'أمان عالي',
                    description: 'جميع محادثاتك محمية بتشفير متقدم'
                }
            ]
        }
    };
    
    return content[lang] || content.fa;
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

// Add CSS animations for notifications and mobile menu
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
    
    .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    .animate-on-scroll.animated {
        opacity: 1;
        transform: translateY(0);
    }
    
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            top: 100%;
            left: 0;
            right: 0;
            background-color: hsl(var(--background));
            border-top: 1px solid hsl(var(--border));
            padding: 1rem;
            flex-direction: column;
            gap: 1rem;
            transform: translateY(-100%);
            transition: transform 0.3s ease;
        }
        
        .nav-menu.open {
            transform: translateY(0);
        }
        
        .nav-toggle {
            display: flex;
            flex-direction: column;
            gap: 4px;
            cursor: pointer;
            padding: 0.5rem;
        }
        
        .nav-toggle span {
            width: 25px;
            height: 3px;
            background-color: hsl(var(--foreground));
            transition: all 0.3s ease;
        }
        
        .nav-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .nav-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .nav-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    }
    
    @media (min-width: 769px) {
        .nav-toggle {
            display: none;
        }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initHome();
});