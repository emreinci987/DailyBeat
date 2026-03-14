import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';

describe('POST /api/auth/register', () => {
    it('should validate required fields', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({});
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.errors).toBeDefined();
    });

    it('should reject invalid email format', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'not-an-email', password: '123456' });
        expect(res.status).toBe(400);
    });

    it('should reject short password', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'test@example.com', password: '12' });
        expect(res.status).toBe(400);
    });
});

describe('GET /api/auth/me', () => {
    it('should reject unauthenticated requests', async () => {
        const res = await request(app).get('/api/auth/me');
        expect(res.status).toBe(401);
    });
});
