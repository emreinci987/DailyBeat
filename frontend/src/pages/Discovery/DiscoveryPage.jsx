import { Link } from 'react-router-dom'
import './DiscoveryPage.css'

function DiscoveryPage() {
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
