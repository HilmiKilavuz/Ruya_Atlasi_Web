// Burç listesi ve temel özellikler
const HOROSCOPE_SIGNS = [
    'aries', // koç
    'taurus', // boğa
    'gemini', // ikizler
    'cancer', // yengeç
    'leo', // aslan
    'virgo', // başak
    'libra', // terazi
    'scorpio', // akrep
    'sagittarius', // yay
    'capricorn', // oğlak
    'aquarius', // kova
    'pisces' // balık
];

// Burç isimlerini API formatına çeviren yardımcı fonksiyon
const convertSignToApiFormat = (sign) => {
    // Eğer sign parametresi null veya undefined ise, hata logla ve varsayılan döndür
    if (!sign) {
        console.error('Burç bilgisi bulunamadı (null/undefined), varsayılan olarak "aries" kullanılıyor');
        return 'aries';
    }
    
    // String değilse, string'e çevir ve uyarı ver
    if (typeof sign !== 'string') {
        console.warn(`Burç bilgisi string değil, tür: ${typeof sign}. String'e çevriliyor.`);
        sign = String(sign);
    }
    
    // Boş string kontrolü
    if (sign.trim() === '') {
        console.error('Burç bilgisi boş string, varsayılan olarak "aries" kullanılıyor');
        return 'aries';
    }
    
    // Küçük harfe çevir ve trim yap
    const normalizedSign = sign.toLowerCase().trim();
    console.log('convertSignToApiFormat - Giriş değeri:', sign, 'Normalize edilmiş değer:', normalizedSign);
    
    // İngilizce burç isimleri doğrudan döndürülsün (tam eşleşme)
    if (HOROSCOPE_SIGNS.includes(normalizedSign)) {
        console.log('İngilizce burç adı bulundu (tam eşleşme):', normalizedSign);
        return normalizedSign;
    }
    
    // Türkçe burç isimleri için kapsamlı eşleştirme tablosu
    const signMap = {
        // Koç burcu varyasyonları
        'koç': 'aries',
        'koc': 'aries',
        'koc burcu': 'aries',
        'koç burcu': 'aries',
        
        // Boğa burcu varyasyonları
        'boğa': 'taurus',
        'boga': 'taurus',
        'boğa burcu': 'taurus',
        'boga burcu': 'taurus',
        
        // İkizler burcu varyasyonları
        'ikizler': 'gemini',
        'ikizler burcu': 'gemini',
        
        // Yengeç burcu varyasyonları
        'yengeç': 'cancer',
        'yengec': 'cancer',
        'yengeç burcu': 'cancer',
        'yengec burcu': 'cancer',
        
        // Aslan burcu varyasyonları
        'aslan': 'leo',
        'aslan burcu': 'leo',
        
        // Başak burcu varyasyonları
        'başak': 'virgo',
        'basak': 'virgo',
        'başak burcu': 'virgo',
        'basak burcu': 'virgo',
        
        // Terazi burcu varyasyonları
        'terazi': 'libra',
        'terazi burcu': 'libra',
        
        // Akrep burcu varyasyonları
        'akrep': 'scorpio',
        'akrep burcu': 'scorpio',
        
        // Yay burcu varyasyonları
        'yay': 'sagittarius',
        'yay burcu': 'sagittarius',
        
        // Oğlak burcu varyasyonları
        'oğlak': 'capricorn',
        'oglak': 'capricorn',
        'oğlak burcu': 'capricorn',
        'oglak burcu': 'capricorn',
        
        // Kova burcu varyasyonları
        'kova': 'aquarius',
        'kova burcu': 'aquarius',
        
        // Balık burcu varyasyonları
        'balık': 'pisces',
        'balik': 'pisces',
        'balık burcu': 'pisces',
        'balik burcu': 'pisces'
    };
    
    // Tam eşleşme kontrolü
    if (signMap[normalizedSign]) {
        console.log('Türkçe burç adı eşleşti (tam eşleşme):', normalizedSign, '->', signMap[normalizedSign]);
        return signMap[normalizedSign];
    }
    
    // Türkçe karakterleri kaldırma
    const withoutTurkishChars = normalizedSign
        .replace(/ç/g, 'c')
        .replace(/ğ/g, 'g')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ş/g, 's')
        .replace(/ü/g, 'u');
    
    console.log('Türkçe karakterler kaldırıldı:', withoutTurkishChars);
    
    // Türkçe karaktersiz tam eşleşme kontrolü
    if (signMap[withoutTurkishChars]) {
        console.log('Türkçe karaktersiz eşleşme bulundu (tam eşleşme):', withoutTurkishChars, '->', signMap[withoutTurkishChars]);
        return signMap[withoutTurkishChars];
    }
    
    // İngilizce kısmi eşleşme kontrolü
    for (const englishSign of HOROSCOPE_SIGNS) {
        if (normalizedSign.includes(englishSign) || englishSign.includes(normalizedSign)) {
            console.log('İngilizce burç adı bulundu (kısmi eşleşme):', normalizedSign, '->', englishSign);
            return englishSign;
        }
    }
    
    // Türkçe kısmi eşleşme kontrolü
    for (const [turkishName, englishName] of Object.entries(signMap)) {
        // İki yönlü kısmi eşleşme kontrolü
        if (normalizedSign.includes(turkishName) || turkishName.includes(normalizedSign)) {
            console.log('Türkçe burç adı eşleşti (kısmi eşleşme):', normalizedSign, '->', englishName);
            return englishName;
        }
        
        // Türkçe karaktersiz kısmi eşleşme kontrolü
        if (withoutTurkishChars.includes(turkishName.replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')) || 
            turkishName.replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').includes(withoutTurkishChars)) {
            console.log('Türkçe karaktersiz eşleşme bulundu (kısmi eşleşme):', withoutTurkishChars, '->', englishName);
            return englishName;
        }
    }
    
    // Özel durum: "yay" kelimesi "sagittarius" olarak çevrilmeli
    if (normalizedSign === 'yay' || normalizedSign.includes('yay') || withoutTurkishChars === 'yay' || withoutTurkishChars.includes('yay')) {
        console.log('Özel durum tespit edildi - "yay" kelimesi bulundu:', normalizedSign, '-> sagittarius');
        return 'sagittarius';
    }
    
    console.error(`Geçersiz burç adı: "${sign}". Varsayılan olarak "aries" kullanılıyor.`);
    return 'aries';
};

// Burç isimlerini Türkçe'ye çeviren yardımcı fonksiyon
const convertSignToTurkish = (sign) => {
    const signMap = {
        'aries': 'Koç',
        'taurus': 'Boğa',
        'gemini': 'İkizler',
        'cancer': 'Yengeç',
        'leo': 'Aslan',
        'virgo': 'Başak',
        'libra': 'Terazi',
        'scorpio': 'Akrep',
        'sagittarius': 'Yay',
        'capricorn': 'Oğlak',
        'aquarius': 'Kova',
        'pisces': 'Balık'
    };
    return signMap[sign.toLowerCase()] || sign;
};

// Burç özelliklerini içeren sabit veri
const ZODIAC_PROPERTIES = {
    aries: {
        element: 'Ateş',
        gezegen: 'Mars',
        nitelik: 'Öncü',
        ugurluTas: 'Elmas',
        ugurluRenk: 'Kırmızı',
        ugurluGun: 'Salı',
        motto: 'Ben öncüyüm!',
        olumluOzellikler: ['Cesur', 'Enerjik', 'Lider ruhlu', 'Dinamik'],
        olumsuzOzellikler: ['Sabırsız', 'Agresif', 'Düşünmeden hareket eden'],
        anlastigiburclar: ['Aslan', 'Yay'],
        anlasamadigiburclar: ['Yengeç', 'Terazi'],
        color: 'var(--aries-color)',
        icon: 'fa-fire',
        symbol: '♈'
    },
    taurus: {
        element: 'Toprak',
        gezegen: 'Venüs',
        nitelik: 'Sabit',
        ugurluTas: 'Zümrüt',
        ugurluRenk: 'Yeşil',
        ugurluGun: 'Cuma',
        motto: 'Ben sahip olurum!',
        olumluOzellikler: ['Kararlı', 'Güvenilir', 'Sabırlı', 'Pratik'],
        olumsuzOzellikler: ['İnatçı', 'Possesif', 'Materyalist'],
        anlastigiburclar: ['Başak', 'Oğlak'],
        anlasamadigiburclar: ['Aslan', 'Kova'],
        color: 'var(--taurus-color)',
        icon: 'fa-leaf',
        symbol: '♉'
    },
    gemini: {
        element: 'Hava',
        gezegen: 'Merkür',
        nitelik: 'Değişken',
        ugurluTas: 'Akik',
        ugurluRenk: 'Sarı',
        ugurluGun: 'Çarşamba',
        motto: 'Ben düşünürüm!',
        olumluOzellikler: ['Zeki', 'İletişimi güçlü', 'Uyumlu', 'Çok yönlü'],
        olumsuzOzellikler: ['Kararsız', 'Yüzeysel', 'Dağınık'],
        anlastigiburclar: ['Terazi', 'Kova'],
        anlasamadigiburclar: ['Başak', 'Balık'],
        color: 'var(--gemini-color)',
        icon: 'fa-wind',
        symbol: '♊'
    },
    cancer: {
        element: 'Su',
        gezegen: 'Ay',
        nitelik: 'Öncü',
        ugurluTas: 'İnci',
        ugurluRenk: 'Beyaz',
        ugurluGun: 'Pazartesi',
        motto: 'Ben hissederim!',
        olumluOzellikler: ['Şefkatli', 'Koruyucu', 'Duygusal', 'Sezgisel'],
        olumsuzOzellikler: ['Alıngan', 'Kaprisli', 'Manipülatif'],
        anlastigiburclar: ['Akrep', 'Balık'],
        anlasamadigiburclar: ['Koç', 'Terazi'],
        color: 'var(--cancer-color)',
        icon: 'fa-water',
        symbol: '♋'
    },
    leo: {
        element: 'Ateş',
        gezegen: 'Güneş',
        nitelik: 'Sabit',
        ugurluTas: 'Yakut',
        ugurluRenk: 'Altın',
        ugurluGun: 'Pazar',
        motto: 'Ben varım!',
        olumluOzellikler: ['Yaratıcı', 'Cömert', 'Sadık', 'Karizmatik'],
        olumsuzOzellikler: ['Kibirli', 'Dramatik', 'İnatçı'],
        anlastigiburclar: ['Koç', 'Yay'],
        anlasamadigiburclar: ['Boğa', 'Akrep'],
        color: 'var(--leo-color)',
        icon: 'fa-sun',
        symbol: '♌'
    },
    virgo: {
        element: 'Toprak',
        gezegen: 'Merkür',
        nitelik: 'Değişken',
        ugurluTas: 'Safir',
        ugurluRenk: 'Kahverengi',
        ugurluGun: 'Çarşamba',
        motto: 'Ben analiz ederim!',
        olumluOzellikler: ['Çalışkan', 'Analitik', 'Titiz', 'Yardımsever'],
        olumsuzOzellikler: ['Mükemmelliyetçi', 'Eleştirel', 'Endişeli'],
        anlastigiburclar: ['Boğa', 'Oğlak'],
        anlasamadigiburclar: ['İkizler', 'Balık'],
        color: 'var(--virgo-color)',
        icon: 'fa-seedling',
        symbol: '♍'
    },
    libra: {
        element: 'Hava',
        gezegen: 'Venüs',
        nitelik: 'Öncü',
        ugurluTas: 'Opal',
        ugurluRenk: 'Pembe',
        ugurluGun: 'Cuma',
        motto: 'Ben dengelerim!',
        olumluOzellikler: ['Diplomatik', 'Adil', 'Zarif', 'Barışçıl'],
        olumsuzOzellikler: ['Kararsız', 'Çatışmadan kaçan', 'Yüzeysel'],
        anlastigiburclar: ['İkizler', 'Kova'],
        anlasamadigiburclar: ['Yengeç', 'Oğlak'],
        color: 'var(--libra-color)',
        icon: 'fa-balance-scale',
        symbol: '♎'
    },
    scorpio: {
        element: 'Su',
        gezegen: 'Mars/Plüton',
        nitelik: 'Sabit',
        ugurluTas: 'Akuamarin',
        ugurluRenk: 'Bordo',
        ugurluGun: 'Salı',
        motto: 'Ben arzularım!',
        olumluOzellikler: ['Tutkulu', 'Kararlı', 'Sezgisel', 'Güçlü'],
        olumsuzOzellikler: ['Kıskanç', 'Takıntılı', 'Manipülatif'],
        anlastigiburclar: ['Yengeç', 'Balık'],
        anlasamadigiburclar: ['Aslan', 'Kova'],
        color: 'var(--scorpio-color)',
        icon: 'fa-bolt',
        symbol: '♏'
    },
    sagittarius: {
        element: 'Ateş',
        gezegen: 'Jüpiter',
        nitelik: 'Değişken',
        ugurluTas: 'Turkuaz',
        ugurluRenk: 'Mor',
        ugurluGun: 'Perşembe',
        motto: 'Ben görürüm!',
        olumluOzellikler: ['İyimser', 'Maceracı', 'Dürüst', 'Özgürlükçü'],
        olumsuzOzellikler: ['Sabırsız', 'Düşüncesiz', 'Taktisiz'],
        anlastigiburclar: ['Koç', 'Aslan'],
        anlasamadigiburclar: ['İkizler', 'Başak'],
        color: 'var(--sagittarius-color)',
        icon: 'fa-arrow-alt-circle-up',
        symbol: '♐'
    },
    capricorn: {
        element: 'Toprak',
        gezegen: 'Satürn',
        nitelik: 'Öncü',
        ugurluTas: 'Oniks',
        ugurluRenk: 'Siyah',
        ugurluGun: 'Cumartesi',
        motto: 'Ben kullanırım!',
        olumluOzellikler: ['Disiplinli', 'Sorumlu', 'Hırslı', 'Pratik'],
        olumsuzOzellikler: ['Mesafeli', 'Pesimist', 'Materyalist'],
        anlastigiburclar: ['Boğa', 'Başak'],
        anlasamadigiburclar: ['Koç', 'Terazi'],
        color: 'var(--capricorn-color)',
        icon: 'fa-mountain',
        symbol: '♑'
    },
    aquarius: {
        element: 'Hava',
        gezegen: 'Uranüs/Satürn',
        nitelik: 'Sabit',
        ugurluTas: 'Ametist',
        ugurluRenk: 'Lacivert',
        ugurluGun: 'Cumartesi',
        motto: 'Ben bilirim!',
        olumluOzellikler: ['Yenilikçi', 'İnsancıl', 'Bağımsız', 'Orijinal'],
        olumsuzOzellikler: ['İsyankar', 'Mesafeli', 'Sabit fikirli'],
        anlastigiburclar: ['İkizler', 'Terazi'],
        anlasamadigiburclar: ['Boğa', 'Akrep'],
        color: 'var(--aquarius-color)',
        icon: 'fa-tint',
        symbol: '♒'
    },
    pisces: {
        element: 'Su',
        gezegen: 'Neptün/Jüpiter',
        nitelik: 'Değişken',
        ugurluTas: 'Ay taşı',
        ugurluRenk: 'Deniz mavisi',
        ugurluGun: 'Perşembe',
        motto: 'Ben inanırım!',
        olumluOzellikler: ['Şefkatli', 'Sezgisel', 'Sanatsal', 'Fedakar'],
        olumsuzOzellikler: ['Dağınık', 'Kaçıngan', 'Kurban psikolojisi'],
        anlastigiburclar: ['Yengeç', 'Akrep'],
        anlasamadigiburclar: ['İkizler', 'Başak'],
        color: 'var(--pisces-color)',
        icon: 'fa-fish',
        symbol: '♓'
    }
};

// Yorum şablonları
const HOROSCOPE_TEMPLATES = {
    ask: [
        "Aşk hayatınızda {duygu} bir dönem sizi bekliyor. {gezegen} etkisi altında {eylem} zamanı.",
        "{burc} burcu için romantik fırsatlar kapıda. {olumluOzellik} yanınız öne çıkacak.",
        "İlişkinizde {duygu} bir döneme giriyorsunuz. {olumsuzOzellik} davranışlardan kaçının.",
        "Venüs'ün etkisiyle duygusal hayatınızda {eylem} yaşanabilir. {tavsiye}"
    ],
    kariyer: [
        "{element} burcunuzun {olumluOzellik} özellikleri iş hayatınızda öne çıkacak. {eylem}",
        "Kariyerinizde {duygu} gelişmeler var. {gezegen}'in etkisiyle {tavsiye}",
        "İş hayatınızda {eylem} zamanı. {olumluOzellik} yönlerinizi kullanın.",
        "Profesyonel yaşamınızda {duygu} bir dönem. {tavsiye}"
    ],
    saglik: [
        "Sağlık açısından {duygu} bir dönemdesiniz. {tavsiye}",
        "{element} enerjiniz yüksek. {eylem} için uygun zaman.",
        "Fiziksel ve ruhsal dengeniz için {tavsiye}. {ugurluRenk} rengi size şans getirecek.",
        "Sağlığınıza dikkat etmeniz gereken bir dönem. {eylem} önemli."
    ],
    genel: [
        "{motto} Bu hafta {duygu} enerjiler sizi sarıyor. {tavsiye}",
        "{gezegen}'in etkisiyle {eylem} zamanı. {olumluOzellik} yönleriniz öne çıkıyor.",
        "{element} burcunuzun özellikleri bu dönemde güçleniyor. {tavsiye}",
        "Şans gezegeni {gezegen} size destek veriyor. {eylem} için harekete geçin."
    ]
};

// Dinamik içerik için yardımcı listeler
const DUYGULAR = [
    'heyecan verici', 'sakin', 'tutkulu', 'dengeli', 'yoğun', 'romantik',
    'dinamik', 'huzurlu', 'enerjik', 'duygusal', 'kararlı', 'yaratıcı',
    'güçlü', 'derin', 'yenileyici', 'ilham verici', 'cesaret verici', 'umut dolu'
];

const EYLEMLER = [
    'yeni başlangıçlar yapma', 'ilerleme', 'değişim', 'gelişim', 'dönüşüm',
    'harekete geçme', 'plan yapma', 'risk alma', 'dinlenme', 'odaklanma',
    'hedeflerinize ulaşma', 'kendinizi geliştirme', 'potansiyelinizi açığa çıkarma', 
    'hayallerinizi gerçekleştirme', 'engelleri aşma', 'fırsatları değerlendirme'
];

const TAVSIYELER = [
    'Kendinize güvenin ve ileri adım atın',
    'Sabırlı olun ve doğru zamanı bekleyin',
    'İç sesinizi dinleyin ve sezgilerinize güvenin',
    'Çevrenizdekilerin fikirlerine açık olun',
    'Dengeli ve ölçülü davranın',
    'Yeni fırsatlara açık olun',
    'Rutininizi değiştirmekten korkmayın',
    'Kendinize ve sevdiklerinize zaman ayırın',
    'Sağlıklı sınırlar koymayı unutmayın',
    'Pozitif düşünceyi koruyun',
    'Zorluklara rağmen iyimserliğinizi kaybetmeyin',
    'Stres yönetimi için meditasyon yapın',
    'Hem zihinsel hem de fiziksel sağlığınıza özen gösterin',
    'İlişkilerinizde açık iletişimi tercih edin',
    'Kariyerinizde uzun vadeli planlamalar yapın'
];

// Günlük yorumlar için ek cümleler
const ADDITIONAL_DAILY_SENTENCES = [
    'Bugün enerjiniz yüksek ve motivasyonunuz tam. Bu fırsatı değerlendirin.',
    'Bugün duygusal dalgalanmalar yaşayabilirsiniz, kendinize nazik davranın.',
    'Bugün içgörünüz ve sezgileriniz özellikle güçlü, önemli kararlar için ideal bir zaman.',
    'Bugün çevrenizdeki insanlarla olan iletişiminiz çok önemli, açık ve dürüst olun.',
    'Bugün finansal konularda dikkatli olmanız gerekebilir, ani kararlar vermekten kaçının.',
    'Bugün yaratıcı fikirleriniz ön planda, sanatsal projelere yönelebilirsiniz.',
    'Bugün fiziksel aktiviteler için uygun bir gün, enerjinizi doğru kanalize edin.',
    'Bugün dinlenme ve kendinize zaman ayırma günü, ruhsal dengenizi koruyun.',
    'Bugün kariyerinizde önemli fırsatlar kapınızı çalabilir, gözlerinizi açık tutun.',
    'Bugün sosyal çevrenizle olan bağlarınızı güçlendirme zamanı, davetlere katılın.'
];

// Haftalık yorumlar için ek cümleler
const ADDITIONAL_WEEKLY_SENTENCES = [
    'Bu hafta iletişim gezegeni Merkür, sosyal çevrenizde yeni tanışmalar getirebilir.',
    'Bu hafta finansal konularda dikkatli planlar yapmanız, uzun vadede fayda sağlayacak.',
    'Aşk gezegeni Venüs bu hafta burcunuzu olumlu etkiliyor, romantik ilişkileriniz güçlenebilir.',
    'Bu hafta kariyer yolunuzda beklenmedik fırsatlar ortaya çıkabilir, hazırlıklı olun.',
    'Sağlık açısından bu hafta daha disiplinli bir rutin oluşturmanın tam zamanı.',
    'Haftanın ortasında Ay\'ın etkisiyle duygusal farkındalığınız artacak.',
    'Mars\'ın enerjisi bu hafta sizi daha hırslı kılabilir, hedeflerinize odaklanın.',
    'Bu hafta, yakın ilişkilerinizde açık iletişim kurmak özellikle önemli olacak.',
    'Jüpiter\'in etkisiyle bu hafta kendini geliştirme konusunda yeni adımlar atabilirsiniz.',
    'Haftanın sonuna doğru, Satürn\'ün etkisiyle sorumluluk duygunuz artabilir.'
];

// Aylık yorumlar için ek cümleler
const ADDITIONAL_MONTHLY_SENTENCES = [
    'Bu ay, kariyer hedefleriniz için stratejik planlar yapmanın tam zamanı.',
    'Merkür retrosunun etkisiyle bu ay iletişim konularında dikkatli olmalısınız.',
    'Venüs\'ün destekleyici enerjisiyle ilişkileriniz bu ay boyunca olumlu bir seyir izleyebilir.',
    'Bu ay finansal konularda yeni fırsatlar kapınızı çalabilir, dikkatli değerlendirin.',
    'Sağlık rutininizi gözden geçirmek ve yeni alışkanlıklar edinmek için uygun bir ay.',
    'Dolunay\'ın etkisiyle duygusal farkındalığınız bu ay boyunca yüksek olacak.',
    'Mars\'ın burcunuzu etkilemesiyle, enerjiniz ve motivasyonunuz artabilir.',
    'Bu ay aile bağlarınızı güçlendirmek için ideal, sevdiklerinize zaman ayırın.',
    'Jüpiter\'in şanslı etkisiyle beklenmedik kazançlar elde edebilirsiniz.',
    'Ay sonuna doğru, Plüton\'un dönüştürücü enerjisiyle kişisel bir dönüşüm yaşayabilirsiniz.'
];

// Yıllık yorumlar için ek cümleler
const ADDITIONAL_YEARLY_SENTENCES = [
    'Bu yıl, Satürn\'ün etkisiyle kariyer yolunuzda ciddi ve kalıcı adımlar atabilirsiniz.',
    'Jüpiter\'in şanslı enerjisi yılın ilk yarısında finansal konularda size destek olacak.',
    'Venüs\'ün olumlu açıları sayesinde, bu yıl aşk hayatınızda önemli gelişmeler olabilir.',
    'Uranüs\'ün yenilikçi etkisi, bu yıl sizi beklenmedik fırsatlarla karşılaştırabilir.',
    'Neptün\'ün ruhsal etkisi altında, bu yıl manevi gelişiminize odaklanabilirsiniz.',
    'Plüton\'un dönüştürücü enerjisi, hayatınızın belirli alanlarında köklü değişimlere yol açabilir.',
    'Merkür retroları sırasında iletişim ve teknoloji konularında dikkatli olun.',
    'Bu yıl eğitim veya kendini geliştirme alanında yeni başlangıçlar yapabilirsiniz.',
    'Ay düğümlerinin etkisiyle, karmik bağlantılar ve önemli dersler sizi bekliyor olabilir.',
    'Bu yıl sağlık konusunda daha bilinçli ve disiplinli bir yaklaşım benimsemelisiniz.'
];

// Rastgele seçim yapan yardımcı fonksiyon
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Burç yorumu oluşturan fonksiyon
const generateHoroscope = (sign, period = 'daily') => {
    const properties = ZODIAC_PROPERTIES[sign];
    const date = new Date();
    
    // Seed değerini tarih bazlı oluştur (gün, ay, yıl, burç ve periyoda göre)
    let seed;
    switch(period) {
        case 'daily':
            // Günlük: Gün, ay, yıl ve burca göre değişir
            seed = date.getDate() + (date.getMonth() + 1) * 100 + date.getFullYear() * 10000 + sign.charCodeAt(0);
            break;
        case 'weekly':
            // Haftalık: Haftanın numarası, yıl ve burca göre değişir
            // Yılın kaçıncı haftası olduğunu hesapla
            const weekNumber = Math.ceil((((date - new Date(date.getFullYear(), 0, 1)) / 86400000) + 1) / 7);
            seed = weekNumber + date.getFullYear() * 100 + sign.charCodeAt(0);
            break;
        case 'monthly':
            // Aylık: Ay, yıl ve burca göre değişir
            seed = (date.getMonth() + 1) + date.getFullYear() * 100 + sign.charCodeAt(0);
            break;
        case 'yearly':
            // Yıllık: Yıl ve burca göre değişir
            seed = date.getFullYear() + sign.charCodeAt(0);
            break;
        default:
            seed = date.getDate() + (date.getMonth() + 1) * 100 + date.getFullYear() * 10000 + sign.charCodeAt(0);
    }
    
    // Seed ile rastgele eleman seçme fonksiyonu
    const getSeededRandomItem = (array) => {
        // Basit bir seed-based rastgele sayı üreteci
        const randomValue = Math.abs(Math.sin(seed++) * 10000) % 1;
        return array[Math.floor(randomValue * array.length)];
    };
    
    // Farklı periyotlar için farklı yorum uzunlukları
    const categoryCount = {
        daily: 2,   // Günlük için 2 kategori
        weekly: 3,  // Haftalık için 3 kategori
        monthly: 4, // Aylık için tüm kategoriler
        yearly: 4   // Yıllık için tüm kategoriler
    };

    let horoscope = '';
    const categories = Object.keys(HOROSCOPE_TEMPLATES);
    const selectedCategories = categories.slice(0, categoryCount[period]);

    // Daha kapsamlı yorumlar için ek cümleler ekleyelim
    let additionalSentences = '';
    switch(period) {
        case 'daily':
            additionalSentences = `${getSeededRandomItem(ADDITIONAL_DAILY_SENTENCES)} `;
            break;
        case 'weekly':
            additionalSentences = `${getSeededRandomItem(ADDITIONAL_WEEKLY_SENTENCES)} ${getSeededRandomItem(ADDITIONAL_WEEKLY_SENTENCES)} `;
            break;
        case 'monthly':
            additionalSentences = `${getSeededRandomItem(ADDITIONAL_MONTHLY_SENTENCES)} ${getSeededRandomItem(ADDITIONAL_MONTHLY_SENTENCES)} ${getSeededRandomItem(ADDITIONAL_MONTHLY_SENTENCES)} `;
            break;
        case 'yearly':
            additionalSentences = `${getSeededRandomItem(ADDITIONAL_YEARLY_SENTENCES)} ${getSeededRandomItem(ADDITIONAL_YEARLY_SENTENCES)} ${getSeededRandomItem(ADDITIONAL_YEARLY_SENTENCES)} ${getSeededRandomItem(ADDITIONAL_YEARLY_SENTENCES)} `;
            break;
    }

    selectedCategories.forEach(category => {
        const template = getSeededRandomItem(HOROSCOPE_TEMPLATES[category]);
        // Şablonu seed bazlı doldur
        let filledTemplate = template
            .replace('{burc}', convertSignToTurkish(sign))
            .replace('{element}', properties.element)
            .replace('{gezegen}', properties.gezegen)
            .replace('{motto}', properties.motto)
            .replace('{ugurluRenk}', properties.ugurluRenk)
            .replace('{duygu}', getSeededRandomItem(DUYGULAR))
            .replace('{eylem}', getSeededRandomItem(EYLEMLER))
            .replace('{tavsiye}', getSeededRandomItem(TAVSIYELER))
            .replace('{olumluOzellik}', getSeededRandomItem(properties.olumluOzellikler))
            .replace('{olumsuzOzellik}', getSeededRandomItem(properties.olumsuzOzellikler));
        
        horoscope += filledTemplate + ' ';
    });

    // Ek cümleleri ekle
    horoscope += additionalSentences;

    // Burç eşleşmeleri
    const compatibility = getCompatibility(sign, seed);
    
    // Tarih formatını periyoda göre ayarla
    let formattedDate;
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    
    switch(period) {
        case 'daily':
            formattedDate = date.toLocaleDateString('tr-TR', options);
            break;
        case 'weekly':
            const endOfWeek = new Date(date);
            endOfWeek.setDate(date.getDate() + 6);
            formattedDate = `${date.toLocaleDateString('tr-TR', {day: 'numeric', month: 'long'})} - ${endOfWeek.toLocaleDateString('tr-TR', options)}`;
            break;
        case 'monthly':
            formattedDate = date.toLocaleDateString('tr-TR', {month: 'long', year: 'numeric'});
            break;
        case 'yearly':
            formattedDate = date.toLocaleDateString('tr-TR', {year: 'numeric'});
            break;
        default:
            formattedDate = date.toLocaleDateString('tr-TR', options);
    }

    return {
        yorum: horoscope.trim(),
        tarih: formattedDate,
        burc: convertSignToTurkish(sign),
        element: properties.element,
        gezegen: properties.gezegen,
        ugurluTas: properties.ugurluTas,
        ugurluRenk: properties.ugurluRenk,
        ugurluGun: properties.ugurluGun,
        motto: properties.motto,
        olumluOzellikler: properties.olumluOzellikler,
        olumsuzOzellikler: properties.olumsuzOzellikler,
        anlastigiburclar: properties.anlastigiburclar,
        anlasamadigiburclar: properties.anlasamadigiburclar,
        uyumluBurclar: compatibility.uyumluBurclar,
        uyumsuzBurclar: compatibility.uyumsuzBurclar,
        color: properties.color,
        icon: properties.icon,
        symbol: properties.symbol,
        dateRange: getDateRangeForSign(sign),
        period: period
    };
};

// Burç eşleşmeleri için yardımcı fonksiyon
const getCompatibility = (sign, seed = Date.now()) => {
    const properties = ZODIAC_PROPERTIES[sign];
    const uyumluBurclar = {};
    const uyumsuzBurclar = {};
    
    // Seed ile rastgele eleman seçme fonksiyonu
    const getSeededRandomItem = (array) => {
        // Basit bir seed-based rastgele sayı üreteci
        const randomValue = Math.abs(Math.sin(seed++) * 10000) % 1;
        return array[Math.floor(randomValue * array.length)];
    };
    
    // Anlaştığı burçlar
    properties.anlastigiburclar.forEach(turkishName => {
        const englishName = Object.keys(ZODIAC_PROPERTIES).find(
            key => convertSignToTurkish(key) === turkishName
        );
        if (englishName) {
            uyumluBurclar[englishName] = {
                burc: turkishName,
                aciklama: `${convertSignToTurkish(sign)} ve ${turkishName} arasında ${getSeededRandomItem(['çok iyi', 'harika', 'mükemmel', 'uyumlu'])} bir ilişki olabilir. İkinizin de ${getSeededRandomItem(['enerjileri', 'elementleri', 'özellikleri'])} birbirini tamamlıyor.`
            };
        }
    });
    
    // Anlaşamadığı burçlar
    properties.anlasamadigiburclar.forEach(turkishName => {
        const englishName = Object.keys(ZODIAC_PROPERTIES).find(
            key => convertSignToTurkish(key) === turkishName
        );
        if (englishName) {
            uyumsuzBurclar[englishName] = {
                burc: turkishName,
                aciklama: `${convertSignToTurkish(sign)} ve ${turkishName} arasında ${getSeededRandomItem(['zorlayıcı', 'dikkatli olunması gereken', 'çaba gerektiren'])} bir ilişki olabilir. Farklı ${getSeededRandomItem(['yaklaşımlarınız', 'ihtiyaçlarınız', 'beklentileriniz'])} anlaşmazlıklara yol açabilir.`
            };
        }
    });
    
    return { uyumluBurclar, uyumsuzBurclar };
};

// Burç tarih aralıklarını döndüren yardımcı fonksiyon
const getDateRangeForSign = (sign) => {
    const dateRanges = {
        aries: '21 Mart - 19 Nisan',
        taurus: '20 Nisan - 20 Mayıs',
        gemini: '21 Mayıs - 21 Haziran',
        cancer: '22 Haziran - 22 Temmuz',
        leo: '23 Temmuz - 22 Ağustos',
        virgo: '23 Ağustos - 22 Eylül',
        libra: '23 Eylül - 22 Ekim',
        scorpio: '23 Ekim - 21 Kasım',
        sagittarius: '22 Kasım - 21 Aralık',
        capricorn: '22 Aralık - 19 Ocak',
        aquarius: '20 Ocak - 18 Şubat',
        pisces: '19 Şubat - 20 Mart'
    };
    
    return dateRanges[sign.toLowerCase()];
};

// Burç verilerini yönetmek için servis
class HoroscopeService {
    constructor() {
        console.log('HoroscopeService başlatılıyor...');
        // Yerel depolama için
        this.horoscopeCache = {};
        this.lastUpdatedDate = null;
        
        // Her burç için yorumları oluştur ve önbelleğe al
        this.initializeHoroscopes();
        
        console.log('HoroscopeService başlatıldı. Cache boyutu:', Object.keys(this.horoscopeCache).length);
    }
    
    initializeHoroscopes() {
        console.log('Burç yorumları yükleniyor...');
        const periods = ['daily', 'weekly', 'monthly', 'yearly'];
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD formatı
        
        // Son güncelleme tarihini kontrol et
        const needsUpdate = !this.lastUpdatedDate || this.lastUpdatedDate !== todayStr;
        console.log('Güncelleme gerekiyor mu:', needsUpdate, 'Son güncelleme:', this.lastUpdatedDate);
        
        if (needsUpdate) {
            console.log('Tüm burç yorumları yenileniyor...');
            try {
                HOROSCOPE_SIGNS.forEach(sign => {
                    this.horoscopeCache[sign] = {};
                    periods.forEach(period => {
                        this.horoscopeCache[sign][period] = generateHoroscope(sign, period);
                    });
                });
                
                // Son güncelleme tarihini kaydet
                this.lastUpdatedDate = todayStr;
                console.log('Tüm burç yorumları yenilendi. Tarih:', todayStr);
        } catch (error) {
                console.error('Burç yorumları yüklenirken hata:', error);
            }
        } else {
            console.log('Burç yorumları güncel, yenileme yapılmadı.');
        }
    }

    // Günlük kontrol ve güncelleme işlevi
    checkAndUpdate() {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD formatı
        
        // Son güncelleme tarihi bugün değilse, tüm günlük yorumları güncelle
        if (!this.lastUpdatedDate || this.lastUpdatedDate !== todayStr) {
            HOROSCOPE_SIGNS.forEach(sign => {
                this.horoscopeCache[sign].daily = generateHoroscope(sign, 'daily');
            });
            this.lastUpdatedDate = todayStr;
        }
    }

    // Kullanıcının burcunu al
    getUserHoroscope(userId) {
        // Her istekte güncellemeleri kontrol et
        this.checkAndUpdate();
        
        // Burada localStorage veya sessionStorage kullanarak kullanıcının burcunu alabiliriz
        const userSign = localStorage.getItem('userHoroscopeSign') || 'aries';
        return Promise.resolve(userSign);
    }

    // Belirli bir periyot için tüm burçların yorumlarını al
    getHoroscopeReadings(period = 'daily') {
        // Her istekte güncellemeleri kontrol et
        this.checkAndUpdate();
        
        const readings = {};
        HOROSCOPE_SIGNS.forEach(sign => {
            // Eğer cache'de yoksa, oluştur
            if (!this.horoscopeCache[sign][period]) {
                this.horoscopeCache[sign][period] = generateHoroscope(sign, period);
            }
            readings[sign] = this.horoscopeCache[sign][period];
        });
        return Promise.resolve(readings);
    }

    // Tüm günlük burç yorumlarını al
    getAllDailyHoroscopes() {
        // Her istekte güncellemeleri kontrol et
        this.checkAndUpdate();
        
            const horoscopes = [];
        HOROSCOPE_SIGNS.forEach(sign => {
            horoscopes.push({
                sign: sign,
                data: this.horoscopeCache[sign].daily
            });
        });
        return Promise.resolve(horoscopes);
    }
    
    // Günlük burç yorumu al
    getDailyHoroscope(sign) {
        // Her istekte güncellemeleri kontrol et
        this.checkAndUpdate();
        
        if (!this.horoscopeCache[sign] || !this.horoscopeCache[sign].daily) {
            this.horoscopeCache[sign] = this.horoscopeCache[sign] || {};
            this.horoscopeCache[sign].daily = generateHoroscope(sign, 'daily');
        }
        return Promise.resolve(this.horoscopeCache[sign].daily);
    }
    
    // Haftalık burç yorumu al
    getWeeklyHoroscope(sign) {
        // Her istekte güncellemeleri kontrol et
        this.checkAndUpdate();
        
        if (!this.horoscopeCache[sign] || !this.horoscopeCache[sign].weekly) {
            this.horoscopeCache[sign] = this.horoscopeCache[sign] || {};
            this.horoscopeCache[sign].weekly = generateHoroscope(sign, 'weekly');
        }
        return Promise.resolve(this.horoscopeCache[sign].weekly);
    }
    
    // Aylık burç yorumu al
    getMonthlyHoroscope(sign) {
        // Her istekte güncellemeleri kontrol et
        this.checkAndUpdate();
        
        if (!this.horoscopeCache[sign] || !this.horoscopeCache[sign].monthly) {
            this.horoscopeCache[sign] = this.horoscopeCache[sign] || {};
            this.horoscopeCache[sign].monthly = generateHoroscope(sign, 'monthly');
            }
        return Promise.resolve(this.horoscopeCache[sign].monthly);
    }
    
    // Yıllık burç yorumu al
    getYearlyHoroscope(sign) {
        // Her istekte güncellemeleri kontrol et
        this.checkAndUpdate();
        
        if (!this.horoscopeCache[sign] || !this.horoscopeCache[sign].yearly) {
            this.horoscopeCache[sign] = this.horoscopeCache[sign] || {};
            this.horoscopeCache[sign].yearly = generateHoroscope(sign, 'yearly');
        }
        return Promise.resolve(this.horoscopeCache[sign].yearly);
    }
    
    // İki burç arasındaki uyumu hesapla
    calculateCompatibility(sign1, sign2) {
        const sign1Props = ZODIAC_PROPERTIES[sign1];
        const sign2Name = convertSignToTurkish(sign2);
        
        let compatibility = {
            score: 0,
            description: '',
            areas: {}
        };
        
        // Anlaşan burçlar listesinde var mı?
        if (sign1Props.anlastigiburclar.includes(sign2Name)) {
            compatibility.score = Math.floor(Math.random() * 20) + 80; // 80-100 arası
            compatibility.description = `${convertSignToTurkish(sign1)} ve ${sign2Name} arasında mükemmel bir uyum var!`;
        } 
        // Anlaşamayan burçlar listesinde var mı?
        else if (sign1Props.anlasamadigiburclar.includes(sign2Name)) {
            compatibility.score = Math.floor(Math.random() * 30) + 30; // 30-60 arası
            compatibility.description = `${convertSignToTurkish(sign1)} ve ${sign2Name} arasında zorlayıcı bir uyum olabilir.`;
    }
        // Ne anlaşan ne de anlaşamayan listesinde değilse
        else {
            compatibility.score = Math.floor(Math.random() * 20) + 60; // 60-80 arası
            compatibility.description = `${convertSignToTurkish(sign1)} ve ${sign2Name} arasında orta düzeyde bir uyum var.`;
        }
        
        // Farklı alanlarda uyum
        compatibility.areas = {
            love: Math.floor(Math.random() * 100) + 1,
            friendship: Math.floor(Math.random() * 100) + 1,
            communication: Math.floor(Math.random() * 100) + 1,
            trust: Math.floor(Math.random() * 100) + 1
        };
        
        return Promise.resolve(compatibility);
    }
}

export const horoscopeService = new HoroscopeService(); 
export { convertSignToTurkish, convertSignToApiFormat }; 