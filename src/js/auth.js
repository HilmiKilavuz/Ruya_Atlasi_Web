import { auth, db } from './firebase-config.js';
import { userService } from './userService.js';

// Yaş doğrulama fonksiyonu
function validateAge(input) {
    const birthDate = new Date(input.value);
    const today = new Date();
    
    // Bugünün tarihini max olarak ayarla
    const maxDate = today.toISOString().split('T')[0];
    input.setAttribute('max', maxDate);
    
    // Yaş hesaplama
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    const errorElement = document.getElementById('birthDateError');
    const submitButton = document.querySelector('.auth-submit');

    if (age < 18) {
        errorElement.textContent = '18 yaşından küçükler üye olamaz.';
        errorElement.style.display = 'block';
        input.setCustomValidity('18 yaşından küçükler üye olamaz.');
        submitButton.disabled = true;
    } else if (age > 100) {
        errorElement.textContent = 'Geçerli bir doğum tarihi giriniz.';
        errorElement.style.display = 'block';
        input.setCustomValidity('Geçerli bir doğum tarihi giriniz.');
        submitButton.disabled = true;
    } else {
        errorElement.style.display = 'none';
        input.setCustomValidity('');
        submitButton.disabled = false;
    }
}

// Global scope'a ekle
window.validateAge = validateAge;

// Loading screen handler
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        // Force reflow
        loadingScreen.offsetHeight;
        loadingScreen.classList.remove('hidden');
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        // Remove from DOM after transition
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500); // Match the CSS transition duration
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Auth.js yüklendi'); // Debug log

    // Form handling
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    // Password visibility toggle function
    const setupPasswordToggle = (formElement) => {
        if (!formElement) return;
        
        const passwordInputs = formElement.querySelectorAll('input[type="password"]');
        const toggleButtons = formElement.querySelectorAll('.password-toggle');
        
        toggleButtons.forEach((toggleButton, index) => {
            if (toggleButton && passwordInputs[index]) {
                toggleButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    const input = passwordInputs[index];
                    const icon = toggleButton.querySelector('i');
                    
                    if (input.type === 'password') {
                        input.type = 'text';
                        icon.classList.remove('fa-eye');
                        icon.classList.add('fa-eye-slash');
                    } else {
                        input.type = 'password';
                        icon.classList.remove('fa-eye-slash');
                        icon.classList.add('fa-eye');
                    }
                });
            }
        });
    };

    // Setup password toggle for both forms
    setupPasswordToggle(signupForm);
    setupPasswordToggle(loginForm);

    // Doğum tarihi input'unu bul ve max değerini ayarla
    const birthDateInput = document.getElementById('birthDate');
    if (birthDateInput) {
        const today = new Date();
        const maxDate = today.toISOString().split('T')[0];
        birthDateInput.setAttribute('max', maxDate);
    }

    // Kayıt formu işleme
    if (signupForm) {
        console.log('Kayıt formu bulundu'); // Debug log

        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Kayıt formu gönderildi'); // Debug log
            
            try {
                const formData = {
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value,
                    passwordConfirm: document.getElementById('passwordConfirm').value,
                    username: document.getElementById('username').value,
                    birthDate: document.getElementById('birthDate').value,
                    zodiacSign: document.getElementById('zodiacSign').value
                };

                console.log('Form verileri:', formData); // Debug log

                // Form validasyonu
                if (!formData.email || !formData.password || !formData.username) {
                    throw new Error('Lütfen tüm zorunlu alanları doldurun.');
                }

                if (formData.password !== formData.passwordConfirm) {
                    throw new Error('Şifreler eşleşmiyor.');
                }

                if (formData.password.length < 8) {
                    throw new Error('Şifre en az 8 karakter olmalıdır.');
                }

                // Yaş kontrolü
                const birthDate = new Date(formData.birthDate);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }

                if (age < 18) {
                    throw new Error('18 yaşından küçükler üye olamaz.');
                }

                const submitButton = signupForm.querySelector('.auth-submit');
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> İşleniyor...';

                // Firebase'e kayıt
                const user = await userService.register(formData.email, formData.password, formData.username);
                console.log('Kullanıcı kaydı başarılı:', user); // Debug log
                
                // Ek kullanıcı bilgilerini güncelle
                await userService.updateUserProfile(user.uid, {
                    birthDate: formData.birthDate,
                    zodiacSign: formData.zodiacSign,
                    age: age
                });
                console.log('Kullanıcı profili güncellendi'); // Debug log

                // Başarı mesajını göster
                const successMessage = document.getElementById('successMessage');
                const errorMessage = document.getElementById('errorMessage');
                
                successMessage.textContent = 'Kayıt başarılı! Yönlendiriliyorsunuz...';
                successMessage.style.display = 'block';
                errorMessage.style.display = 'none';

                // Ana sayfaya yönlendir
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 2000);

            } catch (error) {
                console.error('Kayıt hatası:', error); // Debug log
                
                const errorMessage = document.getElementById('errorMessage');
                const successMessage = document.getElementById('successMessage');
                
                errorMessage.textContent = error.message || 'Kayıt sırasında bir hata oluştu.';
                errorMessage.style.display = 'block';
                successMessage.style.display = 'none';

                const submitButton = signupForm.querySelector('.auth-submit');
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-user-plus"></i> Üye Ol';
            }
        });
    }

    // Giriş formu işleme
    if (loginForm) {
        console.log('Giriş formu bulundu'); // Debug log

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Giriş formu gönderildi'); // Debug log
            
            try {
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;

                console.log('Giriş bilgileri:', { email }); // Debug log

                if (!email || !password) {
                    throw new Error('Lütfen e-posta ve şifrenizi girin.');
                }

                const submitButton = loginForm.querySelector('.auth-submit');
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Giriş yapılıyor...';

                const user = await userService.login(email, password);
                console.log('Giriş başarılı:', user); // Debug log
                
                successMessage.textContent = 'Giriş başarılı! Yönlendiriliyorsunuz...';
                successMessage.style.display = 'block';
                errorMessage.style.display = 'none';

                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 2000);

            } catch (error) {
                console.error('Giriş hatası:', error); // Debug log
                errorMessage.textContent = error.message || 'Giriş sırasında bir hata oluştu.';
                errorMessage.style.display = 'block';
                successMessage.style.display = 'none';

                const submitButton = loginForm.querySelector('.auth-submit');
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Giriş Yap';
            }
        });
    }

    // Çıkış işlemi
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        console.log('Çıkış butonu bulundu'); // Debug log

        logoutButton.addEventListener('click', async () => {
            try {
                await userService.logout();
                console.log('Çıkış başarılı'); // Debug log
                window.location.href = '/src/pages/login.html';
            } catch (error) {
                console.error('Çıkış hatası:', error); // Debug log
            }
        });
    }
});

// Form validation
function validateForm() {
    let isValid = true;
    const form = document.getElementById('signupForm');
    
    // Reset previous errors
    form.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error', 'success');
        const errorMessage = group.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    });

    // Validate full name
    const fullName = form.querySelector('#fullName');
    if (fullName.value.trim().length < 3) {
        showError(fullName, 'Ad ve soyad en az 3 karakter olmalıdır');
        isValid = false;
    } else {
        showSuccess(fullName);
    }

    // Validate email
    const email = form.querySelector('#email');
    if (!isValidEmail(email.value)) {
        showError(email, 'Geçerli bir e-posta adresi giriniz');
        isValid = false;
    } else {
        showSuccess(email);
    }

    // Validate password
    const password = form.querySelector('#password');
    if (password.value.length < 8) {
        showError(password, 'Şifre en az 8 karakter olmalıdır');
        isValid = false;
    } else if (!isStrongPassword(password.value)) {
        showError(password, 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir');
        isValid = false;
    } else {
        showSuccess(password);
    }

    // Validate birth date
    const birthDate = form.querySelector('#birthDate');
    if (!isValidDate(birthDate.value)) {
        showError(birthDate, 'Geçerli bir doğum tarihi seçiniz');
        isValid = false;
    } else {
        showSuccess(birthDate);
    }

    // Validate zodiac sign
    const zodiacSign = form.querySelector('#zodiacSign');
    if (!zodiacSign.value) {
        showError(zodiacSign, 'Lütfen burcunuzu seçin');
        isValid = false;
    } else {
        showSuccess(zodiacSign);
    }

    // Validate terms
    const terms = form.querySelector('input[name="terms"]');
    if (!terms.checked) {
        showError(terms, 'Kullanım koşullarını kabul etmelisiniz');
        isValid = false;
    }

    return isValid;
}

// Helper functions
function showError(input, message) {
    const formGroup = input.closest('.form-group');
    formGroup.classList.add('error');
    formGroup.classList.remove('success');
    
    // Remove existing error message if any
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i>${message}`;
    formGroup.appendChild(errorDiv);
}

function showSuccess(input) {
    const formGroup = input.closest('.form-group');
    formGroup.classList.add('success');
    formGroup.classList.remove('error');
}

function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function isStrongPassword(password) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasUpperCase && hasLowerCase && hasNumber;
}

function isValidDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    return date instanceof Date && !isNaN(date) && date < today;
}

function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;

    // Add to document
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);

    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
} 