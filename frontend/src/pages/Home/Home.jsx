import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

function Home() {
    const { user, logout } = useAuth()

    return (
        <main style={{ minHeight: '100vh', padding: '2rem' }}>
            <h1>DailyBeat</h1>
            <p>Hos geldin, {user?.displayName || user?.email || 'Kullanici'}.</p>
            <p>Giris basarili. Artik korumali sayfalara erisebilirsin.</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={logout}>Cikis Yap</button>
                <Link to="/login">Login Ekrani</Link>
            </div>
        </main>
    )
}

export default Home
