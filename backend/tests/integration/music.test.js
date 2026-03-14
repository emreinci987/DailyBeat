import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';

describe('GET /api/music/search', () => {
    it('should accept requests without auth (optionalAuth)', async () => {
        const res = await request(app)
            .get('/api/music/search')
            .query({ q: 'test', source: 'spotify' });
        // Should not be 401 — the route allows unauthenticated access
        expect(res.status).not.toBe(401);
        // The actual API call may fail (no Spotify credentials in test),
        // but we should still get a well-formed response
        expect(res.body).toHaveProperty('success');
    });
});

describe('POST /api/recommendations (auth required)', () => {
    it('should reject unauthenticated requests', async () => {
        const res = await request(app)
            .post('/api/recommendations')
            .send({ mood: 'happy' });
        expect(res.status).toBe(401);
    });
});

describe('GET /api/recommendations/discover (auth required)', () => {
    it('should reject unauthenticated requests', async () => {
        const res = await request(app).get('/api/recommendations/discover');
        expect(res.status).toBe(401);
    });
});
