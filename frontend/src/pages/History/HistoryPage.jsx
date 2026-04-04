import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import './HistoryPage.css'

function HistoryPage() {
    const { logout } = useAuth()

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

            {/* Header */}
            <header className="hist-header">
                <div className="hist-header__brand">
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                        <circle cx="24" cy="24" r="22" stroke="url(#histBrandGrad)" strokeWidth="2.5" />
                        <path d="M18 32V18l16-4v14" stroke="url(#histBrandGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="15" cy="32" r="3" fill="url(#histBrandGrad)" />
                        <circle cx="31" cy="28" r="3" fill="url(#histBrandGrad)" />
                        <defs>
                            <linearGradient id="histBrandGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#A78BFA" />
                                <stop offset="1" stopColor="#EC4899" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span className="hist-header__title">Daily<span>Beat</span></span>
                </div>
                <div className="hist-header__actions">
                    <Link to="/app" className="hist-header__back">
                        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Ana Sayfa
                    </Link>
                    <button className="hist-header__logout" onClick={logout} type="button">Çıkış</button>
                </div>
            </header>

            {/* Main */}
            <main className="hist-main">
                <div className="hist-coming-soon">
                    <div className="hist-coming-soon__icon">📜</div>
                    <div className="hist-coming-soon__badge">Yakında Gelecek</div>
                    <h1 className="hist-coming-soon__title">
                        Duygu <span>Geçmişin</span>
                    </h1>
                    <p className="hist-coming-soon__desc">
                        Tüm duygu kayıtlarını ve müzik önerilerini burada görebileceksin. Bu özellik üzerinde çalışıyoruz!
                    </p>

                    {/* Progress bar */}
                    <div className="hist-progress-bar">
                        <div className="hist-progress-bar__fill"></div>
                    </div>

                    {/* Feature preview */}
                    <div className="hist-features">
                        <div className="hist-feature">
                            <span className="hist-feature__icon">📊</span>
                            <span className="hist-feature__text">Duygu değişim grafiğini takip et</span>
                        </div>
                        <div className="hist-feature">
                            <span className="hist-feature__icon">🎵</span>
                            <span className="hist-feature__text">Önceki müzik önerilerini tekrar dinle</span>
                        </div>
                        <div className="hist-feature">
                            <span className="hist-feature__icon">📅</span>
                            <span className="hist-feature__text">Günlük ve haftalık ruh hali özeti</span>
                        </div>
                    </div>

                    <Link to="/app" className="hist-back-link">
                        <span>🏠 Ana Sayfaya Dön</span>
                    </Link>
                </div>
            </main>
        </div>
    )
}

export default HistoryPage
