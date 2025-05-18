# Email Verification System for Rüya Atlası

Bu doküman, Rüya Atlası web uygulaması için e-posta doğrulama sistemini açıklamaktadır.

## İçerik

1. [Genel Bakış](#genel-bakış)
2. [Kurulum](#kurulum)
3. [Nasıl Çalışır](#nasıl-çalışır)
4. [EmailJS Konfigürasyonu](#emailjs-konfigürasyonu)
5. [Template Örneği](#template-örneği)
6. [Güvenlik Notları](#güvenlik-notları)
7. [Hata Ayıklama](#hata-ayıklama)

## Genel Bakış

E-posta doğrulama sistemi, kullanıcıların gerçek e-posta adreslerini kullandıklarını doğrulamak için EmailJS servisi ile entegre çalışır. Sistem şu özellikleri içerir:

- Kayıt sırasında kullanıcının e-posta adresine 6 haneli doğrulama kodu gönderilir
- Kullanıcı doğrulama kodunu girdikten sonra kayıt işlemine devam edebilir
- Kodun 15 dakikalık geçerlilik süresi vardır
- Kullanıcılar isteğe bağlı olarak yeni kod talep edebilir

## Kurulum

### Adım 1: EmailJS Hesabı Oluşturun

1. [EmailJS](https://www.emailjs.com/) web sitesine gidin ve bir hesap oluşturun
2. Ücretsiz plan ayda 200 e-posta gönderme hakkı sunar
3. Hesabınızı doğrulayın

### Adım 2: E-posta Servisi Ekleyin

1. EmailJS Dashboard'da "Email Services" bölümüne gidin
2. "Add New Service" butonuna tıklayın
3. Gmail, Outlook, vs. gibi bir servis seçin ve yapılandırın
4. Service ID'yi not alın

### Adım 3: E-posta Şablonu Oluşturun

1. "Email Templates" bölümüne gidin
2. "Create New Template" butonuna tıklayın
3. Aşağıdaki değişkenleri içeren bir şablon oluşturun:
   - `{{to_name}}` veya `{{name}}` - Kullanıcının adı
   - `{{verification_code}}` veya `{{code}}` - Doğrulama kodu
   - `{{to_email}}` veya `{{email}}` - Kullanıcının e-posta adresi
4. Template ID'yi not alın

### Adım 4: Public Key'i Alın

1. Dashboard'da "Integration" bölümüne gidin
2. Public Key'inizi kopyalayın

### Adım 5: Kodu Güncelleyin

`src/js/auth.js` dosyasında aşağıdaki bilgileri güncelleyin:

```javascript
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
```

## Nasıl Çalışır

1. Kullanıcı e-posta adresini girer ve "E-postamı Doğrula" butonuna tıklar
2. Sistem 6 haneli rastgele bir kod oluşturur ve EmailJS aracılığıyla e-posta gönderir
3. Kod tarayıcının localStorage'ında saklanır ve 15 dakika geçerlidir
4. Kullanıcı kodu girdikten sonra "Doğrulama Kodunu Onayla" butonuna tıklar
5. Kod doğruysa, kullanıcı kayıt formunu tamamlayabilir
6. Kod yanlışsa veya süresi dolmuşsa, hata mesajı gösterilir

## EmailJS Konfigürasyonu

EmailJS servisini doğru şekilde yapılandırmak için:

1. E-posta servisinizin (Gmail, Outlook, vs.) SMTP ayarlarını doğru yapılandırın
2. SPF ve DKIM kayıtlarını ayarlayarak e-postaların spam klasörüne düşmemesini sağlayın
3. E-posta şablonunuzun mobil cihazlarda da iyi görüntülendiğinden emin olun
4. Test e-postaları göndererek sistemin çalıştığını doğrulayın

## Template Örneği

Aşağıda örnek bir HTML e-posta şablonu verilmiştir:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Rüya Atlası - E-posta Doğrulama</title>
    <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1a237e; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f5f5f5; }
        .verification-code { font-size: 32px; font-weight: bold; text-align: center; 
                           letter-spacing: 5px; color: #1a237e; margin: 20px 0; }
        .footer { font-size: 12px; color: #999; text-align: center; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Rüya Atlası</h1>
            <p>E-posta Doğrulama Kodu</p>
        </div>
        <div class="content">
            <p>Merhaba {{to_name}},</p>
            <p>Rüya Atlası hesabınızı doğrulamak için aşağıdaki kodu kullanın:</p>
            <div class="verification-code">{{verification_code}}</div>
            <p>Bu kod 15 dakika boyunca geçerlidir. Eğer siz bu işlemi başlatmadıysanız, lütfen bu e-postayı dikkate almayın.</p>
        </div>
        <div class="footer">
            <p>Rüya Atlası &copy; 2023 Tüm hakları saklıdır.</p>
            <p>E-posta adresiniz {{to_email}} olarak kaydedilmiştir.</p>
        </div>
    </div>
</body>
</html>
```

## Güvenlik Notları

1. **Client-Side Doğrulama**: Şu anki sistem client-side doğrulama kullanmaktadır ve localStorage'da veri saklamaktadır. Bu, geliştirme ve test için uygundur ancak production ortamında daha güvenli bir çözüm düşünülmelidir.

2. **Alternatif Çözüm**: Daha güvenli bir çözüm için Firebase Cloud Functions veya başka bir backend servisi kullanarak server-side doğrulama yapılabilir.

3. **Rate Limiting**: Hizmet seviyesi saldırılarını önlemek için e-posta gönderme işlemlerinde rate limiting uygulanmalıdır.

4. **Kod Geçerlilik Süresi**: Kodun 15 dakikalık geçerlilik süresi vardır, bu süre ihtiyaca göre değiştirilebilir.

## Hata Ayıklama

Sorun giderme için:

1. **EmailJS Konsol Logları**: `debug: true` ayarı ile EmailJS'nin hata mesajlarını konsola yazdırmasını sağlayabilirsiniz.

2. **Test E-postası**: `auth.js` dosyasındaki `testEmail()` fonksiyonu yorum satırını kaldırarak bir test e-postası gönderebilirsiniz.

3. **Yaygın Hatalar**:
   - **400 Bad Request**: EmailJS yapılandırmanızı kontrol edin, özellikle service ID ve template ID
   - **401 Unauthorized**: Public key'inizi kontrol edin
   - **422 Unprocessable Entity**: Şablon değişkenlerini kontrol edin
   - **429 Too Many Requests**: Rate limiting aşıldı, daha sonra tekrar deneyin

4. **Template Değişkenleri**: Şablonunuzda kullandığınız değişken adlarının, gönderdiğiniz parametrelerle eşleştiğinden emin olun. 