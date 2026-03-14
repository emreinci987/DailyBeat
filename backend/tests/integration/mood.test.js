import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';

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
});

describe('GET /api/mood/history (auth required)', () => {
    it('should reject unauthenticated requests', async () => {
        const res = await request(app).get('/api/mood/history');
        expect(res.status).toBe(401);
    });
});

describe('GET /api/mood/stats (auth required)', () => {
    it('should reject unauthenticated requests', async () => {
        const res = await request(app).get('/api/mood/stats');
        expect(res.status).toBe(401);
    });
});
