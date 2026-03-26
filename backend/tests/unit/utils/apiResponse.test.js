import { describe, it, expect } from '@jest/globals';
import { successResponse, errorResponse, paginatedResponse } from '../../../src/utils/apiResponse.js';

/** Create a mock Express response object */
function mockRes() {
    const res = {
        statusCode: null,
        body: null,
        status(code) {
            res.statusCode = code;
            return res;
        },
        json(data) {
            res.body = data;
            return res;
        },
    };
    return res;
}

describe('apiResponse utilities', () => {
    describe('successResponse', () => {
        it('should return 200 with default message', () => {
            const res = mockRes();
            successResponse(res, { foo: 'bar' });
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual({ foo: 'bar' });
            expect(res.body.message).toBe('Success');
        });

        it('should accept custom message and status code', () => {
            const res = mockRes();
            successResponse(res, null, 'Created', 201);
            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe('Created');
        });
    });

    describe('errorResponse', () => {
        it('should return 500 by default', () => {
            const res = mockRes();
            errorResponse(res);
            expect(res.statusCode).toBe(500);
            expect(res.body.success).toBe(false);
        });

        it('should include errors array when provided', () => {
            const res = mockRes();
            errorResponse(res, 'Validation', 400, ['field required']);
            expect(res.statusCode).toBe(400);
            expect(res.body.errors).toEqual(['field required']);
        });
    });

    describe('paginatedResponse', () => {
        it('should include pagination metadata', () => {
            const res = mockRes();
            paginatedResponse(res, [1, 2, 3], 1, 10, 25);
            expect(res.statusCode).toBe(200);
            expect(res.body.pagination).toEqual({
                page: 1,
                limit: 10,
                total: 25,
                totalPages: 3,
            });
        });
    });
});
