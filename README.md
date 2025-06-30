# Rüya Atlası  mystical



> Yapay zeka destekli rüya yorumları ve kişiselleştirilmiş burç analizleri sunan modern bir mistik keşif platformu.

**Rüya Atlası**, kullanıcıların gördükleri rüyaların anlamlarını harici bir yapay zeka servisi aracılığıyla keşfetmelerini ve kişiselleştirilmiş astrolojik yorumlara ulaşmalarını sağlayan bir web uygulamasıdır.

---

### ✨ Temel Özellikler

-   **🤖 Yapay Zeka Destekli Rüya Yorumu:** Girdiğiniz rüya metnini analiz ederek size özel psikolojik ve sembolik yorumlar sunar.
-   **🔮 Dinamik Burç Analizi:** Burcunuza özel günlük, haftalık ve aylık periyotlarda aşk, kariyer ve sağlık yorumları alırsınız.
-   **👤 Kişisel Profil:** Aldığınız rüya yorumlarını kişisel profilinize kaydedebilir ve geçmiş rüyalarınızı dilediğiniz zaman tekrar okuyabilirsiniz.
-   **🔒 Güvenli Kimlik Doğrulama:** Firebase Authentication ile e-posta/şifre tabanlı güvenli kullanıcı kaydı ve girişi.
-   **📱 Duyarlı Tasarım:** Masaüstü, tablet ve mobil cihazlarda kusursuz bir kullanıcı deneyimi.

---

### 🛠️ Kullanılan Teknolojiler

**Ön Yüz (Frontend):**
-   **HTML5, CSS3, JavaScript (ES6+)**
-   **Vite:** Hızlı ve modern geliştirme ortamı ve derleyici.

**Arka Yüz (Backend) & Altyapı:**
-   **Firebase Platformu:**
    -   **Firebase Authentication:** Kullanıcı yönetimi.
    -   **Firebase Firestore:** NoSQL veritabanı.
    -   **Firebase Functions:** Sunucusuz (serverless) arka plan işlemleri.
    -   **Firebase Hosting:** Uygulamanın barındırılması ve küresel CDN.
-   **Node.js & Express.js:** E-posta gönderme gibi sunucu tarafı işlemler için.
-   **Nodemailer:** E-posta doğrulama servisi.

**Harici Servisler:**
-   **Yapay Zeka API'si:** Rüya metinlerini yorumlamak için harici bir yapay zeka servisi.

---

### 📂 Proje Yapısı

Proje, sorumlulukların net bir şekilde ayrıldığı modüler bir yapıya sahiptir.

```
/
├── server/               # E-posta gönderimi için kullanılan yerel Node.js sunucusu
├── functions/            # Firebase üzerinde çalışan sunucusuz fonksiyonlar
├── src/                  # Ana ön yüz (frontend) kodları
│   ├── js/               # JavaScript modülleri (auth, dream, horoscope vb.)
│   ├── styles/           # CSS stil dosyaları
│   └── ...
├── public/               # Statik varlıklar (resimler, ikonlar vb.)
├── index.html            # Ana HTML dosyası
└── README.md             # Bu dosya
```

---

### 🚀 Kurulum ve Başlatma

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin:

1.  **Projeyi klonlayın:**
    ```bash
    git clone https://github.com/KULLANICI_ADINIZ/PROJE_ADINIZ.git
    cd PROJE_DIZINI
    ```

2.  **Bağımlılıkları yükleyin:**
    Projenin hem kök dizininde hem de `server` ve `functions` dizinlerinde ayrı bağımlılıklar bulunmaktadır.

    ```bash
    # Kök dizin (Vite için)
    npm install

    # Server dizini
    cd server
    npm install
    cd ..

    # Functions dizini
    cd functions
    npm install
    cd ..
    ```

3.  **Yapılandırma Dosyalarını Oluşturun:**
    -   `src/js/firebase-config.js` dosyasına kendi Firebase proje bilgilerinizi girin.
    -   `server/server.js` ve `functions/index.js` dosyalarındaki Nodemailer `auth` bölümüne kendi e-posta ve uygulama şifrenizi girin. (Güvenlik için bu bilgileri ortam değişkenleri ile yönetmeniz önerilir.)

4.  **Projeyi başlatın:**
    Uygulama, hem ön yüz sunucusunu (Vite) hem de arka yüz sunucusunu (Node.js) aynı anda başlatmak için `concurrently` kullanır.

    ```bash
    npm run dev
    ```

    Uygulama varsayılan olarak `http://localhost:5173` adresinde çalışacaktır.

---



