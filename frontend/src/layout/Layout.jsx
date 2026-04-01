import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import sliitLogo from '../assets/sliit-logo.png'
import { useAuth } from '../contexts/AuthContext'
import { isAdminRole } from '../utils/session'

const navigationItems = [
  { to: '/profile', label: 'Profile' },
  { to: '/resources', label: 'Resources' },
  { to: '/tickets', label: 'Tickets' },
  { to: '/notifications', label: 'Notifications' },
]

<<<<<<< HEAD
const guestNavigationItems = [
  { to: '/login', label: 'Sign in' },
  { to: '/signup', label: 'Sign up' },
=======
const adminNavigationItems = [
  { to: '/admin', label: 'Dashboard' },
 
  { to: '/login', label: 'profile' },
>>>>>>> 277136eee2e5728305516bcf0bc8384f1c4a6ba3
]

const adminNavigationItems = [{ to: '/admin', label: 'Dashboard' }]

const linkClass = ({ isActive }) =>
  'hub-nav__link' + (isActive ? ' hub-nav__link--active' : '')

export default function Layout() {
  const { user } = useAuth()
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const isResourcesPage = location.pathname.startsWith('/resources')
  const isBookingsPage =
    location.pathname.startsWith('/bookings') ||
    location.pathname.startsWith('/user-bookings') ||
    location.pathname.startsWith('/admin-bookings')

  // Determine booking page route and label based on user role
  const bookingPageRoute = user?.role === 'ADMIN' ? '/admin-bookings' : '/bookings'
  const bookingPageLabel = user?.role === 'ADMIN' ? 'Booking Approvals' : 'My Bookings'

  useEffect(() => {
    const syncRole = () => {
      // Role is now handled by useAuth hook, no need for manual sync
    }
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
    <div
      className={`hub-app${isHomePage ? ' hub-app--home' : ''}${
        isResourcesPage ? ' hub-app--resources' : ''
      }${isBookingsPage ? ' hub-app--bookings' : ''}`}
    >
      <header className="hub-header">
        <div className="hub-header__inner">
          <NavLink to="/" className="hub-brand" end>
            <img src={sliitLogo} alt="SLIIT logo" className="hub-brand__mark" />
            <span className="hub-brand__text">Smart Campus Hub</span>
          </NavLink>
          <nav className="hub-nav" aria-label="Main">
            {navigationItems.slice(0, 2).map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
            {/* Role-based My Bookings navigation */}
            <NavLink 
              key="my-bookings" 
              to={bookingPageRoute} 
              className={linkClass}
            >
              {bookingPageLabel}
            </NavLink>
            {navigationItems.slice(2).map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
            {!user && guestNavigationItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
            {isAdminRole(user?.role) && adminNavigationItems.map((item) => (
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
