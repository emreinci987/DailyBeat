import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import request from 'supertest'

const mockVerifyIdToken = jest.fn()
const mockCreateFirebaseUser = jest.fn()
const mockCreateUserProfile = jest.fn()
const mockGetUserById = jest.fn()

jest.unstable_mockModule('../../src/config/firebase.js', () => ({
    initFirebase: jest.fn(() => ({
        auth: {
            createUser: mockCreateFirebaseUser,
            verifyIdToken: mockVerifyIdToken,
        },
        db: {},
    })),
    auth: {
        createUser: mockCreateFirebaseUser,
        verifyIdToken: mockVerifyIdToken,
    },
    db: {},
    default: {
        auth: () => ({ verifyIdToken: mockVerifyIdToken }),
    },
}))

jest.unstable_mockModule('../../src/models/User.js', () => ({
    default: {
        createUser: mockCreateUserProfile,
        getUserById: mockGetUserById,
    },
}))

jest.unstable_mockModule('../../src/utils/logger.js', () => ({
    default: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}))

const { default: app } = await import('../../src/app.js')

describe('POST /api/auth/register', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should validate required fields', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({})
        expect(res.status).toBe(400)
        expect(res.body.success).toBe(false)
        expect(res.body.errors).toBeDefined()
    })

    it('should create firebase user and firestore user profile', async () => {
        mockCreateFirebaseUser.mockResolvedValue({ uid: 'uid-123', email: 'new@example.com' })
        mockCreateUserProfile.mockResolvedValue({
            uid: 'uid-123',
            email: 'new@example.com',
            displayName: 'New User',
        })

        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'new@example.com',
                password: '123456',
                displayName: 'New User',
            })

        expect(res.status).toBe(201)
        expect(res.body.success).toBe(true)
        expect(res.body.data.uid).toBe('uid-123')
        expect(mockCreateFirebaseUser).toHaveBeenCalledTimes(1)
        expect(mockCreateUserProfile).toHaveBeenCalledWith('uid-123', {
            email: 'new@example.com',
            displayName: 'New User',
        })
    })
})

describe('POST /api/auth/login', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        global.fetch = jest.fn()
    })

    it('should validate required fields', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({})
        expect(res.status).toBe(400)
        expect(res.body.success).toBe(false)
    })

    it('should login and return token with existing profile', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                localId: 'uid-1',
                email: 'user@example.com',
                idToken: 'id-token',
                refreshToken: 'refresh-token',
                expiresIn: '3600',
                displayName: 'Existing User',
            }),
        })

        mockVerifyIdToken.mockResolvedValue({ uid: 'uid-1', name: 'Existing User', picture: '' })
        mockGetUserById.mockResolvedValue({ uid: 'uid-1', email: 'user@example.com', displayName: 'Existing User' })

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'user@example.com', password: '123456' })

        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.data.token).toBe('id-token')
        expect(res.body.data.user.uid).toBe('uid-1')
        expect(mockCreateUserProfile).not.toHaveBeenCalled()
    })

    it('should map firebase invalid credentials to 401', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            json: async () => ({ error: { message: 'INVALID_PASSWORD' } }),
        })

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'user@example.com', password: 'badpass' })

        expect(res.status).toBe(401)
        expect(res.body.success).toBe(false)
    })
})

describe('GET /api/auth/me', () => {
    it('should reject unauthenticated requests', async () => {
        const res = await request(app).get('/api/auth/me')
        expect(res.status).toBe(401)
    })
})
