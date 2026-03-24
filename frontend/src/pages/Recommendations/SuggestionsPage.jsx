import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { recommendationAPI } from '../../services/api'
import './SuggestionsPage.css'

const MOOD_META = {
    happy:     { emoji: '😊', label: 'Mutlu',      color: '#FBBF24' },
    sad:       { emoji: '😢', label: 'Üzgün',      color: '#60A5FA' },
    energetic: { emoji: '⚡', label: 'Enerjik',    color: '#F97316' },
    calm:      { emoji: '😌', label: 'Sakin',       color: '#34D399' },
    angry:     { emoji: '😡', label: 'Kızgın',     color: '#EF4444' },
    romantic:  { emoji: '💕', label: 'Romantik',   color: '#EC4899' },
    anxious:   { emoji: '😰', label: 'Endişeli',   color: '#A78BFA' },
    nostalgic: { emoji: '🥹', label: 'Nostaljik',  color: '#FB923C' },
    focused:   { emoji: '🎯', label: 'Odaklanmış', color: '#06B6D4' },
}

/* Placeholder songs when API is unavailable */
const PLACEHOLDER_SONGS = [
    { id: '1', title: 'Yükleniyor...', artist: 'Öneriler hazırlanıyor', url: '#', source: 'spotify' },
]

function SuggestionsPage() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const mood = location.state?.mood || 'happy'
    const intensity = location.state?.intensity || 5
    const moodInfo = MOOD_META[mood] || MOOD_META.happy

    const [songs, setSongs] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let cancelled = false

        async function fetchRecommendations() {
            setIsLoading(true)
            setError(null)
            try {
                const data = await recommendationAPI.get({ mood, intensity })
                if (!cancelled) {
                    setSongs(data.data?.songs || data.songs || [])
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Öneri hatası:', err)
                    setError('Öneriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.')
                }
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        }

        fetchRecommendations()
        return () => { cancelled = true }
    }, [mood, intensity])

    const getSourceIcon = (source) => {
        if (source === 'youtube') {
            return (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="#FF0000">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
            )
        }
        return (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#1DB954">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
        )
    }

    return (
        <div className="suggestions-page" style={{ '--mood-color': moodInfo.color }}>
            {/* Animated background */}
            <div className="sug-bg">
                <div className="sug-bg__orb sug-bg__orb--1"></div>
                <div className="sug-bg__orb sug-bg__orb--2"></div>
                <div className="sug-bg__orb sug-bg__orb--3"></div>
                <div className="sug-bg__noise"></div>
            </div>

            {/* Header */}
            <header className="sug-header">
                <div className="sug-header__brand">
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                        <circle cx="24" cy="24" r="22" stroke="url(#sugBrandGrad)" strokeWidth="2.5" />
                        <path d="M18 32V18l16-4v14" stroke="url(#sugBrandGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="15" cy="32" r="3" fill="url(#sugBrandGrad)" />
                        <circle cx="31" cy="28" r="3" fill="url(#sugBrandGrad)" />
                        <defs>
                            <linearGradient id="sugBrandGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#A78BFA" />
                                <stop offset="1" stopColor="#EC4899" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span className="sug-header__title">Daily<span>Beat</span></span>
                </div>
                <div className="sug-header__actions">
                    <Link to="/app/mood" className="sug-header__back">
                        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Yeni Duygu
                    </Link>
                    <button className="sug-header__logout" onClick={logout} type="button">Çıkış</button>
                </div>
            </header>

            {/* Main Content */}
            <main className="sug-main">
                {/* Mood summary */}
                <div className="sug-mood-summary">
                    <span className="sug-mood-summary__emoji">{moodInfo.emoji}</span>
                    <div className="sug-mood-summary__text">
                        <h1>Senin İçin Seçtik</h1>
                        <p>{moodInfo.label} hissettiğin için bu şarkıları önerdik • Yoğunluk: {intensity}/10</p>
                    </div>
                </div>

                {/* Song list */}
                <div className="sug-songs">
                    {isLoading ? (
                        <div className="sug-loading">
                            <div className="sug-loading__spinner"></div>
                            <p>Şarkılar yükleniyor...</p>
                        </div>
                    ) : error ? (
                        <div className="sug-error">
                            <span className="sug-error__icon">😔</span>
                            <p>{error}</p>
                            <button className="sug-error__retry" onClick={() => window.location.reload()} type="button">
                                Tekrar Dene
                            </button>
                        </div>
                    ) : songs.length === 0 ? (
                        <div className="sug-empty">
                            <span className="sug-empty__icon">🎵</span>
                            <p>Henüz öneri bulunamadı. Farklı bir duygu deneyin!</p>
                            <Link to="/app/mood" className="sug-empty__back">Duygu Seç</Link>
                        </div>
                    ) : (
                        <div className="sug-song-list">
                            {songs.map((song, index) => (
                                <a
                                    key={song.id || index}
                                    href={song.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="sug-song-card"
                                    style={{ animationDelay: `${index * 0.08}s` }}
                                >
                                    <div className="sug-song-card__index">{index + 1}</div>
                                    {song.thumbnail && (
                                        <img
                                            className="sug-song-card__thumb"
                                            src={song.thumbnail}
                                            alt={song.title}
                                            loading="lazy"
                                        />
                                    )}
                                    <div className="sug-song-card__info">
                                        <span className="sug-song-card__title">{song.title}</span>
                                        <span className="sug-song-card__artist">{song.artist}</span>
                                    </div>
                                    <div className="sug-song-card__source">
                                        {getSourceIcon(song.source)}
                                    </div>
                                    <svg className="sug-song-card__play" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions footer */}
                {!isLoading && songs.length > 0 && (
                    <div className="sug-actions">
                        <Link to="/app/mood" className="sug-action-btn sug-action-btn--secondary">
                            🔄 Yeni Duygu Seç
                        </Link>
                        <Link to="/app" className="sug-action-btn sug-action-btn--primary">
                            🏠 Ana Sayfaya Dön
                        </Link>
                    </div>
                )}
            </main>
        </div>
    )
}

export default SuggestionsPage
