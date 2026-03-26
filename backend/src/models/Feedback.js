import { db } from '../config/firebase.js';

const COLLECTION = 'feedbacks';

/**
 * Firestore Feedback model helpers.
 *
 * {
 *   userId      : string  (Firebase Auth UID)
 *   songUrl     : string  (Spotify / YouTube URL)
 *   songTitle   : string
 *   songArtist  : string
 *   rating      : number  (1 = dislike, 2 = neutral, 3 = like)
 *   mood        : string  (hangi mood için önerildi)
 *   comment     : string  (isteğe bağlı kullanıcı yorumu)
 *   createdAt   : string  (ISO)
 * }
 */

export async function createFeedback(data) {
    const feedback = {
        userId: data.userId,
        songUrl: data.songUrl,
        songTitle: data.songTitle || '',
        songArtist: data.songArtist || '',
        rating: data.rating,
        mood: data.mood || '',
        comment: data.comment || '',
        createdAt: new Date().toISOString(),
    };
    const ref = await db.collection(COLLECTION).add(feedback);
    return { id: ref.id, ...feedback };
}

export async function getFeedbacksByUser(userId, { limit = 30, offset = 0 } = {}) {
    const snapshot = await db
        .collection(COLLECTION)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset)
        .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getFeedbackById(id) {
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
}

export async function deleteFeedback(id) {
    await db.collection(COLLECTION).doc(id).delete();
}

export default { createFeedback, getFeedbacksByUser, getFeedbackById, deleteFeedback };
