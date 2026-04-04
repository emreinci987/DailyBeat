import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

function Home() {
    const { user, logout } = useAuth()

    return (
        <main style={{ minHeight: '100vh', padding: '2rem' }}>
            <h1>DailyBeat</h1>
            <p>Hos geldin, {user?.displayName || user?.email || 'Kullanici'}.</p>
            <p>Giris basarili. Artik korumali sayfalara erisebilirsin.</p>
            <nav style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <Link to="/app/mood" style={{ padding: '0.5rem 1rem', background: '#A78BFA', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>🎭 Duygu Seç</Link>
                <Link to="/app/suggestions" style={{ padding: '0.5rem 1rem', background: '#EC4899', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>🎵 Öneriler</Link>
                <Link to="/app/recommend" style={{ padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>🎶 Duygu & Öneri</Link>
                <Link to="/app/profile" style={{ padding: '0.5rem 1rem', background: '#06B6D4', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>👤 Profil</Link>
                <Link to="/app/history" style={{ padding: '0.5rem 1rem', background: '#6366F1', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>📜 Geçmiş</Link>
                <Link to="/app/discovery" style={{ padding: '0.5rem 1rem', background: '#F59E0B', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>🔍 Keşfet</Link>
            </nav>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={logout}>Cikis Yap</button>
            </div>
        </main>
    )
}

export default Home
