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
