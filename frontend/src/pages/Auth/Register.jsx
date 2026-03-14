import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Register.css'

function Register() {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [acceptTerms, setAcceptTerms] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})

    /* ---- Password strength ---- */
    const getPasswordStrength = (pwd) => {
        if (!pwd) return { level: 0, label: '' }
        let score = 0
        if (pwd.length >= 6) score++
        if (pwd.length >= 10) score++
        if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
        if (/\d/.test(pwd)) score++
        if (/[^A-Za-z0-9]/.test(pwd)) score++

        if (score <= 1) return { level: 1, label: 'Zayıf', cls: 'weak' }
        if (score === 2) return { level: 2, label: 'Orta', cls: 'fair' }
        if (score === 3) return { level: 3, label: 'İyi', cls: 'good' }
        return { level: 4, label: 'Güçlü', cls: 'strong' }
    }

    const strength = getPasswordStrength(password)

    /* ---- Validation ---- */
    const validateForm = () => {
        const newErrors = {}
        if (!fullName.trim()) {
            newErrors.fullName = 'Ad Soyad gereklidir'
        }
        if (!email) {
            newErrors.email = 'E-posta adresi gereklidir'
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Geçerli bir e-posta adresi giriniz'
        }
        if (!password) {
            newErrors.password = 'Şifre gereklidir'
        } else if (password.length < 6) {
            newErrors.password = 'Şifre en az 6 karakter olmalıdır'
        }
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Şifre tekrarı gereklidir'
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Şifreler eşleşmiyor'
        }
        if (!acceptTerms) {
            newErrors.terms = 'Kullanım şartlarını kabul etmelisiniz'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        setIsLoading(true)
        // Simülasyon — ileride backend'e bağlanacak
        setTimeout(() => {
            setIsLoading(false)
            console.log('Kayıt yapılıyor:', { fullName, email })
        }, 1500)
    }

    /* ---- Eye toggle SVGs ---- */
    const EyeOpen = (
        <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
    )
    const EyeClosed = (
        <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
        </svg>
    )

    return (
        <div className="register-page">
            {/* Animated background */}
            <div className="register-bg">
                <div className="register-bg__orb register-bg__orb--1"></div>
                <div className="register-bg__orb register-bg__orb--2"></div>
                <div className="register-bg__orb register-bg__orb--3"></div>
                <div className="register-bg__noise"></div>
            </div>

            {/* Floating music notes */}
            <div className="register-floating-notes">
                <span className="reg-note reg-note--1">♪</span>
                <span className="reg-note reg-note--2">♫</span>
                <span className="reg-note reg-note--3">♩</span>
                <span className="reg-note reg-note--4">♬</span>
                <span className="reg-note reg-note--5">♪</span>
            </div>

            <div className="register-container">
                {/* Left: branding side */}
                <div className="register-brand">
                    <div className="register-brand__content">
                        <div className="register-brand__icon">
                            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="24" cy="24" r="22" stroke="url(#regBrandGrad)" strokeWidth="2.5" />
                                <path d="M18 32V18l16-4v14" stroke="url(#regBrandGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="15" cy="32" r="3" fill="url(#regBrandGrad)" />
                                <circle cx="31" cy="28" r="3" fill="url(#regBrandGrad)" />
                                <defs>
                                    <linearGradient id="regBrandGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#A78BFA" />
                                        <stop offset="1" stopColor="#EC4899" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <h1 className="register-brand__title">
                            Daily<span>Beat</span>
                        </h1>
                        <p className="register-brand__tagline">Müziğinle Hisset</p>
                        <div className="register-brand__features">
                            <div className="reg-brand-feature">
                                <span className="reg-brand-feature__icon">🎭</span>
                                <div>
                                    <h3>Duygu Kaydı</h3>
                                    <p>Ruh halini emoji veya kaydırma çubuğuyla kaydet</p>
                                </div>
                            </div>
                            <div className="reg-brand-feature">
                                <span className="reg-brand-feature__icon">🎵</span>
                                <div>
                                    <h3>Akıllı Öneri</h3>
                                    <p>Spotify ve YouTube ile kişiselleştirilmiş müzik</p>
                                </div>
                            </div>
                            <div className="reg-brand-feature">
                                <span className="reg-brand-feature__icon">🚀</span>
                                <div>
                                    <h3>Keşif Modu</h3>
                                    <p>Sürpriz şarkılarla yeni türler keşfet</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: register form */}
                <div className="register-form-wrapper">
                    <div className="register-card">
                        <div className="register-card__header">
                            {/* Mobile logo */}
                            <div className="register-card__mobile-logo">
                                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                                    <circle cx="24" cy="24" r="22" stroke="url(#regMobileGrad)" strokeWidth="2.5" />
                                    <path d="M18 32V18l16-4v14" stroke="url(#regMobileGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx="15" cy="32" r="3" fill="url(#regMobileGrad)" />
                                    <circle cx="31" cy="28" r="3" fill="url(#regMobileGrad)" />
                                    <defs>
                                        <linearGradient id="regMobileGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#A78BFA" />
                                            <stop offset="1" stopColor="#EC4899" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <span className="register-card__mobile-title">Daily<span>Beat</span></span>
                            </div>
                            <h2>Hesap Oluştur</h2>
                            <p>Müzik yolculuğunuza başlamak için hemen kayıt olun</p>
                        </div>

                        <form className="register-form" onSubmit={handleSubmit} noValidate>
                            {/* Full Name */}
                            <div className={`reg-form-group ${errors.fullName ? 'reg-form-group--error' : ''}`}>
                                <label htmlFor="fullName" className="reg-form-label">Ad Soyad</label>
                                <div className="reg-input-wrapper">
                                    <svg className="reg-input-icon" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    <input
                                        id="fullName"
                                        type="text"
                                        className="reg-form-input"
                                        placeholder="Adınız Soyadınız"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        autoComplete="name"
                                    />
                                </div>
                                {errors.fullName && <span className="reg-form-error">{errors.fullName}</span>}
                            </div>

                            {/* Email */}
                            <div className={`reg-form-group ${errors.email ? 'reg-form-group--error' : ''}`}>
                                <label htmlFor="regEmail" className="reg-form-label">E-posta</label>
                                <div className="reg-input-wrapper">
                                    <svg className="reg-input-icon" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                    <input
                                        id="regEmail"
                                        type="email"
                                        className="reg-form-input"
                                        placeholder="ornek@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                    />
                                </div>
                                {errors.email && <span className="reg-form-error">{errors.email}</span>}
                            </div>

                            {/* Password */}
                            <div className={`reg-form-group ${errors.password ? 'reg-form-group--error' : ''}`}>
                                <label htmlFor="regPassword" className="reg-form-label">Şifre</label>
                                <div className="reg-input-wrapper">
                                    <svg className="reg-input-icon" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    <input
                                        id="regPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        className="reg-form-input"
                                        placeholder="En az 6 karakter"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="reg-password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                        aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                                    >
                                        {showPassword ? EyeClosed : EyeOpen}
                                    </button>
                                </div>
                                {errors.password && <span className="reg-form-error">{errors.password}</span>}

                                {/* Strength bar */}
                                {password && (
                                    <div className="password-strength">
                                        <div className="password-strength__bars">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`password-strength__bar ${i <= strength.level ? `password-strength__bar--active strength--${strength.cls}` : ''}`}
                                                />
                                            ))}
                                        </div>
                                        <span className={`password-strength__text strength--${strength.cls}`}>
                                            {strength.label}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className={`reg-form-group ${errors.confirmPassword ? 'reg-form-group--error' : ''}`}>
                                <label htmlFor="confirmPassword" className="reg-form-label">Şifre Tekrarı</label>
                                <div className="reg-input-wrapper">
                                    <svg className="reg-input-icon" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        className="reg-form-input"
                                        placeholder="Şifrenizi tekrar giriniz"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="reg-password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        tabIndex={-1}
                                        aria-label={showConfirmPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                                    >
                                        {showConfirmPassword ? EyeClosed : EyeOpen}
                                    </button>
                                </div>
                                {errors.confirmPassword && <span className="reg-form-error">{errors.confirmPassword}</span>}
                            </div>

                            {/* Terms */}
                            <div className={`reg-form-group ${errors.terms ? 'reg-form-group--error' : ''}`}>
                                <label className="reg-terms-wrapper" htmlFor="acceptTerms">
                                    <input
                                        id="acceptTerms"
                                        type="checkbox"
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)}
                                    />
                                    <span className="reg-terms-custom"></span>
                                    <span className="reg-terms-text">
                                        <a href="#">Kullanım Şartları</a>'nı ve <a href="#">Gizlilik Politikası</a>'nı kabul ediyorum
                                    </span>
                                </label>
                                {errors.terms && <span className="reg-form-error">{errors.terms}</span>}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className={`register-btn ${isLoading ? 'register-btn--loading' : ''}`}
                                disabled={isLoading}
                                id="register-submit-btn"
                            >
                                {isLoading ? (
                                    <span className="register-btn__spinner"></span>
                                ) : (
                                    'Kayıt Ol'
                                )}
                            </button>
                        </form>

                        <div className="register-divider">
                            <span>veya</span>
                        </div>

                        <div className="social-register">
                            <button className="social-reg-btn" type="button" id="google-register-btn">
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google ile Kayıt Ol
                            </button>
                        </div>

                        <p className="register-footer">
                            Zaten hesabınız var mı?{' '}
                            <Link to="/login">Giriş Yap</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register
