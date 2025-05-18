import { db } from './firebase-config.js';
import { 
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    arrayUnion,
    arrayRemove,
    Timestamp
} from 'firebase/firestore';

// Rüya kaydetme
export const saveDream = async (userId, dreamData) => {
    try {
        const dreamRef = await addDoc(collection(db, 'dreams'), {
            userId,
            title: dreamData.title || 'İsimsiz Rüya',
            content: dreamData.content,
            date: dreamData.date || new Date().toISOString(),
            mood: dreamData.mood || 'nötr',
            interpretation: dreamData.interpretation,
            tags: dreamData.tags || [],
            createdAt: new Date().toISOString(),
            isPublic: dreamData.isPublic || false,
            isFavorite: dreamData.isFavorite || false
        });

        return { success: true, dreamId: dreamRef.id };
    } catch (error) {
        console.error('Rüya kaydetme hatası:', error);
        return { success: false, error: error.message };
    }
};

// Kullanıcının rüyalarını getir
export const getUserDreams = async (userId) => {
    try {
        // First try with the simple query without sorting (no index required)
        const q = query(
            collection(db, 'dreams'),
            where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(q);
        const dreams = [];
        querySnapshot.forEach((doc) => {
            dreams.push({ id: doc.id, ...doc.data() });
        });

        // Sort dreams by date in JavaScript after fetching
        dreams.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA; // descending order (newest first)
        });

        return { success: true, dreams };
    } catch (error) {
        console.error('Rüyaları getirme hatası:', error);
        return { success: false, error: error.message };
    }
};

// Kullanıcının favori rüyalarını getir
export const getFavoriteDreams = async (userId) => {
    try {
        // First try with a simpler query to avoid index issues
        const q = query(
            collection(db, 'dreams'),
            where('userId', '==', userId),
            where('isFavorite', '==', true)
        );

        const querySnapshot = await getDocs(q);
        const dreams = [];
        querySnapshot.forEach((doc) => {
            dreams.push({ id: doc.id, ...doc.data() });
        });

        // Sort dreams by date in JavaScript after fetching
        dreams.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA; // descending order (newest first)
        });

        return { success: true, dreams };
    } catch (error) {
        console.error('Favori rüyaları getirme hatası:', error);
        return { success: false, error: error.message };
    }
};

// Rüyayı favorilere ekle/çıkar
export const toggleFavorite = async (dreamId, isFavorite) => {
    try {
        await updateDoc(doc(db, 'dreams', dreamId), {
            isFavorite: isFavorite,
            updatedAt: new Date().toISOString()
        });

        return { success: true };
    } catch (error) {
        console.error('Favori durumu güncelleme hatası:', error);
        return { success: false, error: error.message };
    }
};

// Tek bir rüyayı getir
export const getDream = async (dreamId) => {
    try {
        const dreamDoc = await getDoc(doc(db, 'dreams', dreamId));
        if (dreamDoc.exists()) {
            return { success: true, dream: { id: dreamDoc.id, ...dreamDoc.data() } };
        } else {
            return { success: false, error: 'Rüya bulunamadı' };
        }
    } catch (error) {
        console.error('Rüya getirme hatası:', error);
        return { success: false, error: error.message };
    }
};

// Rüyayı güncelle
export const updateDream = async (dreamId, updateData) => {
    try {
        await updateDoc(doc(db, 'dreams', dreamId), {
            ...updateData,
            updatedAt: new Date().toISOString()
        });

        return { success: true };
    } catch (error) {
        console.error('Rüya güncelleme hatası:', error);
        return { success: false, error: error.message };
    }
};

// Rüyayı sil
export const deleteDream = async (dreamId) => {
    try {
        await deleteDoc(doc(db, 'dreams', dreamId));
        return { success: true };
    } catch (error) {
        console.error('Rüya silme hatası:', error);
        return { success: false, error: error.message };
    }
};

// Herkese açık rüyaları getir
export const getPublicDreams = async () => {
    try {
        const q = query(
            collection(db, 'dreams'),
            where('isPublic', '==', true),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const dreams = [];
        querySnapshot.forEach((doc) => {
            dreams.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, dreams };
    } catch (error) {
        console.error('Herkese açık rüyaları getirme hatası:', error);
        return { success: false, error: error.message };
    }
}; 