import { describe, it, expect } from '@jest/globals';
import errorHandler from '../../../src/middleware/errorHandler.js';

function mockRes() {
    const res = {
        statusCode: null,
        body: null,
        status(code) { res.statusCode = code; return res; },
        json(data) { res.body = data; return res; },
    };
    return res;
}

describe('errorHandler middleware', () => {
    it('should return 500 for generic errors', () => {
        const err = new Error('Something broke');
        const res = mockRes();
        errorHandler(err, {}, res, () => { });
        expect(res.statusCode).toBe(500);
        expect(res.body.success).toBe(false);
    });

    it('should use err.status when present', () => {
        const err = new Error('Not found');
        err.status = 404;
        err.expose = true;
        const res = mockRes();
        errorHandler(err, {}, res, () => { });
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Not found');
    });

    it('should hide internal message when expose is false', () => {
        const err = new Error('Secret DB error');
        const res = mockRes();
        errorHandler(err, {}, res, () => { });
        expect(res.body.message).toBe('Sunucu hatası');
    });

    it('should include stack in non-production', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        const err = new Error('Debug');
        const res = mockRes();
        errorHandler(err, {}, res, () => { });
        expect(res.body.stack).toBeDefined();
        process.env.NODE_ENV = originalEnv;
    });
});
