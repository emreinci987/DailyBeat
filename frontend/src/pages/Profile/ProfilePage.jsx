import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { userAPI, moodAPI } from '../../services/api'
import './ProfilePage.css'

function ProfilePage() {
    const { user, logout } = useAuth()
    const [profile, setProfile] = useState(null)
    const [stats, setStats] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let cancelled = false

        async function fetchProfile() {
            setIsLoading(true)
            setError(null)
            try {
                const [profileData, statsData] = await Promise.allSettled([
                    userAPI.profile(),
                    moodAPI.stats(),
                ])

                if (!cancelled) {
                    if (profileData.status === 'fulfilled') {
                        setProfile(profileData.value.data || profileData.value)
                    }
                    if (statsData.status === 'fulfilled') {
                        setStats(statsData.value.data || statsData.value)
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Profil yükleme hatası:', err)
                    setError('Profil bilgileri yüklenirken bir hata oluştu.')
                }
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        }

        fetchProfile()
        return () => { cancelled = true }
    }, [])

    const displayName = profile?.displayName || user?.displayName || 'Kullanıcı'
    const email = profile?.email || user?.email || ''
    const initial = displayName.charAt(0).toUpperCase()
    const joinDate = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })
        : '—'

    return (
        <div className="profile-page">
            {/* Animated background */}
            <div className="prof-bg">
                <div className="prof-bg__orb prof-bg__orb--1"></div>
                <div className="prof-bg__orb prof-bg__orb--2"></div>
                <div className="prof-bg__orb prof-bg__orb--3"></div>
                <div className="prof-bg__noise"></div>
            </div>

            {/* Floating music notes */}
            <div className="prof-floating-notes">
                <span className="prof-note prof-note--1">♪</span>
                <span className="prof-note prof-note--2">♫</span>
                <span className="prof-note prof-note--3">♩</span>
                <span className="prof-note prof-note--4">♬</span>
            </div>

            {/* Header */}
            <header className="prof-header">
                <div className="prof-header__brand">
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                        <circle cx="24" cy="24" r="22" stroke="url(#profBrandGrad)" strokeWidth="2.5" />
                        <path d="M18 32V18l16-4v14" stroke="url(#profBrandGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="15" cy="32" r="3" fill="url(#profBrandGrad)" />
                        <circle cx="31" cy="28" r="3" fill="url(#profBrandGrad)" />
                        <defs>
                            <linearGradient id="profBrandGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#A78BFA" />
                                <stop offset="1" stopColor="#EC4899" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span className="prof-header__title">Daily<span>Beat</span></span>
                </div>
                <div className="prof-header__actions">
                    <Link to="/app" className="prof-header__back">
                        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Ana Sayfa
                    </Link>
                    <button className="prof-header__logout" onClick={logout} type="button">Çıkış</button>
                </div>
            </header>

            {/* Main */}
            <main className="prof-main">
                <div className="prof-container">
                    {/* Profile Card */}
                    <div className="prof-card">
                        {isLoading ? (
                            <div className="prof-loading">
                                <div className="prof-loading__spinner"></div>
                                <p>Profil yükleniyor...</p>
                            </div>
                        ) : error ? (
                            <div className="prof-error">
                                <div className="prof-error__icon">😔</div>
                                <p>{error}</p>
                                <button className="prof-error__retry" onClick={() => window.location.reload()} type="button">
                                    Tekrar Dene
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Avatar section */}
                                <div className="prof-avatar-section">
                                    <div className="prof-avatar">
                                        <span className="prof-avatar__initial">{initial}</span>
                                    </div>
                                    <h1 className="prof-user-name">{displayName}</h1>
                                    <p className="prof-user-email">{email}</p>
                                </div>

                                {/* Info rows */}
                                <div className="prof-info">
                                    <div className="prof-info-row">
                                        <span className="prof-info-row__label">
                                            <span className="prof-info-row__icon">📧</span>
                                            E-posta
                                        </span>
                                        <span className="prof-info-row__value">{email || '—'}</span>
                                    </div>
                                    <div className="prof-info-row">
                                        <span className="prof-info-row__label">
                                            <span className="prof-info-row__icon">📅</span>
                                            Katılım Tarihi
                                        </span>
                                        <span className="prof-info-row__value">{joinDate}</span>
                                    </div>
                                    <div className="prof-info-row">
                                        <span className="prof-info-row__label">
                                            <span className="prof-info-row__icon">🎵</span>
                                            Müzik Kaynağı
                                        </span>
                                        <span className="prof-info-row__value">{profile?.preferredSource || 'Spotify'}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Stats Card */}
                    {!isLoading && !error && (
                        <div className="prof-stats-card">
                            <h2 className="prof-stats-title">
                                <span>📊</span> İstatistikler
                            </h2>
                            <div className="prof-stats-grid">
                                <div className="prof-stat">
                                    <span className="prof-stat__value">{stats?.totalMoods || 0}</span>
                                    <span className="prof-stat__label">Kayıtlı Duygu</span>
                                </div>
                                <div className="prof-stat">
                                    <span className="prof-stat__value">{stats?.totalRecommendations || 0}</span>
                                    <span className="prof-stat__label">Öneri</span>
                                </div>
                                <div className="prof-stat">
                                    <span className="prof-stat__value">{stats?.streak || 0}</span>
                                    <span className="prof-stat__label">Gün Serisi</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions Card */}
                    {!isLoading && !error && (
                        <div className="prof-actions-card">
                            <Link to="/app/mood" className="prof-action-btn">
                                <span className="prof-action-btn__icon">🎭</span>
                                <span className="prof-action-btn__text">Duygu Seç</span>
                                <span className="prof-action-btn__arrow">→</span>
                            </Link>
                            <Link to="/app/suggestions" className="prof-action-btn">
                                <span className="prof-action-btn__icon">🎵</span>
                                <span className="prof-action-btn__text">Öneriler</span>
                                <span className="prof-action-btn__arrow">→</span>
                            </Link>
                            <Link to="/app/history" className="prof-action-btn">
                                <span className="prof-action-btn__icon">📜</span>
                                <span className="prof-action-btn__text">Geçmiş</span>
                                <span className="prof-action-btn__arrow">→</span>
                            </Link>
                            <button className="prof-action-btn prof-action-btn--danger" onClick={logout} type="button">
                                <span className="prof-action-btn__icon">🚪</span>
                                <span className="prof-action-btn__text">Çıkış Yap</span>
                                <span className="prof-action-btn__arrow">→</span>
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default ProfilePage
