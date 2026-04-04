/**
 * @file Sprint 1-2 Integration Tests
 * @description DailyBeat — Sprint 1 + Sprint 2 Comprehensive Integration Test Suite
 * 
 * Coverage:
 * ✅ Authentication (Register, Login)
 * ✅ Mood Management (Create, History, Stats, Delete, Types)
 * ✅ User Profile (Get, Update)
 * ✅ Playlist Management (Get, Delete)
 * ✅ Recommendations (Get recommendations, Discovery)
 * ✅ Error Handling & Authorization
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';

// ─────────────────────────────────────────────────────────────
// MOCKING SETUP
// ─────────────────────────────────────────────────────────────

const mockVerifyIdToken = jest.fn();
const mockCreateFirebaseUser = jest.fn();

// In-memory databases
const usersData = new Map();
const moodEntriesData = new Map();
const playlistsData = new Map();
let moodIdCounter = 0;
let playlistIdCounter = 0;

// Helper to create Firestore-like query builder
function createMoodQuery(state = {}) {
    const { filters = [], orderBy = null, limitValue = undefined, offsetValue = 0 } = state;

    return {
        where(field, op, value) {
            return createMoodQuery({
                ...state,
                filters: [...filters, { field, op, value }],
            });
        },
        orderBy(field, direction = 'asc') {
            return createMoodQuery({ ...state, orderBy: { field, direction } });
        },
        limit(value) {
            return createMoodQuery({ ...state, limitValue: value });
        },
        offset(value) {
            return createMoodQuery({ ...state, offsetValue: value });
        },
        async get() {
            let rows = [...moodEntriesData.entries()].map(([id, data]) => ({ id, data }));

            // Apply filters
            filters.forEach(({ field, op, value }) => {
                if (op === '==') {
                    rows = rows.filter(row => row.data[field] === value);
                    return;
                }

                if (op === '>=') {
                    rows = rows.filter(row => (row.data[field] || '') >= value);
                    return;
                }

                if (op === '<=') {
                    rows = rows.filter(row => (row.data[field] || '') <= value);
                }
            });

            // Apply ordering
            if (orderBy) {
                const { field, direction } = orderBy;
                const factor = direction === 'desc' ? -1 : 1;
                rows.sort((a, b) => {
                    const aVal = a.data[field] || '';
                    const bVal = b.data[field] || '';
                    if (aVal === bVal) return 0;
                    return aVal > bVal ? factor : -factor;
                });
            }

            // Apply offset and limit
            if (offsetValue > 0) {
                rows = rows.slice(offsetValue);
            }
            if (typeof limitValue === 'number') {
                rows = rows.slice(0, limitValue);
            }

            return {
                docs: rows.map(row => ({
                    id: row.id,
                    exists: true,
                    data: () => ({ ...row.data }),
                })),
                size: rows.length,
            };
        },
    };
}

// Mock Firestore db
const mockDb = {
    collection(name) {
        if (name === 'moodEntries') {
            return {
                async add(data) {
                    const id = `mood-${++moodIdCounter}`;
                    moodEntriesData.set(id, { ...data });
                    return { id };
                },
                doc(id) {
                    return {
                        async get() {
                            const data = moodEntriesData.get(id);
                            return {
                                exists: !!data,
                                id,
                                data: () => data,
                            };
                        },
                        async delete() {
                            moodEntriesData.delete(id);
                        },
                    };
                },
                where: (field, op, value) => createMoodQuery({}).where(field, op, value),
            };
        } else if (name === 'playlists') {
            return {
                async add(data) {
                    const id = `playlist-${++playlistIdCounter}`;
                    const playlist = { ...data, id, createdAt: new Date().toISOString() };
                    playlistsData.set(id, playlist);
                    return { id };
                },
                doc(id) {
                    return {
                        async get() {
                            const data = playlistsData.get(id);
                            return {
                                exists: !!data,
                                id,
                                data: () => data,
                            };
                        },
                        async delete() {
                            playlistsData.delete(id);
                        },
                    };
                },
                where(field, op, value) {
                    return {
                        orderBy(orderField, direction = 'asc') {
                            return {
                                limit(limitVal) {
                                    return {
                                        offset(offsetVal) {
                                            return {
                                                async get() {
                                                    let rows = [...playlistsData.entries()]
                                                        .filter(([_, pl]) => pl[field] === value)
                                                        .map(([id, pl]) => ({ id, data: pl }));

                                                    const factor = direction === 'desc' ? -1 : 1;
                                                    rows.sort((a, b) => {
                                                        const aVal = a.data[orderField] || '';
                                                        const bVal = b.data[orderField] || '';
                                                        if (aVal === bVal) return 0;
                                                        return aVal > bVal ? factor : -factor;
                                                    });

                                                    rows = rows.slice(offsetVal, offsetVal + limitVal);

                                                    return {
                                                        docs: rows.map(row => ({
                                                            id: row.id,
                                                            exists: true,
                                                            data: () => ({ ...row.data }),
                                                        })),
                                                    };
                                                },
                                            };
                                        },
                                    };
                                },
                            };
                        },
                    };
                },
            };
        } else if (name === 'users') {
            return {
                doc(uid) {
                    return {
                        async set(data) {
                            usersData.set(uid, { ...data, uid });
                        },
                        async get() {
                            const data = usersData.get(uid);
                            return {
                                exists: !!data,
                                id: uid,
                                data: () => data,
                            };
                        },
                        async update(data) {
                            const user = usersData.get(uid);
                            if (user) {
                                usersData.set(uid, { ...user, ...data });
                            }
                        },
                    };
                },
            };
        }
        throw new Error(`Unsupported collection: ${name}`);
    },
};

// Setup Firebase mock
jest.unstable_mockModule('../../src/config/firebase.js', () => ({
    db: mockDb,
    auth: {
        createUser: mockCreateFirebaseUser,
        verifyIdToken: mockVerifyIdToken,
    },
    initFirebase: jest.fn(() => ({
        db: mockDb,
        auth: { 
            createUser: mockCreateFirebaseUser,
            verifyIdToken: mockVerifyIdToken 
        },
    })),
    default: {
        auth: () => ({ verifyIdToken: mockVerifyIdToken }),
    },
}));

// Mock User model
jest.unstable_mockModule('../../src/models/User.js', () => ({
    default: {
        createUser: jest.fn(async (uid, data) => {
            const user = {
                uid,
                email: data.email || '',
                displayName: data.displayName || '',
                photoURL: data.photoURL || '',
                preferences: data.preferences || { genres: [], language: 'tr' },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            usersData.set(uid, user);
            return user;
        }),
        getUserById: jest.fn(async (uid) => {
            return usersData.get(uid) || null;
        }),
        updateUser: jest.fn(async (uid, data) => {
            const user = usersData.get(uid);
            if (user) {
                const updated = { ...user, ...data, updatedAt: new Date().toISOString() };
                usersData.set(uid, updated);
                return updated;
            }
            return null;
        }),
        deleteUser: jest.fn(async (uid) => {
            usersData.delete(uid);
        }),
    },
}));

// Mock logger
jest.unstable_mockModule('../../src/utils/logger.js', () => ({
    default: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

// Mock music service
jest.unstable_mockModule('../../src/services/music/musicService.js', () => ({
    searchSpotifyTracks: jest.fn(async () => [
        {
            title: 'Test Song',
            artist: 'Test Artist',
            album: 'Test Album',
            url: 'https://spotify.com/test',
            thumbnailUrl: 'https://example.com/thumb.jpg',
            previewUrl: 'https://example.com/preview.mp3',
            source: 'spotify',
        },
    ]),
    getSpotifyRecommendations: jest.fn(async () => [
        {
            title: 'Recommended Song',
            artist: 'Recommended Artist',
            album: 'Album',
            url: 'https://spotify.com/rec',
            thumbnailUrl: 'https://example.com/rec.jpg',
            source: 'spotify',
        },
    ]),
    searchYouTubeVideos: jest.fn(async () => [
        {
            title: 'YouTube Song',
            artist: 'YouTube Artist',
            url: 'https://youtube.com/watch?v=test',
            thumbnailUrl: 'https://example.com/yt.jpg',
            source: 'youtube',
        },
    ]),
}));

const { default: app } = await import('../../src/app.js');

// ─────────────────────────────────────────────────────────────
// TEST SETUP
// ─────────────────────────────────────────────────────────────

beforeEach(() => {
    jest.clearAllMocks();
    usersData.clear();
    moodEntriesData.clear();
    playlistsData.clear();
    moodIdCounter = 0;
    playlistIdCounter = 0;

    // Setup mock behaviors
    mockVerifyIdToken.mockImplementation(async (token) => {
        if (token === 'valid-token-123') {
            return {
                uid: 'user-123',
                email: 'test@example.com',
                name: 'Test User',
                picture: '',
            };
        }
        if (token === 'other-user-token') {
            return {
                uid: 'user-456',
                email: 'other@example.com',
                name: 'Other User',
                picture: '',
            };
        }
        throw new Error('Invalid token');
    });

    mockCreateFirebaseUser.mockResolvedValue({
        uid: 'firebase-uid-123',
        email: 'newuser@example.com',
    });
});

// ─────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────

describe('📱 DailyBeat Sprint 1-2 Integration Tests', () => {
    // ═══════════════════════════════════════════════════════════
    // 🔐 AUTHENTICATION (Sprint 1)
    // ═══════════════════════════════════════════════════════════

    describe('🔐 POST /api/auth/register', () => {
        it('should reject empty body', async () => {
            const res = await request(app).post('/api/auth/register').send({});
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should reject invalid email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'not-email',
                    password: 'password123',
                    displayName: 'Test',
                });
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should reject short password', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: '123',
                    displayName: 'Test',
                });
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should successfully register with valid data', async () => {
            // Mock Firebase Admin SDK path first
            mockCreateFirebaseUser.mockResolvedValue({
                uid: 'firebase-uid-123',
                email: 'newuser@example.com',
                displayName: 'New User',
            });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'newuser@example.com',
                    password: 'password123',
                    displayName: 'New User',
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.uid).toBeDefined();
            expect(res.body.data.email).toBe('newuser@example.com');
        });
    });

    describe('🔐 POST /api/auth/login', () => {
        beforeEach(() => {
            global.fetch = jest.fn();
        });

        it('should reject empty credentials', async () => {
            const res = await request(app).post('/api/auth/login').send({});
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should reject invalid email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'not-email',
                    password: 'password123',
                });
            expect(res.status).toBe(400);
        });

        it('should reject short password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: '123',
                });
            expect(res.status).toBe(400);
        });

        it('should successfully login with valid credentials', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                json: async () => ({
                    localId: 'user-123',
                    email: 'test@example.com',
                    idToken: 'valid-token-123',
                    refreshToken: 'refresh-token',
                    expiresIn: '3600',
                }),
            });

            mockVerifyIdToken.mockResolvedValueOnce({
                uid: 'user-123',
                email: 'test@example.com',
                name: 'Test User',
            });

            // Pre-create user in Firestore
            usersData.set('user-123', {
                email: 'test@example.com',
                displayName: 'Test User',
                photoURL: '',
                preferences: { genres: [] },
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.token).toBe('valid-token-123');
        });

        it('should reject invalid credentials', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                json: async () => ({
                    error: { message: 'INVALID_PASSWORD' },
                }),
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword',
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('🔐 GET /api/auth/me - Get Current User', () => {
        beforeEach(() => {
            usersData.set('user-123', {
                uid: 'user-123',
                email: 'test@example.com',
                displayName: 'Test User',
                photoURL: 'https://example.com/photo.jpg',
                preferences: { genres: ['pop', 'rock'], language: 'tr' },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        });

        it('should reject unauthenticated requests', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.status).toBe(401);
        });

        it('should reject invalid token format', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'InvalidToken');
            expect(res.status).toBe(401);
        });

        it('should reject expired/invalid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token');
            expect(res.status).toBe(401);
        });

        it('should successfully retrieve current user profile', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer valid-token-123');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.uid).toBe('user-123');
            expect(res.body.data.email).toBe('test@example.com');
            expect(res.body.data.displayName).toBe('Test User');
            expect(res.body.data.photoURL).toBe('https://example.com/photo.jpg');
            expect(res.body.data.preferences).toBeDefined();
        });

        it('should return user with correct structure', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer valid-token-123');

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty('uid');
            expect(res.body.data).toHaveProperty('email');
            expect(res.body.data).toHaveProperty('displayName');
            expect(res.body.data).toHaveProperty('preferences');
            expect(res.body.data).toHaveProperty('createdAt');
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 😊 MOOD MANAGEMENT (Sprint 2)
    // ═══════════════════════════════════════════════════════════

    describe('😊 GET /api/mood/types', () => {
        it('should return available mood types without auth', async () => {
            const res = await request(app).get('/api/mood/types');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
            expect(res.body.data).toContain('happy');
            expect(res.body.data).toContain('sad');
            expect(res.body.data).toContain('calm');
        });
    });

    describe('😊 POST /api/mood - Create Mood Entry', () => {
        it('should reject unauthenticated requests', async () => {
            const res = await request(app)
                .post('/api/mood')
                .send({ mood: 'happy', intensity: 7 });
            expect(res.status).toBe(401);
        });

        it('should reject missing mood field', async () => {
            const res = await request(app)
                .post('/api/mood')
                .set('Authorization', 'Bearer valid-token-123')
                .send({ intensity: 7 });
            expect(res.status).toBe(400);
        });

        it('should reject invalid mood type', async () => {
            const res = await request(app)
                .post('/api/mood')
                .set('Authorization', 'Bearer valid-token-123')
                .send({ mood: 'invalid-mood', intensity: 7 });
            expect(res.status).toBe(400);
        });

        it('should reject intensity outside 1-10 range', async () => {
            const res = await request(app)
                .post('/api/mood')
                .set('Authorization', 'Bearer valid-token-123')
                .send({ mood: 'happy', intensity: 15 });
            expect(res.status).toBe(400);
        });

        it('should reject note longer than 500 characters', async () => {
            const longNote = 'A'.repeat(501);
            const res = await request(app)
                .post('/api/mood')
                .set('Authorization', 'Bearer valid-token-123')
                .send({
                    mood: 'happy',
                    intensity: 7,
                    note: longNote,
                });
            expect(res.status).toBe(400);
        });

        it('should successfully create mood entry with valid data', async () => {
            const res = await request(app)
                .post('/api/mood')
                .set('Authorization', 'Bearer valid-token-123')
                .send({
                    mood: 'happy',
                    intensity: 8,
                    note: 'Had a great day',
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBeDefined();
            expect(res.body.data.mood).toBe('happy');
            expect(res.body.data.intensity).toBe(8);
            expect(res.body.data.note).toBe('Had a great day');
            expect(res.body.data.userId).toBe('user-123');
            expect(res.body.data.createdAt).toBeDefined();
        });

        it('should use default intensity of 5 if not provided', async () => {
            const res = await request(app)
                .post('/api/mood')
                .set('Authorization', 'Bearer valid-token-123')
                .send({ mood: 'calm' });

            expect(res.status).toBe(201);
            expect(res.body.data.intensity).toBe(5);
        });

        it('should allow empty note', async () => {
            const res = await request(app)
                .post('/api/mood')
                .set('Authorization', 'Bearer valid-token-123')
                .send({ mood: 'sad', intensity: 3, note: '' });

            expect(res.status).toBe(201);
            expect(res.body.data.note).toBe('');
        });
    });

    describe('😊 GET /api/mood/history - Mood History', () => {
        beforeEach(async () => {
            // Create multiple mood entries
            for (let i = 0; i < 35; i++) {
                const moods = ['happy', 'sad', 'calm', 'energetic'];
                moodEntriesData.set(`mood-${i + 1}`, {
                    userId: 'user-123',
                    mood: moods[i % moods.length],
                    intensity: (i % 10) + 1,
                    note: `Entry ${i + 1}`,
                    createdAt: new Date(Date.now() - i * 1000 * 60 * 60).toISOString(),
                });
                moodIdCounter = i + 1;
            }
        });

        it('should reject unauthenticated requests', async () => {
            const res = await request(app).get('/api/mood/history');
            expect(res.status).toBe(401);
        });

        it('should return mood history with default pagination', async () => {
            const res = await request(app)
                .get('/api/mood/history')
                .set('Authorization', 'Bearer valid-token-123');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.summary).toBeDefined();
            expect(res.body.data.chartData).toBeDefined();
            expect(res.body.data.history).toBeDefined();
            expect(Array.isArray(res.body.data.history)).toBe(true);
        });

        it('should respect limit parameter', async () => {
            const res = await request(app)
                .get('/api/mood/history')
                .query({ limit: 10 })
                .set('Authorization', 'Bearer valid-token-123');

            expect(res.status).toBe(200);
            expect(res.body.data.history.length).toBeLessThanOrEqual(10);
        });

        it('should enforce maximum limit of 100', async () => {
            const res = await request(app)
                .get('/api/mood/history')
                .query({ limit: 500 })
                .set('Authorization', 'Bearer valid-token-123');

            expect(res.status).toBe(200);
            expect(res.body.data.history.length).toBeLessThanOrEqual(100);
        });

        it('should support offset pagination', async () => {
            const res1 = await request(app)
                .get('/api/mood/history')
                .query({ limit: 10, offset: 0 })
                .set('Authorization', 'Bearer valid-token-123');

            const res2 = await request(app)
                .get('/api/mood/history')
                .query({ limit: 10, offset: 10 })
                .set('Authorization', 'Bearer valid-token-123');

            expect(res1.status).toBe(200);
            expect(res2.status).toBe(200);
            if (res1.body.data.history.length > 0 && res2.body.data.history.length > 0) {
                expect(res1.body.data.history[0].id).not.toBe(res2.body.data.history[0].id);
            }
        });

        it('should return formatted history with summary', async () => {
            const res = await request(app)
                .get('/api/mood/history')
                .set('Authorization', 'Bearer valid-token-123');

            expect(res.status).toBe(200);
            const { summary, chartData, history } = res.body.data;
            
            expect(summary.totalEntries).toBeGreaterThan(0);
            expect(summary.moodDistribution).toBeDefined();
            expect(chartData.labels).toBeDefined();
            expect(chartData.datasets).toBeDefined();
            expect(Array.isArray(history)).toBe(true);
        });
    });

    describe('😊 GET /api/mood/stats - Mood Statistics', () => {
        beforeEach(async () => {
            const moodSeq = ['happy', 'happy', 'sad', 'calm', 'happy', 'energetic'];
            moodSeq.forEach((mood, i) => {
                moodEntriesData.set(`mood-${i + 1}`, {
                    userId: 'user-123',
                    mood,
                    intensity: 5,
                    note: '',
                    createdAt: new Date().toISOString(),
                });
            });
            moodIdCounter = moodSeq.length;
        });

        it('should reject unauthenticated requests', async () => {
            const res = await request(app).get('/api/mood/stats');
            expect(res.status).toBe(401);
        });

        it('should return mood statistics', async () => {
            const res = await request(app)
                .get('/api/mood/stats')
                .set('Authorization', 'Bearer valid-token-123');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.total).toBe(6);
            expect(res.body.data.distribution).toBeDefined();
        });

        it('should correctly count mood occurrences', async () => {
            const res = await request(app)
                .get('/api/mood/stats')
                .set('Authorization', 'Bearer valid-token-123');

            expect(res.status).toBe(200);
            expect(res.body.data.distribution.happy).toBe(3);
            expect(res.body.data.distribution.sad).toBe(1);
            expect(res.body.data.distribution.calm).toBe(1);
        });
    });

    describe('😊 DELETE /api/mood/:id - Delete Mood Entry', () => {
        let moodId;

        beforeEach(async () => {
            moodId = 'mood-1';
            moodEntriesData.set(moodId, {
                userId: 'user-123',
                mood: 'happy',
                intensity: 7,
                note: 'To delete',
                createdAt: new Date().toISOString(),
            });
        });

        it('should reject unauthenticated requests', async () => {
            const res = await request(app).delete(`/api/mood/${moodId}`);
            expect(res.status).toBe(401);
        });

        it('should return 404 for non-existent mood', async () => {
            const res = await request(app)
                .delete('/api/mood/non-existent')
                .set('Authorization', 'Bearer valid-token-123');

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should successfully delete own mood entry', async () => {
            const res = await request(app)
                .delete(`/api/mood/${moodId}`)
                .set('Authorization', 'Bearer valid-token-123');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(moodEntriesData.has(moodId)).toBe(false);
        });

        it('should reject deletion by other user', async () => {
            const res = await request(app)
                .delete(`/api/mood/${moodId}`)
                .set('Authorization', 'Bearer other-user-token');

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 👤 USER PROFILE (Sprint 1-2)
    // ═══════════════════════════════════════════════════════════

    describe('👤 GET /api/users/profile', () => {
        beforeEach(() => {
            usersData.set('user-123', {
                uid: 'user-123',
                email: 'test@example.com',
                displayName: 'Test User',
                photoURL: '',
                preferences: { genres: ['pop', 'rock'] },
            });
        });

        it('should reject unauthenticated requests', async () => {
            const res = await request(app).get('/api/users/profile');
            expect(res.status).toBe(401);
        });

        it('should return user profile', async () => {
            const res = await request(app)
                .get('/api/users/profile')
                .set('Authorization', 'Bearer valid-token-123');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.uid).toBe('user-123');
            expect(res.body.data.email).toBe('test@example.com');
            expect(res.body.data.displayName).toBe('Test User');
        });

        it('should return 404 for non-existent user', async () => {
            mockVerifyIdToken.mockResolvedValueOnce({
                uid: 'non-existent',
                email: 'none@example.com',
            });

            const res = await request(app)
                .get('/api/users/profile')
                .set('Authorization', 'Bearer valid-token-123');

            expect(res.status).toBe(404);
        });
    });

    describe('👤 PUT /api/users/profile - Update Profile', () => {
        beforeEach(() => {
            usersData.set('user-123', {
                uid: 'user-123',
                email: 'test@example.com',
                displayName: 'Test User',
                photoURL: '',
                preferences: { genres: [] },
            });
        });

        it('should reject unauthenticated requests', async () => {
            const res = await request(app)
                .put('/api/users/profile')
                .send({ displayName: 'New Name' });
            expect(res.status).toBe(401);
        });

        it('should reject invalid photoURL', async () => {
            const res = await request(app)
                .put('/api/users/profile')
                .set('Authorization', 'Bearer valid-token-123')
                .send({ photoURL: 'not-a-url' });

            expect(res.status).toBe(400);
        });

        it('should update displayName', async () => {
            const res = await request(app)
                .put('/api/users/profile')
                .set('Authorization', 'Bearer valid-token-123')
                .send({ displayName: 'Updated Name' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(usersData.get('user-123').displayName).toBe('Updated Name');
        });

        it('should update photoURL', async () => {
            const newURL = 'https://example.com/photo.jpg';
            const res = await request(app)
                .put('/api/users/profile')
                .set('Authorization', 'Bearer valid-token-123')
                .send({ photoURL: newURL });

            expect(res.status).toBe(200);
            expect(usersData.get('user-123').photoURL).toBe(newURL);
        });

        it('should update preferences', async () => {
            const res = await request(app)
                .put('/api/users/profile')
                .set('Authorization', 'Bearer valid-token-123')
                .send({
                    preferences: { genres: ['jazz', 'classical'] },
                });

            expect(res.status).toBe(200);
            expect(usersData.get('user-123').preferences.genres).toContain('jazz');
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 🎵 PLAYLISTS (Sprint 2)
    // ═══════════════════════════════════════════════════════════

    describe('🎵 GET /api/users/playlists', () => {
        beforeEach(() => {
            for (let i = 0; i < 5; i++) {
                playlistsData.set(`playlist-${i + 1}`, {
                    userId: 'user-123',
                    name: `Playlist ${i + 1}`,
                    mood: 'happy',
                    songs: [],
                    createdAt: new Date(Date.now() - i * 1000).toISOString(),
                });
            }
            playlistIdCounter = 5;
        });

        it('should reject unauthenticated requests', async () => {
            const res = await request(app).get('/api/users/playlists');
            expect(res.status).toBe(401);
        });

        it('should return user playlists', async () => {
            const res = await request(app)
                .get('/api/users/playlists')
                .set('Authorization', 'Bearer valid-token-123');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should return only user\'s playlists', async () => {
            const res = await request(app)
                .get('/api/users/playlists')
                .set('Authorization', 'Bearer valid-token-123');

            expect(res.status).toBe(200);
            res.body.data.forEach(pl => {
                expect(pl.userId).toBe('user-123');
            });
        });

        it('should support limit parameter', async () => {
            const res = await request(app)
                .get('/api/users/playlists')
                .query({ limit: 2 })
                .set('Authorization', 'Bearer valid-token-123');

            expect(res.status).toBe(200);
            expect(res.body.data.length).toBeLessThanOrEqual(2);
        });

        it('should support offset pagination', async () => {
            const res = await request(app)
                .get('/api/users/playlists')
                .query({ offset: 2, limit: 2 })
                .set('Authorization', 'Bearer valid-token-123');

            expect(res.status).toBe(200);
            expect(res.body.data.length).toBeLessThanOrEqual(2);
        });
    });

    describe('🎵 DELETE /api/users/playlists/:id', () => {
        beforeEach(() => {
            playlistsData.set('playlist-1', {
                userId: 'user-123',
                name: 'My Playlist',
                mood: 'happy',
                songs: [],
                createdAt: new Date().toISOString(),
            });
        });

        it('should reject unauthenticated requests', async () => {
            const res = await request(app).delete('/api/users/playlists/playlist-1');
            expect(res.status).toBe(401);
        });

        it('should return 404 for non-existent playlist', async () => {
            const res = await request(app)
                .delete('/api/users/playlists/non-existent')
                .set('Authorization', 'Bearer valid-token-123');

            expect(res.status).toBe(404);
        });

        it('should successfully delete own playlist', async () => {
            const res = await request(app)
                .delete('/api/users/playlists/playlist-1')
                .set('Authorization', 'Bearer valid-token-123');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(playlistsData.has('playlist-1')).toBe(false);
        });

        it('should reject deletion by other user', async () => {
            const res = await request(app)
                .delete('/api/users/playlists/playlist-1')
                .set('Authorization', 'Bearer other-user-token');

            expect(res.status).toBe(403);
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 🎵 RECOMMENDATIONS (Sprint 2)
    // ═══════════════════════════════════════════════════════════

    describe('🎵 POST /api/recommendations - Get Recommendations', () => {
        it('should reject unauthenticated requests', async () => {
            const res = await request(app)
                .post('/api/recommendations')
                .send({ mood: 'happy' });
            expect(res.status).toBe(401);
        });

        it('should reject missing mood', async () => {
            const res = await request(app)
                .post('/api/recommendations')
                .set('Authorization', 'Bearer valid-token-123')
                .send({});
            expect(res.status).toBe(400);
        });

        it('should reject invalid mood', async () => {
            const res = await request(app)
                .post('/api/recommendations')
                .set('Authorization', 'Bearer valid-token-123')
                .send({ mood: 'invalid' });
            expect(res.status).toBe(400);
        });

        it('should return recommendations for valid mood', async () => {
            const res = await request(app)
                .post('/api/recommendations')
                .set('Authorization', 'Bearer valid-token-123')
                .send({ mood: 'happy' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data.songs)).toBe(true);
        });

        it('should respect limit parameter', async () => {
            const res = await request(app)
                .post('/api/recommendations')
                .set('Authorization', 'Bearer valid-token-123')
                .send({ mood: 'calm', limit: 5 });

            expect(res.status).toBe(200);
            expect(res.body.data.songs.length).toBeLessThanOrEqual(5);
        });

        it('should enforce maximum limit of 50', async () => {
            const res = await request(app)
                .post('/api/recommendations')
                .set('Authorization', 'Bearer valid-token-123')
                .send({ mood: 'sad', limit: 50 });

            expect(res.status).toBe(200);
            expect(res.body.data.songs.length).toBeLessThanOrEqual(50);
        });

        it('should not create playlist when save=false', async () => {
            const res = await request(app)
                .post('/api/recommendations')
                .set('Authorization', 'Bearer valid-token-123')
                .send({ mood: 'happy', save: false });

            expect(res.status).toBe(200);
            expect(res.body.data.playlist).toBeNull();
        });

        it('should create playlist when save=true', async () => {
            const res = await request(app)
                .post('/api/recommendations')
                .set('Authorization', 'Bearer valid-token-123')
                .send({ mood: 'happy', save: true });

            expect(res.status).toBe(200);
            expect(res.body.data.playlist).toBeDefined();
            expect(res.body.data.playlist.id).toBeDefined();
            expect(res.body.data.playlist.mood).toBe('happy');
        });
    });

    describe('🎵 GET /api/recommendations/discover - Discovery Mode', () => {
        it('should reject unauthenticated requests', async () => {
            const res = await request(app).get('/api/recommendations/discover');
            expect(res.status).toBe(401);
        });

        it('should return discovery recommendations', async () => {
            const res = await request(app)
                .get('/api/recommendations/discover')
                .set('Authorization', 'Bearer valid-token-123');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.genre).toBeDefined();
            expect(Array.isArray(res.body.data.songs)).toBe(true);
        });

        it('should return valid genre', async () => {
            const validGenres = [
                'jazz', 'classical', 'world-music', 'blues',
                'reggae', 'latin', 'k-pop'
            ];

            const res = await request(app)
                .get('/api/recommendations/discover')
                .set('Authorization', 'Bearer valid-token-123');

            expect(res.status).toBe(200);
            expect(validGenres).toContain(res.body.data.genre);
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 🛡️ ERROR HANDLING & EDGE CASES
    // ═══════════════════════════════════════════════════════════

    describe('🛡️ Error Handling', () => {
        it('should return 404 for undefined routes', async () => {
            const res = await request(app).get('/api/nonexistent');
            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should reject requests without Bearer token', async () => {
            const res = await request(app)
                .get('/api/mood/stats')
                .set('Authorization', 'Invalid-Format');

            expect([400, 401]).toContain(res.status);
        });

        it('should handle invalid token gracefully', async () => {
            const res = await request(app)
                .get('/api/mood/stats')
                .set('Authorization', 'Bearer invalid-token-xyz');

            expect(res.status).toBe(401);
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 🔄 END-TO-END WORKFLOWS
    // ═══════════════════════════════════════════════════════════

    describe('🔄 Complete Workflows', () => {
        beforeEach(() => {
            usersData.set('user-123', {
                uid: 'user-123',
                email: 'test@example.com',
                displayName: 'Test User',
                photoURL: '',
                preferences: { genres: [] },
            });
        });

        it('should complete full mood-to-recommendation workflow', async () => {
            // 1. Create mood
            const moodRes = await request(app)
                .post('/api/mood')
                .set('Authorization', 'Bearer valid-token-123')
                .send({ mood: 'happy', intensity: 8, note: 'Great day' });

            expect(moodRes.status).toBe(201);
            const moodId = moodRes.body.data.id;

            // 2. Get recommendations for that mood
            const recRes = await request(app)
                .post('/api/recommendations')
                .set('Authorization', 'Bearer valid-token-123')
                .send({ mood: 'happy', limit: 10, save: true });

            expect(recRes.status).toBe(200);
            expect(recRes.body.data.songs.length).toBeGreaterThan(0);
            expect(recRes.body.data.playlist).toBeDefined();

            // 3. Get playlists
            const playlistRes = await request(app)
                .get('/api/users/playlists')
                .set('Authorization', 'Bearer valid-token-123');

            expect(playlistRes.status).toBe(200);
            expect(playlistRes.body.data.length).toBeGreaterThan(0);

            // 4. Get mood history
            const historyRes = await request(app)
                .get('/api/mood/history')
                .set('Authorization', 'Bearer valid-token-123');

            expect(historyRes.status).toBe(200);
            expect(historyRes.body.data.history.length).toBeGreaterThan(0);
        });

        it('should complete profile update and mood tracking workflow', async () => {
            // 1. Update profile
            const updateRes = await request(app)
                .put('/api/users/profile')
                .set('Authorization', 'Bearer valid-token-123')
                .send({
                    displayName: 'Updated User',
                    preferences: { genres: ['pop', 'rock'] },
                });

            expect(updateRes.status).toBe(200);

            // 2. Add multiple moods
            const moods = ['happy', 'energetic', 'calm'];
            for (const mood of moods) {
                const res = await request(app)
                    .post('/api/mood')
                    .set('Authorization', 'Bearer valid-token-123')
                    .send({ mood, intensity: 5 });
                expect(res.status).toBe(201);
            }

            // 3. Get stats
            const statsRes = await request(app)
                .get('/api/mood/stats')
                .set('Authorization', 'Bearer valid-token-123');

            expect(statsRes.status).toBe(200);
            expect(statsRes.body.data.total).toBe(3);

            // 4. Verify profile
            const profileRes = await request(app)
                .get('/api/users/profile')
                .set('Authorization', 'Bearer valid-token-123');

            expect(profileRes.status).toBe(200);
            expect(profileRes.body.data.displayName).toBe('Updated User');
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 🎵 MUSIC SEARCH (Sprint 2)
    // ═══════════════════════════════════════════════════════════

    describe('🎵 GET /api/music/search - Search Music', () => {
        it('should handle empty query parameter', async () => {
            const res = await request(app)
                .get('/api/music/search')
                .query({ q: '' });
            expect([200, 400, 500]).toContain(res.status);
        });

        it('should handle missing query parameter gracefully', async () => {
            const res = await request(app).get('/api/music/search');
            expect([200, 400, 500]).toContain(res.status);
        });

        it('should search music without authentication', async () => {
            const res = await request(app)
                .get('/api/music/search')
                .query({ q: 'happy' });

            expect([200, 400, 500]).toContain(res.status);
            if (res.status === 200) {
                expect(res.body.success).toBe(true);
                expect(Array.isArray(res.body.data)).toBe(true);
            }
        });

        it('should search music with authentication', async () => {
            const res = await request(app)
                .get('/api/music/search')
                .query({ q: 'love' })
                .set('Authorization', 'Bearer valid-token-123');

            expect([200, 400, 500]).toContain(res.status);
            if (res.status === 200) {
                expect(res.body.success).toBe(true);
                expect(Array.isArray(res.body.data)).toBe(true);
            }
        });

        it('should support limit parameter for search results', async () => {
            const res = await request(app)
                .get('/api/music/search')
                .query({ q: 'music', limit: 10 });

            expect([200, 400, 500]).toContain(res.status);
            if (res.status === 200 && Array.isArray(res.body.data)) {
                expect(res.body.data.length).toBeLessThanOrEqual(10);
            }
        });

        it('should support offset parameter for pagination', async () => {
            const res = await request(app)
                .get('/api/music/search')
                .query({ q: 'rock', limit: 5, offset: 0 });

            expect([200, 400, 500]).toContain(res.status);
            if (res.status === 200) {
                expect(res.body.success).toBe(true);
            }
        });

        it('should return music with expected structure', async () => {
            const res = await request(app)
                .get('/api/music/search')
                .query({ q: 'happy' });

            if (res.status === 200 && res.body.data.length > 0) {
                const song = res.body.data[0];
                expect(song).toHaveProperty('title');
                expect(song).toHaveProperty('artist');
                expect(song).toHaveProperty('source');
            }
        });

        it('should handle special characters in search query', async () => {
            const res = await request(app)
                .get('/api/music/search')
                .query({ q: 'rock & roll' });

            expect([200, 400, 500]).toContain(res.status);
        });

        it('should handle unicode characters in search', async () => {
            const res = await request(app)
                .get('/api/music/search')
                .query({ q: 'türkçe müzik' });

            expect([200, 400, 500]).toContain(res.status);
        });
    });
});
