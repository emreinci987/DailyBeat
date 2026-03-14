import admin from '../config/firebase.js';
import { errorResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

/**
 * Verify the Firebase ID token sent as a Bearer token.
 * Attaches decoded token to req.user on success.
 */
export async function authenticate(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return errorResponse(res, 'Yetkilendirme başlığı eksik', 401);
    }

    const idToken = header.split('Bearer ')[1];

    try {
        const firebaseAuth = admin.auth();
        const decoded = await firebaseAuth.verifyIdToken(idToken);
        req.user = {
            uid: decoded.uid,
            email: decoded.email,
            name: decoded.name || '',
            picture: decoded.picture || '',
        };
        return next();
    } catch (error) {
        logger.warn('Auth token verification failed', { error: error.message });
        return errorResponse(res, 'Geçersiz veya süresi dolmuş token', 401);
    }
}

/**
 * Optional authentication — sets req.user if token is present but
 * does not block the request when it is missing.
 */
export async function optionalAuth(req, _res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return next();

    const idToken = header.split('Bearer ')[1];

    try {
        const firebaseAuth = admin.auth();
        const decoded = await firebaseAuth.verifyIdToken(idToken);
        req.user = {
            uid: decoded.uid,
            email: decoded.email,
            name: decoded.name || '',
            picture: decoded.picture || '',
        };
    } catch {
        // silently ignore — user simply is not authenticated
    }
    return next();
}
