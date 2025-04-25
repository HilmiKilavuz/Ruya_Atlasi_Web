document.addEventListener('DOMContentLoaded', () => {
    // Loading screen
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }, 1000);
    }

    // Form handling
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        // Password visibility toggle
        const passwordInput = document.getElementById('password');
        const toggleButton = document.querySelector('.password-toggle');
        
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                const type = passwordInput.getAttribute('type');
                passwordInput.setAttribute('type', type === 'password' ? 'text' : 'password');
                toggleButton.querySelector('i').className = 
                    type === 'password' ? 'fas fa-eye-slash' : 'fas fa-eye';
            });
        }

        // Form validation
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!validateForm()) {
                showNotification('Lütfen tüm alanları doğru şekilde doldurun.', 'error');
                return;
            }

            // Show loading state
            const submitButton = signupForm.querySelector('.auth-submit');
            submitButton.classList.add('loading');
            submitButton.disabled = true;

            try {
                // Simulated API call
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Success state
                showNotification('Üyeliğiniz başarıyla oluşturuldu!', 'success');
                
                // Redirect to home page after 2 seconds
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
                
            } catch (error) {
                showNotification('Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
                submitButton.classList.remove('loading');
                submitButton.disabled = false;
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