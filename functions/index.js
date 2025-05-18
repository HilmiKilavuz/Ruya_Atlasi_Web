const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// CORS yapılandırması
app.use(cors({ origin: true }));
app.use(express.json());

// Gönderilen doğrulama kodlarını geçici olarak saklamak için
// Gerçek bir uygulamada bu bilgileri bir veritabanında saklamalısınız
const verificationCodes = {};

// Nodemailer ile e-posta gönderme ayarları
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ruyaatlasi23@gmail.com', // Gerçek e-posta adresinizi buraya yazın
    pass: 'iiwn zfss dhaf ipvz' // Uygulama şifrenizi buraya yazın
  }
});

// 6 haneli doğrulama kodu oluştur
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Şifre değiştirme için doğrulama kodu gönder
app.post('/send-password-reset-code', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'E-posta adresi gereklidir.' });
    }
    
    // Doğrulama kodu oluştur
    const verificationCode = generateVerificationCode();
    
    // Doğrulama kodunu geçici olarak sakla (15 dakika geçerli)
    verificationCodes[email] = {
      code: verificationCode,
      expiry: Date.now() + 15 * 60 * 1000 // 15 dakika geçerlilik süresi
    };
    
    // E-posta içeriği
    const mailOptions = {
      from: 'ruyaatlasi23@gmail.com', // Gönderen e-posta adresi
      to: email,
      subject: 'Rüya Atlası - Şifre Değiştirme Doğrulama Kodu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; padding: 10px 0; background: linear-gradient(135deg, #1a237e, #4a148c); color: #ffffff; border-radius: 5px 5px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Rüya Atlası</h1>
            <p style="margin: 5px 0 0;">Şifre Değiştirme Doğrulama Kodu</p>
          </div>
          <div style="padding: 20px;">
            <p>Şifrenizi değiştirmek için aşağıdaki doğrulama kodunu kullanın:</p>
            <div style="text-align: center; margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
              ${verificationCode}
            </div>
            <p>Bu kod 15 dakika boyunca geçerlidir. Eğer siz bu işlemi başlatmadıysanız, lütfen bu e-postayı dikkate almayın.</p>
          </div>
          <div style="text-align: center; padding: 10px 0; background-color: #f5f5f5; color: #666; border-radius: 0 0 5px 5px; font-size: 12px;">
            <p>Rüya Atlası &copy; 2023 Tüm hakları saklıdır.</p>
          </div>
        </div>
      `
    };
    
    // E-postayı gönder
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      success: true, 
      message: 'Doğrulama kodu e-posta adresinize gönderildi.' 
    });
    
  } catch (error) {
    console.error('Doğrulama kodu gönderilirken hata:', error);
    res.status(500).json({ 
      error: 'Doğrulama kodu gönderilirken bir hata oluştu.', 
      message: error.message 
    });
  }
});

// Doğrulama kodunu kontrol et
app.post('/verify-code', (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ error: 'E-posta ve doğrulama kodu gereklidir.' });
    }
    
    const verification = verificationCodes[email];
    
    // Doğrulama kodu yoksa veya süresi geçmişse
    if (!verification || Date.now() > verification.expiry) {
      return res.status(400).json({ 
        error: 'Doğrulama kodunun süresi dolmuş veya geçersiz kod.', 
        expired: true 
      });
    }
    
    // Kod eşleşmiyor
    if (verification.code !== code) {
      return res.status(400).json({ 
        error: 'Doğrulama kodu yanlış.', 
        invalid: true 
      });
    }
    
    // Doğrulama başarılı, kodu sil
    delete verificationCodes[email];
    
    res.status(200).json({ 
      success: true, 
      message: 'Doğrulama başarılı. Şifrenizi değiştirebilirsiniz.' 
    });
    
  } catch (error) {
    console.error('Kod doğrulanırken hata:', error);
    res.status(500).json({ 
      error: 'Kod doğrulanırken bir hata oluştu.', 
      message: error.message 
    });
  }
});

// API'yi Firebase Cloud Functions'a dönüştür
exports.api = functions.https.onRequest(app); 