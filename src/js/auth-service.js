import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth, db } from './firebase-config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Kullanıcı kaydı
export const registerUser = async (email, password, userData) => {
    try {
        // Firebase Authentication ile kullanıcı oluştur
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Firestore'da kullanıcı profili oluştur
        await setDoc(doc(db, 'users', user.uid), {
            email: email,
            name: userData.name,
            birthDate: userData.birthDate,
            zodiacSign: userData.zodiacSign,
            createdAt: new Date().toISOString(),
            ...userData
        });

        return { success: true, user };
    } catch (error) {
        console.error('Kayıt hatası:', error);
        return { success: false, error: error.message };
    }
};

// Kullanıcı girişi
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Giriş hatası:', error);
        return { success: false, error: error.message };
    }
};

// Kullanıcı çıkışı
export const logoutUser = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Çıkış hatası:', error);
        return { success: false, error: error.message };
    }
};

// Kullanıcı durumu değişikliği dinleyicisi
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

// Kullanıcı profili getir
export const getUserProfile = async (userId) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            return { success: true, data: userDoc.data() };
        } else {
            return { success: false, error: 'Kullanıcı profili bulunamadı' };
        }
    } catch (error) {
        console.error('Profil getirme hatası:', error);
        return { success: false, error: error.message };
    }
}; 