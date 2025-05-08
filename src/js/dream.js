import { auth } from './firebase-config';
import { saveDream, getUserDreams } from './dream-service';
import { onAuthChange } from './auth-service';

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

    // Form elements
    const dreamForm = document.getElementById('dreamForm');
    const dreamContent = document.getElementById('dreamContent');
    const currentCount = document.getElementById('currentCount');
    const maxCount = document.getElementById('maxCount');
    const resultSection = document.querySelector('.dream-result-section');
    const newDreamButton = document.querySelector('.new-dream-button');

    // Auth state listener
    let currentUser = null;
    onAuthChange((user) => {
        currentUser = user;
        updateUIForAuthState(user);
    });

    // Character counter
    if (dreamContent && currentCount && maxCount) {
        const maxLength = 1000;
        maxCount.textContent = maxLength;

        dreamContent.addEventListener('input', () => {
            const length = dreamContent.value.length;
            currentCount.textContent = length;

            if (length > maxLength) {
                dreamContent.value = dreamContent.value.substring(0, maxLength);
                currentCount.textContent = maxLength;
            }
        });
    }

    // Form submission
    if (dreamForm) {
        dreamForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!currentUser) {
                alert('Lütfen önce giriş yapın.');
                return;
            }

            // Get form data
            const formData = new FormData(dreamForm);
            const dreamData = {
                title: formData.get('dreamTitle'),
                date: formData.get('dreamDate'),
                content: formData.get('dreamContent'),
                mood: formData.get('dreamMood'),
                interpretation: '', // AI yorumu eklenecek
                tags: [], // AI tarafından belirlenecek
                isPublic: false
            };

            // Hide form and show result section
            dreamForm.closest('.dream-input-section').style.display = 'none';
            resultSection.style.display = 'block';

            // Update result section with dream details
            document.querySelector('.dream-title').textContent = dreamData.title;
            document.querySelector('.dream-date').textContent = new Date(dreamData.date)
                .toLocaleDateString('tr-TR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            document.querySelector('.original-dream').textContent = dreamData.content;

            try {
                // Simulate AI interpretation (to be replaced with actual AI call)
                const interpretation = "Bu rüya, içsel dönüşüm ve kişisel gelişim sürecinizi yansıtıyor. " +
                    "Rüyanızdaki semboller, hayatınızdaki değişimlere hazır olduğunuzu gösteriyor. " +
                    "Önünüzdeki dönemde yeni fırsatlarla karşılaşabilirsiniz.";
                const tags = ['Dönüşüm', 'Kişisel Gelişim', 'Yeni Başlangıçlar'];

                // Update dreamData with AI results
                dreamData.interpretation = interpretation;
                dreamData.tags = tags;

                // Save to Firebase
                const result = await saveDream(currentUser.uid, dreamData);
                if (!result.success) {
                    throw new Error(result.error);
                }

                // Update UI
                document.querySelector('.loading-interpretation').style.display = 'none';
                document.querySelector('.interpretation').textContent = interpretation;

                // Add tags
                const tagsContainer = document.querySelector('.tags-container');
                tagsContainer.innerHTML = '';
                tags.forEach(tag => {
                    const tagElement = document.createElement('span');
                    tagElement.className = 'dream-tag';
                    tagElement.textContent = tag;
                    tagsContainer.appendChild(tagElement);
                });

            } catch (error) {
                console.error('Rüya kaydetme hatası:', error);
                alert('Rüyanız kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
            }
        });
    }

    // New dream button
    if (newDreamButton) {
        newDreamButton.addEventListener('click', () => {
            // Reset form
            dreamForm.reset();
            currentCount.textContent = '0';

            // Show form and hide result section
            dreamForm.closest('.dream-input-section').style.display = 'block';
            resultSection.style.display = 'none';

            // Clear tags
            document.querySelector('.tags-container').innerHTML = '';
        });
    }

    // Action buttons
    const saveButton = document.querySelector('.save-button');
    const shareButton = document.querySelector('.share-button');

    if (saveButton) {
        saveButton.addEventListener('click', async () => {
            if (!currentUser) {
                alert('Lütfen önce giriş yapın.');
                return;
            }

            try {
                const dreamId = saveButton.dataset.dreamId;
                if (dreamId) {
                    await updateDream(dreamId, { isPublic: false });
                    alert('Rüyanız başarıyla kaydedildi!');
                }
            } catch (error) {
                console.error('Kaydetme hatası:', error);
                alert('Rüyanız kaydedilirken bir hata oluştu.');
            }
        });
    }

    if (shareButton) {
        shareButton.addEventListener('click', async () => {
            if (!currentUser) {
                alert('Lütfen önce giriş yapın.');
                return;
            }

            try {
                const dreamId = shareButton.dataset.dreamId;
                if (dreamId) {
                    await updateDream(dreamId, { isPublic: true });
                    alert('Rüyanız başarıyla paylaşıldı!');
                }
            } catch (error) {
                console.error('Paylaşma hatası:', error);
                alert('Rüyanız paylaşılırken bir hata oluştu.');
            }
        });
    }
});

// UI güncelleme fonksiyonu
function updateUIForAuthState(user) {
    const authButtons = document.querySelector('.auth-buttons');
    const dreamForm = document.getElementById('dreamForm');
    
    if (user) {
        // Kullanıcı giriş yapmış
        if (authButtons) {
            authButtons.innerHTML = `
                <span class="user-email">${user.email}</span>
                <button class="btn btn-logout">Çıkış Yap</button>
            `;
            
            const logoutButton = authButtons.querySelector('.btn-logout');
            logoutButton.addEventListener('click', async () => {
                try {
                    await auth.signOut();
                } catch (error) {
                    console.error('Çıkış hatası:', error);
                    alert('Çıkış yapılırken bir hata oluştu.');
                }
            });
        }
        
        if (dreamForm) {
            dreamForm.style.display = 'block';
        }
    } else {
        // Kullanıcı giriş yapmamış
        if (authButtons) {
            authButtons.innerHTML = `
                <a href="login.html" class="btn btn-login">
                    <i class="fas fa-user"></i>
                    Giriş Yap
                </a>
                <a href="signup.html" class="btn btn-signup">
                    <i class="fas fa-user-plus"></i>
                    Üye Ol
                </a>
            `;
        }
        
        if (dreamForm) {
            dreamForm.style.display = 'none';
        }
    }
} 