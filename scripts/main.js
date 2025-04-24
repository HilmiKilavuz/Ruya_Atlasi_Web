document.addEventListener('DOMContentLoaded', () => {
    // Yıldız arka planı oluşturma
    createStarryBackground();

    // Modal işlevselliği
    const loginBtn = document.querySelector('.login-btn');
    const registerBtn = document.querySelector('.register-btn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const closeBtns = document.querySelectorAll('.close-btn');
    const authForms = document.querySelectorAll('.auth-form');

    // Modal açma fonksiyonları
    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    registerBtn.addEventListener('click', () => {
        registerModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    // Modal kapatma fonksiyonları
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    });

    // Modal dışına tıklandığında kapatma
    window.addEventListener('click', (e) => {
        if (e.target === loginModal || e.target === registerModal) {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Form gönderme işlemleri
    authForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (e.target.id === 'registerForm') {
                const formData = {
                    fullName: e.target.querySelector('input[type="text"]').value,
                    email: e.target.querySelector('input[type="email"]').value,
                    birthDate: e.target.querySelector('input[type="date"]').value,
                    password: e.target.querySelectorAll('input[type="password"]')[0].value,
                    passwordConfirm: e.target.querySelectorAll('input[type="password"]')[1].value
                };

                // Şifre kontrolü
                if (formData.password !== formData.passwordConfirm) {
                    alert('Şifreler eşleşmiyor!');
                    return;
                }

                // Burç hesaplama
                const zodiacSign = calculateZodiacSign(formData.birthDate);
                formData.zodiacSign = zodiacSign;

                console.log('Kayıt Bilgileri:', formData);
                // Burada API'ye gönderme işlemi yapılacak
            } else {
                const formData = {
                    email: e.target.querySelector('input[type="email"]').value,
                    password: e.target.querySelector('input[type="password"]').value
                };
                console.log('Giriş Bilgileri:', formData);
                // Burada API'ye gönderme işlemi yapılacak
            }

            // Modal kapatma
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    });
});

// Burç hesaplama fonksiyonu
function calculateZodiacSign(birthDate) {
    const date = new Date(birthDate);
    const day = date.getDate();
    const month = date.getMonth() + 1; // JavaScript'te aylar 0'dan başlar

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Koç";
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Boğa";
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "İkizler";
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Yengeç";
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Aslan";
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Başak";
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Terazi";
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Akrep";
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Yay";
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Oğlak";
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Kova";
    return "Balık"; // Geriye kalan tarihler (19 Şubat - 20 Mart)
}

// Yıldız arka planı oluşturma fonksiyonu
function createStarryBackground() {
    const container = document.querySelector('.container');
    if (!container) return; // Ana sayfada değilse çıkış yap
    
    // 50 yıldız oluştur
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Rastgele pozisyon
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        
        // Rastgele boyut (1-3px)
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Rastgele animasyon süresi (3-7s)
        star.style.animationDuration = `${Math.random() * 4 + 3}s`;
        
        container.appendChild(star);
    }
}

// CSS için yıldız animasyonu stil ekle
const style = document.createElement('style');
style.textContent = `
    .star {
        position: absolute;
        background-color: var(--accent-gold);
        border-radius: 50%;
        opacity: 0;
        animation: twinkle linear infinite;
        pointer-events: none;
    }

    @keyframes twinkle {
        0%, 100% { opacity: 0; transform: scale(0.5); }
        50% { opacity: 0.8; transform: scale(1); }
    }
`;
document.head.appendChild(style); 