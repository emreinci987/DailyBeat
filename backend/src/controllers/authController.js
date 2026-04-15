import { initFirebase } from '../config/firebase.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';
import environment from '../config/environment.js';

function ensureFirebaseAuth() {
    const { auth, db } = initFirebase();

    if (!auth || !db) {
        const error = new Error('Firebase yapılandırması eksik');
        error.status = 503;
        error.expose = true;
        throw error;
    }

    return auth;
}

function mapLoginError(message) {
    switch (message) {
        case 'EMAIL_NOT_FOUND':
        case 'INVALID_PASSWORD':
        case 'INVALID_LOGIN_CREDENTIALS':
            return { message: 'E-posta veya şifre hatalı', status: 401 };
        case 'USER_DISABLED':
            return { message: 'Kullanıcı hesabı devre dışı', status: 403 };
        default:
            return { message: 'Giriş işlemi başarısız oldu', status: 401 };
    }
}

function mapSignUpError(message) {
    switch (message) {
        case 'EMAIL_EXISTS':
            return { message: 'Bu e-posta zaten kullanılıyor', status: 409 };
        case 'INVALID_EMAIL':
            return { message: 'Geçerli bir e-posta adresi giriniz', status: 400 };
        case 'WEAK_PASSWORD : Password should be at least 6 characters':
        case 'WEAK_PASSWORD':
            return { message: 'Şifre en az 6 karakter olmalıdır', status: 400 };
        case 'OPERATION_NOT_ALLOWED':
            return {
                message: 'Firebase Authentication üzerinde E-posta/Şifre yöntemi aktif değil',
                status: 503,
            };
        case 'CONFIGURATION_NOT_FOUND':
            return {
                message:
                    'Firebase Authentication yapılandırması bulunamadı. ' +
                    'FIREBASE_API_KEY ve Firebase proje ayarlarınızı kontrol edin.',
                status: 503,
            };
        default:
            return { message: 'Kayıt işlemi başarısız oldu', status: 400 };
    }
}

function isAdminConfigNotFoundError(error) {
    const message = error?.message || '';
    const code = error?.code || error?.errorInfo?.code || '';

    return (
        code === 'auth/configuration-not-found'
        || message.includes('There is no configuration corresponding to the provided identifier')
    );
}

function createExposedError(message, status) {
    const error = new Error(message);
    error.status = status;
    error.expose = true;
    return error;
}

async function signUpWithPassword(email, password, displayName = '') {
    const apiKey = environment.firebaseClient.apiKey;

    if (!apiKey) {
        throw createExposedError('FIREBASE_API_KEY tanımlı değil', 500);
    }

    const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        const detail = payload?.error?.message || 'UNKNOWN';
        const mapped = mapSignUpError(detail);
        throw createExposedError(mapped.message, mapped.status);
    }

    // displayName update is optional and does not block registration.
    if (displayName && payload.idToken) {
        const updateEndpoint = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`;
        await fetch(updateEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idToken: payload.idToken,
                displayName,
                returnSecureToken: true,
            }),
        }).catch(() => null);
    }

    return payload;
}

async function signInWithPassword(email, password) {
    const apiKey = environment.firebaseClient.apiKey;

    if (!apiKey) {
        const error = new Error('FIREBASE_API_KEY tanımlı değil');
        error.status = 500;
        error.expose = true;
        throw error;
    }

    const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        const detail = payload?.error?.message || 'UNKNOWN';
        const mapped = mapLoginError(detail);
        const error = new Error(mapped.message);
        error.status = mapped.status;
        error.expose = true;
        throw error;
    }

    return payload;
}

/**
 * POST /api/auth/register
 * Body: { email, password, displayName }
 */
export async function register(req, res, next) {
    try {
        const firebaseAuth = ensureFirebaseAuth();

        const { email, password, displayName } = req.body;

        let uid;
        let profileEmail = email;
        let profileDisplayName = displayName || '';

        try {
            // Primary path: Firebase Admin SDK
            const firebaseUser = await firebaseAuth.createUser({
                email,
                password,
                displayName: displayName || '',
            });

            uid = firebaseUser.uid;
            profileEmail = firebaseUser.email || email;
            profileDisplayName = firebaseUser.displayName || displayName || '';
        } catch (error) {
            if (error.code === 'auth/email-already-exists') {
                return errorResponse(res, 'Bu e-posta zaten kullanılıyor', 409);
            }

            if (!isAdminConfigNotFoundError(error)) {
                throw error;
            }

            // Fallback path: Firebase Identity Toolkit REST API
            logger.warn('Admin createUser failed, switching to signUp fallback', {
                reason: error.message,
            });

            const signUpResult = await signUpWithPassword(email, password, displayName || '');

            uid = signUpResult.localId;
            profileEmail = signUpResult.email || email;
            profileDisplayName = displayName || '';
        }

        // Create Firestore profile
        const user = await User.createUser(uid, {
            email: profileEmail,
            displayName: profileDisplayName,
        });

        logger.info('User registered', { uid });
        return successResponse(res, user, 'Kayıt başarılı', 201);
    } catch (error) {
        if (error?.expose && error?.status) {
            return errorResponse(res, error.message, error.status);
        }

        if (error.code === 'auth/invalid-email') {
            return errorResponse(res, 'Geçerli bir e-posta adresi giriniz', 400);
        }

        if (error.code === 'auth/invalid-password') {
            return errorResponse(res, 'Şifre en az 6 karakter olmalıdır', 400);
        }

        return next(error);
    }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function login(req, res, next) {
    try {
        const firebaseAuth = ensureFirebaseAuth();
        const { email, password } = req.body;

        const signInResult = await signInWithPassword(email, password);

        // Verify token via Admin SDK to ensure it is valid and decode claims.
        const decoded = await firebaseAuth.verifyIdToken(signInResult.idToken);
        const uid = decoded.uid || signInResult.localId;

        let user = await User.getUserById(uid);

        if (!user) {
            user = await User.createUser(uid, {
                email: signInResult.email || email,
                displayName: signInResult.displayName || decoded.name || '',
                photoURL: decoded.picture || '',
            });
            logger.info('User profile auto-created on login', { uid });
        }

        return successResponse(
            res,
            {
                token: signInResult.idToken,
                refreshToken: signInResult.refreshToken,
                expiresIn: Number(signInResult.expiresIn || 0),
                user,
            },
            'Giriş başarılı',
        );
    } catch (error) {
        return next(error);
    }
}

/**
 * GET /api/auth/me
 * Requires authentication header.
 */
export async function getMe(req, res, next) {
    try {
        ensureFirebaseAuth();

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

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 */
export async function forgotPassword(req, res, next) {
    try {
        const apiKey = environment.firebaseClient.apiKey;

        if (!apiKey) {
            return errorResponse(res, 'Firebase yapılandırması eksik', 503);
        }

        const { email } = req.body;

        const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`;
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestType: 'PASSWORD_RESET', email }),
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            const detail = payload?.error?.message || 'UNKNOWN';

            // Don't reveal whether the email exists or not (security best practice)
            if (detail === 'EMAIL_NOT_FOUND') {
                logger.info('Password reset requested for non-existent email', { email });
                return successResponse(res, null, 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi');
            }

            logger.error('Password reset failed', { detail });
            return errorResponse(res, 'Şifre sıfırlama işlemi başarısız oldu', 400);
        }

        logger.info('Password reset email sent', { email });
        return successResponse(res, null, 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi');
    } catch (error) {
        return next(error);
    }
}

export default { register, login, getMe, forgotPassword };
