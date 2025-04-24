document.addEventListener('DOMContentLoaded', () => {
    // Güncel tarihi ayarla
    const currentDate = new Date();
    document.querySelector('.current-date').textContent = currentDate.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Burç bilgileri
    const zodiacSigns = [
        {
            name: 'Koç',
            date: '21 Mart - 19 Nisan',
            element: 'Ateş',
            icon: '../assets/images/aries.svg'
        },
        {
            name: 'Boğa',
            date: '20 Nisan - 20 Mayıs',
            element: 'Toprak',
            icon: '../assets/images/taurus.svg'
        },
        {
            name: 'İkizler',
            date: '21 Mayıs - 20 Haziran',
            element: 'Hava',
            icon: '../assets/images/gemini.svg'
        },
        {
            name: 'Yengeç',
            date: '21 Haziran - 22 Temmuz',
            element: 'Su',
            icon: '../assets/images/cancer.svg'
        },
        {
            name: 'Aslan',
            date: '23 Temmuz - 22 Ağustos',
            element: 'Ateş',
            icon: '../assets/images/leo.svg'
        },
        {
            name: 'Başak',
            date: '23 Ağustos - 22 Eylül',
            element: 'Toprak',
            icon: '../assets/images/virgo.svg'
        },
        {
            name: 'Terazi',
            date: '23 Eylül - 22 Ekim',
            element: 'Hava',
            icon: '../assets/images/libra.svg'
        },
        {
            name: 'Akrep',
            date: '23 Ekim - 21 Kasım',
            element: 'Su',
            icon: '../assets/images/scorpio.svg'
        },
        {
            name: 'Yay',
            date: '22 Kasım - 21 Aralık',
            element: 'Ateş',
            icon: '../assets/images/sagittarius.svg'
        },
        {
            name: 'Oğlak',
            date: '22 Aralık - 19 Ocak',
            element: 'Toprak',
            icon: '../assets/images/capricorn.svg'
        },
        {
            name: 'Kova',
            date: '20 Ocak - 18 Şubat',
            element: 'Hava',
            icon: '../assets/images/aquarius.svg'
        },
        {
            name: 'Balık',
            date: '19 Şubat - 20 Mart',
            element: 'Su',
            icon: '../assets/images/pisces.svg'
        }
    ];

    // Burç kartlarını oluştur
    const signsGrid = document.querySelector('.signs-grid');
    zodiacSigns.forEach(sign => {
        const card = document.createElement('div');
        card.className = 'sign-card';
        card.innerHTML = `
            <img src="${sign.icon}" alt="${sign.name} burcu">
            <h3>${sign.name}</h3>
            <p>${sign.date}</p>
            <p>Element: ${sign.element}</p>
        `;
        card.addEventListener('click', () => showHoroscope(sign));
        signsGrid.appendChild(card);
    });

    // Örnek burç yorumları
    const horoscopeTexts = {
        Koç: "Bugün enerjiniz yüksek ve motivasyonunuz tam. Yeni başlangıçlar için ideal bir gün.",
        Boğa: "Finansal konularda şanslı bir gündesiniz. Yatırımlarınızı gözden geçirin.",
        İkizler: "İletişim yetenekleriniz dorukta. Önemli görüşmeler için uygun bir gün.",
        Yengeç: "Ailenizle ilgili güzel gelişmeler var. Ev hayatınız hareketlenebilir.",
        Aslan: "Yaratıcılığınız yüksek, sanatsal projeler için harika bir gün.",
        Başak: "Detaylara olan dikkatiniz işinizde başarı getirecek.",
        Terazi: "İlişkilerinizde uyum ve denge hakim. Ortaklıklar için uygun bir gün.",
        Akrep: "Sezgileriniz güçlü, içgüdülerinize güvenin.",
        Yay: "Yeni öğrenme fırsatları doğabilir. Eğitim için ideal bir gün.",
        Oğlak: "Kariyerinizde ilerleme kaydedebilirsiniz. Hedeflerinize odaklanın.",
        Kova: "Sosyal çevreniz genişleyebilir. Yeni arkadaşlıklar kurabilirsiniz.",
        Balık: "Manevi yönünüz güçlü. Meditasyon ve içe dönük aktiviteler için uygun bir gün."
    };

    // Burç yorumunu göster
    function showHoroscope(sign) {
        const userSignIcon = document.getElementById('userSignIcon');
        const userSignName = document.getElementById('userSignName');
        const dailyHoroscope = document.getElementById('dailyHoroscope');

        userSignIcon.src = sign.icon;
        userSignIcon.alt = `${sign.name} burcu`;
        userSignName.textContent = sign.name;
        
        // Giriş yapılmış kullanıcı kontrolü (örnek)
        const isLoggedIn = false; // Bu değer backend'den gelecek

        if (isLoggedIn) {
            dailyHoroscope.innerHTML = `<p>${horoscopeTexts[sign.name]}</p>`;
        } else {
            dailyHoroscope.innerHTML = `
                <p class="login-message">Bu burç yorumunu görmek için lütfen giriş yapın.</p>
            `;
        }
    }
}); 