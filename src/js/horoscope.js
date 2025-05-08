import { getCurrentUser, logout } from './userService.js';
import { horoscopeService, convertSignToTurkish } from './horoscopeService.js';
import { userService } from './userService.js';

// Constants
const ANIMATION_DURATION = 300;

// DOM Elements
const horoscopeGrid = document.querySelector('.horoscope-grid');
const currentDateElement = document.querySelector('.current-date');
const guestNav = document.getElementById('guestNav');
const userPanel = document.getElementById('userPanel');
const userMenuButton = document.getElementById('userMenuButton');
const userDropdown = document.getElementById('userDropdown');
const userNameElement = document.querySelector('.user-name');
const logoutButton = document.getElementById('logoutButton');
const userHoroscopeSection = document.querySelector('.user-horoscope-section');
const userHoroscopeContent = document.querySelector('.user-horoscope-content');
const tabButtons = document.querySelectorAll('.tab-button');
const loadingOverlay = document.querySelector('.loading-overlay');

// Burç bilgileri
const horoscopeData = {
    aries: { title: 'Koç', icon: 'fa-fire', dateRange: '21 Mart - 19 Nisan' },
    taurus: { title: 'Boğa', icon: 'fa-leaf', dateRange: '20 Nisan - 20 Mayıs' },
    gemini: { title: 'İkizler', icon: 'fa-wind', dateRange: '21 Mayıs - 21 Haziran' },
    cancer: { title: 'Yengeç', icon: 'fa-water', dateRange: '22 Haziran - 22 Temmuz' },
    leo: { title: 'Aslan', icon: 'fa-sun', dateRange: '23 Temmuz - 22 Ağustos' },
    virgo: { title: 'Başak', icon: 'fa-seedling', dateRange: '23 Ağustos - 22 Eylül' },
    libra: { title: 'Terazi', icon: 'fa-balance-scale', dateRange: '23 Eylül - 22 Ekim' },
    scorpio: { title: 'Akrep', icon: 'fa-bolt', dateRange: '23 Ekim - 21 Kasım' },
    sagittarius: { title: 'Yay', icon: 'fa-arrow-alt-circle-up', dateRange: '22 Kasım - 21 Aralık' },
    capricorn: { title: 'Oğlak', icon: 'fa-mountain', dateRange: '22 Aralık - 19 Ocak' },
    aquarius: { title: 'Kova', icon: 'fa-tint', dateRange: '20 Ocak - 18 Şubat' },
    pisces: { title: 'Balık', icon: 'fa-fish', dateRange: '19 Şubat - 20 Mart' }
};

// Utility Functions
const formatDate = (date) => {
    return date.toLocaleDateString('tr-TR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const showLoading = () => {
    loadingOverlay.style.display = 'flex';
};

const hideLoading = () => {
    loadingOverlay.style.display = 'none';
};

// Auth Functions
const checkAuthState = async () => {
    try {
        const user = await getCurrentUser();
        let horoscopeSign = null;
        
        if (user) {
            showUserPanel(user);
            
            // Burç bilgisini al, öncelikle Firebase'den
            if (user.horoscopeSign) {
                horoscopeSign = user.horoscopeSign;
                // Eğer Firebase'de varsa localStorage'a da kaydet
                localStorage.setItem('userHoroscopeSign', horoscopeSign);
            } 
            // Firebase'de yoksa localStorage'dan kontrol et
            else {
                horoscopeSign = localStorage.getItem('userHoroscopeSign');
                
                // Eğer localStorage'da varsa ve kullanıcı giriş yapmışsa, Firebase'e de kaydet
                if (horoscopeSign && user.uid) {
                    await userService.updateHoroscopeSign(user.uid, horoscopeSign);
                }
            }
            
            if (horoscopeSign) {
                await loadUserHoroscope(horoscopeSign);
            } else {
                // Burç seçimi yapılmamışsa, burç seçme ekranını göster
                showHoroscopeSelection();
            }
        } else {
            showGuestNav();
            
            // Misafir kullanıcı için localStorage'dan burç bilgisini kontrol et
            horoscopeSign = localStorage.getItem('userHoroscopeSign');
            
            if (horoscopeSign) {
                await loadUserHoroscope(horoscopeSign);
            } else {
                showHoroscopeSelection();
            }
        }
        
        // Tüm burçların yorumlarını yükle
        await loadAllHoroscopes();
    } catch (error) {
        console.error('Auth state check failed:', error);
        showGuestNav();
        showHoroscopeSelection();
    }
};

const showUserPanel = (user) => {
    if (!guestNav || !userPanel) return;
    
    guestNav.style.display = 'none';
    userPanel.style.display = 'flex';
    if (userNameElement) {
        userNameElement.textContent = user.displayName || 'Kullanıcı';
    }
};

const showGuestNav = () => {
    if (!guestNav || !userPanel) return;
    
    userPanel.style.display = 'none';
    guestNav.style.display = 'flex';
};

// Horoscope Functions
const loadUserHoroscope = async (sign, period = 'daily') => {
    try {
        showLoading();
        let horoscopeData;

        switch (period) {
            case 'daily':
                horoscopeData = await horoscopeService.getDailyHoroscope(sign);
                break;
            case 'weekly':
                horoscopeData = await horoscopeService.getWeeklyHoroscope(sign);
                break;
            case 'monthly':
                horoscopeData = await horoscopeService.getMonthlyHoroscope(sign);
                break;
            case 'yearly':
                horoscopeData = await horoscopeService.getYearlyHoroscope(sign);
                break;
            default:
                horoscopeData = await horoscopeService.getDailyHoroscope(sign);
        }

        updateUserHoroscopeContent(sign, horoscopeData, period);
    } catch (error) {
        console.error('Burç yorumu yüklenirken hata:', error);
        showError('Burç yorumu yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
        hideLoading();
    }
};

const updateUserHoroscopeContent = (sign, data, period) => {
    if (!userHoroscopeContent || !data) return;
    
    const periodText = {
        daily: 'Günlük',
        weekly: 'Haftalık',
        monthly: 'Aylık',
        yearly: 'Yıllık'
    }[period] || 'Günlük';
    
    const zodiacIcon = data.icon || getZodiacIcon(sign);
    const zodiacColor = data.color || `var(--${sign}-color)`;
    
    userHoroscopeContent.innerHTML = `
        <div class="user-horoscope-card" style="background: linear-gradient(135deg, ${zodiacColor.replace('var(', 'rgba(').replace(')', ', 0.8)')}, var(--primary-night-blue))">
            <div class="card-header">
                <div class="zodiac-icon large" style="color: ${zodiacColor}">
                    <i class="fas ${zodiacIcon}" aria-hidden="true"></i>
                </div>
                <div class="header-content">
                    <h3>${data.burc}</h3>
                    <p class="period-text">${periodText} Yorum - ${data.tarih}</p>
                    <p class="date-range">${data.dateRange}</p>
                </div>
            </div>
            <div class="card-content">
                <p class="horoscope-text">${data.yorum}</p>
            </div>
            <div class="card-metadata">
                <div class="metadata-item">
                    <i class="fas fa-quote-left" aria-hidden="true"></i>
                    <span>Motto: ${data.motto}</span>
                </div>
                <div class="metadata-item">
                    <i class="fas fa-globe" aria-hidden="true"></i>
                    <span>Element: ${data.element}</span>
                </div>
                <div class="metadata-item">
                    <i class="fas fa-star" aria-hidden="true"></i>
                    <span>Gezegen: ${data.gezegen}</span>
                </div>
            </div>
            <button class="btn-detail" onclick="showHoroscopeDetail('${sign}', '${period}')">
                <i class="fas fa-search-plus"></i>
                Detaylı Bilgi
            </button>
        </div>
    `;
};

const getZodiacIcon = (sign) => {
    const iconMap = {
        aries: 'fas fa-fire',
        taurus: 'fas fa-leaf',
        gemini: 'fas fa-wind',
        cancer: 'fas fa-water',
        leo: 'fas fa-sun',
        virgo: 'fas fa-seedling',
        libra: 'fas fa-balance-scale',
        scorpio: 'fas fa-bolt',
        sagittarius: 'fas fa-arrow-alt-circle-up',
        capricorn: 'fas fa-mountain',
        aquarius: 'fas fa-tint',
        pisces: 'fas fa-fish'
    };
    
    return iconMap[sign.toLowerCase()] || 'fas fa-question';
};

const loadAllHoroscopes = async (period = 'daily') => {
    try {
        showLoading();
        
        // Seçilen periyoda göre tüm burçların yorumlarını al
        const readings = await horoscopeService.getHoroscopeReadings(period);
        
        if (readings && Object.keys(readings).length > 0) {
            // Objeyi dizi formatına dönüştür
            const horoscopesArray = [];
            Object.keys(readings).forEach(sign => {
                horoscopesArray.push({
                    sign: sign,
                    data: readings[sign]
                });
            });
            
            updateHoroscopeGrid(horoscopesArray, period);
        } else {
            showError('Burç yorumları bulunamadı.');
        }
    } catch (error) {
        console.error('Burç yorumları yüklenirken hata:', error);
        showError('Burç yorumları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
        hideLoading();
    }
};

const updateHoroscopeGrid = (horoscopes, period = 'daily') => {
    if (!horoscopeGrid) return;
    
    horoscopeGrid.innerHTML = '';
    
    // Periyoda göre başlığı güncelle
    const periodTitles = {
        'daily': 'Diğer Burçların Günlük Yorumları',
        'weekly': 'Diğer Burçların Haftalık Yorumları',
        'monthly': 'Diğer Burçların Aylık Yorumları',
        'yearly': 'Diğer Burçların Yıllık Yorumları'
    };
    
    // Başlığı güncelle
    const sectionTitle = document.querySelector('.other-horoscopes-section .section-title');
    if (sectionTitle) {
        sectionTitle.textContent = periodTitles[period] || periodTitles['daily'];
    }
    
    horoscopes.forEach(({ sign, data }) => {
        if (!data) return;
        
        const card = document.createElement('div');
        card.className = 'horoscope-card';
        card.setAttribute('data-sign', sign);
        card.setAttribute('data-period', period);
        
        // Burç kartının rengini ayarla
        const zodiacColor = data.color || `var(--${sign}-color)`;
        card.style.borderTop = `3px solid ${zodiacColor}`;
        
        const iconClass = data.icon || getZodiacIcon(sign);
        
        card.innerHTML = `
            <div class="card-header">
                <div class="zodiac-icon" style="color: ${zodiacColor}">
                    <i class="fas ${iconClass}" aria-hidden="true"></i>
                </div>
                <h2>${data.burc}</h2>
                <p class="date-range">${data.dateRange || ''}</p>
            </div>
            <div class="card-content">
                <p class="daily-horoscope">${data.yorum.substring(0, 150)}...</p>
            </div>
            <div class="card-metadata">
                <div class="metadata-item">
                    <i class="fas fa-gem" aria-hidden="true"></i>
                    <span>Uğurlu Taş: ${data.ugurluTas}</span>
                </div>
                <div class="metadata-item">
                    <i class="fas fa-palette" aria-hidden="true"></i>
                    <span>Uğurlu Renk: ${data.ugurluRenk}</span>
                </div>
            </div>
            <div class="card-footer">
                <button class="read-more" onclick="showHoroscopeDetail('${sign}', '${period}')">
                    <i class="fas fa-arrow-right" aria-hidden="true"></i>
                    <span>Detaylı Bilgi</span>
                </button>
                <button class="select-sign" onclick="selectUserZodiac('${sign}')">
                    <i class="fas fa-check-circle" aria-hidden="true"></i>
                    <span>Burcum Bu</span>
                </button>
            </div>
        `;
        
        horoscopeGrid.appendChild(card);
    });
};

// Error Handling
const showError = (message) => {
    const errorToast = document.createElement('div');
    errorToast.classList.add('error-toast');
    errorToast.textContent = message;
    document.body.appendChild(errorToast);
    
    setTimeout(() => {
        errorToast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(errorToast);
        }, 300);
    }, 3000);
};

// Auth handlers
const handleLogout = async () => {
    try {
        showLoading();
        await logout();
        closeDropdown();
        window.location.reload();
    } catch (error) {
        console.error('Logout failed:', error);
        showError('Çıkış yaparken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
        hideLoading();
    }
};

// Tab handlers
const handleTabClick = async (event) => {
    const button = event.currentTarget;
    const period = button.dataset.period;
    
    // Active class'ı değiştir
    tabButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    showLoading();
    
    try {
        // Kullanıcının burcunu al
        const userSign = localStorage.getItem('userHoroscopeSign');
        
        if (userSign) {
            // Kullanıcının burcunu güncelle
            await loadUserHoroscope(userSign, period);
        } else {
            // Burç seçilmemişse, seçim yapmasını iste
            showHoroscopeSelection();
        }
        
        // Tüm burçları da güncelle (periyoda göre)
        await updateAllHoroscopesForPeriod(period);
    } catch (error) {
        console.error('Tab değişimi sırasında hata:', error);
        showError('Burç yorumları güncellenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
        hideLoading();
    }
};

// Belirli bir periyot için tüm burçları güncelle
const updateAllHoroscopesForPeriod = async (period) => {
    try {
        const readings = await horoscopeService.getHoroscopeReadings(period);
        const horoscopesArray = [];
        
        // Objeyi dizi formatına dönüştür
        Object.keys(readings).forEach(sign => {
            horoscopesArray.push({
                sign: sign,
                data: readings[sign]
            });
        });
        
        updateHoroscopeGrid(horoscopesArray, period);
    } catch (error) {
        console.error('Burç yorumları güncellenirken hata:', error);
        showError('Burç yorumları güncellenirken bir hata oluştu.');
    }
};

// Event Listeners
const setupEventListeners = () => {
    tabButtons.forEach(button => {
        button.addEventListener('click', handleTabClick);
    });
    
    if (userMenuButton) {
        userMenuButton.addEventListener('click', toggleDropdown);
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    // Dropdown dışına tıklandığında kapat
    document.addEventListener('click', (event) => {
        if (userMenuButton && !userMenuButton.contains(event.target) && 
            userDropdown && !userDropdown.contains(event.target)) {
            closeDropdown();
        }
    });
};

const toggleDropdown = () => {
    if (userDropdown) {
    userDropdown.classList.toggle('show');
        userMenuButton.setAttribute('aria-expanded', userDropdown.classList.contains('show'));
    }
};

const closeDropdown = () => {
    if (userDropdown) {
        userDropdown.classList.remove('show');
    userMenuButton.setAttribute('aria-expanded', 'false');
    }
};

const setCurrentDate = () => {
    if (currentDateElement) {
        const now = new Date();
        currentDateElement.textContent = formatDate(now);
    }
};

// Horoscope Selection
const showHoroscopeSelection = () => {
    if (userHoroscopeContent) {
        userHoroscopeContent.innerHTML = `
            <div class="horoscope-selection">
                <p>Burç yorumlarınızı görmek için burcunuzu seçin:</p>
                <div class="zodiac-selector">
                    <select id="zodiacSelect" class="zodiac-dropdown">
                        <option value="">Burç Seçin</option>
                        <option value="aries">Koç</option>
                        <option value="taurus">Boğa</option>
                        <option value="gemini">İkizler</option>
                        <option value="cancer">Yengeç</option>
                        <option value="leo">Aslan</option>
                        <option value="virgo">Başak</option>
                        <option value="libra">Terazi</option>
                        <option value="scorpio">Akrep</option>
                        <option value="sagittarius">Yay</option>
                        <option value="capricorn">Oğlak</option>
                        <option value="aquarius">Kova</option>
                        <option value="pisces">Balık</option>
                    </select>
                    <button id="saveZodiacBtn" class="btn-primary">Kaydet</button>
                </div>
            </div>
        `;
        
        // Seçim butonuna event listener ekle
        const saveButton = document.getElementById('saveZodiacBtn');
        if (saveButton) {
            saveButton.addEventListener('click', saveUserZodiac);
    }
    }
};

const saveUserZodiac = async () => {
    const select = document.getElementById('zodiacSelect');
    if (select && select.value) {
        try {
            showLoading();

            // Seçilen burcu localStorage'a kaydet
            localStorage.setItem('userHoroscopeSign', select.value);
            
            // Eğer kullanıcı giriş yapmışsa, Firebase profiline de kaydet
            const user = await getCurrentUser();
            if (user && user.uid) {
                await userService.updateHoroscopeSign(user.uid, select.value);
            }
            
            // Active olan tab'ı bul
            const activeTab = document.querySelector('.tab-button.active');
            const period = activeTab ? activeTab.dataset.period : 'daily';
            
            // Burç yorumunu yükle
            await loadUserHoroscope(select.value, period);
            
        } catch (error) {
            console.error('Burç kaydedilirken hata:', error);
            showError('Burç bilgisi kaydedilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        } finally {
            hideLoading();
        }
    } else {
        showError('Lütfen bir burç seçin.');
    }
};

// "Burcum Bu" butonuna tıklandığında çalışacak fonksiyon
window.selectUserZodiac = async (sign) => {
    try {
        showLoading();
        console.log('Burcum bu seçildi:', sign);
        
        // Seçilen burcu localStorage'a kaydet
        localStorage.setItem('userHoroscopeSign', sign);
        
        // Eğer kullanıcı giriş yapmışsa, Firebase profiline de kaydet
        const user = await getCurrentUser();
        if (user && user.uid) {
            await userService.updateHoroscopeSign(user.uid, sign);
        }
        
        // Active olan tab'ı bul
        const activeTab = document.querySelector('.tab-button.active');
        const period = activeTab ? activeTab.dataset.period : 'daily';
        
        // Burç yorumunu yükle
        await loadUserHoroscope(sign, period);
        
        // Sayfayı yukarı kaydır
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Türkçe burç adını al
        const burcAdi = horoscopeService.horoscopeCache[sign]?.daily?.burc || convertSignToTurkish(sign);
        
        // Başarılı mesajı göster
        showSuccess(`${burcAdi} burcu başarıyla seçildi!`);
        
    } catch (error) {
        console.error('Burç seçilirken hata:', error);
        showError('Burcunuz seçilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
        hideLoading();
    }
};

// Detail Modal - periyot bazlı güncellenen versiyon
window.showHoroscopeDetail = (sign, period = 'daily') => {
    try {
        console.log('showHoroscopeDetail çağrıldı:', sign, period);
        console.log('horoscopeCache:', horoscopeService.horoscopeCache);
        
        // Belirtilen periyot için burç yorumunu al
        if (!horoscopeService.horoscopeCache[sign]) {
            console.error('Burç verisi bulunamadı:', sign);
            showError('Burç verisi yüklenemedi. Lütfen sayfayı yenileyin ve tekrar deneyin.');
            return;
        }
        
        if (!horoscopeService.horoscopeCache[sign][period]) {
            console.error('Periyot verisi bulunamadı:', sign, period);
            // Eğer periyot yoksa, daily'ye geri dön
            period = 'daily';
        }
        
        const horoscope = horoscopeService.horoscopeCache[sign][period];
        if (!horoscope) {
            console.error('Burç yorumu bulunamadı:', sign, period);
            showError('Burç yorumu yüklenemedi. Lütfen sayfayı yenileyin ve tekrar deneyin.');
            return;
        }
        
        const zodiacColor = horoscope.color || `var(--${sign}-color)`;
        const zodiacIcon = horoscope.icon || getZodiacIcon(sign);
        
        // Periyot başlıklarını belirle
        const periodTitles = {
            'daily': 'Günlük',
            'weekly': 'Haftalık',
            'monthly': 'Aylık',
            'yearly': 'Yıllık'
        };
        
        const periodTitle = periodTitles[period] || 'Günlük';
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="background: linear-gradient(135deg, ${zodiacColor.replace('var(', 'rgba(').replace(')', ', 0.3)')}, var(--primary-night-blue))">
                <span class="close-button">&times;</span>
                
                <div class="modal-header">
                    <div class="zodiac-icon large" style="color: ${zodiacColor}">
                        <i class="fas ${zodiacIcon}" aria-hidden="true"></i>
                    </div>
                    <div>
                        <h2>${horoscope.burc} Burcu</h2>
                        <p class="detail-date">${horoscope.dateRange}</p>
                    </div>
                </div>
                
                <div class="horoscope-detail">
                    <h3>${periodTitle} Burç Yorumu</h3>
                    <p class="detail-date">${horoscope.tarih}</p>
                    <p>${horoscope.yorum}</p>
                    
                    <h3>Genel Özellikler</h3>
                    <div class="feature-grid">
                        <div class="feature-item">
                            <i class="fas fa-fire-alt" aria-hidden="true"></i>
                            <strong>Element:</strong> ${horoscope.element}
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-globe-americas" aria-hidden="true"></i>
                            <strong>Gezegen:</strong> ${horoscope.gezegen}
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-gem" aria-hidden="true"></i>
                            <strong>Uğurlu Taş:</strong> ${horoscope.ugurluTas}
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-palette" aria-hidden="true"></i>
                            <strong>Uğurlu Renk:</strong> ${horoscope.ugurluRenk}
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-calendar-day" aria-hidden="true"></i>
                            <strong>Uğurlu Gün:</strong> ${horoscope.ugurluGun}
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-quote-left" aria-hidden="true"></i>
                            <strong>Motto:</strong> ${horoscope.motto}
                        </div>
                    </div>
                    
                    <div class="traits-container">
                        <div class="traits-column">
                            <h3>Olumlu Özellikler</h3>
                            <ul class="traits-list positive">
                                ${horoscope.olumluOzellikler.map(ozellik => `<li>${ozellik}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="traits-column">
                            <h3>Olumsuz Özellikler</h3>
                            <ul class="traits-list negative">
                                ${horoscope.olumsuzOzellikler.map(ozellik => `<li>${ozellik}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                    
                    <h3>Burç Uyumları</h3>
                    <div class="compatibility-container">
                        <div class="compatibility-column">
                            <h4>Anlaştığı Burçlar</h4>
                            <ul class="compatibility-list positive">
                                ${horoscope.anlastigiburclar.map(burc => `<li>${burc}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="compatibility-column">
                            <h4>Anlaşamadığı Burçlar</h4>
                            <ul class="compatibility-list negative">
                                ${horoscope.anlasamadigiburclar.map(burc => `<li>${burc}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn-select-sign" onclick="selectUserZodiac('${sign}')">
                            <i class="fas fa-check-circle"></i>
                            Burcum Bu
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Modal açıldıktan sonra scroll'u en üste çek
        setTimeout(() => {
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.scrollTop = 0;
            }
        }, 100);
        
        // Close button event
        const closeButton = modal.querySelector('.close-button');
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Close when clicking outside
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                document.body.removeChild(modal);
            }
        });
    } catch (error) {
        console.error('showHoroscopeDetail hatası:', error);
        showError('Burç detayları gösterilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
};

// Başarı mesajı gösterme fonksiyonu
const showSuccess = (message) => {
    const successToast = document.createElement('div');
    successToast.classList.add('success-toast');
    successToast.textContent = message;
    document.body.appendChild(successToast);
    
    setTimeout(() => {
        successToast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(successToast);
        }, 300);
    }, 3000);
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Sayfa yükleniyor...');
        const horoscopePage = new HoroscopePage();
        horoscopePage.init().catch(error => {
            console.error('Sayfa başlatılırken hata:', error);
            showError('Sayfa yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        });
        console.log('Sayfa başlatıldı.');
    } catch (error) {
        console.error('Sayfa yüklenirken kritik hata:', error);
        alert('Sayfa yüklenirken kritik bir hata oluştu. Lütfen daha sonra tekrar deneyin veya sayfayı yenileyin.');
    }
});

// Main Class
class HoroscopePage {
    constructor() {
        this.currentPeriod = 'daily';
    }

    async init() {
        setCurrentDate();
        this.setupEventListeners();
        
        showLoading();
        try {
            const user = await getCurrentUser();
            let horoscopeSign = null;
            
            if (user) {
                showUserPanel(user);
                
                // Burç bilgisini al, öncelikle Firebase'den
                if (user.horoscopeSign) {
                    horoscopeSign = user.horoscopeSign;
                    // Eğer Firebase'de varsa localStorage'a da kaydet
                    localStorage.setItem('userHoroscopeSign', horoscopeSign);
                } 
                // Firebase'de yoksa localStorage'dan kontrol et
                else {
                    horoscopeSign = localStorage.getItem('userHoroscopeSign');
                    
                    // Eğer localStorage'da varsa ve kullanıcı giriş yapmışsa, Firebase'e de kaydet
                    if (horoscopeSign && user.uid) {
                        await userService.updateHoroscopeSign(user.uid, horoscopeSign);
                    }
                }
                
                if (horoscopeSign) {
                    await this.displayUserHoroscope(horoscopeSign);
                } else {
                    this.showHoroscopeSelection();
                }
            } else {
                showGuestNav();
                
                // Misafir kullanıcı için localStorage'dan burç bilgisini kontrol et
                horoscopeSign = localStorage.getItem('userHoroscopeSign');
                
                if (horoscopeSign) {
                    await this.displayUserHoroscope(horoscopeSign);
                } else {
                    this.showHoroscopeSelection();
                }
            }
            
        await this.loadAllHoroscopes();
        } catch (error) {
            console.error('Initialization error:', error);
            showError('Sayfa yüklenirken bir hata oluştu.');
        } finally {
            hideLoading();
        }
    }

    setupEventListeners() {
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => this.changePeriod(e.target.dataset.period));
        });
        
        if (userMenuButton) {
            userMenuButton.addEventListener('click', toggleDropdown);
        }
        
        if (logoutButton) {
            logoutButton.addEventListener('click', handleLogout);
        }
        
        // Dropdown dışına tıklandığında kapat
        document.addEventListener('click', (event) => {
            if (userMenuButton && !userMenuButton.contains(event.target) && 
                userDropdown && !userDropdown.contains(event.target)) {
                closeDropdown();
            }
        });
    }

    async loadUserHoroscope() {
        const user = await getCurrentUser();
        if (user && user.horoscopeSign) {
            await this.displayUserHoroscope(user.horoscopeSign);
        } else {
            this.showHoroscopeSelection();
        }
    }

    async loadAllHoroscopes(period = null) {
        try {
            const activePeriod = period || this.currentPeriod;
            
            // Seçilen periyoda göre tüm burçların yorumlarını al
            const readings = await horoscopeService.getHoroscopeReadings(activePeriod);
            
            if (readings && Object.keys(readings).length > 0) {
                // Objeyi dizi formatına dönüştür
                const horoscopesArray = [];
                Object.keys(readings).forEach(sign => {
                    horoscopesArray.push({
                        sign: sign,
                        data: readings[sign]
                    });
                });
                
                this.displayAllHoroscopes(horoscopesArray, activePeriod);
            }
        } catch (error) {
            console.error('Error loading horoscopes:', error);
            showError('Burç yorumları yüklenirken bir hata oluştu.');
        }
    }

    async changePeriod(period) {
        if (period === this.currentPeriod) return;
        
        // Update active tab
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.period === period);
        });
        
        this.currentPeriod = period;
        
        showLoading();
        try {
            // Kullanıcının burç yorumunu güncelle
            const userSign = localStorage.getItem('userHoroscopeSign');
            if (userSign) {
                await this.displayUserHoroscope(userSign);
            }
            
            // Tüm burçların yorumlarını da güncelle
            await this.loadAllHoroscopes(period);
        } catch (error) {
            console.error('Period change error:', error);
            showError('Periyot değiştirilirken bir hata oluştu.');
        } finally {
            hideLoading();
        }
    }

    async displayUserHoroscope(sign) {
        try {
            showLoading();
            
            let data;
            switch (this.currentPeriod) {
                case 'daily':
                    data = await horoscopeService.getDailyHoroscope(sign);
                    break;
                case 'weekly':
                    data = await horoscopeService.getWeeklyHoroscope(sign);
                    break;
                case 'monthly':
                    data = await horoscopeService.getMonthlyHoroscope(sign);
                    break;
                case 'yearly':
                    data = await horoscopeService.getYearlyHoroscope(sign);
                    break;
                default:
                    data = await horoscopeService.getDailyHoroscope(sign);
            }
            
            updateUserHoroscopeContent(sign, data, this.currentPeriod);
        } catch (error) {
            console.error('Error displaying horoscope:', error);
            showError('Burç yorumu görüntülenirken bir hata oluştu.');
        } finally {
            hideLoading();
        }
    }

    displayAllHoroscopes(readings, period = 'daily') {
        if (!horoscopeGrid) return;

        horoscopeGrid.innerHTML = '';
        
        // Periyoda göre başlığı güncelle
        const periodTitles = {
            'daily': 'Diğer Burçların Günlük Yorumları',
            'weekly': 'Diğer Burçların Haftalık Yorumları',
            'monthly': 'Diğer Burçların Aylık Yorumları',
            'yearly': 'Diğer Burçların Yıllık Yorumları'
        };
        
        // Başlığı güncelle
        const sectionTitle = document.querySelector('.other-horoscopes-section .section-title');
        if (sectionTitle) {
            sectionTitle.textContent = periodTitles[period] || periodTitles['daily'];
        }

        readings.forEach(({ sign, data }) => {
            if (!data) return;
            
            const card = document.createElement('div');
            card.className = 'horoscope-card';
            card.setAttribute('data-sign', sign);
            card.setAttribute('data-period', period);
            
            // Burç kartının rengini ayarla
            const zodiacColor = data.color || `var(--${sign}-color)`;
            card.style.borderTop = `3px solid ${zodiacColor}`;
            
            const iconClass = data.icon || getZodiacIcon(sign);
            
            card.innerHTML = `
                <div class="card-header">
                    <div class="zodiac-icon" style="color: ${zodiacColor}">
                        <i class="fas ${iconClass}" aria-hidden="true"></i>
                    </div>
                    <h2>${data.burc}</h2>
                    <p class="date-range">${data.dateRange || ''}</p>
                </div>
                <div class="card-content">
                    <p class="daily-horoscope">${data.yorum.substring(0, 150)}...</p>
                </div>
                <div class="card-metadata">
                    <div class="metadata-item">
                        <i class="fas fa-gem" aria-hidden="true"></i>
                        <span>Uğurlu Taş: ${data.ugurluTas}</span>
                    </div>
                    <div class="metadata-item">
                        <i class="fas fa-palette" aria-hidden="true"></i>
                        <span>Uğurlu Renk: ${data.ugurluRenk}</span>
                    </div>
                </div>
                <div class="card-footer">
                    <button class="read-more" onclick="showHoroscopeDetail('${sign}', '${period}')">
                        <i class="fas fa-arrow-right" aria-hidden="true"></i>
                        <span>Detaylı Bilgi</span>
                    </button>
                    <button class="select-sign" onclick="selectUserZodiac('${sign}')">
                        <i class="fas fa-check-circle" aria-hidden="true"></i>
                        <span>Burcum Bu</span>
                    </button>
                </div>
            `;
            
            horoscopeGrid.appendChild(card);
        });
    }

    showLoginPrompt() {
        if (userHoroscopeContent) {
            userHoroscopeContent.innerHTML = `
            <div class="login-prompt">
                    <p>Burç yorumlarını görmek için giriş yapın veya kayıt olun.</p>
                    <a href="login.html" class="btn-primary">Giriş Yap</a>
                    <a href="signup.html" class="btn-primary">Kayıt Ol</a>
            </div>
        `;
        }
    }

    showHoroscopeSelection() {
        showHoroscopeSelection();
    }

    updateCurrentDate() {
        setCurrentDate();
    }
} 