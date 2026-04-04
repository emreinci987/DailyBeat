import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { moodAPI } from '../../services/api'
import './EmotionPage.css'

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

function EmotionPage() {
    const navigate = useNavigate()
    const [selectedMood, setSelectedMood] = useState(null)
    const [intensity, setIntensity] = useState(5)
    const [note, setNote] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const selectedMoodData = MOODS.find(m => m.key === selectedMood)

    const handleSubmit = async () => {
        if (!selectedMood) return
        setIsSubmitting(true)

        try {
            await moodAPI.create({
                mood: selectedMood,
                intensity,
                note: note.trim() || undefined,
            })
            setSubmitted(true)
            setTimeout(() => {
                navigate('/app/suggestions', { state: { mood: selectedMood, intensity } })
            }, 1200)
        } catch (err) {
            console.error('Mood kaydetme hatası:', err)
            setIsSubmitting(false)
        }
    }

    const handleReset = () => {
        setSelectedMood(null)
        setIntensity(5)
        setNote('')
        setSubmitted(false)
    }

    return (
        <div className="emotion-page">
            {/* Animated background */}
            <div className="emotion-bg">
                <div className="emotion-bg__orb emotion-bg__orb--1"></div>
                <div className="emotion-bg__orb emotion-bg__orb--2"></div>
                <div className="emotion-bg__orb emotion-bg__orb--3"></div>
                <div className="emotion-bg__noise"></div>
            </div>

            {/* Floating music notes */}
            <div className="emotion-floating-notes">
                <span className="em-note em-note--1">♪</span>
                <span className="em-note em-note--2">♫</span>
                <span className="em-note em-note--3">♩</span>
                <span className="em-note em-note--4">♬</span>
            </div>

            {/* Main content */}
            <main className="emotion-main">
                <div className="emotion-card">
                    {submitted ? (
                        /* Success state */
                        <div className="emotion-success">
                            <div className="emotion-success__icon">✨</div>
                            <h2>Duygun Kaydedildi!</h2>
                            <p>Sana özel müzik önerileri hazırlanıyor...</p>
                            <div className="emotion-success__spinner"></div>
                        </div>
                    ) : (
                        <>
                            {/* Step indicator */}
                            <div className="emotion-steps">
                                <div className={`emotion-step ${selectedMood ? 'emotion-step--done' : 'emotion-step--active'}`}>
                                    <span className="emotion-step__num">1</span>
                                    <span className="emotion-step__label">Duygu Seç</span>
                                </div>
                                <div className="emotion-step__line"></div>
                                <div className={`emotion-step ${selectedMood ? 'emotion-step--active' : ''}`}>
                                    <span className="emotion-step__num">2</span>
                                    <span className="emotion-step__label">Detaylar</span>
                                </div>
                            </div>

                            {/* Title */}
                            <div className="emotion-card__header">
                                <h1>{selectedMood ? 'Biraz Daha Detay' : 'Bugün Nasıl Hissediyorsun?'}</h1>
                                <p>{selectedMood
                                    ? `${selectedMoodData?.emoji} ${selectedMoodData?.label} seçtin — yoğunluğunu ayarla`
                                    : 'Ruh halini seçerek sana özel müzik önerisi al'
                                }</p>
                            </div>

                            {!selectedMood ? (
                                /* Mood grid */
                                <div className="mood-grid">
                                    {MOODS.map(mood => (
                                        <button
                                            key={mood.key}
                                            className="mood-card"
                                            onClick={() => setSelectedMood(mood.key)}
                                            style={{ '--mood-color': mood.color }}
                                            id={`mood-${mood.key}`}
                                            type="button"
                                        >
                                            <span className="mood-card__emoji">{mood.emoji}</span>
                                            <span className="mood-card__label">{mood.label}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                /* Details section */
                                <div className="emotion-details">
                                    {/* Selected mood display */}
                                    <button
                                        className="emotion-selected"
                                        onClick={handleReset}
                                        type="button"
                                        style={{ '--mood-color': selectedMoodData?.color }}
                                    >
                                        <span className="emotion-selected__emoji">{selectedMoodData?.emoji}</span>
                                        <span className="emotion-selected__label">{selectedMoodData?.label}</span>
                                        <span className="emotion-selected__change">Değiştir</span>
                                    </button>

                                    {/* Intensity slider */}
                                    <div className="intensity-section">
                                        <label className="intensity-label" htmlFor="intensity-slider">
                                            Yoğunluk: <strong>{intensity}</strong>/10
                                        </label>
                                        <div className="intensity-slider-wrapper">
                                            <span className="intensity-emoji intensity-emoji--low">😶</span>
                                            <input
                                                id="intensity-slider"
                                                type="range"
                                                min="1"
                                                max="10"
                                                value={intensity}
                                                onChange={e => setIntensity(Number(e.target.value))}
                                                className="intensity-slider"
                                                style={{ '--slider-pct': `${((intensity - 1) / 9) * 100}%`, '--mood-color': selectedMoodData?.color }}
                                            />
                                            <span className="intensity-emoji intensity-emoji--high">🔥</span>
                                        </div>
                                    </div>

                                    {/* Optional note */}
                                    <div className="note-section">
                                        <label className="note-label" htmlFor="mood-note">
                                            Not ekle <span>(isteğe bağlı)</span>
                                        </label>
                                        <textarea
                                            id="mood-note"
                                            className="note-input"
                                            placeholder="Bugün nasıl hissediyorsun? Birkaç kelimeyle anlat..."
                                            value={note}
                                            onChange={e => setNote(e.target.value)}
                                            maxLength={200}
                                            rows={3}
                                        />
                                        <span className="note-counter">{note.length}/200</span>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        className={`emotion-submit ${isSubmitting ? 'emotion-submit--loading' : ''}`}
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        id="emotion-submit-btn"
                                        type="button"
                                    >
                                        {isSubmitting ? (
                                            <span className="emotion-submit__spinner"></span>
                                        ) : (
                                            <>
                                                <span>🎵</span> Müzik Önerisi Al
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}

export default EmotionPage
