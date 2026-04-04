import { useState } from 'react'
import { Link } from 'react-router-dom'
import { moodAPI, recommendationAPI } from '../../services/api'
import './SongRecommendPage.css'

const MOODS = [
    { key: 'happy',     emoji: '😊', label: 'Mutlu',      color: '#FBBF24' },
    { key: 'sad',       emoji: '😢', label: 'Üzgün',      color: '#60A5FA' },
    { key: 'energetic', emoji: '⚡', label: 'Enerjik',    color: '#F97316' },
    { key: 'calm',      emoji: '😌', label: 'Sakin',       color: '#34D399' },
    { key: 'angry',     emoji: '😡', label: 'Kızgın',     color: '#EF4444' },
    { key: 'romantic',  emoji: '💕', label: 'Romantik',   color: '#EC4899' },
    { key: 'anxious',   emoji: '😰', label: 'Endişeli',   color: '#A78BFA' },
    { key: 'nostalgic', emoji: '🥹', label: 'Nostaljik',  color: '#FB923C' },
    { key: 'focused',   emoji: '🎯', label: 'Odaklanmış', color: '#06B6D4' },
]

function SongRecommendPage() {

    // Step 1: emotion selection
    const [selectedMood, setSelectedMood] = useState(null)
    const [intensity, setIntensity] = useState(5)

    // Step 2: results
    const [songs, setSongs] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showResults, setShowResults] = useState(false)

    const selectedMoodData = MOODS.find(m => m.key === selectedMood)

    // Current step: 1 = pick emotion, 2 = view results
    const currentStep = showResults ? 2 : 1

    const handleApplyEmotion = async () => {
        if (!selectedMood) return
        setIsLoading(true)
        setError(null)

        try {
            // Save the mood first
            await moodAPI.create({
                mood: selectedMood,
                intensity,
            })

            // Get recommendations
            const data = await recommendationAPI.get({ mood: selectedMood, intensity })
            setSongs(data.data?.songs || data.songs || [])
            setShowResults(true)
        } catch (err) {
            console.error('Öneri hatası:', err)
            setError('Öneriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleReset = () => {
        setSelectedMood(null)
        setIntensity(5)
        setSongs([])
        setShowResults(false)
        setError(null)
    }

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
        <div className="recommend-page" style={{ '--mood-color': selectedMoodData?.color || '#8B5CF6' }}>
            {/* Animated background */}
            <div className="rec-bg">
                <div className="rec-bg__orb rec-bg__orb--1"></div>
                <div className="rec-bg__orb rec-bg__orb--2"></div>
                <div className="rec-bg__orb rec-bg__orb--3"></div>
                <div className="rec-bg__noise"></div>
            </div>

            {/* Floating music notes */}
            <div className="rec-floating-notes">
                <span className="rec-note rec-note--1">♪</span>
                <span className="rec-note rec-note--2">♫</span>
                <span className="rec-note rec-note--3">♩</span>
                <span className="rec-note rec-note--4">♬</span>
            </div>


            {/* Main */}
            <main className="rec-main">
                <div className="rec-container">
                    {/* Step progress */}
                    <div className="rec-progress">
                        <div className={`rec-step ${currentStep === 1 ? 'rec-step--active' : 'rec-step--done'}`}>
                            <span className="rec-step__num">{currentStep > 1 ? '✓' : '1'}</span>
                            <span className="rec-step__label">Duygu Seç</span>
                        </div>
                        <div className="rec-step__line"></div>
                        <div className={`rec-step ${currentStep === 2 ? 'rec-step--active' : ''}`}>
                            <span className="rec-step__num">2</span>
                            <span className="rec-step__label">Öneriler</span>
                        </div>
                    </div>

                    {/* Step 1: Emotion Selection */}
                    {!showResults && (
                        <div className="rec-emotion-card">
                            <div className="rec-emotion-card__header">
                                <h1>{selectedMood ? 'Yoğunluğu Ayarla & Uygula' : 'Duygunu Seç'}</h1>
                                <p>{selectedMood
                                    ? `${selectedMoodData?.emoji} ${selectedMoodData?.label} — şimdi yoğunluğunu belirle`
                                    : 'Ruh halini seç, sana özel şarkı önerisi al'
                                }</p>
                            </div>

                            {/* Mood grid */}
                            <div className="rec-mood-grid">
                                {MOODS.map(mood => (
                                    <button
                                        key={mood.key}
                                        className={`rec-mood-btn ${selectedMood === mood.key ? 'rec-mood-btn--selected' : ''}`}
                                        onClick={() => setSelectedMood(mood.key)}
                                        style={{ '--mood-btn-color': mood.color }}
                                        id={`rec-mood-${mood.key}`}
                                        type="button"
                                    >
                                        <span className="rec-mood-btn__emoji">{mood.emoji}</span>
                                        <span className="rec-mood-btn__label">{mood.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Intensity slider — shown after mood selection */}
                            {selectedMood && (
                                <div className="rec-intensity">
                                    <label className="rec-intensity__label" htmlFor="rec-intensity-slider">
                                        Yoğunluk: <strong>{intensity}</strong>/10
                                    </label>
                                    <div className="rec-intensity__wrapper">
                                        <span className="rec-intensity__emoji">😶</span>
                                        <input
                                            id="rec-intensity-slider"
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={intensity}
                                            onChange={e => setIntensity(Number(e.target.value))}
                                            className="rec-intensity__slider"
                                            style={{
                                                '--slider-pct': `${((intensity - 1) / 9) * 100}%`,
                                                '--mood-color': selectedMoodData?.color
                                            }}
                                        />
                                        <span className="rec-intensity__emoji">🔥</span>
                                    </div>
                                </div>
                            )}

                            {/* Apply button */}
                            <button
                                className="rec-apply-btn"
                                onClick={handleApplyEmotion}
                                disabled={!selectedMood || isLoading}
                                id="rec-apply-btn"
                                type="button"
                            >
                                {isLoading ? (
                                    <span className="rec-apply-btn__spinner"></span>
                                ) : (
                                    <>
                                        <span>🎵</span>
                                        <span>Duygunu Uygula & Öneri Al</span>
                                    </>
                                )}
                            </button>

                            {error && (
                                <div className="rec-error" style={{ marginTop: '16px' }}>
                                    <div className="rec-error__icon">😔</div>
                                    <p>{error}</p>
                                    <button className="rec-error__retry" onClick={handleApplyEmotion} type="button">
                                        Tekrar Dene
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Results */}
                    {showResults && (
                        <div className="rec-results-card">
                            {/* Mood banner */}
                            <div className="rec-mood-banner">
                                <span className="rec-mood-banner__emoji">{selectedMoodData?.emoji}</span>
                                <div className="rec-mood-banner__info">
                                    <h2>Senin İçin Seçtik</h2>
                                    <p>{selectedMoodData?.label} hissettiğin için • Yoğunluk: {intensity}/10</p>
                                </div>
                            </div>

                            {/* Song list */}
                            {songs.length === 0 ? (
                                <div className="rec-empty">
                                    <div className="rec-empty__icon">🎵</div>
                                    <p>Henüz öneri bulunamadı. Farklı bir duygu deneyin!</p>
                                </div>
                            ) : (
                                <div className="rec-song-list">
                                    {songs.map((song, index) => (
                                        <a
                                            key={song.id || index}
                                            href={song.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="rec-song-card"
                                            style={{ animationDelay: `${index * 0.08}s` }}
                                        >
                                            <div className="rec-song-card__index">{index + 1}</div>
                                            {song.thumbnailUrl && (
                                                <img
                                                    className="rec-song-card__thumb"
                                                    src={song.thumbnailUrl}
                                                    alt={song.title}
                                                    loading="lazy"
                                                />
                                            )}
                                            <div className="rec-song-card__info">
                                                <span className="rec-song-card__title">{song.title}</span>
                                                <span className="rec-song-card__artist">{song.artist}</span>
                                            </div>
                                            <div className="rec-song-card__source">
                                                {getSourceIcon(song.source)}
                                            </div>
                                            <svg className="rec-song-card__play" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                            </svg>
                                        </a>
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="rec-results-actions">
                                <button
                                    className="rec-action-link rec-action-link--primary"
                                    onClick={handleReset}
                                    type="button"
                                >
                                    🔄 Yeni Duygu Seç
                                </button>
                                <Link to="/app" className="rec-action-link rec-action-link--secondary">
                                    🏠 Ana Sayfaya Dön
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default SongRecommendPage
