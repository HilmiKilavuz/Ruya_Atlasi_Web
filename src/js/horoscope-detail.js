// Horoscope Data
const horoscopeData = {
    koc: {
        title: 'Koç',
        icon: 'fa-fire',
        dateRange: '21 Mart - 19 Nisan',
        characteristics: ['Lider', 'Enerjik', 'Cesur', 'Dinamik', 'Maceracı'],
        compatibility: ['Aslan', 'Yay', 'İkizler'],
        dailyForecast: 'Bugün enerjiniz yüksek ve motivasyonunuz tam. Yeni başlangıçlar için ideal bir gün. Finansal konularda dikkatli olmalısınız. Spor ve fiziksel aktiviteler için uygun bir zaman.'
    },
    boga: {
        title: 'Boğa',
        icon: 'fa-leaf',
        dateRange: '20 Nisan - 20 Mayıs',
        characteristics: ['Kararlı', 'Güvenilir', 'Sabırlı', 'Pratik', 'Sadık'],
        compatibility: ['Başak', 'Oğlak', 'Yengeç'],
        dailyForecast: 'Maddi konularda şanslı bir gündesiniz. Sevdiklerinizle vakit geçirmek size iyi gelecek. İş hayatınızda olumlu gelişmeler var. Konfor ve lüks arayışınız artabilir.'
    },
    ikizler: {
        title: 'İkizler',
        icon: 'fa-wind',
        dateRange: '21 Mayıs - 21 Haziran',
        characteristics: ['İletişimci', 'Meraklı', 'Uyumlu', 'Zeki', 'Sosyal'],
        compatibility: ['Terazi', 'Kova', 'Koç'],
        dailyForecast: 'İletişim konusunda başarılı olacağınız bir gün. Yeni fikirleriniz ilgi görecek. Sosyal ilişkileriniz güçlenecek. Öğrenme ve keşfetme arzunuz artacak.'
    },
    yengec: {
        title: 'Yengeç',
        icon: 'fa-water',
        dateRange: '22 Haziran - 22 Temmuz',
        characteristics: ['Duygusal', 'Koruyucu', 'Sezgisel', 'Şefkatli', 'Ev sever'],
        compatibility: ['Akrep', 'Balık', 'Boğa'],
        dailyForecast: 'Duygusal konularda hassas olacağınız bir gün. Ailenizle ilgili güzel haberler alabilirsiniz. İç sesinizi dinleyin. Ev ve aile konuları ön planda olacak.'
    },
    aslan: {
        title: 'Aslan',
        icon: 'fa-sun',
        dateRange: '23 Temmuz - 22 Ağustos',
        characteristics: ['Yaratıcı', 'Cömert', 'Lider', 'Kendine güvenen', 'Karizmatik'],
        compatibility: ['Koç', 'Yay', 'Terazi'],
        dailyForecast: 'Liderlik özellikleriniz ön plana çıkacak. Yaratıcı projeleriniz için destek bulacaksınız. Aşk hayatınızda hareketlilik var. Kendinizi gösterme fırsatları doğacak.'
    },
    basak: {
        title: 'Başak',
        icon: 'fa-seedling',
        dateRange: '23 Ağustos - 22 Eylül',
        characteristics: ['Analitik', 'Çalışkan', 'Detaycı', 'Mükemmeliyetçi', 'Yardımsever'],
        compatibility: ['Boğa', 'Oğlak', 'Yengeç'],
        dailyForecast: 'Detaylara olan dikkatiniz işinizde avantaj sağlayacak. Sağlık konularına özen göstermelisiniz. Yeni bir hobi edinebilirsiniz. İş hayatınızda düzen ön planda.'
    },
    terazi: {
        title: 'Terazi',
        icon: 'fa-balance-scale',
        dateRange: '23 Eylül - 22 Ekim',
        characteristics: ['Diplomatik', 'Adil', 'Uyumlu', 'Estetik', 'Barışçıl'],
        compatibility: ['İkizler', 'Kova', 'Aslan'],
        dailyForecast: 'İlişkilerinizde denge kurmak önem kazanacak. Sanatsal aktiviteler size ilham verecek. Kariyerinizde yeni fırsatlar doğabilir. Sosyal çevreniz genişleyecek.'
    },
    akrep: {
        title: 'Akrep',
        icon: 'fa-bolt',
        dateRange: '23 Ekim - 21 Kasım',
        characteristics: ['Tutkulu', 'Kararlı', 'Güçlü', 'Sezgisel', 'Derin'],
        compatibility: ['Yengeç', 'Balık', 'Oğlak'],
        dailyForecast: 'Sezgileriniz güçlü olacak. Gizli kalmış konular aydınlanabilir. Finansal konularda şanslı bir dönemdesiniz. Dönüşüm zamanı.'
    },
    yay: {
        title: 'Yay',
        icon: 'fa-arrow-alt-circle-up',
        dateRange: '22 Kasım - 21 Aralık',
        characteristics: ['Maceracı', 'Optimist', 'Özgür', 'Felsefi', 'Dürüst'],
        compatibility: ['Koç', 'Aslan', 'İkizler'],
        dailyForecast: 'Macera arayışınız artacak. Yeni öğrenme fırsatları doğacak. Uzak yerlerden güzel haberler alabilirsiniz. Yolculuklar gündeme gelebilir.'
    },
    oglak: {
        title: 'Oğlak',
        icon: 'fa-mountain',
        dateRange: '22 Aralık - 19 Ocak',
        characteristics: ['Disiplinli', 'Hırslı', 'Sorumlu', 'Pratik', 'Sabırlı'],
        compatibility: ['Boğa', 'Başak', 'Akrep'],
        dailyForecast: 'Kariyer hedeflerinize odaklanacaksınız. Disiplininiz takdir toplayacak. Uzun vadeli planlarınız şekillenecek. İş hayatında yükseliş var.'
    },
    kova: {
        title: 'Kova',
        icon: 'fa-stream',
        dateRange: '20 Ocak - 18 Şubat',
        characteristics: ['Yenilikçi', 'Özgün', 'İnsancıl', 'Bağımsız', 'Arkadaş canlısı'],
        compatibility: ['İkizler', 'Terazi', 'Yay'],
        dailyForecast: 'Yenilikçi fikirleriniz dikkat çekecek. Sosyal çevreniz genişleyebilir. Teknolojik konularda şanslısınız. Grup çalışmaları öne çıkacak.'
    },
    balik: {
        title: 'Balık',
        icon: 'fa-fish',
        dateRange: '19 Şubat - 20 Mart',
        characteristics: ['Sezgisel', 'Sanatsal', 'Şefkatli', 'Romantik', 'Hayalperest'],
        compatibility: ['Yengeç', 'Akrep', 'Boğa'],
        dailyForecast: 'Sanatsal yetenekleriniz ön plana çıkacak. Rüyalarınız size yol gösterebilir. Manevi konularda derinleşeceksiniz. İlham dolu bir gün.'
    }
};

// Get sign from URL
const getSignFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('sign');
};

// Update page content
const updatePageContent = (sign) => {
    const data = horoscopeData[sign];
    if (!data) {
        window.location.href = 'horoscope.html';
        return;
    }

    // Update icon
    const iconElement = document.querySelector('.zodiac-icon-large');
    iconElement.innerHTML = `<i class="fas ${data.icon}" aria-hidden="true"></i>`;

    // Update title
    const titleElement = document.querySelector('.zodiac-title');
    titleElement.textContent = data.title;

    // Update date range
    const dateRangeElement = document.querySelector('.date-range');
    dateRangeElement.textContent = data.dateRange;

    // Update forecast
    const forecastElement = document.querySelector('.forecast-text');
    forecastElement.textContent = data.dailyForecast;

    // Update compatibility
    const compatibilityGrid = document.querySelector('.compatibility-grid');
    compatibilityGrid.innerHTML = data.compatibility.map(sign => `
        <div class="compatibility-item">
            <i class="fas fa-heart" aria-hidden="true"></i>
            <span>${sign}</span>
        </div>
    `).join('');

    // Update characteristics
    const characteristicsGrid = document.querySelector('.characteristics-grid');
    characteristicsGrid.innerHTML = data.characteristics.map(trait => `
        <div class="characteristic-item">
            <i class="fas fa-star" aria-hidden="true"></i>
            <span>${trait}</span>
        </div>
    `).join('');

    // Add animation delays to sections
    document.querySelectorAll('.horoscope-content section').forEach((section, index) => {
        section.style.setProperty('--section-index', index);
    });
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    const sign = getSignFromUrl();
    if (sign) {
        updatePageContent(sign);
    } else {
        window.location.href = 'horoscope.html';
    }
}); 