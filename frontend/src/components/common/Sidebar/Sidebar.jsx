import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'
import './Sidebar.css'

const NAV_ITEMS = [
    { to: '/app',           icon: '🏠', label: 'Ana Sayfa',     exact: true },
    { to: '/app/mood',      icon: '🎭', label: 'Duygu Seç' },
    { to: '/app/recommend', icon: '🎶', label: 'Duygu & Öneri' },
    { to: '/app/suggestions', icon: '🎵', label: 'Öneriler' },
    { divider: true },
    { to: '/app/history',   icon: '📜', label: 'Geçmiş' },
    { to: '/app/discovery', icon: '🔍', label: 'Keşfet' },
    { divider: true },
    { to: '/app/profile',   icon: '👤', label: 'Profil' },
]

function Sidebar() {
    const { logout } = useAuth()
    const [expanded, setExpanded] = useState(false)

    return (
        <aside className={`sidebar ${expanded ? 'sidebar--expanded' : ''}`}>
            {/* Toggle button */}
            <button
                className="sidebar__toggle"
                onClick={() => setExpanded(prev => !prev)}
                type="button"
                aria-label={expanded ? 'Menüyü daralt' : 'Menüyü genişlet'}
            >
                <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
            </button>

            {/* Brand */}
            <Link to="/app" className="sidebar__brand">
                <svg className="sidebar__brand-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="22" stroke="url(#sidebarBrandGrad)" strokeWidth="2.5" />
                    <path d="M18 32V18l16-4v14" stroke="url(#sidebarBrandGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="15" cy="32" r="3" fill="url(#sidebarBrandGrad)" />
                    <circle cx="31" cy="28" r="3" fill="url(#sidebarBrandGrad)" />
                    <defs>
                        <linearGradient id="sidebarBrandGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#A78BFA" />
                            <stop offset="1" stopColor="#EC4899" />
                        </linearGradient>
                    </defs>
                </svg>
                <span className="sidebar__brand-text">Daily<span>Beat</span></span>
            </Link>

            {/* Navigation */}
            <nav className="sidebar__nav">
                {NAV_ITEMS.map((item, idx) => {
                    if (item.divider) {
                        return <div key={`div-${idx}`} className="sidebar__divider" />
                    }

                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.exact}
                            className={({ isActive }) =>
                                `sidebar__nav-link ${isActive ? 'sidebar__nav-link--active' : ''}`
                            }
                            data-tooltip={item.label}
                        >
                            <span className="sidebar__nav-icon">{item.icon}</span>
                            <span className="sidebar__nav-label">{item.label}</span>
                        </NavLink>
                    )
                })}
            </nav>

            {/* Footer — logout */}
            <div className="sidebar__footer">
                <button className="sidebar__logout-btn" onClick={logout} type="button">
                    <span className="sidebar__logout-icon">🚪</span>
                    <span className="sidebar__logout-label">Çıkış Yap</span>
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
