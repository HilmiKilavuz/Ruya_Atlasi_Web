import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    onAuthStateChanged
} from 'firebase/auth';
import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc 
} from 'firebase/firestore';

export const userService = {
    // Kullanıcı kaydı
    async register(email, password, username) {
        try {
            console.log('Kayıt işlemi başlatılıyor...', { email, username }); // Debug log

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('Kullanıcı Firebase Auth\'da oluşturuldu', userCredential); // Debug log

            const user = userCredential.user;
            
            // Kullanıcı profilini güncelle
            await updateProfile(user, {
                displayName: username
            });
            console.log('Kullanıcı profili güncellendi'); // Debug log

            // Firestore'da kullanıcı dokümanı oluştur
            const userData = {
                uid: user.uid,
                email: email,
                username: username,
                createdAt: new Date().toISOString(),
                favoriteSymbols: [],
                dreamCount: 0,
                profilePicture: '',
                lastLogin: new Date().toISOString(),
                horoscopeSign: '' // Başlangıçta boş burç
            };

            await setDoc(doc(db, 'users', user.uid), userData);
            console.log('Kullanıcı Firestore\'a kaydedildi', userData); // Debug log

            return user;
        } catch (error) {
            console.error('Kayıt işlemi sırasında hata:', error); // Debug log
            throw error;
        }
    },

    // Kullanıcı girişi
    async login(email, password) {
        try {
            console.log('Giriş işlemi başlatılıyor...', { email }); // Debug log

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Son giriş zamanını güncelle
            await updateDoc(doc(db, 'users', user.uid), {
                lastLogin: new Date().toISOString()
            });
            console.log('Giriş başarılı ve son giriş zamanı güncellendi'); // Debug log
            
            // Kullanıcı profilini al ve localStorage'a kaydet
            const userProfile = await this.getUserProfile(user.uid);
            if (userProfile && userProfile.horoscopeSign) {
                localStorage.setItem('userHoroscopeSign', userProfile.horoscopeSign);
            }

            return user;
        } catch (error) {
            console.error('Giriş işlemi sırasında hata:', error); // Debug log
            throw error;
        }
    },

    // Kullanıcı çıkışı
    async logout() {
        try {
            await signOut(auth);
            console.log('Çıkış başarılı'); // Debug log
            // Çıkış yapıldığında localStorage'dan burç bilgisini temizle
            localStorage.removeItem('userHoroscopeSign');
        } catch (error) {
            console.error('Çıkış işlemi sırasında hata:', error); // Debug log
            throw error;
        }
    },

    // Kullanıcı profili getir
    async getUserProfile(uid) {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                return userDoc.data();
            }
            return null;
        } catch (error) {
            console.error('Profil getirme sırasında hata:', error); // Debug log
            throw error;
        }
    },

    // Kullanıcı profili güncelle
    async updateUserProfile(uid, updateData) {
        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, {
                ...updateData,
                updatedAt: new Date().toISOString()
            });
            console.log('Profil güncellendi', updateData); // Debug log
            
            // Eğer burç güncellemesi varsa localStorage'a da kaydet
            if (updateData.horoscopeSign) {
                localStorage.setItem('userHoroscopeSign', updateData.horoscopeSign);
            }
        } catch (error) {
            console.error('Profil güncelleme sırasında hata:', error); // Debug log
            throw error;
        }
    },
    
    // Kullanıcının burcunu güncelle
    async updateHoroscopeSign(uid, sign) {
        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, {
                horoscopeSign: sign,
                updatedAt: new Date().toISOString()
            });
            console.log('Burç bilgisi güncellendi', sign); // Debug log
            
            // localStorage'a da kaydet
            localStorage.setItem('userHoroscopeSign', sign);
            return true;
        } catch (error) {
            console.error('Burç güncelleme sırasında hata:', error); // Debug log
            throw error;
        }
    }
};

// Get current user
export const getCurrentUser = async () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            unsubscribe();
            if (user) {
                try {
                    // Kullanıcı profil bilgilerini al
                    const userProfile = await userService.getUserProfile(user.uid);
                    // Eğer burç bilgisi varsa localStorage'a kaydet
                    if (userProfile && userProfile.horoscopeSign) {
                        localStorage.setItem('userHoroscopeSign', userProfile.horoscopeSign);
                    }
                    // Profil bilgilerini user objesine ekle
                    resolve({
                        ...user,
                        ...userProfile
                    });
                } catch (error) {
                    console.error('Kullanıcı profili alınamadı:', error);
            resolve(user);
                }
            } else {
                resolve(null);
            }
        }, reject);
    });
};

// Logout user
export const logout = async () => {
    try {
        await signOut(auth);
        // Çıkış yapıldığında localStorage'dan burç bilgisini temizle
        localStorage.removeItem('userHoroscopeSign');
        return true;
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

// Listen to auth state changes
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
}; 