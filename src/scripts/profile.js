import { auth } from '../js/firebase-config.js';
import { getFirestore, doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { onAuthStateChanged, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const db = getFirestore();
    
    // Form ve buton elementleri
    const profileForm = document.getElementById('profileForm');
    const editToggle = document.getElementById('editToggle');
    const cancelEdit = document.getElementById('cancelEdit');
    const formActions = document.querySelector('.form-actions');
    
    // Form input elementleri
    const formInputs = profileForm.querySelectorAll('input, select, textarea');
    const displayName = document.getElementById('displayName');
    
    let currentUser = null;
    let originalFormData = {};

    // Auth durumunu kontrol et
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            await loadUserProfile();
        } else {
            window.location.href = '../../index.html';
        }
    });

    // Kullanıcı profilini yükle
    async function loadUserProfile() {
        try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                
                // Form alanlarını doldur
                Object.keys(userData).forEach(key => {
                    const input = profileForm.elements[key];
                    if (input) {
                        input.value = userData[key];
                        if (key === 'fullName') {
                            displayName.textContent = userData[key];
                        }
                    }
                });

                // İstatistikleri güncelle
                updateStats(userData.stats || {
                    dreamCount: 0,
                    commentCount: 0,
                    favoriteCount: 0
                });

                // Orijinal form verilerini sakla
                saveOriginalFormData();
            }
        } catch (error) {
            console.error('Profil yüklenirken hata:', error);
            showNotification('Profil bilgileri yüklenemedi', 'error');
        }
    }

    // Düzenleme modunu aç/kapat
    editToggle.addEventListener('click', () => {
        const isEditing = formInputs[0].disabled === false;
        toggleEditMode(!isEditing);
    });

    // Düzenlemeyi iptal et
    cancelEdit.addEventListener('click', () => {
        toggleEditMode(false);
        restoreOriginalFormData();
    });

    // Form gönderimi
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const formData = new FormData(profileForm);
            const userData = Object.fromEntries(formData.entries());
            
            // Firestore'da kullanıcı bilgilerini güncelle
            await updateDoc(doc(db, 'users', currentUser.uid), userData);
            
            // Görünen ismi güncelle
            displayName.textContent = userData.fullName;
            
            // Düzenleme modunu kapat
            toggleEditMode(false);
            
            // Orijinal form verilerini güncelle
            saveOriginalFormData();
            
            showNotification('Profil bilgileri güncellendi', 'success');
        } catch (error) {
            console.error('Profil güncellenirken hata:', error);
            showNotification('Profil güncellenemedi', 'error');
        }
    });

    // Düzenleme modunu değiştir
    function toggleEditMode(enabled) {
        formInputs.forEach(input => {
            input.disabled = !enabled;
        });
        formActions.style.display = enabled ? 'flex' : 'none';
        editToggle.innerHTML = enabled ? 
            '<i class="fas fa-times"></i> İptal' : 
            '<i class="fas fa-edit"></i> Düzenle';
    }

    // Orijinal form verilerini sakla
    function saveOriginalFormData() {
        formInputs.forEach(input => {
            originalFormData[input.name] = input.value;
        });
    }

    // Orijinal form verilerini geri yükle
    function restoreOriginalFormData() {
        Object.keys(originalFormData).forEach(key => {
            const input = profileForm.elements[key];
            if (input) {
                input.value = originalFormData[key];
            }
        });
    }

    // İstatistikleri güncelle
    function updateStats(stats) {
        document.getElementById('dreamCount').textContent = stats.dreamCount || 0;
        document.getElementById('commentCount').textContent = stats.commentCount || 0;
        document.getElementById('favoriteCount').textContent = stats.favoriteCount || 0;
    }

    // Şifre değiştirme modalı için event listener'lar
    const changePasswordLink = document.querySelector('.settings-item');
    const modal = document.getElementById('passwordModal');
    const closeButton = modal.querySelector('.close-button');
    const passwordForm = document.getElementById('passwordForm');
    const toggleButtons = document.querySelectorAll('.toggle-password');
    const newPasswordInput = document.getElementById('newPassword');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    changePasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        openPasswordModal();
    });

    closeButton.addEventListener('click', closePasswordModal);

    // Şifre göster/gizle
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

    // Şifre gücü kontrolü
    newPasswordInput.addEventListener('input', checkPasswordStrength);

    // Şifre değiştirme formu gönderimi
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Şifre doğrulama
        if (newPassword !== confirmPassword) {
            showNotification('Yeni şifreler eşleşmiyor', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showNotification('Şifre en az 6 karakter olmalıdır', 'error');
            return;
        }

        try {
            // Kullanıcıyı yeniden doğrula
            const credential = EmailAuthProvider.credential(
                currentUser.email,
                currentPassword
            );
            
            await reauthenticateWithCredential(currentUser, credential);
            
            // Şifreyi güncelle
            await updatePassword(currentUser, newPassword);
            
            showNotification('Şifreniz başarıyla güncellendi', 'success');
            closePasswordModal();
            passwordForm.reset();
        } catch (error) {
            console.error('Şifre değiştirme hatası:', error);
            let errorMessage = 'Şifre değiştirilemedi';
            
            if (error.code === 'auth/wrong-password') {
                errorMessage = 'Mevcut şifreniz yanlış';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Yeni şifreniz çok zayıf';
            }
            
            showNotification(errorMessage, 'error');
        }
    });
});

// Şifre gücünü kontrol et
function checkPasswordStrength(event) {
    const password = event.target.value;
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    // Şifre gücü kriterleri
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const length = password.length;

    let strength = 0;
    let strengthLabel = '';

    if (length >= 8) strength++;
    if (hasLower && hasUpper) strength++;
    if (hasNumber) strength++;
    if (hasSpecial) strength++;

    strengthBar.classList.remove('weak', 'medium', 'strong');

    if (password === '') {
        strengthBar.style.width = '0';
        strengthText.textContent = '';
    } else if (strength <= 2) {
        strengthBar.classList.add('weak');
        strengthLabel = 'Zayıf';
    } else if (strength === 3) {
        strengthBar.classList.add('medium');
        strengthLabel = 'Orta';
    } else {
        strengthBar.classList.add('strong');
        strengthLabel = 'Güçlü';
    }

    strengthText.textContent = strengthLabel;
}

// Modal fonksiyonları
function openPasswordModal() {
    const modal = document.getElementById('passwordModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closePasswordModal() {
    const modal = document.getElementById('passwordModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
    document.getElementById('passwordForm').reset();
    document.querySelector('.strength-bar').classList.remove('weak', 'medium', 'strong');
    document.querySelector('.strength-text').textContent = '';
}

// Bildirim gösterme fonksiyonu
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Stil tanımlamaları
    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '12px 24px',
        borderRadius: '8px',
        animation: 'slideIn 0.3s ease-out',
        zIndex: 1000
    });
    
    document.body.appendChild(notification);
    
    // CSS animasyonu ekle
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    // 3 saniye sonra bildirimi kaldır
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
} 