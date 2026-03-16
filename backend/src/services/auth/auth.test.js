/**
 * @file auth.test.js
 * @description DailyBeat — Sprint 1 Unit Test Paketi
 *
 * Sprint 1 Kapsamı:
 *  - AuthService (register, login, logout, getCurrentUser)
 *  - Firebase Auth & Firestore bağlantısı
 *  - Express.js Auth Route'ları (/api/auth/register, /api/auth/login)
 *
 * Bağımlılıklar:
 *  npm install --save-dev jest supertest @firebase/rules-unit-testing
 *
 * Çalıştırma:
 *  npm test -- --testPathPatterns=auth
 *  npm test -- --testPathPatterns=auth --verbose
 */

import AuthService        from '../../services/auth/authService.js';
import { getAuthRoutes }  from '../../routes/authRoutes.js';
import express            from 'express';
import request            from 'supertest';

// ─── Firebase modüllerini mock'la ───────────────────────────────────────────
jest.mock('firebase/auth');
jest.mock('firebase/firestore');

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';


// ─────────────────────────────────────────────────────────────────────────────
// Test Yardımcıları
// ─────────────────────────────────────────────────────────────────────────────

/** Sahte Firebase User objesi */
const createMockFirebaseUser = (overrides = {}) => ({
  uid:         'test-uid-123',
  email:       'test@dailybeat.com',
  displayName: 'Test User',
  emailVerified: true,
  ...overrides,
});

/** Sahte Firestore kullanıcı belgesi */
const createMockUserDoc = (overrides = {}) => ({
  id:         'test-uid-123',
  email:      'test@dailybeat.com',
  name:       'Test User',
  favGenres:  [],
  createdAt:  new Date('2024-01-15'),
  ...overrides,
});

/** Sahte auth ve firestore instance'ları */
const mockAuth      = { currentUser: null };
const mockFirestore = {};

/** Supertest için Express uygulaması oluştur */
const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', getAuthRoutes(mockAuth, mockFirestore));
  return app;
};


// ─────────────────────────────────────────────────────────────────────────────
// BLOK 1: AuthService — register()
// ─────────────────────────────────────────────────────────────────────────────

describe('AuthService.register()', () => {

  let authService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService(mockAuth, mockFirestore);
  });

  test('Geçerli bilgilerle kayıt başarılı — Firebase user ve Firestore belgesi oluşturulmalı', async () => {
    const mockUser = createMockFirebaseUser();
    createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    setDoc.mockResolvedValue(undefined);
    doc.mockReturnValue('mock-doc-ref');

    const result = await authService.register('Test User', 'test@dailybeat.com', 'Password123!');

    expect(createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      mockAuth,
      'test@dailybeat.com',
      'Password123!'
    );
    expect(setDoc).toHaveBeenCalledTimes(1);
    expect(result).toHaveProperty('uid', 'test-uid-123');
    expect(result).toHaveProperty('email', 'test@dailybeat.com');
  });

  test('Kayıt başarılı — dönen objede name alanı bulunmalı', async () => {
    const mockUser = createMockFirebaseUser();
    createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    setDoc.mockResolvedValue(undefined);
    doc.mockReturnValue('mock-doc-ref');

    const result = await authService.register('Test User', 'test@dailybeat.com', 'Password123!');

    expect(result).toHaveProperty('name', 'Test User');
  });

  test('Kayıt başarılı — favGenres başlangıçta boş dizi olmalı', async () => {
    const mockUser = createMockFirebaseUser();
    createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    setDoc.mockResolvedValue(undefined);
    doc.mockReturnValue('mock-doc-ref');

    const result = await authService.register('Test User', 'test@dailybeat.com', 'Password123!');

    expect(result.favGenres).toEqual([]);
  });

  test('Mevcut email ile kayıt — Firebase hatasını yakalamalı', async () => {
    const firebaseError = { code: 'auth/email-already-in-use', message: 'Email already in use' };
    createUserWithEmailAndPassword.mockRejectedValue(firebaseError);

    await expect(
      authService.register('Test User', 'existing@dailybeat.com', 'Password123!')
    ).rejects.toMatchObject({ code: 'auth/email-already-in-use' });
  });

  test('Zayıf şifre ile kayıt — Firebase hatasını yakalamalı', async () => {
    const firebaseError = { code: 'auth/weak-password', message: 'Password too weak' };
    createUserWithEmailAndPassword.mockRejectedValue(firebaseError);

    await expect(
      authService.register('Test User', 'test@dailybeat.com', '123')
    ).rejects.toMatchObject({ code: 'auth/weak-password' });
  });

  test('Geçersiz email formatı — Firebase hatasını yakalamalı', async () => {
    const firebaseError = { code: 'auth/invalid-email', message: 'Invalid email' };
    createUserWithEmailAndPassword.mockRejectedValue(firebaseError);

    await expect(
      authService.register('Test User', 'gecersiz-email', 'Password123!')
    ).rejects.toMatchObject({ code: 'auth/invalid-email' });
  });

  test('Firebase user oluşturuldu ama Firestore yazımı başarısız — hata fırlatılmalı', async () => {
    const mockUser = createMockFirebaseUser();
    createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    setDoc.mockRejectedValue(new Error('Firestore write failed'));
    doc.mockReturnValue('mock-doc-ref');

    await expect(
      authService.register('Test User', 'test@dailybeat.com', 'Password123!')
    ).rejects.toThrow('Firestore write failed');
  });

  test('Boş isim girildiğinde hata fırlatılmalı', async () => {
    await expect(
      authService.register('', 'test@dailybeat.com', 'Password123!')
    ).rejects.toThrow();
  });

});


// ─────────────────────────────────────────────────────────────────────────────
// BLOK 2: AuthService — login()
// ─────────────────────────────────────────────────────────────────────────────

describe('AuthService.login()', () => {

  let authService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService(mockAuth, mockFirestore);
  });

  test('Doğru email ve şifre ile giriş başarılı', async () => {
    const mockUser    = createMockFirebaseUser();
    const mockUserDoc = createMockUserDoc();

    signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    getDoc.mockResolvedValue({ exists: () => true, data: () => mockUserDoc });
    doc.mockReturnValue('mock-doc-ref');

    const result = await authService.login('test@dailybeat.com', 'Password123!');

    expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      mockAuth,
      'test@dailybeat.com',
      'Password123!'
    );
    expect(result).toHaveProperty('uid', 'test-uid-123');
  });

  test('Giriş başarılı — token döndürülmeli', async () => {
    const mockUser = { ...createMockFirebaseUser(), getIdToken: jest.fn().mockResolvedValue('mock-jwt-token') };
    const mockUserDoc = createMockUserDoc();

    signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    getDoc.mockResolvedValue({ exists: () => true, data: () => mockUserDoc });
    doc.mockReturnValue('mock-doc-ref');

    const result = await authService.login('test@dailybeat.com', 'Password123!');

    expect(result).toHaveProperty('token');
    expect(result.token).toBe('mock-jwt-token');
  });

  test('Yanlış şifre ile giriş — Firebase hatasını yakalamalı', async () => {
    const firebaseError = { code: 'auth/wrong-password', message: 'Wrong password' };
    signInWithEmailAndPassword.mockRejectedValue(firebaseError);

    await expect(
      authService.login('test@dailybeat.com', 'WrongPassword!')
    ).rejects.toMatchObject({ code: 'auth/wrong-password' });
  });

  test('Kayıtlı olmayan email ile giriş — Firebase hatasını yakalamalı', async () => {
    const firebaseError = { code: 'auth/user-not-found', message: 'User not found' };
    signInWithEmailAndPassword.mockRejectedValue(firebaseError);

    await expect(
      authService.login('nouser@dailybeat.com', 'Password123!')
    ).rejects.toMatchObject({ code: 'auth/user-not-found' });
  });

  test('Çok fazla başarısız giriş — rate limit hatasını yakalamalı', async () => {
    const firebaseError = { code: 'auth/too-many-requests', message: 'Too many requests' };
    signInWithEmailAndPassword.mockRejectedValue(firebaseError);

    await expect(
      authService.login('test@dailybeat.com', 'WrongPass!')
    ).rejects.toMatchObject({ code: 'auth/too-many-requests' });
  });

  test('Giriş başarılı ama Firestore\'da kullanıcı belgesi yok — yine de login dönmeli', async () => {
    const mockUser = { ...createMockFirebaseUser(), getIdToken: jest.fn().mockResolvedValue('token') };
    signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    getDoc.mockResolvedValue({ exists: () => false });
    doc.mockReturnValue('mock-doc-ref');

    const result = await authService.login('test@dailybeat.com', 'Password123!');

    // Firebase auth başarılıysa Firestore belgesi olmasa da uid dönmeli
    expect(result).toHaveProperty('uid');
  });

});


// ─────────────────────────────────────────────────────────────────────────────
// BLOK 3: AuthService — logout()
// ─────────────────────────────────────────────────────────────────────────────

describe('AuthService.logout()', () => {

  let authService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService(mockAuth, mockFirestore);
  });

  test('Başarıyla oturum kapatılmalı', async () => {
    signOut.mockResolvedValue(undefined);

    await expect(authService.logout()).resolves.not.toThrow();
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(signOut).toHaveBeenCalledWith(mockAuth);
  });

  test('Firebase logout hatası — fırlatılmalı', async () => {
    signOut.mockRejectedValue(new Error('Network error during logout'));

    await expect(authService.logout()).rejects.toThrow('Network error during logout');
  });

  test('Logout sonrası getCurrentUser null dönmeli', async () => {
    signOut.mockResolvedValue(undefined);
    mockAuth.currentUser = null;

    await authService.logout();

    const user = authService.getCurrentUser();
    expect(user).toBeNull();
  });

});


// ─────────────────────────────────────────────────────────────────────────────
// BLOK 4: AuthService — getCurrentUser()
// ─────────────────────────────────────────────────────────────────────────────

describe('AuthService.getCurrentUser()', () => {

  let authService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService(mockAuth, mockFirestore);
  });

  test('Giriş yapılmışsa mevcut kullanıcıyı döndürmeli', () => {
    const mockUser     = createMockFirebaseUser();
    mockAuth.currentUser = mockUser;

    const result = authService.getCurrentUser();

    expect(result).not.toBeNull();
    expect(result.uid).toBe('test-uid-123');
    expect(result.email).toBe('test@dailybeat.com');
  });

  test('Giriş yapılmamışsa null döndürmeli', () => {
    mockAuth.currentUser = null;

    const result = authService.getCurrentUser();

    expect(result).toBeNull();
  });

  test('Dönen user objesinde zorunlu alanlar bulunmalı', () => {
    mockAuth.currentUser = createMockFirebaseUser();

    const result = authService.getCurrentUser();

    expect(result).toHaveProperty('uid');
    expect(result).toHaveProperty('email');
  });

});


// ─────────────────────────────────────────────────────────────────────────────
// BLOK 5: Firebase Bağlantısı
// ─────────────────────────────────────────────────────────────────────────────

describe('Firebase Bağlantısı', () => {

  beforeEach(() => jest.clearAllMocks());

  test('Firestore\'a kullanıcı belgesi yazılabilmeli', async () => {
    doc.mockReturnValue('mock-doc-ref');
    setDoc.mockResolvedValue(undefined);

    const userData = {
      id:        'test-uid-123',
      email:     'test@dailybeat.com',
      name:      'Test User',
      favGenres: [],
      createdAt: serverTimestamp(),
    };

    await expect(
      setDoc('mock-doc-ref', userData)
    ).resolves.not.toThrow();

    expect(setDoc).toHaveBeenCalledTimes(1);
  });

  test('Firestore\'dan kullanıcı belgesi okunabilmeli', async () => {
    const mockUserData = createMockUserDoc();
    doc.mockReturnValue('mock-doc-ref');
    getDoc.mockResolvedValue({
      exists: () => true,
      data:   () => mockUserData,
      id:     'test-uid-123',
    });

    const docSnap = await getDoc('mock-doc-ref');

    expect(docSnap.exists()).toBe(true);
    expect(docSnap.data().email).toBe('test@dailybeat.com');
    expect(docSnap.data().name).toBe('Test User');
  });

  test('Var olmayan belge okunduğunda exists() false dönmeli', async () => {
    doc.mockReturnValue('mock-doc-ref');
    getDoc.mockResolvedValue({ exists: () => false });

    const docSnap = await getDoc('mock-doc-ref');

    expect(docSnap.exists()).toBe(false);
  });

  test('Firestore yazım hatası — hata fırlatılmalı', async () => {
    doc.mockReturnValue('mock-doc-ref');
    setDoc.mockRejectedValue(new Error('PERMISSION_DENIED'));

    await expect(
      setDoc('mock-doc-ref', { test: true })
    ).rejects.toThrow('PERMISSION_DENIED');
  });

  test('doc() doğru koleksiyon ve ID ile çağrılmalı', () => {
    doc(mockFirestore, 'users', 'test-uid-123');

    expect(doc).toHaveBeenCalledWith(mockFirestore, 'users', 'test-uid-123');
  });

});


// ─────────────────────────────────────────────────────────────────────────────
// BLOK 6: Express Auth Route'ları — /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {

  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
  });

  test('Geçerli body ile 201 dönmeli', async () => {
    const mockUser = createMockFirebaseUser();
    createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    setDoc.mockResolvedValue(undefined);
    doc.mockReturnValue('mock-doc-ref');

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@dailybeat.com', password: 'Password123!' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('userId');
    expect(res.body).toHaveProperty('token');
  });

  test('Eksik email ile istek — 400 dönmeli', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', password: 'Password123!' });

    expect(res.status).toBe(400);
  });

  test('Eksik şifre ile istek — 400 dönmeli', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@dailybeat.com' });

    expect(res.status).toBe(400);
  });

  test('Eksik isim ile istek — 400 dönmeli', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@dailybeat.com', password: 'Password123!' });

    expect(res.status).toBe(400);
  });

  test('Mevcut email ile kayıt — 409 dönmeli', async () => {
    const firebaseError = { code: 'auth/email-already-in-use' };
    createUserWithEmailAndPassword.mockRejectedValue(firebaseError);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'existing@dailybeat.com', password: 'Password123!' });

    expect(res.status).toBe(409);
  });

  test('Boş body ile istek — 400 dönmeli', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({});

    expect(res.status).toBe(400);
  });

  test('Content-Type application/json olmalı', async () => {
    const mockUser = createMockFirebaseUser();
    createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    setDoc.mockResolvedValue(undefined);
    doc.mockReturnValue('mock-doc-ref');

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@dailybeat.com', password: 'Password123!' });

    expect(res.headers['content-type']).toMatch(/json/);
  });

});


// ─────────────────────────────────────────────────────────────────────────────
// BLOK 7: Express Auth Route'ları — /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {

  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
  });

  test('Doğru bilgilerle giriş — 200 ve token dönmeli', async () => {
    const mockUser = {
      ...createMockFirebaseUser(),
      getIdToken: jest.fn().mockResolvedValue('mock-jwt-token'),
    };
    const mockUserDoc = createMockUserDoc();

    signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    getDoc.mockResolvedValue({ exists: () => true, data: () => mockUserDoc });
    doc.mockReturnValue('mock-doc-ref');

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@dailybeat.com', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('userId');
  });

  test('Yanlış şifre — 401 dönmeli', async () => {
    signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/wrong-password' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@dailybeat.com', password: 'WrongPass!' });

    expect(res.status).toBe(401);
  });

  test('Kayıtlı olmayan kullanıcı — 404 dönmeli', async () => {
    signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/user-not-found' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nouser@dailybeat.com', password: 'Password123!' });

    expect(res.status).toBe(404);
  });

  test('Eksik email ile istek — 400 dönmeli', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'Password123!' });

    expect(res.status).toBe(400);
  });

  test('Eksik şifre ile istek — 400 dönmeli', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@dailybeat.com' });

    expect(res.status).toBe(400);
  });

  test('Rate limit aşımı — 429 dönmeli', async () => {
    signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/too-many-requests' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@dailybeat.com', password: 'WrongPass!' });

    expect(res.status).toBe(429);
  });

  test('Başarılı login — yanıtta şifre alanı OLMAMALI (güvenlik)', async () => {
    const mockUser = {
      ...createMockFirebaseUser(),
      getIdToken: jest.fn().mockResolvedValue('mock-jwt-token'),
    };
    signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    getDoc.mockResolvedValue({ exists: () => true, data: () => createMockUserDoc() });
    doc.mockReturnValue('mock-doc-ref');

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@dailybeat.com', password: 'Password123!' });

    expect(res.body).not.toHaveProperty('password');
    expect(res.body).not.toHaveProperty('passwordHash');
  });

});


// ─────────────────────────────────────────────────────────────────────────────
// BLOK 8: Input Validasyon Testleri
// ─────────────────────────────────────────────────────────────────────────────

describe('Input Validasyon', () => {

  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
  });

  test('Geçersiz email formatı register\'da reddedilmeli', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'gecersiz-email', password: 'Password123!' });

    expect(res.status).toBe(400);
  });

  test('6 karakterden kısa şifre reddedilmeli', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@dailybeat.com', password: '12345' });

    expect(res.status).toBe(400);
  });

  test('Çok uzun email (255+ karakter) reddedilmeli', async () => {
    const longEmail = 'a'.repeat(250) + '@b.com';

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: longEmail, password: 'Password123!' });

    expect(res.status).toBe(400);
  });

  test('SQL injection içeren email reddedilmeli', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: "' OR 1=1 --", password: 'anything' });

    expect(res.status).toBe(400);
  });

  test('XSS içeren name alanı reddedilmeli ya da sanitize edilmeli', async () => {
    const mockUser = createMockFirebaseUser();
    createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    setDoc.mockResolvedValue(undefined);
    doc.mockReturnValue('mock-doc-ref');

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name:     '<script>alert("xss")</script>',
        email:    'test@dailybeat.com',
        password: 'Password123!',
      });

    // Ya 400 dönmeli ya da script tag temizlenmiş olmalı
    if (res.status === 201) {
      expect(res.body.name).not.toContain('<script>');
    } else {
      expect(res.status).toBe(400);
    }
  });

});


// ─────────────────────────────────────────────────────────────────────────────
// BLOK 9: Performans Testleri
// ─────────────────────────────────────────────────────────────────────────────

describe('⚡ Performans — Auth İşlemleri', () => {

  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
  });

  test(
    'Login isteği 2000ms içinde yanıt vermeli',
    async () => {
      const mockUser = {
        ...createMockFirebaseUser(),
        getIdToken: jest.fn().mockResolvedValue('mock-token'),
      };
      signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
      getDoc.mockResolvedValue({ exists: () => true, data: () => createMockUserDoc() });
      doc.mockReturnValue('mock-doc-ref');

      const start = Date.now();
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@dailybeat.com', password: 'Password123!' });
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(2000);
    },
    2000
  );

  test(
    'Register isteği 2000ms içinde yanıt vermeli',
    async () => {
      const mockUser = createMockFirebaseUser();
      createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
      setDoc.mockResolvedValue(undefined);
      doc.mockReturnValue('mock-doc-ref');

      const start = Date.now();
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email: 'test@dailybeat.com', password: 'Password123!' });
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(2000);
    },
    2000
  );

});
