import { db } from '../config/firebase.js';

const COLLECTION = 'users';

/**
 * Firestore User model helpers.
 *
 * Document ID = Firebase Auth UID
 * {
 *   email        : string
 *   displayName  : string
 *   photoURL     : string
 *   preferences  : { genres: string[], language: string }
 *   createdAt    : Timestamp
 *   updatedAt    : Timestamp
 * }
 */

export async function createUser(uid, data) {
    const now = new Date().toISOString();
    const user = {
        email: data.email || '',
        displayName: data.displayName || '',
        photoURL: data.photoURL || '',
        preferences: data.preferences || { genres: [], language: 'tr' },
        createdAt: now,
        updatedAt: now,
    };
    await db.collection(COLLECTION).doc(uid).set(user);
    return { uid, ...user };
}

export async function getUserById(uid) {
    const doc = await db.collection(COLLECTION).doc(uid).get();
    if (!doc.exists) return null;
    return { uid: doc.id, ...doc.data() };
}

export async function updateUser(uid, data) {
    const payload = { ...data, updatedAt: new Date().toISOString() };
    await db.collection(COLLECTION).doc(uid).update(payload);
    return getUserById(uid);
}

export async function deleteUser(uid) {
    await db.collection(COLLECTION).doc(uid).delete();
}

export default { createUser, getUserById, updateUser, deleteUser };
