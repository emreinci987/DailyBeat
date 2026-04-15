import { Routes, Route, Navigate } from 'react-router-dom'
import useAuth from './hooks/useAuth'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ForgotPassword from './pages/Auth/ForgotPassword'
import Home from './pages/Home/Home'
import SuggestionsPage from './pages/Recommendations/SuggestionsPage'
import HistoryPage from './pages/History/HistoryPage'
import DiscoveryPage from './pages/Discovery/DiscoveryPage'
import ProfilePage from './pages/Profile/ProfilePage'
import SongRecommendPage from './pages/SongRecommend/SongRecommendPage'
import ProtectedRoute from './components/auth/ProtectedRoute/ProtectedRoute'
import AppLayout from './components/common/AppLayout/AppLayout'

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
                path="/forgot-password"
                element={(
                    <AuthRedirect>
                        <ForgotPassword />
                    </AuthRedirect>
                )}
            />

            {/* Protected app routes — wrapped with sidebar layout */}
            <Route
                path="/app"
                element={(
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                )}
            >
                <Route index element={<Home />} />

                <Route path="suggestions" element={<SuggestionsPage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="discovery" element={<DiscoveryPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="recommend" element={<SongRecommendPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

export default App
