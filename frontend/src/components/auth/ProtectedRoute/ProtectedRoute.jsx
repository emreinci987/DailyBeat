import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'

function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth()
    const location = useLocation()

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
                <p>Yukleniyor...</p>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />
    }

    return children
}

export default ProtectedRoute
