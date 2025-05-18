/*
 * Node.js API ile E-posta Doğrulama Sistemi
 * 
 * Bu sistem, EmailJS yerine kendi Node.js sunucumuzu kullanarak e-posta doğrulama işlemlerini gerçekleştirir.
 * Doğrulama kodu gönderme ve kontrol etme API uç noktaları:
 *    - POST /api/send-verification-code - Kayıt sırasında e-posta doğrulama kodu gönderme
 *    - POST /api/send-password-reset-code - Şifre sıfırlama için doğrulama kodu gönderme
 *    - POST /api/verify-code - Doğrulama kodunu kontrol etme
 */

import { auth, db } from './firebase-config.js';
import { userService } from './userService.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { convertSignToApiFormat } from './horoscopeService.js';

// API URL'i (Geliştirme ortamında localhost, canlıda sunucu adresi olacak)
const API_URL = 'http://localhost:3000/api';

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
    
    // E-posta doğrulama adımı için elementler
    const verifyEmailButton = document.getElementById('verifyEmailButton');
    const completeSignupButton = document.getElementById('completeSignupButton');
    const emailVerificationStep = document.getElementById('emailVerificationStep');
    const verificationCodeInput = document.getElementById('verificationCode');
    const resendVerificationButton = document.getElementById('resendVerificationButton');
    
    // Doğrulama kodu ve e-posta için değişkenler
    let userEmail = '';
    let isEmailVerified = false;

    // E-posta doğrulama için API çağrısı
    const sendVerificationEmail = async (email) => {
        try {
            if (!email || email.trim() === '') {
                throw new Error('E-posta adresi boş olamaz');
            }
            
            const username = document.getElementById('username')?.value || 'Değerli Kullanıcı';
            
            // API isteği için JSON verisini hazırla
            const data = {
                email: email,
                username: username
            };
            
            console.log('Sending verification email to:', email);
            
            // Node.js API'ye istek gönder
            const response = await fetch(`${API_URL}/send-verification-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'E-posta gönderiminde bir hata oluştu');
            }
            
            console.log('Email sent successfully:', result);
            
            // Bildirim göster
            const notificationMessage = `Doğrulama kodu ${email} adresine gönderildi.`;
            showNotification(notificationMessage, 'success');
            
            return { success: true, message: result.message };
            
        } catch (error) {
            console.error('Verification email sending error:', error);
            showNotification('E-posta gönderilirken bir hata oluştu: ' + error.message, 'error');
            return { success: false, error: error.message };
        }
    };
    
    const verifyEmail = async () => {
        try {
            // E-posta inputunu temizle ve doğrula
            const emailInput = document.getElementById('email');
            const email = emailInput.value.trim();
            
            if (!email) {
                showError(emailInput, 'Lütfen e-posta adresinizi girin');
                return;
            }
            
            if (!isValidEmail(email)) {
                showError(emailInput, 'Lütfen geçerli bir e-posta adresi girin');
                return;
            }
            
            // E-posta doğrulamasını göster, butonları değiştir
            emailVerificationStep.style.display = 'block';
            verifyEmailButton.style.display = 'none';
            completeSignupButton.style.display = 'block';
            
            // E-posta adresi kaydet
            userEmail = email;
            
            // Loading ekranını göster
            showLoadingScreen();
            
            // E-posta gönder
            const emailResult = await sendVerificationEmail(email);
            
            // Loading ekranını gizle
            hideLoadingScreen();
            
            if (emailResult.success) {
                // Başarı mesajını göster
                successMessage.textContent = emailResult.message;
                successMessage.style.display = 'block';
                
                // 5 saniye sonra başarı mesajını gizle
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 5000);
                
                // Doğrulama adımına geçiş
                verificationCodeInput.focus();
            } else {
                // Hata mesajını göster
                errorMessage.textContent = emailResult.error;
                errorMessage.style.display = 'block';
                
                // E-posta doğrulama adımını gizle, normal butonu geri getir
                emailVerificationStep.style.display = 'none';
                verifyEmailButton.style.display = 'block';
                completeSignupButton.style.display = 'none';
            }
            
        } catch (error) {
            console.error('Email verification error:', error);
            errorMessage.textContent = 'Bir hata oluştu: ' + error.message;
            errorMessage.style.display = 'block';
            hideLoadingScreen();
        }
    };
    
    const verifyCode = async () => {
        try {
            const code = verificationCodeInput.value.trim();
        
            if (!code) {
                showError(verificationCodeInput, 'Lütfen doğrulama kodunu girin');
            return false;
        }
        
            if (code.length !== 6 || !/^\d+$/.test(code)) {
                showError(verificationCodeInput, 'Geçersiz doğrulama kodu. 6 haneli sayısal kod olmalıdır.');
            return false;
        }
        
            showLoadingScreen();
            
            // Node.js API'ye istek gönder
            const response = await fetch(`${API_URL}/verify-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: userEmail,
                    code: code
                })
            });
            
            const result = await response.json();
            
            hideLoadingScreen();
            
            if (!response.ok) {
                // Kod yanlış veya süresi dolmuş
                if (result.expired) {
                    showError(verificationCodeInput, 'Doğrulama kodunun süresi dolmuş. Lütfen yeni kod isteyin.');
                } else if (result.invalid) {
                    showError(verificationCodeInput, 'Yanlış doğrulama kodu. Lütfen tekrar deneyin.');
                } else {
                    showError(verificationCodeInput, result.error || 'Kod doğrulanırken bir hata oluştu');
                }
            return false;
        }
        
            // Doğrulama başarılı
            showSuccess(verificationCodeInput);
            isEmailVerified = true;
            showNotification('E-posta adresiniz başarıyla doğrulandı!', 'success');
            
            return true;
            
        } catch (error) {
            console.error('Code verification error:', error);
            hideLoadingScreen();
            showError(verificationCodeInput, 'Bir hata oluştu: ' + error.message);
            return false;
        }
    };
    
    // Verify email button handler
    if (verifyEmailButton) {
        verifyEmailButton.addEventListener('click', (e) => {
            e.preventDefault();
            verifyEmail();
        });
    }

    // Resend verification code button handler
    if (resendVerificationButton) {
        resendVerificationButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (!userEmail) {
                showNotification('Lütfen önce e-posta adresinizi girin', 'error');
                return;
            }
            
            showLoadingScreen();
            await sendVerificationEmail(userEmail);
            hideLoadingScreen();
        });
    }
    
    // Signup form handler
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Form gönderildi');

            try {
                // Hata ve başarı mesajlarını temizle
                const errorMessage = document.getElementById('errorMessage');
                const successMessage = document.getElementById('successMessage');
                
                if (errorMessage) errorMessage.style.display = 'none';
                if (successMessage) successMessage.style.display = 'none';
                
                // E-posta adresini doğrula
                if (!isEmailVerified) {
                    console.log('E-posta doğrulanmamış, doğrulama yapılıyor...');
                    const isCodeVerified = await verifyCode();
                    if (!isCodeVerified) {
                        console.log('E-posta doğrulama başarısız');
                        showNotification('Lütfen önce e-posta adresinizi doğrulayın', 'error');
                        if (errorMessage) {
                            errorMessage.textContent = 'Lütfen önce e-posta adresinizi doğrulayın';
                            errorMessage.style.display = 'block';
                        }
                        return;
                    }
                    console.log('E-posta doğrulama başarılı');
                }
                
                // Diğer form alanlarını doğrula
                console.log('Form validasyonu yapılıyor...');
                if (!validateForm()) {
                    console.log('Form validasyonu başarısız');
                    return;
                }
                console.log('Form validasyonu başarılı');
                
                // Form verilerini al
                const formData = new FormData(signupForm);
                const userData = {
                    username: formData.get('username'),
                    email: formData.get('email'),
                    password: formData.get('password'),
                    birthDate: formData.get('birthDate'),
                    zodiacSign: formData.get('zodiacSign')
                };
                
                console.log('Kayıt verileri hazırlandı:', userData);
                
                try {
                    showLoadingScreen();
                    console.log('Firebase kayıt işlemi başlatılıyor...');
                    
                    // Firebase'e kullanıcı kaydı (modüler yöntem ile)
                    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
                    console.log('Firebase kayıt başarılı:', userCredential);
                    
                    const user = userCredential.user;
                    
                    // Kullanıcı profil bilgilerini güncelle
                    console.log('Kullanıcı profili güncelleniyor... UID:', user.uid);
                    
                    const userProfile = {
                        username: userData.username,
                        birthDate: userData.birthDate,
                        zodiacSign: userData.zodiacSign,
                        email: userData.email,
                        createdAt: new Date().toISOString()
                    };
                    
                    console.log('Firestore profil bilgileri:', userProfile);
                    
                    // setDoc kullanarak Firestore'da doküman oluştur (updateDoc değil)
                    try {
                        await setDoc(doc(db, "users", user.uid), {
                            uid: user.uid,
                            email: userData.email,
                            username: userData.username,
                            birthDate: userData.birthDate,
                            zodiacSign: userData.zodiacSign,
                            horoscopeSign: convertSignToApiFormat(userData.zodiacSign), // Burç değerini API formatında kaydet
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            favoriteSymbols: [],
                            dreamCount: 0,
                            profilePicture: ''
                        });
                        
                        console.log('Kullanıcı profili oluşturuldu');
                    } catch (profileError) {
                        console.error('Profil oluşturma hatası:', profileError);
                        // Hata olsa bile devam et, en azından kullanıcı oluşturuldu
                    }
                    
                    hideLoadingScreen();
                    
                    // Başarılı kayıt bildirimi
                    showNotification('Kayıt işleminiz başarıyla tamamlandı!', 'success');
                    
                    if (successMessage) {
                        successMessage.textContent = 'Kayıt işleminiz başarıyla tamamlandı! Yönlendiriliyorsunuz...';
                successMessage.style.display = 'block';
                    }

                // Ana sayfaya yönlendir
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 2000);
                    
                } catch (error) {
                    hideLoadingScreen();
                    
                    console.error('Signup error:', error);
                    
                    let errorMsg = 'Kayıt sırasında bir hata oluştu';
                    
                    // Firebase hata mesajlarını Türkçeleştir
                    if (error.code) {
                        switch(error.code) {
                            case 'auth/email-already-in-use':
                                errorMsg = 'Bu e-posta adresi zaten kullanılıyor. Lütfen giriş yapın veya farklı bir e-posta adresi kullanın.';
                                // E-posta inputunu vurgula
                                const emailInput = document.getElementById('email');
                                if (emailInput) {
                                    emailInput.focus();
                                    emailInput.style.borderColor = '#ff4d4d';
                                    emailInput.style.backgroundColor = 'rgba(255, 77, 77, 0.05)';
                                    setTimeout(() => {
                                        emailInput.style.borderColor = '';
                                        emailInput.style.backgroundColor = '';
                                    }, 3000);
                                }
                                
                                // Giriş sayfasına yönlendir butonu ekle
                                const loginRedirect = document.createElement('div');
                                loginRedirect.className = 'login-redirect';
                                loginRedirect.innerHTML = `
                                    <p>Bu e-posta adresi zaten kayıtlı. Giriş yapmak ister misiniz?</p>
                                    <a href="login.html" class="btn btn-primary">Giriş Yap</a>
                                `;
                                
                                // Varsa önceki redirect'i kaldır
                                const existingRedirect = document.querySelector('.login-redirect');
                                if (existingRedirect) {
                                    existingRedirect.remove();
                                }
                                
                                // Auth box'a ekle
                                const authBox = document.querySelector('.auth-box');
                                if (authBox) {
                                    authBox.appendChild(loginRedirect);
                                }
                                break;
                            case 'auth/invalid-email':
                                errorMsg = 'Geçersiz e-posta adresi';
                                break;
                            case 'auth/weak-password':
                                errorMsg = 'Şifre çok zayıf';
                                break;
                            default:
                                errorMsg = `Hata: ${error.message}`;
                        }
                    }
                    
                    if (errorMessage) {
                    errorMessage.textContent = errorMsg;
                    errorMessage.style.display = 'block';
                    }
                    
                    showNotification(errorMsg, 'error');
                }

            } catch (error) {
                console.error('Form işleme hatası:', error);
                showNotification('Bir hata oluştu: ' + error.message, 'error');
                
                const errorMessage = document.getElementById('errorMessage');
                if (errorMessage) {
                    errorMessage.textContent = 'Bir hata oluştu: ' + error.message;
                errorMessage.style.display = 'block';
                }
            }
        });
    }

    // Password toggle
    const setupPasswordToggle = (formElement) => {
        if (!formElement) return;
        
        const toggleButtons = formElement.querySelectorAll('.password-toggle');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const input = button.parentElement.querySelector('input');
                const icon = button.querySelector('i');
                
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
        });
    };
    
    // Password strength indicator
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        // Şifre gücü göstergesi
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            let strength = 0;
            
            // Strength calculation
            if (password.length >= 8) strength += 25;
            if (password.match(/[a-z]+/)) strength += 25;
            if (password.match(/[A-Z]+/)) strength += 25;
            if (password.match(/[0-9]+/) || password.match(/[^a-zA-Z0-9]+/)) strength += 25;
            
            // Update UI
            strengthBar.style.width = `${strength}%`;
            
            if (strength < 25) {
                strengthBar.style.backgroundColor = '#ff4d4d';
                strengthText.textContent = 'Çok Zayıf';
            } else if (strength < 50) {
                strengthBar.style.backgroundColor = '#ffaa00';
                strengthText.textContent = 'Zayıf';
            } else if (strength < 75) {
                strengthBar.style.backgroundColor = '#ffff00';
                strengthText.textContent = 'Orta';
            } else {
                strengthBar.style.backgroundColor = '#00cc00';
                strengthText.textContent = 'Güçlü';
            }
        });
    }
    
    // Initialize password toggles
    setupPasswordToggle(document.body);
    
    // Login form handling
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.querySelector('input[name="remember"]').checked;
            
            // Clear previous error messages
            errorMessage.style.display = 'none';
            successMessage.style.display = 'none';
            
            try {
                // Show loading screen
                showLoadingScreen();
                
                // Use userService to login with rememberMe option
                const user = await userService.login(email, password, rememberMe);
                
                console.log('User signed in successfully:', user);
                
                // Show success message
                successMessage.textContent = 'Giriş başarılı! Yönlendiriliyorsunuz...';
                successMessage.style.display = 'block';
                
                // Hide loading screen
                hideLoadingScreen();
                
                // Redirect to home page after a short delay
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 1500);
                
            } catch (error) {
                console.error('Login error:', error);
                
                // Hide loading screen
                hideLoadingScreen();
                
                // Show appropriate error message
                let errorMsg = 'Giriş yapılırken bir hata oluştu.';
                
                switch (error.code) {
                    case 'auth/invalid-email':
                        errorMsg = 'Geçersiz e-posta adresi.';
                        break;
                    case 'auth/user-disabled':
                        errorMsg = 'Bu hesap devre dışı bırakılmış.';
                        break;
                    case 'auth/user-not-found':
                        errorMsg = 'Bu e-posta adresiyle kayıtlı bir hesap bulunamadı.';
                        break;
                    case 'auth/wrong-password':
                        errorMsg = 'Hatalı şifre.';
                        break;
                    case 'auth/too-many-requests':
                        errorMsg = 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.';
                        break;
                }
                
                errorMessage.textContent = errorMsg;
                errorMessage.style.display = 'block';
            }
        });
    }
});

// Form validation
function validateForm() {
    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const passwordConfirm = document.getElementById('passwordConfirm');
    const birthDate = document.getElementById('birthDate');
    const zodiacSign = document.getElementById('zodiacSign');
    const terms = document.querySelector('input[name="terms"]');
    
    let isValid = true;
    let errors = [];
    
    // Username validation
    if (!username.value.trim()) {
        showError(username, 'Kullanıcı adı gereklidir');
        errors.push('Kullanıcı adı gereklidir');
        isValid = false;
    } else if (username.value.length < 3) {
        showError(username, 'Kullanıcı adı en az 3 karakter olmalıdır');
        errors.push('Kullanıcı adı en az 3 karakter olmalıdır');
        isValid = false;
    } else {
        showSuccess(username);
    }
    
    // Email validation
    if (!email.value.trim()) {
        showError(email, 'E-posta adresi gereklidir');
        errors.push('E-posta adresi gereklidir');
        isValid = false;
    } else if (!isValidEmail(email.value)) {
        showError(email, 'Geçerli bir e-posta adresi girin');
        errors.push('Geçerli bir e-posta adresi girin');
        isValid = false;
    } else {
        showSuccess(email);
    }

    // Password validation
    if (!password.value) {
        showError(password, 'Şifre gereklidir');
        errors.push('Şifre gereklidir');
        isValid = false;
    } else if (password.value.length < 8) {
        showError(password, 'Şifre en az 8 karakter olmalıdır');
        errors.push('Şifre en az 8 karakter olmalıdır');
        isValid = false;
    } else if (!isStrongPassword(password.value)) {
        showError(password, 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir');
        errors.push('Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir');
        isValid = false;
    } else {
        showSuccess(password);
    }

    // Password confirmation
    if (!passwordConfirm.value) {
        showError(passwordConfirm, 'Şifre tekrarı gereklidir');
        errors.push('Şifre tekrarı gereklidir');
        isValid = false;
    } else if (passwordConfirm.value !== password.value) {
        showError(passwordConfirm, 'Şifreler eşleşmiyor');
        errors.push('Şifreler eşleşmiyor');
        isValid = false;
    } else {
        showSuccess(passwordConfirm);
    }
    
    // Birth date validation
    if (!birthDate.value) {
        showError(birthDate, 'Doğum tarihi gereklidir');
        errors.push('Doğum tarihi gereklidir');
        isValid = false;
    } else if (!isValidDate(birthDate.value)) {
        showError(birthDate, 'Geçerli bir tarih girin');
        errors.push('Geçerli bir tarih girin');
        isValid = false;
    } else {
        showSuccess(birthDate);
    }

    // Zodiac sign validation
    if (!zodiacSign.value) {
        showError(zodiacSign, 'Burç seçimi gereklidir');
        errors.push('Burç seçimi gereklidir');
        isValid = false;
    } else {
        showSuccess(zodiacSign);
    }

    // Terms validation
    if (!terms.checked) {
        const termsLabel = terms.parentElement;
        termsLabel.classList.add('error');
        errors.push('Kullanım koşullarını kabul etmelisiniz');
        isValid = false;
    } else {
        const termsLabel = terms.parentElement;
        termsLabel.classList.remove('error');
    }
    
    if (!isValid) {
        console.log('Validasyon hataları:', errors);
        // Hataları ekranda göster
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = errors.join(', ');
            errorMessage.style.display = 'block';
            
            // 5 saniye sonra hata mesajını gizle
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 5000);
        }
        
        // Hataları bildirim olarak da göster
        showNotification('Lütfen form hatalarını düzeltin: ' + errors[0], 'error');
    }

    return isValid;
}

// Form error display
function showError(input, message) {
    const formGroup = input.parentElement.classList.contains('password-input') 
        ? input.parentElement.parentElement 
        : input.parentElement;
    
    formGroup.classList.add('error');
    
    const errorElement = formGroup.querySelector('.error-text') || document.createElement('small');
    errorElement.classList.add('error-text');
    errorElement.textContent = message;
    
    if (!formGroup.querySelector('.error-text')) {
        formGroup.appendChild(errorElement);
    }
}

// Form success display
function showSuccess(input) {
    const formGroup = input.parentElement.classList.contains('password-input') 
        ? input.parentElement.parentElement 
        : input.parentElement;
    
    formGroup.classList.remove('error');
    const errorElement = formGroup.querySelector('.error-text');
    if (errorElement) {
        errorElement.remove();
    }
}

// Email validation
function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Password strength validation
function isStrongPassword(password) {
    return /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
}

// Date validation
function isValidDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

// Notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Notification icon based on type
    let icon = 'fas fa-info-circle';
    if (type === 'success') icon = 'fas fa-check-circle';
    if (type === 'error') icon = 'fas fa-exclamation-circle';
    if (type === 'warning') icon = 'fas fa-exclamation-triangle';
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);

    // Force reflow
    notification.offsetHeight;
    notification.classList.add('show');
    
    // Close button functionality
    const closeNotificationButton = notification.querySelector('.notification-close');
    closeNotificationButton.addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // Auto close after 5 seconds
    setTimeout(() => {
        closeNotification(notification);
    }, 5000);
}

// Close notification function
function closeNotification(notification) {
    notification.classList.remove('show');
    
    // Remove from DOM after animation
    notification.addEventListener('transitionend', () => {
        notification.remove();
    });
}

// Burç değerini API formatına dönüştürme fonksiyonu
