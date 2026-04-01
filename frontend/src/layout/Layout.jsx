import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import sliitLogo from '../assets/sliit-logo.png'
import { getSessionRole, isAdminRole } from '../utils/session'

const navigationItems = [
  { to: '/resources', label: 'Resources' },
  { to: '/bookings', label: 'Bookings' },
  { to: '/tickets', label: 'Tickets' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/login', label: 'Sign in' },
]

const linkClass = ({ isActive }) =>
  'hub-nav__link' + (isActive ? ' hub-nav__link--active' : '')

export default function Layout() {
  const location = useLocation()
  const [role, setRole] = useState(getSessionRole())
  const isHomePage = location.pathname === '/'

  useEffect(() => {
    const syncRole = () => setRole(getSessionRole())
    window.addEventListener('storage', syncRole)
    window.addEventListener('smart-campus-session-change', syncRole)
    return () => {
      window.removeEventListener('storage', syncRole)
      window.removeEventListener('smart-campus-session-change', syncRole)
    }
  }, [])

  if (location.pathname.startsWith('/admin')) {
    return <Outlet />
  }

  return (
    <div className={`hub-app${isHomePage ? ' hub-app--home' : ''}`}>
      <header className="hub-header">
        <div className="hub-header__inner">
          <NavLink to="/" className="hub-brand" end>
            <img src={sliitLogo} alt="SLIIT logo" className="hub-brand__mark" />
            <span className="hub-brand__text">Smart Campus Hub</span>
          </NavLink>
          <nav className="hub-nav" aria-label="Main">
            {navigationItems.slice(0, 3).map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
            {isAdminRole(role) && (
              <NavLink to="/admin" className={linkClass}>
                Dashboard
              </NavLink>
            )}
            {navigationItems.slice(3).map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="hub-main">
        <Outlet />
      </main>
    </div>
  )
}
