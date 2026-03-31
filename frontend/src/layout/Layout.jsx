import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { getSessionRole, isAdminRole } from '../utils/session'
import sliitLogo from '../assets/sliit-logo.png'

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
            <NavLink to="/resources" className={linkClass}>
              Resources
            </NavLink>
            <NavLink to="/bookings" className={linkClass}>
              Bookings
            </NavLink>
            <NavLink to="/tickets" className={linkClass}>
              Tickets
            </NavLink>
            {isAdminRole(role) && (
              <NavLink to="/admin" className={linkClass}>
                Dashboard
              </NavLink>
            )}
            <NavLink to="/notifications" className={linkClass}>
              Notifications
            </NavLink>
            <NavLink to="/login" className={linkClass}>
              Sign in
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="hub-main">
        <Outlet />
      </main>
      <footer className="hub-footer">
        <p>IT3030 · Smart Campus Operations Hub</p>
      </footer>
    </div>
  )
}
