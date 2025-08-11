// About Page JavaScript

// Global state
const aboutState = {
    currentLanguage: 'fa',
    scrollPosition: 0,
    particles: [],
    animationFrame: null
};

// Initialize about page
function initAbout() {
    setupEventListeners();
    setupAnimations();
    setupParticles();
    updateUI();
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

    // Scroll effects
    window.addEventListener('scroll', handleScroll);


    
    // Parallax effects
    setupParallaxEffects();
}



// Setup parallax effects
function setupParallaxEffects() {
    const heroSection = document.querySelector('.hero-section');
    const logoGlow = document.querySelector('.logo-glow');
    
    if (heroSection && logoGlow) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            logoGlow.style.transform = `translateX(-50%) translateY(${rate}px) scale(${1 + scrolled * 0.0001})`;
        });
    }
}

// Setup particles
function setupParticles() {
    const particleBg = document.getElementById('particleBg');
    if (!particleBg) return;
    
    // Create particles
    for (let i = 0; i < 30; i++) {
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
    const colors = ['#8b5cf6', '#3b82f6', '#ec4899', '#60a5fa', '#10b981'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    
    // Random animation delay
    particle.style.animationDelay = Math.random() * 6 + 's';
    
    container.appendChild(particle);
    aboutState.particles.push(particle);
}

// Animate particles
function animateParticles() {
    aboutState.particles.forEach(particle => {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        
        particle.style.transform = `translate(${x}px, ${y}px)`;
    });
    
    aboutState.animationFrame = requestAnimationFrame(animateParticles);
}

// Handle scroll
function handleScroll() {
    aboutState.scrollPosition = window.scrollY;
    
    // Animate elements on scroll
    animateOnScroll();
}

// Animate elements on scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.mission-card, .tech-card, .founder-card, .value-item');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// Setup animations
function setupAnimations() {
    // Animate mission cards
    animateMissionCards();
    
    // Animate tech cards
    animateTechCards();
    
    // Animate founder card
    animateFounderCard();
    

}

// Animate mission cards
function animateMissionCards() {
    const missionCards = document.querySelectorAll('.mission-card');
    
    missionCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 * (index + 1));
    });
}

// Animate tech cards
function animateTechCards() {
    const techCards = document.querySelectorAll('.tech-card');
    
    techCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 300 * (index + 1));
    });
}

// Animate founder card
function animateFounderCard() {
    const founderCard = document.querySelector('.founder-card');
    if (founderCard) {
        founderCard.style.opacity = '0';
        founderCard.style.transform = 'translateY(30px)';
        founderCard.style.transition = 'all 0.8s ease';
        
        setTimeout(() => {
            founderCard.style.opacity = '1';
            founderCard.style.transform = 'translateY(0)';
        }, 500);
    }
}



// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        font-weight: 500;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Update UI
function updateUI() {
    // Add any UI updates here
    console.log('About page UI updated');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initAbout();
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (aboutState.animationFrame) {
        cancelAnimationFrame(aboutState.animationFrame);
    }
}); 