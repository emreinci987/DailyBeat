import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import './DiscoveryPage.css'

function DiscoveryPage() {
    const { logout } = useAuth()

    return (
        <div className="discovery-page">
            {/* Animated background */}
            <div className="disc-bg">
                <div className="disc-bg__orb disc-bg__orb--1"></div>
                <div className="disc-bg__orb disc-bg__orb--2"></div>
                <div className="disc-bg__orb disc-bg__orb--3"></div>
                <div className="disc-bg__noise"></div>
            </div>

            {/* Floating music notes */}
            <div className="disc-floating-notes">
                <span className="disc-note disc-note--1">♪</span>
                <span className="disc-note disc-note--2">♫</span>
                <span className="disc-note disc-note--3">♩</span>
                <span className="disc-note disc-note--4">♬</span>
            </div>

            {/* Header */}
            <header className="disc-header">
                <div className="disc-header__brand">
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
                        <circle cx="24" cy="24" r="22" stroke="url(#discBrandGrad)" strokeWidth="2.5" />
                        <path d="M18 32V18l16-4v14" stroke="url(#discBrandGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="15" cy="32" r="3" fill="url(#discBrandGrad)" />
                        <circle cx="31" cy="28" r="3" fill="url(#discBrandGrad)" />
                        <defs>
                            <linearGradient id="discBrandGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#A78BFA" />
                                <stop offset="1" stopColor="#EC4899" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span className="disc-header__title">Daily<span>Beat</span></span>
                </div>
                <div className="disc-header__actions">
                    <Link to="/app" className="disc-header__back">
                        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Ana Sayfa
                    </Link>
                    <button className="disc-header__logout" onClick={logout} type="button">Çıkış</button>
                </div>
            </header>

            {/* Main */}
            <main className="disc-main">
                <div className="disc-coming-soon">
                    <div className="disc-coming-soon__icon">🔍</div>
                    <div className="disc-coming-soon__badge">Yakında Gelecek</div>
                    <h1 className="disc-coming-soon__title">
                        Müzik <span>Keşfet</span>
                    </h1>
                    <p className="disc-coming-soon__desc">
                        Yeni sanatçılar, trendler ve sana özel keşif listeleri burada olacak. Bu özellik üzerinde çalışıyoruz!
                    </p>

                    {/* Progress bar */}
                    <div className="disc-progress-bar">
                        <div className="disc-progress-bar__fill"></div>
                    </div>

                    {/* Feature preview */}
                    <div className="disc-features">
                        <div className="disc-feature">
                            <span className="disc-feature__icon">🌍</span>
                            <span className="disc-feature__text">Trend olan şarkıları ve sanatçıları keşfet</span>
                        </div>
                        <div className="disc-feature">
                            <span className="disc-feature__icon">🎧</span>
                            <span className="disc-feature__text">Kişiselleştirilmiş keşif listeleri</span>
                        </div>
                        <div className="disc-feature">
                            <span className="disc-feature__icon">🏷️</span>
                            <span className="disc-feature__text">Türlere ve ruh haline göre filtrele</span>
                        </div>
                    </div>

                    <Link to="/app" className="disc-back-link">
                        <span>🏠 Ana Sayfaya Dön</span>
                    </Link>
                </div>
            </main>
        </div>
    )
}

export default DiscoveryPage
