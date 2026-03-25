import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';

const mockVerifyIdToken = jest.fn();
const moodEntries = new Map();
let idCounter = 0;

function nextId() {
    idCounter += 1;
    return `mood-${idCounter}`;
}

function applyQuery(collectionData, queryState) {
    let rows = [...collectionData.entries()].map(([id, data]) => ({ id, data }));

    queryState.filters.forEach(({ field, op, value }) => {
        if (op === '==') {
            rows = rows.filter((row) => row.data[field] === value);
        }
    });

    if (queryState.orderBy) {
        const { field, direction } = queryState.orderBy;
        const factor = direction === 'desc' ? -1 : 1;
        rows.sort((a, b) => {
            const left = a.data[field] || '';
            const right = b.data[field] || '';
            if (left === right) return 0;
            return left > right ? factor : -factor;
        });
    }

    if (queryState.offsetValue > 0) {
        rows = rows.slice(queryState.offsetValue);
    }

    if (typeof queryState.limitValue === 'number') {
        rows = rows.slice(0, queryState.limitValue);
    }

    return rows;
}

function createQuery(state) {
    return {
        where(field, op, value) {
            return createQuery({
                ...state,
                filters: [...state.filters, { field, op, value }],
            });
        },
        orderBy(field, direction = 'asc') {
            return createQuery({
                ...state,
                orderBy: { field, direction },
            });
        },
        limit(value) {
            return createQuery({
                ...state,
                limitValue: value,
            });
        },
        offset(value) {
            return createQuery({
                ...state,
                offsetValue: value,
            });
        },
        async get() {
            const rows = applyQuery(moodEntries, state);
            return {
                docs: rows.map((row) => ({
                    id: row.id,
                    data: () => ({ ...row.data }),
                })),
                size: rows.length,
            };
        },
    };
}

const mockDb = {
    collection(name) {
        if (name !== 'moodEntries') {
            throw new Error(`Unsupported collection: ${name}`);
        }

        return {
            async add(data) {
                const id = nextId();
                moodEntries.set(id, { ...data });
                return { id };
            },
            doc(id) {
                return {
                    async get() {
                        const data = moodEntries.get(id);
                        return {
                            exists: Boolean(data),
                            id,
                            data: () => (data ? { ...data } : undefined),
                        };
                    },
                    async delete() {
                        moodEntries.delete(id);
                    },
                };
            },
            where(field, op, value) {
                return createQuery({
                    filters: [{ field, op, value }],
                    orderBy: null,
                    limitValue: undefined,
                    offsetValue: 0,
                });
            },
        };
    },
};

jest.unstable_mockModule('../../src/config/firebase.js', () => ({
    db: mockDb,
    auth: {
        verifyIdToken: mockVerifyIdToken,
    },
    initFirebase: jest.fn(() => ({
        db: mockDb,
        auth: { verifyIdToken: mockVerifyIdToken },
    })),
    default: {
        auth: () => ({ verifyIdToken: mockVerifyIdToken }),
    },
}));

jest.unstable_mockModule('../../src/utils/logger.js', () => ({
    default: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

const { default: app } = await import('../../src/app.js');

beforeEach(() => {
    moodEntries.clear();
    idCounter = 0;
    jest.clearAllMocks();
    mockVerifyIdToken.mockImplementation(async (token) => {
        if (token === 'valid-token') {
            return { uid: 'test-uid', email: 'test@example.com', name: 'Test User', picture: '' };
        }
        if (token === 'other-valid-token') {
            return { uid: 'other-uid', email: 'other@example.com', name: 'Other User', picture: '' };
        }
        throw new Error('Invalid token');
    });
});

describe('GET /api/mood/types', () => {
    it('should return available mood types without auth', async () => {
        const res = await request(app).get('/api/mood/types');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.data).toContain('happy');
        expect(res.body.data).toContain('sad');
    });
});

describe('POST /api/mood (auth required)', () => {
    it('should reject requests without auth token', async () => {
        const res = await request(app)
            .post('/api/mood')
            .send({ mood: 'happy', intensity: 7 });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it('should reject requests with invalid Bearer token', async () => {
        const res = await request(app)
            .post('/api/mood')
            .set('Authorization', 'Bearer invalid-token')
            .send({ mood: 'happy', intensity: 7 });
        expect(res.status).toBe(401);
    });

    it('should create a mood entry for authenticated user', async () => {
        const res = await request(app)
            .post('/api/mood')
            .set('Authorization', 'Bearer valid-token')
            .send({ mood: 'happy', intensity: 7, note: 'good day' });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.userId).toBe('test-uid');
        expect(res.body.data.mood).toBe('happy');
        expect(res.body.data.createdAt).toBeDefined();
    });

    it('should reject invalid mood payload', async () => {
        const res = await request(app)
            .post('/api/mood')
            .set('Authorization', 'Bearer valid-token')
            .send({ mood: 'unknown-mood', intensity: 7 });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(Array.isArray(res.body.errors)).toBe(true);
    });
});

describe('GET /api/mood/history (auth required)', () => {
    it('should reject unauthenticated requests', async () => {
        const res = await request(app).get('/api/mood/history');
        expect(res.status).toBe(401);
    });

    it('should return formatted history for authenticated user', async () => {
        await request(app)
            .post('/api/mood')
            .set('Authorization', 'Bearer valid-token')
            .send({ mood: 'sad', intensity: 3, note: 'a bit low' });

        await request(app)
            .post('/api/mood')
            .set('Authorization', 'Bearer valid-token')
            .send({ mood: 'happy', intensity: 8, note: 'better now' });

        const res = await request(app)
            .get('/api/mood/history?limit=1&offset=0')
            .set('Authorization', 'Bearer valid-token');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.summary.totalEntries).toBe(1);
        expect(Array.isArray(res.body.data.history)).toBe(true);
        expect(res.body.data.history[0].timestamp).toBeDefined();
        expect(res.body.data.history[0].mood).toBe('happy');
    });
});

describe('GET /api/mood/stats (auth required)', () => {
    it('should reject unauthenticated requests', async () => {
        const res = await request(app).get('/api/mood/stats');
        expect(res.status).toBe(401);
    });

    it('should return distribution stats for authenticated user', async () => {
        await request(app)
            .post('/api/mood')
            .set('Authorization', 'Bearer valid-token')
            .send({ mood: 'happy', intensity: 8 });

        await request(app)
            .post('/api/mood')
            .set('Authorization', 'Bearer valid-token')
            .send({ mood: 'happy', intensity: 6 });

        await request(app)
            .post('/api/mood')
            .set('Authorization', 'Bearer valid-token')
            .send({ mood: 'sad', intensity: 4 });

        const res = await request(app)
            .get('/api/mood/stats')
            .set('Authorization', 'Bearer valid-token');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.total).toBe(3);
        expect(res.body.data.distribution.happy).toBe(2);
        expect(res.body.data.distribution.sad).toBe(1);
    });
});

describe('DELETE /api/mood/:id (auth required)', () => {
    it('should return 404 when entry does not exist', async () => {
        const res = await request(app)
            .delete('/api/mood/missing-id')
            .set('Authorization', 'Bearer valid-token');

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    it('should return 403 when user does not own the entry', async () => {
        const created = await request(app)
            .post('/api/mood')
            .set('Authorization', 'Bearer other-valid-token')
            .send({ mood: 'calm', intensity: 5 });

        const res = await request(app)
            .delete(`/api/mood/${created.body.data.id}`)
            .set('Authorization', 'Bearer valid-token');

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
    });

    it('should delete entry when owned by requester', async () => {
        const created = await request(app)
            .post('/api/mood')
            .set('Authorization', 'Bearer valid-token')
            .send({ mood: 'focused', intensity: 9 });

        const res = await request(app)
            .delete(`/api/mood/${created.body.data.id}`)
            .set('Authorization', 'Bearer valid-token');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Kayıt silindi');
    });
});
