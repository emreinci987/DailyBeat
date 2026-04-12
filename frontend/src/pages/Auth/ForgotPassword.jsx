import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../../services/api'
import './Login.css'
import './ForgotPassword.css'

function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const validateEmail = () => {
        if (!email) {
            setError('E-posta adresi gereklidir')
            return false
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Geçerli bir e-posta adresi giriniz')
            return false
        }
        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (!validateEmail()) return

        setIsLoading(true)

        try {
            await authAPI.forgotPassword({ email })
            setSuccess(true)
        } catch (err) {
            setError(err?.message || 'Şifre sıfırlama işlemi sırasında bir hata oluştu')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="forgot-page">
            {/* Animated background */}
            <div className="forgot-bg">
                <div className="forgot-bg__orb forgot-bg__orb--1"></div>
                <div className="forgot-bg__orb forgot-bg__orb--2"></div>
                <div className="forgot-bg__orb forgot-bg__orb--3"></div>
                <div className="forgot-bg__noise"></div>
            </div>

            {/* Floating music notes */}
            <div className="floating-notes">
                <span className="note note--1">♪</span>
                <span className="note note--2">♫</span>
                <span className="note note--3">♩</span>
                <span className="note note--4">♬</span>
                <span className="note note--5">♪</span>
            </div>

            <div className="forgot-container">
                <div className="forgot-card">
                    {/* Logo */}
                    <div className="forgot-card__logo">
                        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
                            <circle cx="24" cy="24" r="22" stroke="url(#forgotGrad)" strokeWidth="2.5" />
                            <path d="M18 32V18l16-4v14" stroke="url(#forgotGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="15" cy="32" r="3" fill="url(#forgotGrad)" />
                            <circle cx="31" cy="28" r="3" fill="url(#forgotGrad)" />
                            <defs>
                                <linearGradient id="forgotGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#A78BFA" />
                                    <stop offset="1" stopColor="#EC4899" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span className="forgot-card__title">Daily<span>Beat</span></span>
                    </div>

                    {success ? (
                        <div className="forgot-success">
                            <div className="forgot-success__icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                            <h2>E-posta Gönderildi!</h2>
                            <p>
                                Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine gönderildi.
                                Lütfen gelen kutunuzu kontrol edin.
                            </p>
                            <p className="forgot-success__hint">
                                E-postayı göremiyorsanız spam klasörünüzü kontrol edin.
                            </p>
                            <Link to="/login" className="forgot-back-btn" id="back-to-login-btn">
                                Giriş Sayfasına Dön
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="forgot-card__header">
                                <h2>Şifremi Unuttum</h2>
                                <p>
                                    Hesabınıza bağlı e-posta adresinizi girin.
                                    Size şifre sıfırlama bağlantısı göndereceğiz.
                                </p>
                            </div>

                            <form className="forgot-form" onSubmit={handleSubmit} noValidate>
                                {error && (
                                    <div className="form-error" role="alert" style={{ marginBottom: '0.75rem', display: 'block' }}>
                                        {error}
                                    </div>
                                )}

                                <div className={`form-group ${error ? 'form-group--error' : ''}`}>
                                    <label htmlFor="forgot-email" className="form-label">E-posta</label>
                                    <div className="input-wrapper">
                                        <svg className="input-icon" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                        <input
                                            id="forgot-email"
                                            type="email"
                                            className="form-input"
                                            placeholder="ornek@email.com"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value)
                                                setError('')
                                            }}
                                            autoComplete="email"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className={`forgot-submit-btn ${isLoading ? 'forgot-submit-btn--loading' : ''}`}
                                    disabled={isLoading}
                                    id="forgot-submit-btn"
                                >
                                    {isLoading ? (
                                        <span className="forgot-submit-btn__spinner"></span>
                                    ) : (
                                        'Şifre Sıfırlama Bağlantısı Gönder'
                                    )}
                                </button>
                            </form>

                            <p className="forgot-footer">
                                Şifrenizi hatırlıyor musunuz?{' '}
                                <Link to="/login" className="forgot-login-link">Giriş Yap</Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
