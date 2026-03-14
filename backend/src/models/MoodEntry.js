import { db } from '../config/firebase.js';

const COLLECTION = 'moodEntries';

/**
 * Firestore MoodEntry model helpers.
 *
 * {
 *   userId    : string  (Firebase Auth UID)
 *   mood      : string  (happy | sad | energetic | calm | angry | romantic | anxious | nostalgic | focused)
 *   intensity : number  (1-10)
 *   note      : string  (optional user note)
 *   createdAt : string  (ISO date)
 * }
 */

export async function createMoodEntry(data) {
    const entry = {
        userId: data.userId,
        mood: data.mood,
        intensity: data.intensity ?? 5,
        note: data.note || '',
        createdAt: new Date().toISOString(),
    };
    const ref = await db.collection(COLLECTION).add(entry);
    return { id: ref.id, ...entry };
}

export async function getMoodEntriesByUser(userId, { limit = 30, offset = 0 } = {}) {
    const snapshot = await db
        .collection(COLLECTION)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset)
        .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getMoodEntryById(id) {
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
}

export async function deleteMoodEntry(id) {
    await db.collection(COLLECTION).doc(id).delete();
}

export async function getMoodStats(userId) {
    const snapshot = await db
        .collection(COLLECTION)
        .where('userId', '==', userId)
        .get();

    const counts = {};
    snapshot.docs.forEach((doc) => {
        const mood = doc.data().mood;
        counts[mood] = (counts[mood] || 0) + 1;
    });

    return {
        total: snapshot.size,
        distribution: counts,
    };
}

export default {
    createMoodEntry,
    getMoodEntriesByUser,
    getMoodEntryById,
    deleteMoodEntry,
    getMoodStats,
};
