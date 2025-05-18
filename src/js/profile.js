import { auth } from './firebase-config.js';
import { onAuthStateChanged, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase-config.js';

// Node.js Sunucu API URL
const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Profile.js yükleniyor...');
    
    // Form ve düğme elementlerini seç
    const profileForm = document.getElementById('profileForm');
    const displayNameElement = document.getElementById('displayName');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const birthDateInput = document.getElementById('birthDate');
    const zodiacSignSelect = document.getElementById('zodiacSign');
    const bioInput = document.getElementById('bio');
    
    const editToggleBtn = document.getElementById('editToggle');
    const cancelEditBtn = document.getElementById('cancelEdit');
    const formActions = document.querySelector('.form-actions');
    
    // İstatistik elementleri
    const dreamCountElement = document.getElementById('dreamCount');
    const commentCountElement = document.getElementById('commentCount');
    const favoriteCountElement = document.getElementById('favoriteCount');
    
    // Kullanıcı oturum durumunu izle
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log('Kullanıcı giriş yapmış:', user);
            
            // Firebase'den kullanıcı verilerini al
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    console.log('Kullanıcı verileri:', userData);
                    
                    // Kullanıcı bilgilerini forma doldur
                    fillProfileForm(user, userData);
                    
                    // İstatistikleri güncelle
                    updateStats(userData);
                } else {
                    console.warn('Kullanıcı belgesi bulunamadı');
                }
            } catch (error) {
                console.error('Kullanıcı verileri alınırken hata:', error);
            }
        } else {
            console.log('Kullanıcı giriş yapmamış');
            // Kullanıcı giriş yapmamışsa giriş sayfasına yönlendir
            window.location.href = 'login.html';
        }
    });
    
    // Düzenle butonuna tıklandığında
    if (editToggleBtn) {
        editToggleBtn.addEventListener('click', () => {
            enableFormEditing();
        });
    }
    
    // İptal butonuna tıklandığında
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            disableFormEditing();
            // Formu tekrar Firebase'den alınan verilerle doldur
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        fillProfileForm(user, userDoc.data());
                    }
                }
            });
        });
    }
    
    // Form gönderildiğinde
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const currentUser = auth.currentUser;
            if (!currentUser) return;
            
            try {
                // Kullanıcı profil bilgilerini güncelle
                const updatedData = {
                    username: usernameInput.value,
                    phone: phoneInput.value,
                    birthDate: birthDateInput.value,
                    zodiacSign: zodiacSignSelect.value,
                    bio: bioInput.value,
                    updatedAt: new Date().toISOString()
                };
                
                // Firebase Auth'da displayName güncelle
                await updateProfile(currentUser, {
                    displayName: usernameInput.value
                });
                
                // Firestore'da kullanıcı dokümanını güncelle
                await updateDoc(doc(db, 'users', currentUser.uid), updatedData);
                
                console.log('Profil başarıyla güncellendi');
                alert('Profil bilgileriniz başarıyla güncellendi.');
                
                // Düzenleme modunu kapat
                disableFormEditing();
            } catch (error) {
                console.error('Profil güncellenirken hata:', error);
                alert('Profil güncellenirken bir hata oluştu: ' + error.message);
            }
        });
    }
    
    // Şifre değiştirme modalını aç
    const passwordItems = document.querySelectorAll('.settings-item');
    if (passwordItems.length > 0) {
        passwordItems[0].addEventListener('click', (e) => {
            e.preventDefault();
            const passwordModal = document.getElementById('passwordModal');
            const resetEmailDisplay = document.getElementById('resetEmailDisplay');
            
            if (passwordModal) {
                // E-posta adresini göster
                if (resetEmailDisplay && auth.currentUser) {
                    resetEmailDisplay.textContent = auth.currentUser.email;
                }
                
                // Adım 1'i göster, diğer adımları gizle
                showPasswordStep(1);
                
                passwordModal.classList.add('show');
            }
        });
    }
    
    // Modalı kapat
    const closeButtons = document.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
                // Şifre değiştirme formunu sıfırla
                resetPasswordForm();
            }
        });
    });
    
    // Doğrulama Kodu Gönder butonuna tıklama
    const sendVerificationBtn = document.getElementById('sendVerificationBtn');
    if (sendVerificationBtn) {
        sendVerificationBtn.addEventListener('click', async () => {
            const currentPassword = document.getElementById('currentPassword').value;
            if (!currentPassword) {
                alert('Lütfen mevcut şifrenizi girin.');
                return;
            }
            
            const currentUser = auth.currentUser;
            if (!currentUser) {
                alert('Oturum açmış bir kullanıcı bulunamadı.');
                return;
            }
            
            try {
                // Mevcut şifreyle yeniden kimlik doğrulama
                const credential = EmailAuthProvider.credential(
                    currentUser.email, 
                    currentPassword
                );
                
                await reauthenticateWithCredential(currentUser, credential);
                
                // Doğrulama kodu gönder
                sendVerificationBtn.disabled = true;
                sendVerificationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';
                
                try {
                    const response = await fetch(`${API_URL}/send-password-reset-code`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: currentUser.email
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        // Adım 2'ye geçiş (Doğrulama kodu girişi)
                        showPasswordStep(2);
                        alert('Doğrulama kodu e-posta adresinize gönderildi.');
                    } else {
                        throw new Error(data.error || 'Doğrulama kodu gönderilirken bir hata oluştu.');
                    }
                } catch (error) {
                    console.error('Doğrulama kodu gönderilirken hata:', error);
                    alert('Doğrulama kodu gönderilirken bir hata oluştu: ' + error.message);
                    sendVerificationBtn.disabled = false;
                    sendVerificationBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Doğrulama Kodu Gönder';
                }
            } catch (error) {
                console.error('Kimlik doğrulama hatası:', error);
                
                if (error.code === 'auth/wrong-password') {
                    alert('Girdiğiniz şifre yanlış. Lütfen tekrar deneyin.');
                } else {
                    alert('Kimlik doğrulama hatası: ' + error.message);
                }
            }
        });
    }
    
    // Kodu tekrar gönder butonuna tıklama
    const resendCodeBtn = document.getElementById('resendCodeBtn');
    if (resendCodeBtn) {
        resendCodeBtn.addEventListener('click', async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) return;
            
            resendCodeBtn.disabled = true;
            resendCodeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';
            
            try {
                const response = await fetch(`${API_URL}/send-password-reset-code`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: currentUser.email
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Doğrulama kodu tekrar gönderildi.');
                } else {
                    throw new Error(data.error || 'Doğrulama kodu gönderilirken bir hata oluştu.');
                }
            } catch (error) {
                console.error('Doğrulama kodu gönderilirken hata:', error);
                alert('Doğrulama kodu gönderilirken bir hata oluştu: ' + error.message);
            } finally {
                setTimeout(() => {
                    resendCodeBtn.disabled = false;
                    resendCodeBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Kodu Tekrar Gönder';
                }, 30000); // 30 saniye bekletme
            }
        });
    }
    
    // Kodu doğrula butonuna tıklama
    const verifyCodeBtn = document.getElementById('verifyCodeBtn');
    if (verifyCodeBtn) {
        verifyCodeBtn.addEventListener('click', async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) return;
            
            const verificationCode = document.getElementById('verificationCode').value;
            if (!verificationCode) {
                alert('Lütfen doğrulama kodunu girin.');
                return;
            }
            
            verifyCodeBtn.disabled = true;
            verifyCodeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Doğrulanıyor...';
            
            try {
                const response = await fetch(`${API_URL}/verify-code`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: currentUser.email,
                        code: verificationCode
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Adım 3'e geçiş (Yeni şifre girişi)
                    showPasswordStep(3);
                } else {
                    if (data.expired) {
                        alert('Doğrulama kodunun süresi dolmuş. Lütfen yeni bir kod isteyin.');
                    } else if (data.invalid) {
                        alert('Doğrulama kodu yanlış. Lütfen tekrar deneyin.');
                    } else {
                        throw new Error(data.error || 'Doğrulama kodu kontrolünde bir hata oluştu.');
                    }
                    verifyCodeBtn.disabled = false;
                    verifyCodeBtn.innerHTML = '<i class="fas fa-check"></i> Kodu Doğrula';
                }
            } catch (error) {
                console.error('Doğrulama kodu kontrolünde hata:', error);
                alert('Doğrulama kodu kontrolünde bir hata oluştu: ' + error.message);
                verifyCodeBtn.disabled = false;
                verifyCodeBtn.innerHTML = '<i class="fas fa-check"></i> Kodu Doğrula';
            }
        });
    }
    
    // Şifre değiştirme formu
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const currentUser = auth.currentUser;
            if (!currentUser) {
                alert('Oturum açmış bir kullanıcı bulunamadı.');
                return;
            }
            
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validate passwords
            if (newPassword !== confirmPassword) {
                alert('Yeni şifreler eşleşmiyor. Lütfen tekrar deneyin.');
                return;
            }
            
            if (newPassword.length < 6) {
                alert('Şifre en az 6 karakter uzunluğunda olmalıdır.');
                return;
            }
            
            const submitButton = passwordForm.querySelector('[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Güncelleniyor...';
            
            try {
                // Update password
                await updatePassword(currentUser, newPassword);
                
                // Success message
                alert('Şifreniz başarıyla güncellendi.');
                
                // Close modal and clear form
                const passwordModal = document.getElementById('passwordModal');
                if (passwordModal) {
                    passwordModal.classList.remove('show');
                    resetPasswordForm();
                }
            } catch (error) {
                console.error('Şifre güncellenirken hata:', error);
                
                let errorMessage = 'Şifre güncellenirken bir hata oluştu.';
                
                // Customize error message
                switch (error.code) {
                    case 'auth/weak-password':
                        errorMessage = 'Yeni şifreniz çok zayıf. Daha güçlü bir şifre seçin.';
                        break;
                    case 'auth/requires-recent-login':
                        errorMessage = 'Bu işlem için yeniden giriş yapmanız gerekiyor. Lütfen çıkış yapıp tekrar giriş yapın.';
                        break;
                    default:
                        errorMessage = `Hata: ${error.message}`;
                }
                
                alert(errorMessage);
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-key"></i> Şifreyi Güncelle';
            }
        });
    }
    
    // Password strength indicator
    const newPasswordInput = document.getElementById('newPassword');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    if (newPasswordInput && strengthBar && strengthText) {
        newPasswordInput.addEventListener('input', () => {
            const password = newPasswordInput.value;
            const strength = checkPasswordStrength(password);
            
            // Update strength indicator
            strengthBar.className = 'strength-bar';
            if (password.length > 0) {
                strengthBar.classList.add(strength.level);
                strengthText.textContent = strength.message;
            } else {
                strengthText.textContent = '';
            }
        });
    }
    
    // Toggle password visibility
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const input = button.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            button.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    });
});

// Helper fonksiyonlar
function fillProfileForm(user, userData) {
    const displayNameElement = document.getElementById('displayName');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const birthDateInput = document.getElementById('birthDate');
    const zodiacSignSelect = document.getElementById('zodiacSign');
    const bioInput = document.getElementById('bio');
    
    if (displayNameElement) {
        displayNameElement.textContent = user.displayName || userData.username || 'Kullanıcı';
    }
    
    if (usernameInput) {
        usernameInput.value = userData.username || user.displayName || '';
    }
    
    if (emailInput) {
        emailInput.value = user.email || '';
    }
    
    if (phoneInput) {
        phoneInput.value = userData.phone || '';
    }
    
    if (birthDateInput) {
        birthDateInput.value = userData.birthDate || '';
    }
    
    if (zodiacSignSelect) {
        zodiacSignSelect.value = userData.zodiacSign || '';
    }
    
    if (bioInput) {
        bioInput.value = userData.bio || '';
    }
}

function updateStats(userData) {
    const dreamCountElement = document.getElementById('dreamCount');
    const favoriteCountElement = document.getElementById('favoriteCount');
    
    // Kullanıcının oturum durumunu kontrol et
    if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        
        // Kaydedilen rüyaların sayısını Firestore'dan al
        if (dreamCountElement) {
            import('../js/dream-service.js').then(({ getUserDreams }) => {
                getUserDreams(userId).then(result => {
                    if (result.success) {
                        dreamCountElement.textContent = result.dreams.length;
                    } else {
                        dreamCountElement.textContent = "0";
                    }
                }).catch(error => {
                    console.error('Rüya sayısı alınırken hata:', error);
                    dreamCountElement.textContent = "0";
                });
            });
        }
        
        // Favori rüyaların sayısını Firestore'dan al
        if (favoriteCountElement) {
            import('../js/dream-service.js').then(({ getFavoriteDreams }) => {
                getFavoriteDreams(userId).then(result => {
                    if (result.success) {
                        favoriteCountElement.textContent = result.dreams.length;
                    } else {
                        favoriteCountElement.textContent = "0";
                    }
                }).catch(error => {
                    console.error('Favori rüya sayısı alınırken hata:', error);
                    favoriteCountElement.textContent = "0";
                });
            });
        }
    } else {
        // Kullanıcı oturum açmamışsa 0 göster
        if (dreamCountElement) dreamCountElement.textContent = "0";
        if (favoriteCountElement) favoriteCountElement.textContent = "0";
    }
}

function enableFormEditing() {
    const inputs = document.querySelectorAll('#profileForm input, #profileForm select, #profileForm textarea');
    inputs.forEach(input => {
        if (input.id !== 'email') { // Email'i düzenlemeye izin verme
            input.disabled = false;
        }
    });
    
    document.querySelector('.form-actions').style.display = 'flex';
    document.getElementById('editToggle').style.display = 'none';
}

function disableFormEditing() {
    const inputs = document.querySelectorAll('#profileForm input, #profileForm select, #profileForm textarea');
    inputs.forEach(input => {
        input.disabled = true;
    });
    
    document.querySelector('.form-actions').style.display = 'none';
    document.getElementById('editToggle').style.display = 'inline-flex';
}

// Şifre modalını kapatma fonksiyonu
window.closePasswordModal = function() {
    const passwordModal = document.getElementById('passwordModal');
    if (passwordModal) {
        passwordModal.classList.remove('show');
        resetPasswordForm();
    }
};

// Şifre formunu sıfırlama fonksiyonu
function resetPasswordForm() {
    document.getElementById('passwordForm').reset();
    showPasswordStep(1);
    
    // Butonları sıfırla
    const sendVerificationBtn = document.getElementById('sendVerificationBtn');
    const verifyCodeBtn = document.getElementById('verifyCodeBtn');
    const resendCodeBtn = document.getElementById('resendCodeBtn');
    
    if (sendVerificationBtn) {
        sendVerificationBtn.disabled = false;
        sendVerificationBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Doğrulama Kodu Gönder';
    }
    
    if (verifyCodeBtn) {
        verifyCodeBtn.disabled = false;
        verifyCodeBtn.innerHTML = '<i class="fas fa-check"></i> Kodu Doğrula';
    }
    
    if (resendCodeBtn) {
        resendCodeBtn.disabled = false;
        resendCodeBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Kodu Tekrar Gönder';
    }
}

// Şifre değiştirme adımlarını gösterme fonksiyonu
function showPasswordStep(step) {
    const steps = document.querySelectorAll('.password-step');
    steps.forEach((s, index) => {
        if (index + 1 === step) {
            s.classList.add('active');
        } else {
            s.classList.remove('active');
        }
    });
}

// Şifre gücünü kontrol eden fonksiyon
function checkPasswordStrength(password) {
    if (password.length === 0) {
        return { level: '', message: '' };
    }
    
    // Basit şifre gücü kontrolü
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strength = 
        (password.length >= 8 ? 1 : 0) +
        (hasLowerCase ? 1 : 0) +
        (hasUpperCase ? 1 : 0) +
        (hasNumbers ? 1 : 0) +
        (hasSpecialChars ? 1 : 0);
    
    if (strength < 3) {
        return { level: 'weak', message: 'Zayıf: Daha uzun bir şifre ve farklı karakter türleri kullanın.' };
    } else if (strength < 5) {
        return { level: 'medium', message: 'Orta: İyi bir şifre, ama daha da güçlendirebilirsiniz.' };
    } else {
        return { level: 'strong', message: 'Güçlü: Mükemmel bir şifre!' };
    }
} 