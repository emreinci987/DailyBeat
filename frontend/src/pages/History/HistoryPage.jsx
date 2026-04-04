import { Link } from 'react-router-dom'
import './HistoryPage.css'

function HistoryPage() {
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
