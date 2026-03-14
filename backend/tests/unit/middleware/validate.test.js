import { describe, it, expect } from '@jest/globals';
import validate from '../../../src/middleware/validate.js';
import { registerSchema, moodSchema, recommendationSchema, updateProfileSchema } from '../../../src/types/schemas.js';

/** Minimal mock Express objects */
function mockReqRes(body = {}) {
    const req = { body };
    const res = {
        statusCode: null,
        body: null,
        status(code) { res.statusCode = code; return res; },
        json(data) { res.body = data; return res; },
    };
    const next = () => { res._nextCalled = true; };
    return { req, res, next };
}

describe('validate middleware', () => {
    describe('registerSchema', () => {
        it('should pass with valid data', () => {
            const { req, res, next } = mockReqRes({ email: 'a@b.com', password: '123456' });
            validate(registerSchema)(req, res, next);
            expect(res._nextCalled).toBe(true);
        });

        it('should reject missing email', () => {
            const { req, res, next } = mockReqRes({ password: '123456' });
            validate(registerSchema)(req, res, next);
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should reject short password', () => {
            const { req, res, next } = mockReqRes({ email: 'a@b.com', password: '12' });
            validate(registerSchema)(req, res, next);
            expect(res.statusCode).toBe(400);
        });
    });

    describe('moodSchema', () => {
        it('should pass with valid mood', () => {
            const { req, res, next } = mockReqRes({ mood: 'happy' });
            validate(moodSchema)(req, res, next);
            expect(res._nextCalled).toBe(true);
        });

        it('should reject invalid mood value', () => {
            const { req, res, next } = mockReqRes({ mood: 'unknown-mood' });
            validate(moodSchema)(req, res, next);
            expect(res.statusCode).toBe(400);
        });

        it('should enforce intensity range 1-10', () => {
            const { req, res, next } = mockReqRes({ mood: 'happy', intensity: 15 });
            validate(moodSchema)(req, res, next);
            expect(res.statusCode).toBe(400);
        });

        it('should default intensity to 5', () => {
            const { req, res, next } = mockReqRes({ mood: 'happy' });
            validate(moodSchema)(req, res, next);
            expect(req.body.intensity).toBe(5);
        });
    });

    describe('recommendationSchema', () => {
        it('should pass with valid mood', () => {
            const { req, res, next } = mockReqRes({ mood: 'energetic' });
            validate(recommendationSchema)(req, res, next);
            expect(res._nextCalled).toBe(true);
        });

        it('should default save to false', () => {
            const { req, res, next } = mockReqRes({ mood: 'calm' });
            validate(recommendationSchema)(req, res, next);
            expect(req.body.save).toBe(false);
        });
    });

    describe('updateProfileSchema', () => {
        it('should pass with partial data', () => {
            const { req, res, next } = mockReqRes({ displayName: 'Test' });
            validate(updateProfileSchema)(req, res, next);
            expect(res._nextCalled).toBe(true);
        });

        it('should strip unknown fields', () => {
            const { req, res, next } = mockReqRes({ displayName: 'Test', hackerField: 'drop table' });
            validate(updateProfileSchema)(req, res, next);
            expect(req.body.hackerField).toBeUndefined();
        });
    });
});
