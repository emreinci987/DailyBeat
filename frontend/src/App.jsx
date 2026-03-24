import { Routes, Route, Navigate } from 'react-router-dom'
import useAuth from './hooks/useAuth'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Home from './pages/Home/Home'
import EmotionPage from './pages/MoodPicker/EmotionPage'
import ProtectedRoute from './components/auth/ProtectedRoute/ProtectedRoute'

function AuthRedirect({ children }) {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) return null
    if (isAuthenticated) return <Navigate to="/app" replace />
    return children
}

function App() {
    return (
        <Routes>
            <Route
                path="/login"
                element={(
                    <AuthRedirect>
                        <Login />
                    </AuthRedirect>
                )}
            />
            <Route
                path="/register"
                element={(
                    <AuthRedirect>
                        <Register />
                    </AuthRedirect>
                )}
            />
            <Route
                path="/app"
                element={(
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                )}
            />
            <Route
                path="/app/mood"
                element={(
                    <ProtectedRoute>
                        <EmotionPage />
                    </ProtectedRoute>
                )}
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

export default App
