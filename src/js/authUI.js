// Import Firebase functions
import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// Firebase Auth State Observer
const handleAuthStateChange = (user) => {
    const authContainer = document.querySelector('.auth-container');
    
    if (!authContainer) return;
    
    if (user) {
        // User is signed in
        authContainer.innerHTML = `
            <div class="profile-button">
                <button class="btn btn-profile">
                    <i class="fas fa-user-circle"></i>
                    <span>${user.email.split('@')[0]}</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="profile-menu" id="profileMenu">
                    <a href="src/pages/profile.html" class="profile-menu-item">
                        <i class="fas fa-user"></i>
                        Profilim
                    </a>
                    <a href="src/pages/favorites.html" class="profile-menu-item">
                        <i class="fas fa-star"></i>
                        Favorilerim
                    </a>
                    <a href="src/pages/settings.html" class="profile-menu-item">
                        <i class="fas fa-cog"></i>
                        Ayarlar
                    </a>
                    <button class="profile-menu-item sign-out">
                        <i class="fas fa-sign-out-alt"></i>
                        Çıkış Yap
                    </button>
                </div>
            </div>
        `;

        // Add event listeners after adding the elements to DOM
        const profileButton = document.querySelector('.btn-profile');
        if (profileButton) {
            profileButton.addEventListener('click', toggleProfileMenu);
        }

        const signOutButton = document.querySelector('.sign-out');
        if (signOutButton) {
            signOutButton.addEventListener('click', handleSignOut);
        }

    } else {
        // User is signed out
        authContainer.innerHTML = `
            <div class="auth-buttons">
                <a href="src/pages/login.html" class="btn btn-login">
                    <i class="fas fa-user"></i>
                    Giriş Yap
                </a>
                <a href="src/pages/signup.html" class="btn btn-signup">
                    <i class="fas fa-user-plus"></i>
                    Üye Ol
                </a>
            </div>
        `;
    }
};

// Toggle Profile Menu
const toggleProfileMenu = () => {
    const profileMenu = document.getElementById('profileMenu');
    if (profileMenu) {
        profileMenu.classList.toggle('show');
    }
};

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const profileButton = document.querySelector('.profile-button');
    const profileMenu = document.getElementById('profileMenu');
    if (profileButton && profileMenu && !profileButton.contains(e.target)) {
        profileMenu.classList.remove('show');
    }
});

// Handle Sign Out
const handleSignOut = async () => {
    try {
        await signOut(auth);
        window.location.href = '/';
    } catch (error) {
        console.error('Error signing out:', error);
    }
};

// Initialize Auth State Observer
onAuthStateChanged(auth, handleAuthStateChange);

// UI elementleri
const profileButton = document.getElementById('profileButton');
const loginButton = document.getElementById('loginButton');
const signupButton = document.getElementById('signupButton');

// Auth durumunu dinle
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Kullanıcı giriş yapmış
        profileButton.style.display = 'inline-flex';
        loginButton.style.display = 'none';
        signupButton.style.display = 'none';
    } else {
        // Kullanıcı giriş yapmamış
        profileButton.style.display = 'none';
        loginButton.style.display = 'inline-flex';
        signupButton.style.display = 'inline-flex';
    }
}); 