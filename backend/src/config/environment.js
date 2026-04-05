import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function cleanedEnv(name, fallback = '') {
    const raw = process.env[name];
    if (raw === undefined || raw === null) return fallback;
    return String(raw).trim();
}

const environment = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3001,

    // Firebase Admin
    firebase: {
        serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '',
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    },

    // Firebase Client (exposed to frontend via /api/config/firebase)
    firebaseClient: {
        apiKey: cleanedEnv('FIREBASE_API_KEY'),
        authDomain: cleanedEnv('FIREBASE_AUTH_DOMAIN'),
        projectId: cleanedEnv('FIREBASE_PROJECT_ID'),
        storageBucket: cleanedEnv('FIREBASE_STORAGE_BUCKET'),
        messagingSenderId: cleanedEnv('FIREBASE_MESSAGING_SENDER_ID'),
        appId: cleanedEnv('FIREBASE_APP_ID'),
    },

    // External APIs
    spotify: {
        clientId: cleanedEnv('SPOTIFY_CLIENT_ID'),
        clientSecret: cleanedEnv('SPOTIFY_CLIENT_SECRET'),
    },
    youtube: {
        apiKey: cleanedEnv('YOUTUBE_API_KEY'),
    },

    // CORS
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

    // Rate limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    },
};

export default environment;
