// Translation system for PIMXCHAT
const translations = {
    fa: {
        // Navigation
        nav: {
            home: "خانه",
            about: "درباره ما",
            rules: "قوانین",
            chat: "چت‌بات",
            terms: "شرایط استفاده",
            register: "ثبت نام",
            login: "ورود",
            logout: "خروج"
        },
        
        // Footer
        footer: {
            quickAccess: "دسترسی سریع",
            contactUs: "تماس با ما",
            socialMedia: "شبکه‌های اجتماعی",
            copyright: "تمام حقوق محفوظ است. ساخته شده با ❤️ توسط محمدرضا عابدین‌پور",
            support247: "پشتیبانی 24/7",
            location: "ایران، تهران"
        },
        
        // Home page
        home: {
            hero: {
                title: "هوش مصنوعی هوشمند <span class=\"gradient-text\">برای گفتگو</span>",
                subtitle: "PIMXCHAT یک دستیار هوش مصنوعی پیشرفته است که به شما کمک می‌کند تا به راحتی و به صورت طبیعی با هوش مصنوعی گفتگو کنید"
            },
            features: [
                {
                    title: "هوش مصنوعی پیشرفته",
                    description: "با استفاده از آخرین تکنولوژی‌های هوش مصنوعی، پاسخ‌های دقیق و مفید دریافت کنید"
                },
                {
                    title: "چت چندزبانه",
                    description: "پشتیبانی از زبان‌های مختلف شامل فارسی، انگلیسی، عربی و بسیاری زبان‌های دیگر"
                },
                {
                    title: "امنیت بالا",
                    description: "تمام گفتگوهای شما با رمزگذاری پیشرفته محافظت می‌شود"
                }
            ],
            stats: {
                users: "کاربران فعال",
                messages: "پیام‌های ارسال شده",
                satisfaction: "رضایت کاربران"
            }
        },
        
        // Login page
        login: {
            title: "ورود",
            subtitle: "به PIMXCHAT خوش آمدید! وارد حساب کاربری خود شوید",
            description: [
                "PIMXCHAT یک دستیار هوش مصنوعی پیشرفته است که با استفاده از آخرین تکنولوژی‌های AI ساخته شده است.",
                "با ورود به حساب کاربری، شما به تمامی ویژگی‌های منحصر به فرد ما دسترسی خواهید داشت."
            ],
            benefits: [
                {
                    title: "هوش مصنوعی پیشرفته",
                    description: "با استفاده از آخرین تکنولوژی‌های AI"
                },
                {
                    title: "امنیت بالا",
                    description: "اطلاعات شما با بالاترین استانداردهای امنیتی"
                },
                {
                    title: "گفتگوی طبیعی",
                    description: "تجربه‌ای طبیعی و روان در گفتگو"
                },
                {
                    title: "پاسخ‌های سریع",
                    description: "پاسخ‌های فوری و دقیق"
                }
            ],
            form: {
                login: "ورود",
                noAccount: "حساب ندارید؟ ثبت نام کنید"
            }
        },
        
        // Register page
        register: {
            title: "ثبت نام",
            subtitle: "حساب کاربری جدید ایجاد کنید",
            description: [
                "با ثبت نام در PIMXCHAT، به تمامی ویژگی‌های منحصر به فرد ما دسترسی خواهید داشت.",
                "شما می‌توانید از هوش مصنوعی پیشرفته ما برای گفتگو و دریافت پاسخ‌های دقیق استفاده کنید."
            ],
            benefits: [
                {
                    title: "دسترسی نامحدود",
                    description: "به تمامی ویژگی‌های پلتفرم دسترسی داشته باشید"
                },
                {
                    title: "امنیت کامل",
                    description: "اطلاعات شما با بالاترین استانداردهای امنیتی محافظت می‌شود"
                },
                {
                    title: "پشتیبانی 24/7",
                    description: "در هر زمان از شبانه‌روز از ما پشتیبانی کنید"
                },
                {
                    title: "به‌روزرسانی‌های منظم",
                    description: "از آخرین ویژگی‌ها و بهبودها بهره‌مند شوید"
                }
            ],
            form: {
                register: "ثبت نام",
                hasAccount: "قبلاً ثبت نام کرده‌اید؟ وارد شوید"
            }
        },
        
        // Rules page
        rules: {
            title: "قوانین و مقررات",
            subtitle: "راهنمای استفاده صحیح از PIMXCHAT",
            description: [
                "برای استفاده ایمن و مؤثر از PIMXCHAT، لطفاً قوانین و مقررات زیر را مطالعه کنید",
                "رعایت این قوانین به حفظ امنیت و کیفیت خدمات کمک می‌کند"
            ],
            sections: {
                generalRules: "قوانین کلی",
                usageGuidelines: "راهنمای استفاده"
            },
            stats: {
                dataSecurity: "امنیت اطلاعات",
                support: "پشتیبانی",
                qualityAssurance: "تضمین کیفیت",
                ruleViolations: "تحمل نقض قوانین"
            }
        },
        
        // Terms page
        terms: {
            title: "شرایط استفاده",
            subtitle: "قوانین و مقررات استفاده از PIMXCHAT",
            description: [
                "با استفاده از PIMXCHAT، شما موافقت می‌کنید که این شرایط استفاده را رعایت کنید.",
                "این شرایط برای حفظ امنیت و کیفیت خدمات برای همه کاربران طراحی شده است."
            ]
        },
        
        // About page
        about: {
            title: "درباره ما",
            subtitle: "شناخت بیشتر PIMXCHAT",
            description: [
                "PIMXCHAT یک پلتفرم هوش مصنوعی پیشرفته است که با هدف ارائه تجربه‌ای منحصر به فرد برای کاربران طراحی شده است.",
                "ما متعهد به ارائه خدمات با کیفیت بالا و امنیت کامل برای تمامی کاربران خود هستیم."
            ]
        }
    },
    
    en: {
        // Navigation
        nav: {
            home: "Home",
            about: "About",
            rules: "Rules",
            chat: "Chat",
            terms: "Terms",
            register: "Register",
            login: "Login",
            logout: "Logout"
        },
        
        // Footer
        footer: {
            quickAccess: "Quick Access",
            contactUs: "Contact Us",
            socialMedia: "Social Media",
            copyright: "All rights reserved. Made with ❤️ by Mohammadreza Abedini Pour",
            support247: "24/7 Support",
            location: "Tehran, Iran"
        },
        
        // Home page
        home: {
            hero: {
                title: "Smart AI for <span class=\"gradient-text\">Conversation</span>",
                subtitle: "PIMXCHAT is an advanced AI assistant that helps you chat naturally and easily with artificial intelligence"
            },
            features: [
                {
                    title: "Advanced AI",
                    description: "Get accurate and helpful responses using the latest artificial intelligence technologies"
                },
                {
                    title: "Multilingual Chat",
                    description: "Support for multiple languages including English, Persian, Arabic and many other languages"
                },
                {
                    title: "High Security",
                    description: "All your conversations are protected with advanced encryption"
                }
            ],
            stats: {
                users: "Active Users",
                messages: "Messages Sent",
                satisfaction: "User Satisfaction"
            }
        },
        
        // Login page
        login: {
            title: "Login",
            subtitle: "Welcome to PIMXCHAT! Sign in to your account",
            description: [
                "PIMXCHAT is an advanced AI assistant built with the latest AI technologies.",
                "By logging into your account, you will have access to all our unique features."
            ],
            benefits: [
                {
                    title: "Advanced AI",
                    description: "Using the latest AI technologies"
                },
                {
                    title: "High Security",
                    description: "Your information with the highest security standards"
                },
                {
                    title: "Natural Conversation",
                    description: "Natural and smooth conversation experience"
                },
                {
                    title: "Quick Responses",
                    description: "Fast and accurate responses"
                }
            ],
            form: {
                login: "Login",
                noAccount: "Don't have an account? Register"
            }
        },
        
        // Register page
        register: {
            title: "Register",
            subtitle: "Create a new account",
            description: [
                "By registering with PIMXCHAT, you will have access to all our unique features.",
                "You can use our advanced AI for conversation and receive accurate responses."
            ],
            benefits: [
                {
                    title: "Unlimited Access",
                    description: "Access to all platform features"
                },
                {
                    title: "Complete Security",
                    description: "Your information is protected with the highest security standards"
                },
                {
                    title: "24/7 Support",
                    description: "Get support from us anytime, day or night"
                },
                {
                    title: "Regular Updates",
                    description: "Benefit from the latest features and improvements"
                }
            ],
            form: {
                register: "Register",
                hasAccount: "Already have an account? Login"
            }
        },
        
        // Rules page
        rules: {
            title: "Rules and Regulations",
            subtitle: "Guide to proper use of PIMXCHAT",
            description: [
                "To safely and effectively use PIMXCHAT, please read the following rules and regulations",
                "Following these rules helps maintain security and service quality"
            ],
            sections: {
                generalRules: "General Rules",
                usageGuidelines: "Usage Guidelines"
            },
            stats: {
                dataSecurity: "Data Security",
                support: "Support",
                qualityAssurance: "Quality Assurance",
                ruleViolations: "Rule Violations Tolerance"
            }
        },
        
        // Terms page
        terms: {
            title: "Terms of Service",
            subtitle: "Rules and regulations for using PIMXCHAT",
            description: [
                "By using PIMXCHAT, you agree to follow these terms of service.",
                "These terms are designed to maintain security and service quality for all users."
            ]
        },
        
        // About page
        about: {
            title: "About Us",
            subtitle: "Learn more about PIMXCHAT",
            description: [
                "PIMXCHAT is an advanced AI platform designed to provide a unique experience for users.",
                "We are committed to providing high-quality services and complete security for all our users."
            ]
        }
    }
};

// Language management functions
window.changeLanguage = function(lang) {
    // Save language preference
    localStorage.setItem('language', lang);
    
    // Update document direction
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    // Update all translatable elements
    updatePageContent(lang);
    
    // Update navigation links
    updateNavigation(lang);
    
    // Update footer
    updateFooter(lang);
}

function updatePageContent(lang) {
    const content = translations[lang];
    if (!content) return;
    
    // Update page-specific content based on current page
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('/login')) {
        updateLoginPage(lang);
    } else if (currentPath.includes('/register')) {
        updateRegisterPage(lang);
    } else if (currentPath.includes('/rules')) {
        updateRulesPage(lang);
    } else if (currentPath.includes('/terms')) {
        updateTermsPage(lang);
    } else if (currentPath.includes('/about')) {
        updateAboutPage(lang);
    } else {
        updateHomePage(lang);
    }
}

function updateNavigation(lang) {
    const content = translations[lang];
    if (!content) return;
    
    // Update navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href.includes('home')) {
            link.textContent = content.nav.home;
        } else if (href.includes('about')) {
            link.textContent = content.nav.about;
        } else if (href.includes('rules')) {
            link.textContent = content.nav.rules;
        } else if (href.includes('chat')) {
            link.textContent = content.nav.chat;
        } else if (href.includes('terms')) {
            link.textContent = content.nav.terms;
        }
    });
    
    // Update auth buttons
    const registerBtn = document.querySelector('a[href*="register"]');
    const loginBtn = document.querySelector('a[href*="login"]');
    const logoutBtn = document.querySelector('a[href*="logout"]');
    
    if (registerBtn) registerBtn.textContent = content.nav.register;
    if (loginBtn) loginBtn.textContent = content.nav.login;
    if (logoutBtn) logoutBtn.textContent = content.nav.logout;
}

function updateFooter(lang) {
    const content = translations[lang];
    if (!content) return;
    
    // Update footer sections
    const footerSections = document.querySelectorAll('.footer-section h5');
    footerSections.forEach(section => {
        const text = section.textContent.trim();
        if (text.includes('دسترسی سریع') || text.includes('Quick Access')) {
            section.textContent = content.footer.quickAccess;
        } else if (text.includes('تماس با ما') || text.includes('Contact Us')) {
            section.textContent = content.footer.contactUs;
        } else if (text.includes('شبکه‌های اجتماعی') || text.includes('Social Media')) {
            section.textContent = content.footer.socialMedia;
        }
    });
    
    // Update footer links
    const footerLinks = document.querySelectorAll('.footer-links a');
    footerLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href.includes('home')) {
            link.textContent = content.nav.home;
        } else if (href.includes('about')) {
            link.textContent = content.nav.about;
        } else if (href.includes('rules')) {
            link.textContent = content.nav.rules;
        } else if (href.includes('chat')) {
            link.textContent = content.nav.chat;
        } else if (href.includes('terms')) {
            link.textContent = content.nav.terms;
        }
    });
    
    // Update contact info
    const contactItems = document.querySelectorAll('.contact-item span');
    contactItems.forEach(item => {
        const text = item.textContent.trim();
        if (text.includes('پشتیبانی 24/7') || text.includes('24/7 Support')) {
            item.textContent = content.footer.support247;
        } else if (text.includes('ایران، تهران') || text.includes('Tehran, Iran')) {
            item.textContent = content.footer.location;
        }
    });
    
    // Update copyright
    const copyright = document.querySelector('.footer-bottom span');
    if (copyright) {
        copyright.innerHTML = `&copy; 2024 PIMXCHAT. ${content.footer.copyright}`;
    }
}

// Page-specific update functions
function updateHomePage(lang) {
    const content = translations[lang];
    if (!content) return;
    
    // Update hero section
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    
    if (heroTitle) heroTitle.innerHTML = content.home.hero.title;
    if (heroSubtitle) heroSubtitle.textContent = content.home.hero.subtitle;
    
    // Update features
    const featureTitles = document.querySelectorAll('.feature-card h3');
    const featureDescriptions = document.querySelectorAll('.feature-card p');
    
    content.home.features.forEach((feature, index) => {
        if (featureTitles[index]) featureTitles[index].textContent = feature.title;
        if (featureDescriptions[index]) featureDescriptions[index].textContent = feature.description;
    });
    
    // Update stats labels
    const statLabels = document.querySelectorAll('.stat-label');
    if (statLabels.length >= 3) {
        statLabels[0].textContent = content.home.stats.users;
        statLabels[1].textContent = content.home.stats.messages;
        statLabels[2].textContent = content.home.stats.satisfaction;
    }
}

function updateLoginPage(lang) {
    const content = translations[lang];
    if (!content) return;
    
    // Update title and subtitle
    const title = document.querySelector('.login-title');
    const subtitle = document.querySelector('.login-subtitle');
    
    if (title) title.textContent = content.login.title;
    if (subtitle) subtitle.textContent = content.login.subtitle;
    
    // Update description
    const description = document.querySelector('.login-description');
    if (description) {
        const paragraphs = description.querySelectorAll('p');
        content.login.description.forEach((desc, index) => {
            if (paragraphs[index]) paragraphs[index].textContent = desc;
        });
    }
    
    // Update benefits
    const benefitTitles = document.querySelectorAll('.benefit-preview h4');
    const benefitDescriptions = document.querySelectorAll('.benefit-preview p');
    
    content.login.benefits.forEach((benefit, index) => {
        if (benefitTitles[index]) benefitTitles[index].textContent = benefit.title;
        if (benefitDescriptions[index]) benefitDescriptions[index].textContent = benefit.description;
    });
    
    // Update form
    const loginButton = document.querySelector('.login-button span');
    const registerLink = document.querySelector('.register-link a');
    
    if (loginButton) loginButton.textContent = content.login.form.login;
    if (registerLink) registerLink.textContent = content.login.form.noAccount;
}

function updateRegisterPage(lang) {
    const content = translations[lang];
    if (!content) return;
    
    // Update title and subtitle
    const title = document.querySelector('.register-title');
    const subtitle = document.querySelector('.register-subtitle');
    
    if (title) title.textContent = content.register.title;
    if (subtitle) subtitle.textContent = content.register.subtitle;
    
    // Update description
    const description = document.querySelector('.register-description');
    if (description) {
        const paragraphs = description.querySelectorAll('p');
        content.register.description.forEach((desc, index) => {
            if (paragraphs[index]) paragraphs[index].textContent = desc;
        });
    }
    
    // Update benefits
    const benefitTitles = document.querySelectorAll('.benefit-preview h4');
    const benefitDescriptions = document.querySelectorAll('.benefit-preview p');
    
    content.register.benefits.forEach((benefit, index) => {
        if (benefitTitles[index]) benefitTitles[index].textContent = benefit.title;
        if (benefitDescriptions[index]) benefitDescriptions[index].textContent = benefit.description;
    });
    
    // Update form
    const registerButton = document.querySelector('.register-button span');
    const loginLink = document.querySelector('.login-link a');
    
    if (registerButton) registerButton.textContent = content.register.form.register;
    if (loginLink) loginLink.textContent = content.register.form.hasAccount;
}

function updateRulesPage(lang) {
    const content = translations[lang];
    if (!content) return;
    
    // Update title and subtitle
    const title = document.querySelector('.hero-title');
    const subtitle = document.querySelector('.logo-subtitle');
    
    if (title) title.textContent = content.rules.title;
    if (subtitle) subtitle.textContent = content.rules.subtitle;
    
    // Update description
    const description = document.querySelector('.hero-description');
    if (description) {
        const paragraphs = description.querySelectorAll('p');
        content.rules.description.forEach((desc, index) => {
            if (paragraphs[index]) paragraphs[index].textContent = desc;
        });
    }
    
    // Update section titles
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        const text = title.textContent.trim();
        if (text.includes('اصول و قوانین پایه') || text.includes('Basic Principles and Rules')) {
            title.textContent = content.rules.sections.generalRules;
        } else if (text.includes('راهنمای استفاده صحیح') || text.includes('Proper Usage Guide')) {
            title.textContent = content.rules.sections.usageGuidelines;
        }
    });
    
    // Update stats labels
    const statLabels = document.querySelectorAll('.stat-label');
    if (statLabels.length >= 4) {
        statLabels[0].textContent = content.rules.stats.dataSecurity;
        statLabels[1].textContent = content.rules.stats.support;
        statLabels[2].textContent = content.rules.stats.qualityAssurance;
        statLabels[3].textContent = content.rules.stats.ruleViolations;
    }
}

function updateTermsPage(lang) {
    const content = translations[lang];
    if (!content) return;
    
    // Update title and subtitle
    const title = document.querySelector('.hero-title');
    const subtitle = document.querySelector('.logo-subtitle');
    
    if (title) title.textContent = content.terms.title;
    if (subtitle) subtitle.textContent = content.terms.subtitle;
    
    // Update description
    const description = document.querySelector('.hero-description');
    if (description) {
        const paragraphs = description.querySelectorAll('p');
        content.terms.description.forEach((desc, index) => {
            if (paragraphs[index]) paragraphs[index].textContent = desc;
        });
    }
}

function updateAboutPage(lang) {
    const content = translations[lang];
    if (!content) return;
    
    // Update title and subtitle
    const title = document.querySelector('.hero-title');
    const subtitle = document.querySelector('.logo-subtitle');
    
    if (title) title.textContent = content.about.title;
    if (subtitle) subtitle.textContent = content.about.subtitle;
    
    // Update description
    const description = document.querySelector('.hero-description');
    if (description) {
        const paragraphs = description.querySelectorAll('p');
        content.about.description.forEach((desc, index) => {
            if (paragraphs[index]) paragraphs[index].textContent = desc;
        });
    }
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedLanguage = localStorage.getItem('language') || 'fa';
    changeLanguage(savedLanguage);
}); 