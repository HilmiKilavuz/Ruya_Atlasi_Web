// Rüya Yorumlama Sayfası JavaScript
document.addEventListener('DOMContentLoaded', () => {
    console.log('Rüya yorumlama sayfası yüklendi.');

    // Elementleri seç
    const dreamTextarea = document.getElementById('dreamText');
    const tagInput = document.getElementById('tagInput');
    const addTagButton = document.getElementById('addTagButton');
    const selectedTagsContainer = document.getElementById('selectedTags');
    const interpretButton = document.getElementById('interpretButton');
    const interpretationResult = document.getElementById('interpretationResult');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultContent = document.getElementById('resultContent');
    const saveInterpretationButton = document.getElementById('saveInterpretation');
    const shareInterpretationButton = document.getElementById('shareInterpretation');
    const newInterpretationButton = document.getElementById('newInterpretation');

    // Etiket ekleme fonksiyonu
    const addTag = () => {
        const tagText = tagInput.value.trim();
        if (tagText === '') return;

        // Aynı etiketi tekrar eklemeyi önle
        const existingTags = Array.from(selectedTagsContainer.querySelectorAll('.tag-text')).map(tag => tag.textContent);
        if (existingTags.includes(tagText)) {
            tagInput.value = '';
            return;
        }

        // Yeni etiket oluştur
        const tagElement = document.createElement('div');
        tagElement.className = 'tag';
        tagElement.innerHTML = `
            <span class="tag-text">${tagText}</span>
            <button class="remove-tag" aria-label="Etiketi kaldır">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Etiket kaldırma butonuna olay dinleyicisi ekle
        const removeButton = tagElement.querySelector('.remove-tag');
        removeButton.addEventListener('click', () => {
            selectedTagsContainer.removeChild(tagElement);
        });

        // Etiketi container'a ekle
        selectedTagsContainer.appendChild(tagElement);
        
        // Input'u temizle
        tagInput.value = '';
        tagInput.focus();
    };

    // Tüm etiketleri getirme fonksiyonu
    const getAllTags = () => {
        return Array.from(selectedTagsContainer.querySelectorAll('.tag-text')).map(tag => tag.textContent);
    };

    // Etiket ekle butonu için olay dinleyicisi
    if (addTagButton) {
        addTagButton.addEventListener('click', addTag);
    }

    // Tag input için enter tuşu dinleyicisi
    if (tagInput) {
        tagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
            }
        });
    }

    // Rüya yorumlama fonksiyonu
    const interpretDream = async () => {
        const dreamText = dreamTextarea.value.trim();
        const tags = getAllTags();

        // Input doğrulama
        if (dreamText === '') {
            showNotification('Lütfen rüyanızı yazın', 'error');
            return;
        }

        // Yükleniyor durumunu göster
        interpretationResult.style.display = 'block';
        loadingIndicator.style.display = 'flex';
        resultContent.style.display = 'none';
        interpretButton.disabled = true;

        try {
            // Yapay zeka API'sine istek gönder
            const interpretation = await requestAiInterpretation(dreamText, tags);
            
            // Sonucu göster
            displayInterpretation(interpretation);
        } catch (error) {
            console.error('Rüya yorumlama hatası:', error);
            showNotification('Rüya yorumlanırken bir hata oluştu. Lütfen tekrar deneyin.', 'error');
            
            // Hata durumunda görünümü sıfırla
            interpretationResult.style.display = 'none';
            interpretButton.disabled = false;
        }
    };

    // Yapay zeka API isteği gönderme fonksiyonu
    const requestAiInterpretation = async (dreamText, tags) => {
        // API URL - Arkadaşınızın yapay zeka API'si ile değiştirin
        const apiUrl = 'https://api.example.com/dream-interpretation';
        
        // İstek için veri hazırla
        const requestData = {
            dream: dreamText,
            tags: tags,
            language: 'tr' // İsteğe bağlı: dil tercihi
        };

        try {
            // TODO: Gerçek API entegrasyonu için aşağıdaki fetch kodu kullanılabilir
            // const response = await fetch(apiUrl, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': 'Bearer YOUR_API_KEY' // Gerekirse API anahtarı
            //     },
            //     body: JSON.stringify(requestData)
            // });
            
            // if (!response.ok) {
            //     throw new Error(`API hatası: ${response.status}`);
            // }
            
            // return await response.json();

            // Geçici olarak test için sahte bir yanıt döndür
            // Arkadaşınızın API'si entegre edildiğinde bu kısmı kaldırın
            await new Promise(resolve => setTimeout(resolve, 2000)); // Yapay gecikme
            
            return {
                general: 'Rüyanızda görünen semboller, bilinçaltınızdaki duygusal durumunuzu ve düşüncelerinizi yansıtmaktadır. Bu rüya, hayatınızdaki değişimleri ve dönüşümleri simgeliyor olabilir.',
                sections: [
                    {
                        title: 'Psikolojik Analiz',
                        content: 'Bu rüya, içsel çatışmalarınızı ve duygusal durumunuzu yansıtmaktadır. Rüyanızda görünen semboller, günlük hayatınızdaki stres faktörleri veya çözülmemiş duygusal meselelerle ilişkili olabilir.'
                    },
                    {
                        title: 'Sembolik Anlamlar',
                        content: 'Rüyanızda yer alan her sembol, bilinçaltınızın bir mesajını taşır. Bu semboller, hayatınızdaki belirli durumları veya duygusal bağlantıları temsil edebilir.'
                    },
                    {
                        title: 'Gelecekle İlgili İpuçları',
                        content: 'Bu rüya, gelecekte karşılaşabileceğiniz durumları öngörmekten ziyade, mevcut durumunuzun ve düşüncelerinizin bir yansıması olabilir. Rüyanın mesajlarını dikkate alarak, hayatınızda daha bilinçli kararlar verebilirsiniz.'
                    }
                ],
                keywords: [...tags, 'bilinçaltı', 'dönüşüm', 'duygusal durum']
            };
        } catch (error) {
            console.error('API isteği hatası:', error);
            throw error;
        }
    };

    // Yorumu ekranda gösterme fonksiyonu
    const displayInterpretation = (interpretation) => {
        // Yükleniyor durumunu gizle
        loadingIndicator.style.display = 'none';
        resultContent.style.display = 'block';
        
        // İçeriği oluştur
        let contentHtml = `<p>${interpretation.general}</p>`;
        
        // Bölümleri ekle
        if (interpretation.sections && interpretation.sections.length > 0) {
            interpretation.sections.forEach(section => {
                contentHtml += `
                    <h3>${section.title}</h3>
                    <p>${section.content}</p>
                `;
            });
        }
        
        // Anahtar kelimeler bölümü
        if (interpretation.keywords && interpretation.keywords.length > 0) {
            contentHtml += `
                <h3>İlgili Anahtar Kelimeler</h3>
                <div class="keywords-container">
                    ${interpretation.keywords.map(keyword => `<span class="keyword">${keyword}</span>`).join('')}
                </div>
            `;
        }
        
        // İçeriği DOM'a ekle
        resultContent.innerHTML = contentHtml;
        interpretButton.disabled = false;
    };

    // Yorumu kaydetme fonksiyonu
    const saveDreamInterpretation = () => {
        // Kullanıcının giriş yapmış olup olmadığını kontrol et
        const isLoggedIn = checkUserLogin(); // Bu fonksiyonu uygulamanıza göre uyarlayın
        
        if (!isLoggedIn) {
            showNotification('Rüya yorumunu kaydetmek için giriş yapmalısınız.', 'warning');
            return;
        }
        
        // TODO: Kaydedilen rüya yorumlarını Firestore veya başka bir veritabanına kaydedin
        
        showNotification('Rüya yorumunuz başarıyla kaydedildi!', 'success');
    };
    
    // Kullanıcının giriş yapmış olup olmadığını kontrol etme fonksiyonu
    const checkUserLogin = () => {
        // TODO: Firebase Auth veya kendi auth sisteminizle entegre edin
        return false; // Geçici olarak false döndürüyoruz
    };

    // Rüya yorumunu paylaşma fonksiyonu
    const shareDreamInterpretation = () => {
        // Paylaşım URL'si oluştur
        const shareText = 'Rüya Atlası uygulamasında rüyamı yorumlattım!';
        const shareUrl = window.location.href;
        
        // Paylaşım menüsünü aç (mobil destekli)
        if (navigator.share) {
            navigator.share({
                title: 'Rüya Yorumum',
                text: shareText,
                url: shareUrl
            })
            .then(() => console.log('Paylaşım başarılı'))
            .catch(error => console.error('Paylaşım hatası', error));
        } else {
            // Paylaşım API'si desteklenmiyorsa panoya kopyala
            const tempInput = document.createElement('input');
            document.body.appendChild(tempInput);
            tempInput.value = `${shareText} ${shareUrl}`;
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            
            showNotification('Paylaşım bağlantısı panoya kopyalandı!', 'success');
        }
    };

    // Yeni yorum oluşturma fonksiyonu
    const createNewInterpretation = () => {
        // Formu sıfırla
        dreamTextarea.value = '';
        selectedTagsContainer.innerHTML = '';
        interpretationResult.style.display = 'none';
        
        // Textarea'ya odaklan
        dreamTextarea.focus();
    };

    // Bildirim gösterme fonksiyonu
    const showNotification = (message, type = 'info') => {
        // Mevcut bildirimi kaldır
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Yeni bildirim oluştur
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;
        
        // Bildirimi DOM'a ekle
        document.body.appendChild(notification);
        
        // Animasyon için timeout
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Bildirimi otomatik kaldır
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    };

    // Olay dinleyicileri
    if (interpretButton) {
        interpretButton.addEventListener('click', interpretDream);
    }
    
    if (saveInterpretationButton) {
        saveInterpretationButton.addEventListener('click', saveDreamInterpretation);
    }
    
    if (shareInterpretationButton) {
        shareInterpretationButton.addEventListener('click', shareDreamInterpretation);
    }
    
    if (newInterpretationButton) {
        newInterpretationButton.addEventListener('click', createNewInterpretation);
    }
    
    // Kategori kartları için tıklama olayları
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const tagText = card.querySelector('span').textContent;
            
            // Etiket zaten eklenmiş mi kontrol et
            const existingTags = Array.from(selectedTagsContainer.querySelectorAll('.tag-text')).map(tag => tag.textContent);
            if (!existingTags.includes(tagText)) {
                // Etiketi manuel olarak ekle
                const tagElement = document.createElement('div');
                tagElement.className = 'tag';
                tagElement.innerHTML = `
                    <span class="tag-text">${tagText}</span>
                    <button class="remove-tag" aria-label="Etiketi kaldır">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                const removeButton = tagElement.querySelector('.remove-tag');
                removeButton.addEventListener('click', () => {
                    selectedTagsContainer.removeChild(tagElement);
                });
                
                selectedTagsContainer.appendChild(tagElement);
            }
            
            // Sayfayı giriş alanına doğru kaydır
            dreamTextarea.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Rüya sözlüğü filtre butonları
    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Aktif sınıfını değiştir
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // TODO: Sözlük öğelerini filtrele
            
            // Örnek: Filtre değerini konsola yaz
            console.log('Sözlük filtresi:', button.textContent.trim());
        });
    });

    // İlk yüklemede rüya yorumlama sonuç alanını gizle
    if (interpretationResult) {
        interpretationResult.style.display = 'none';
    }
}); 