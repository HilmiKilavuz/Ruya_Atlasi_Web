// DOM Elements
const dreamSearchInput = document.getElementById('dreamSearchInput');
const horoscopeSearchInput = document.getElementById('horoscopeSearchInput');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('nav');

// Mobile Menu Toggle
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        nav.classList.toggle('active');
        mobileMenuBtn.setAttribute('aria-expanded', 
            mobileMenuBtn.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
        );
    });
}

// Sample Dream Data
const dreams = [
    { symbol: 'Uçmak', meaning: 'Özgürlük ve bağımsızlık arzusu' },
    { symbol: 'Su', meaning: 'Duygusal durum ve bilinçaltı akışı' },
    { symbol: 'Ağaç', meaning: 'Kişisel gelişim ve büyüme' },
    { symbol: 'Ev', meaning: 'Güvenlik ve aile yaşamı' },
    { symbol: 'Yılan', meaning: 'Değişim ve dönüşüm' }
];

// Sample Horoscope Data
const horoscopes = [
    { sign: 'Koç', element: 'Ateş', dailyForecast: 'Enerjiniz yüksek ve motivasyonunuz tam.' },
    { sign: 'Boğa', element: 'Toprak', dailyForecast: 'Finansal konularda dikkatli olun.' },
    { sign: 'İkizler', element: 'Hava', dailyForecast: 'İletişim kanallarınız açık.' },
    { sign: 'Yengeç', element: 'Su', dailyForecast: 'Duygusal konulara odaklanın.' }
];

// Search Functionality
function handleSearch(searchInput, data, type) {
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm.length < 2) {
        showNotification('Lütfen en az 2 karakter girin', 'info');
        return;
    }

    let results;
    if (type === 'dream') {
        results = dreams.filter(dream => 
            dream.symbol.toLowerCase().includes(searchTerm) ||
            dream.meaning.toLowerCase().includes(searchTerm)
        );
    } else {
        results = horoscopes.filter(horoscope => 
            horoscope.sign.toLowerCase().includes(searchTerm) ||
            horoscope.element.toLowerCase().includes(searchTerm)
        );
    }

    if (results.length === 0) {
        showNotification(`${type === 'dream' ? 'Rüya' : 'Burç'} bulunamadı`, 'error');
    } else {
        showResults(results, type);
    }
}

// Event Listeners for Search
if (dreamSearchInput) {
    dreamSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch(dreamSearchInput, dreams, 'dream');
        }
    });
}

if (horoscopeSearchInput) {
    horoscopeSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch(horoscopeSearchInput, horoscopes, 'horoscope');
        }
    });
}

// Show Results
function showResults(results, type) {
    const container = type === 'dream' ? 
        document.querySelector('#dream-section .interpretations') :
        document.querySelector('#horoscope-section .interpretations');

    if (!container) return;

    container.innerHTML = results.map(item => `
        <div class="interpretation-card fade-in">
            <h3>${type === 'dream' ? item.symbol : item.sign}</h3>
            <p>${type === 'dream' ? item.meaning : item.dailyForecast}</p>
        </div>
    `).join('');
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Lazy Loading Images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img.lazy').forEach(img => {
        imageObserver.observe(img);
    });
}

// Reduced Motion Check
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function handleReducedMotion() {
    if (prefersReducedMotion.matches) {
        document.documentElement.style.setProperty('--transition-speed', '0s');
    } else {
        document.documentElement.style.setProperty('--transition-speed', '0.3s');
    }
}

handleReducedMotion();
prefersReducedMotion.addListener(handleReducedMotion); 