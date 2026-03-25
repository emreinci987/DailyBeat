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
            </nav>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={logout}>Cikis Yap</button>
            </div>
        </main>
    )
}

export default Home
