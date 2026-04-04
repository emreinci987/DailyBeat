import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import './Home.css'

function Home() {
    const { user } = useAuth()

    return (
        <div className="home-page">
            {/* Animated background */}
            <div className="home-bg">
                <div className="home-bg__orb home-bg__orb--1"></div>
                <div className="home-bg__orb home-bg__orb--2"></div>
                <div className="home-bg__orb home-bg__orb--3"></div>
                <div className="home-bg__noise"></div>
            </div>

            {/* Floating music notes */}
            <div className="home-floating-notes">
                <span className="home-note home-note--1">♪</span>
                <span className="home-note home-note--2">♫</span>
                <span className="home-note home-note--3">♩</span>
                <span className="home-note home-note--4">♬</span>
            </div>

            {/* Main */}
            <main className="home-main">
                {/* Hero */}
                <div className="home-hero">
                    <p className="home-hero__greeting">
                        Merhaba, {user?.displayName || user?.email || 'Kullanıcı'} 👋
                    </p>
                    <h1 className="home-hero__title">
                        Daily<span>Beat</span>'e Hoş Geldin
                    </h1>
                    <p className="home-hero__subtitle">
                        Ruh halini seç, sana özel müzik önerisi al. Ne yapmak istersin?
                    </p>
                </div>

                {/* Quick actions */}
                <div className="home-actions">
                    <Link to="/app/mood" className="home-action-card">
                        <div className="home-action-card__icon home-action-card__icon--purple">🎭</div>
                        <div className="home-action-card__info">
                            <div className="home-action-card__title">Duygu Seç</div>
                            <div className="home-action-card__desc">Ruh halini belirle</div>
                        </div>
                        <span className="home-action-card__arrow">→</span>
                    </Link>

                    <Link to="/app/recommend" className="home-action-card">
                        <div className="home-action-card__icon home-action-card__icon--gradient">🎶</div>
                        <div className="home-action-card__info">
                            <div className="home-action-card__title">Duygu & Öneri</div>
                            <div className="home-action-card__desc">Tek adımda müzik al</div>
                        </div>
                        <span className="home-action-card__arrow">→</span>
                    </Link>

                    <Link to="/app/suggestions" className="home-action-card">
                        <div className="home-action-card__icon home-action-card__icon--pink">🎵</div>
                        <div className="home-action-card__info">
                            <div className="home-action-card__title">Öneriler</div>
                            <div className="home-action-card__desc">Müzik önerilerini gör</div>
                        </div>
                        <span className="home-action-card__arrow">→</span>
                    </Link>

                    <Link to="/app/profile" className="home-action-card">
                        <div className="home-action-card__icon home-action-card__icon--cyan">👤</div>
                        <div className="home-action-card__info">
                            <div className="home-action-card__title">Profil</div>
                            <div className="home-action-card__desc">Hesap bilgilerin</div>
                        </div>
                        <span className="home-action-card__arrow">→</span>
                    </Link>

                    <Link to="/app/history" className="home-action-card">
                        <div className="home-action-card__icon home-action-card__icon--indigo">📜</div>
                        <div className="home-action-card__info">
                            <div className="home-action-card__title">Geçmiş</div>
                            <div className="home-action-card__desc">Duygu kayıtların</div>
                        </div>
                        <span className="home-action-card__arrow">→</span>
                    </Link>

                    <Link to="/app/discovery" className="home-action-card">
                        <div className="home-action-card__icon home-action-card__icon--amber">🔍</div>
                        <div className="home-action-card__info">
                            <div className="home-action-card__title">Keşfet</div>
                            <div className="home-action-card__desc">Yeni müzik bul</div>
                        </div>
                        <span className="home-action-card__arrow">→</span>
                    </Link>
                </div>
            </main>
        </div>
    )
}

export default Home
