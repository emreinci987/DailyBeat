import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import environment from './environment.js';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db = null;
let auth = null;

/**
 * Initialise Firebase Admin SDK.
 * Supports two modes:
 *  1. Service-account JSON file (local dev)
 *  2. Environment variables (CI / cloud)
 */
function initFirebase() {
    if (admin.apps.length > 0) {
        db = admin.firestore();
        auth = admin.auth();
        return { db, auth };
    }

    const { firebase } = environment;
    const absPath = firebase.serviceAccountPath
        ? path.resolve(__dirname, '../../', firebase.serviceAccountPath)
        : '';

    try {
        if (absPath && existsSync(absPath)) {
            const serviceAccount = JSON.parse(readFileSync(absPath, 'utf8'));
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            logger.info('Firebase initialised with service-account file');
        } else if (firebase.projectId && firebase.clientEmail && firebase.privateKey) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: firebase.projectId,
                    clientEmail: firebase.clientEmail,
                    privateKey: firebase.privateKey,
                }),
            });
            logger.info('Firebase initialised with env credentials');
        } else {
            logger.warn(
                'Firebase credentials not found — running without Firebase. ' +
                'Set FIREBASE_SERVICE_ACCOUNT_PATH or individual env vars.',
            );
            return { db: null, auth: null };
        }

        db = admin.firestore();
        auth = admin.auth();
        return { db, auth };
    } catch (error) {
        logger.error('Firebase initialisation failed', { error: error.message });
        return { db: null, auth: null };
    }
}

export { initFirebase, db, auth };
export default admin;
