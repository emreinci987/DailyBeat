import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App'
import { AuthProvider } from '../../context/AuthContext'

function renderApp(initialEntry) {
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[initialEntry]}>
                <App />
            </MemoryRouter>
        </AuthProvider>,
    )
}

describe('auth screens integration', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.restoreAllMocks()
    })

    it('should login and redirect user to protected app page', async () => {
        vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
            if (url === '/api/auth/login') {
                return {
                    ok: true,
                    json: async () => ({
                        success: true,
                        data: {
                            token: 'token-1',
                            refreshToken: 'refresh-1',
                            expiresIn: 3600,
                            user: { uid: 'uid-1', email: 'user@example.com', displayName: 'Test User' },
                        },
                    }),
                }
            }

            throw new Error(`Unexpected fetch call: ${url}`)
        })

        renderApp('/login')

        const user = userEvent.setup()
        await user.type(await screen.findByLabelText(/e-posta/i), 'user@example.com')
        await user.type(screen.getByLabelText(/^şifre$/i), '123456')
        await user.click(screen.getByRole('button', { name: /^giriş yap$/i }))

        expect(await screen.findByText(/Hos geldin/i)).toBeInTheDocument()
    })

    it('should register, auto-login and redirect user to protected app page', async () => {
        vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
            if (url === '/api/auth/register') {
                return {
                    ok: true,
                    json: async () => ({
                        success: true,
                        data: { uid: 'uid-2', email: 'new@example.com', displayName: 'New User' },
                    }),
                }
            }

            if (url === '/api/auth/login') {
                return {
                    ok: true,
                    json: async () => ({
                        success: true,
                        data: {
                            token: 'token-2',
                            refreshToken: 'refresh-2',
                            expiresIn: 3600,
                            user: { uid: 'uid-2', email: 'new@example.com', displayName: 'New User' },
                        },
                    }),
                }
            }

            throw new Error(`Unexpected fetch call: ${url}`)
        })

        renderApp('/register')

        const user = userEvent.setup()

        await user.type(await screen.findByLabelText(/ad soyad/i), 'New User')
        await user.type(screen.getByLabelText(/e-posta/i), 'new@example.com')
        await user.type(screen.getByLabelText(/^şifre$/i), '123456')
        await user.type(screen.getByLabelText(/şifre tekrarı/i), '123456')
        await user.click(screen.getByRole('checkbox'))
        await user.click(screen.getByRole('button', { name: /^kayıt ol$/i }))

        expect(await screen.findByText(/Hos geldin/i)).toBeInTheDocument()
    })
})
