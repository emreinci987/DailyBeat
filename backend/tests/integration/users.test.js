import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';

describe('GET /api/users/profile (auth required)', () => {
    it('should reject unauthenticated requests', async () => {
        const res = await request(app).get('/api/users/profile');
        expect(res.status).toBe(401);
    });
});

describe('PUT /api/users/profile (auth required)', () => {
    it('should reject unauthenticated requests', async () => {
        const res = await request(app)
            .put('/api/users/profile')
            .send({ displayName: 'Hacked' });
        expect(res.status).toBe(401);
    });
});

describe('GET /api/users/playlists (auth required)', () => {
    it('should reject unauthenticated requests', async () => {
        const res = await request(app).get('/api/users/playlists');
        expect(res.status).toBe(401);
    });
});
