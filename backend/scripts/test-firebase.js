/**
 * Quick script to verify Firebase connection & create a test document
 * in the "users" collection.
 *
 * Usage:  node scripts/test-firebase.js
 * Delete: after confirming, you can remove the test doc from Firestore console.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { initFirebase } from '../src/config/firebase.js';

async function main() {
    console.log('🔄 Firebase bağlantısı deneniyor...\n');

    const { db, auth } = initFirebase();

    if (!db) {
        console.error('❌ Firebase bağlantısı kurulamadı. .env ayarlarını kontrol edin.');
        process.exit(1);
    }

    console.log('✅ Firebase Admin SDK başarıyla bağlandı!\n');

    // Test: "users" collection'a geçici bir doküman yaz
    const testId = 'test-connection-check';
    const testData = {
        email: 'test@dailybeat.com',
        displayName: 'Bağlantı Testi',
        photoURL: '',
        preferences: { genres: [], language: 'tr' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _isTest: true,
    };

    try {
        await db.collection('users').doc(testId).set(testData);
        console.log('✅ "users" collection\'a test dokümanı yazıldı.');

        // Okuma testi
        const doc = await db.collection('users').doc(testId).get();
        if (doc.exists) {
            console.log('✅ Test dokümanı başarıyla okundu:', doc.data().displayName);
        }

        // Temizlik — test dokümanını sil
        await db.collection('users').doc(testId).delete();
        console.log('✅ Test dokümanı silindi (temizlik).\n');

        console.log('🎉 Firebase Firestore tamamen çalışıyor! "users" collection hazır.');
    } catch (err) {
        console.error('❌ Firestore işlemi başarısız:', err.message);
        process.exit(1);
    }

    process.exit(0);
}

main();
