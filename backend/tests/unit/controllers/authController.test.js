import { describe, it, expect, jest, beforeEach } from '@jest/globals'

const mockCreateFirebaseUser = jest.fn()
const mockVerifyIdToken = jest.fn()
const mockCreateUser = jest.fn()
const mockGetUserById = jest.fn()

jest.unstable_mockModule('../../../src/config/firebase.js', () => ({
    initFirebase: jest.fn(() => ({
        auth: {
            createUser: mockCreateFirebaseUser,
            verifyIdToken: mockVerifyIdToken,
        },
        db: {},
    })),
}))

jest.unstable_mockModule('../../../src/models/User.js', () => ({
    default: {
        createUser: mockCreateUser,
        getUserById: mockGetUserById,
    },
}))

jest.unstable_mockModule('../../../src/utils/logger.js', () => ({
    default: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}))

jest.unstable_mockModule('../../../src/config/environment.js', () => ({
    default: {
        firebaseClient: {
            apiKey: 'test-api-key',
        },
    },
}))

const { register, login } = await import('../../../src/controllers/authController.js')

function mockRes() {
    const res = {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code
            return this
        },
        json(payload) {
            this.body = payload
            return this
        },
    }
    return res
}

describe('authController', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('register', () => {
        it('should create firebase user and user profile', async () => {
            const req = {
                body: { email: 'new@example.com', password: '123456', displayName: 'Yeni Kullanici' },
            }
            const res = mockRes()
            const next = jest.fn()

            mockCreateFirebaseUser.mockResolvedValue({ uid: 'uid-42' })
            mockCreateUser.mockResolvedValue({ uid: 'uid-42', email: 'new@example.com' })

            await register(req, res, next)

            expect(res.statusCode).toBe(201)
            expect(res.body.success).toBe(true)
            expect(res.body.data.uid).toBe('uid-42')
            expect(next).not.toHaveBeenCalled()
        })
    })

    describe('login', () => {
        it('should create user profile if missing on login', async () => {
            const req = {
                body: { email: 'test@example.com', password: '123456' },
            }
            const res = mockRes()
            const next = jest.fn()

            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    localId: 'uid-login',
                    email: 'test@example.com',
                    idToken: 'id-token',
                    refreshToken: 'refresh-token',
                    expiresIn: '3600',
                    displayName: 'Test User',
                }),
            })

            mockVerifyIdToken.mockResolvedValue({ uid: 'uid-login', name: 'Test User', picture: '' })
            mockGetUserById.mockResolvedValue(null)
            mockCreateUser.mockResolvedValue({ uid: 'uid-login', email: 'test@example.com', displayName: 'Test User' })

            await login(req, res, next)

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data.token).toBe('id-token')
            expect(mockCreateUser).toHaveBeenCalledWith('uid-login', {
                email: 'test@example.com',
                displayName: 'Test User',
                photoURL: '',
            })
            expect(next).not.toHaveBeenCalled()
        })
    })
})
