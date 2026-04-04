import { Routes, Route, Navigate } from 'react-router-dom'
import useAuth from './hooks/useAuth'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Home from './pages/Home/Home'
import EmotionPage from './pages/MoodPicker/EmotionPage'
import SuggestionsPage from './pages/Recommendations/SuggestionsPage'
import HistoryPage from './pages/History/HistoryPage'
import DiscoveryPage from './pages/Discovery/DiscoveryPage'
import ProfilePage from './pages/Profile/ProfilePage'
import SongRecommendPage from './pages/SongRecommend/SongRecommendPage'
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
            <Route
                path="/app/suggestions"
                element={(
                    <ProtectedRoute>
                        <SuggestionsPage />
                    </ProtectedRoute>
                )}
            />
            <Route
                path="/app/history"
                element={(
                    <ProtectedRoute>
                        <HistoryPage />
                    </ProtectedRoute>
                )}
            />
            <Route
                path="/app/discovery"
                element={(
                    <ProtectedRoute>
                        <DiscoveryPage />
                    </ProtectedRoute>
                )}
            />
            <Route
                path="/app/profile"
                element={(
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                )}
            />
            <Route
                path="/app/recommend"
                element={(
                    <ProtectedRoute>
                        <SongRecommendPage />
                    </ProtectedRoute>
                )}
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

export default App
