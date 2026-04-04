import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    authAPI,
    moodAPI,
    clearStoredToken,
    getStoredToken,
    setStoredToken,
    TOKEN_STORAGE_KEY,
} from './api'

describe('auth API client', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.restoreAllMocks()
    })

    it('should call login endpoint with payload', async () => {
        const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, data: { token: 't1' } }),
        })

        await authAPI.login({ email: 'user@example.com', password: '123456' })

        expect(fetchSpy).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
                'Content-Type': 'application/json',
            }),
        }))
    })

    it('should attach bearer token when token is stored', async () => {
        setStoredToken('jwt-token')
        const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, data: { uid: 'u1' } }),
        })

        await authAPI.me()

        expect(fetchSpy).toHaveBeenCalledWith('/api/auth/me', expect.objectContaining({
            headers: expect.objectContaining({
                Authorization: 'Bearer jwt-token',
            }),
        }))
    })

    it('should manage token storage helpers', () => {
        setStoredToken('abc')
        expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe('abc')
        expect(getStoredToken()).toBe('abc')

        clearStoredToken()
        expect(getStoredToken()).toBeNull()
    })

    it('should call mood history endpoint with query params and auth token', async () => {
        setStoredToken('jwt-token')
        const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, data: { weeklyBreakdown: { days: [] } } }),
        })

        await moodAPI.history({ limit: 30, offset: 0, timezone: 'Europe/Istanbul' })

        expect(fetchSpy).toHaveBeenCalledWith(
            '/api/mood/history?limit=30&offset=0&timezone=Europe%2FIstanbul',
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer jwt-token',
                }),
            }),
        )
    })
})
