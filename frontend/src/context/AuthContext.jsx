import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import {
    authAPI,
    clearStoredToken,
    getStoredToken,
    setStoredToken,
} from '../services/api'

const AuthContext = createContext(null)

function extractPayload(response) {
    return response?.data ?? null
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(getStoredToken())
    const [isLoading, setIsLoading] = useState(true)

    const bootstrap = useCallback(async () => {
        const existingToken = getStoredToken()

        if (!existingToken) {
            setIsLoading(false)
            return
        }

        try {
            const meResponse = await authAPI.me()
            const mePayload = extractPayload(meResponse)
            setToken(existingToken)
            setUser(mePayload)
        } catch {
            clearStoredToken()
            setToken(null)
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        bootstrap()
    }, [bootstrap])

    const login = useCallback(async ({ email, password }) => {
        const response = await authAPI.login({ email, password })
        const payload = extractPayload(response)

        if (!payload?.token || !payload?.user) {
            throw new Error('Beklenmeyen giriş yanıtı')
        }

        setStoredToken(payload.token)
        setToken(payload.token)
        setUser(payload.user)

        return payload.user
    }, [])

    const register = useCallback(async ({ email, password, displayName }) => {
        await authAPI.register({ email, password, displayName })
        return login({ email, password })
    }, [login])

    const logout = useCallback(() => {
        clearStoredToken()
        setToken(null)
        setUser(null)
    }, [])

    const value = useMemo(
        () => ({
            user,
            token,
            isLoading,
            isAuthenticated: Boolean(token && user),
            login,
            register,
            logout,
        }),
        [user, token, isLoading, login, register, logout],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
