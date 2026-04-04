import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { moodAPI } from '../../services/api'
import './HistoryPage.css'

const MOOD_LABELS_TR = {
    happy: 'Mutlu',
    sad: 'Uzgün',
    energetic: 'Enerjik',
    calm: 'Sakin',
    angry: 'Kizgin',
    romantic: 'Romantik',
    anxious: 'Endiseli',
    nostalgic: 'Nostaljik',
    focused: 'Odaklanmis',
}

function formatMoodCounts(moodCounts) {
    const pairs = Object.entries(moodCounts || {});
    if (pairs.length === 0) return 'Kayit yok';

    return pairs
        .sort((a, b) => b[1] - a[1])
        .map(([mood, count]) => `${count} ${MOOD_LABELS_TR[mood] || mood}`)
        .join(', ');
}

function HistoryPage() {
    const [days, setDays] = useState([])
    const [period, setPeriod] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', [])

    useEffect(() => {
        let cancelled = false

        async function fetchHistory() {
            setIsLoading(true)
            setError(null)

            try {
                const response = await moodAPI.history({ limit: 30, offset: 0, timezone })
                if (cancelled) return

                const weekly = response?.data?.weeklyBreakdown
                setPeriod(weekly?.period || null)
                setDays(Array.isArray(weekly?.days) ? weekly.days : [])
            } catch (err) {
                if (!cancelled) {
                    setError(err?.message || 'Gecmis verileri yüklenemedi')
                }
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        }

        fetchHistory()
        return () => { cancelled = true }
    }, [timezone])

    return (
        <div className="history-page">
            {/* Animated background */}
            <div className="hist-bg">
                <div className="hist-bg__orb hist-bg__orb--1"></div>
                <div className="hist-bg__orb hist-bg__orb--2"></div>
                <div className="hist-bg__orb hist-bg__orb--3"></div>
                <div className="hist-bg__noise"></div>
            </div>

            {/* Floating music notes */}
            <div className="hist-floating-notes">
                <span className="hist-note hist-note--1">♪</span>
                <span className="hist-note hist-note--2">♫</span>
                <span className="hist-note hist-note--3">♩</span>
                <span className="hist-note hist-note--4">♬</span>
            </div>

            {/* Main */}
            <main className="hist-main">
                <div className="hist-card">
                    <div className="hist-card__icon">📜</div>
                    <div className="hist-card__badge">Son 7 Gün</div>
                    <h1 className="hist-card__title">
                        Duygu <span>Gecmisin</span>
                    </h1>

                    {period && (
                        <p className="hist-card__period">
                            {period.startDate} - {period.endDate} ({period.timezone})
                        </p>
                    )}

                    {isLoading ? (
                        <div className="hist-loading" role="status" aria-live="polite">
                            <div className="hist-loading__spinner"></div>
                            <p>Geçmis yükleniyor...</p>
                        </div>
                    ) : error ? (
                        <div className="hist-error" role="alert">
                            <p>{error}</p>
                            <button type="button" className="hist-error__retry" onClick={() => window.location.reload()}>
                                Tekrar Dene
                            </button>
                        </div>
                    ) : days.length === 0 ? (
                        <div className="hist-empty">
                            <p>Bu hafta için duygu kaydi bulunamadi.</p>
                        </div>
                    ) : (
                        <ul className="hist-list" aria-label="Son 7 gün duygu sayimlari">
                            {days.map((day) => (
                                <li key={day.date} className="hist-list__item">
                                    <span className="hist-list__day">{day.dayName}</span>
                                    <span className="hist-list__counts">{formatMoodCounts(day.moodCounts)}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <Link to="/app" className="hist-back-link">
                        <span>🏠 Ana Sayfaya Dön</span>
                    </Link>
                </div>
            </main>
        </div>
    )
}

export default HistoryPage
