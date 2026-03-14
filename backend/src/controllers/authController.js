import { auth } from '../config/firebase.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

/**
 * POST /api/auth/register
 * Body: { email, password, displayName }
 */
export async function register(req, res, next) {
    try {
        const { email, password, displayName } = req.body;

        // Create Firebase Auth user
        const firebaseUser = await auth.createUser({
            email,
            password,
            displayName: displayName || '',
        });

        // Create Firestore profile
        const user = await User.createUser(firebaseUser.uid, {
            email,
            displayName: displayName || '',
        });

        logger.info('User registered', { uid: firebaseUser.uid });
        return successResponse(res, user, 'Kayıt başarılı', 201);
    } catch (error) {
        if (error.code === 'auth/email-already-exists') {
            return errorResponse(res, 'Bu e-posta zaten kullanılıyor', 409);
        }
        return next(error);
    }
}

/**
 * GET /api/auth/me
 * Requires authentication header.
 */
export async function getMe(req, res, next) {
    try {
        let user = await User.getUserById(req.user.uid);

        // Auto-create profile if it doesn't exist yet
        if (!user) {
            user = await User.createUser(req.user.uid, {
                email: req.user.email,
                displayName: req.user.name,
                photoURL: req.user.picture,
            });
        }

        return successResponse(res, user);
    } catch (error) {
        return next(error);
    }
}

export default { register, getMe };
