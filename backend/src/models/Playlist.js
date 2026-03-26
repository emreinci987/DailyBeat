import { db } from '../config/firebase.js';

const COLLECTION = 'playlists';

/**
 * Firestore Playlist model helpers.
 *
 * {
 *   userId      : string
 *   name        : string
 *   mood        : string
 *   songs       : Array<{ title, artist, url, source, thumbnailUrl }>
 *   createdAt   : string (ISO)
 * }
 */

export async function createPlaylist(data) {
    const playlist = {
        userId: data.userId,
        name: data.name || `${data.mood} playlist`,
        mood: data.mood,
        songs: data.songs || [],
        createdAt: new Date().toISOString(),
    };
    const ref = await db.collection(COLLECTION).add(playlist);
    return { id: ref.id, ...playlist };
}

export async function getPlaylistsByUser(userId, { limit = 20, offset = 0 } = {}) {
    const snapshot = await db
        .collection(COLLECTION)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset)
        .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getPlaylistById(id) {
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
}

export async function deletePlaylist(id) {
    await db.collection(COLLECTION).doc(id).delete();
}

export default { createPlaylist, getPlaylistsByUser, getPlaylistById, deletePlaylist };
