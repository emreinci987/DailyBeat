import { db } from '../config/firebase.js';
import logger from '../utils/logger.js';

const COLLECTION = 'moodEntries';
const USERS_COLLECTION = 'users';
const USER_MOOD_SUBCOLLECTION = 'moodEntries';

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

    // Mirror into users/{uid}/moodEntries for stable user-scoped history queries.
    try {
        await db
            .collection(USERS_COLLECTION)
            .doc(data.userId)
            .collection(USER_MOOD_SUBCOLLECTION)
            .doc(ref.id)
            .set(entry);
    } catch (error) {
        logger.warn('Failed to mirror mood entry to user subcollection', {
            userId: data.userId,
            entryId: ref.id,
            error: error.message,
        });
    }

    return { id: ref.id, ...entry };
}

function resolveTimestampValue(entry) {
    const rawTimestamp = entry.createdAt || entry.timestamp;
    const parsedDate = rawTimestamp?.toDate instanceof Function
        ? rawTimestamp.toDate()
        : new Date(rawTimestamp || 0);

    if (Number.isNaN(parsedDate.getTime())) {
        return '';
    }

    return parsedDate.toISOString();
}

function sortByTimestampDesc(entries) {
    return [...entries].sort((a, b) => {
        const left = resolveTimestampValue(a);
        const right = resolveTimestampValue(b);
        if (left === right) return 0;
        return left > right ? -1 : 1;
    });
}

async function mirrorEntriesToUserSubcollection(userId, entries) {
    if (!entries.length) return;

    try {
        await Promise.all(entries.map(async (entry) => {
            if (!entry.id) return;

            const { id, ...payload } = entry;
            await db
                .collection(USERS_COLLECTION)
                .doc(userId)
                .collection(USER_MOOD_SUBCOLLECTION)
                .doc(id)
                .set(payload, { merge: true });
        }));
    } catch (_error) {
        // Best-effort backfill only.
    }
}

export async function getMoodEntriesByUser(userId, { limit = 30, offset = 0 } = {}) {
    try {
        const subSnapshot = await db
            .collection(USERS_COLLECTION)
            .doc(userId)
            .collection(USER_MOOD_SUBCOLLECTION)
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .offset(offset)
            .get();

        if (!subSnapshot.empty) {
            return subSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        }
    } catch (_error) {
        // Fall through to legacy collection query.
    }

    const snapshot = await db
        .collection(COLLECTION)
        .where('userId', '==', userId)
        .get();

    const allEntries = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    await mirrorEntriesToUserSubcollection(userId, allEntries);
    const sorted = sortByTimestampDesc(allEntries);
    return sorted.slice(offset, offset + limit);
}

export async function getMoodEntriesSince(userId, sinceDateIso) {
    try {
        const subSnapshot = await db
            .collection(USERS_COLLECTION)
            .doc(userId)
            .collection(USER_MOOD_SUBCOLLECTION)
            .where('createdAt', '>=', sinceDateIso)
            .orderBy('createdAt', 'desc')
            .get();

        if (!subSnapshot.empty) {
            return subSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        }
    } catch (_error) {
        // Fall through to legacy collection query.
    }

    const snapshot = await db
        .collection(COLLECTION)
        .where('userId', '==', userId)
        .get();

    const allEntries = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    await mirrorEntriesToUserSubcollection(userId, allEntries);
    return sortByTimestampDesc(allEntries).filter((entry) => resolveTimestampValue(entry) >= sinceDateIso);
}

export async function getMoodEntryById(id) {
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
}

export async function deleteMoodEntry(id, userId = null) {
    await db.collection(COLLECTION).doc(id).delete();

    if (!userId) return;

    try {
        await db
            .collection(USERS_COLLECTION)
            .doc(userId)
            .collection(USER_MOOD_SUBCOLLECTION)
            .doc(id)
            .delete();
    } catch (_error) {
        // Do not fail delete response if legacy mirror cleanup fails.
    }
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
    getMoodEntriesSince,
    getMoodEntryById,
    deleteMoodEntry,
    getMoodStats,
};
