import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import sliitLogo from '../assets/sliit-logo.png'
import { useAuth } from '../contexts/AuthContext'
import { isAdminRole } from '../utils/session'

const signedInNavigationItems = [
  { to: '/resources', label: 'Resources' },
  { to: '/tickets', label: 'Tickets' },
  { to: '/notifications', label: 'Notifications' },
]

const authenticatedNavigationItems = [
  { to: '/profile', label: 'Profile' },
]

const guestNavigationItems = [
  { to: '/login', label: 'Sign in' },
  { to: '/signup', label: 'Sign up' },
]

const adminNavigationItems = [{ to: '/admin', label: 'Dashboard' }]

const linkClass = ({ isActive }) =>
  'hub-nav__link' + (isActive ? ' hub-nav__link--active' : '')

export default function Layout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const isResourcesPage = location.pathname.startsWith('/resources')
  const isBookingsPage =
    location.pathname.startsWith('/bookings') ||
    location.pathname.startsWith('/user-bookings') ||
    location.pathname.startsWith('/admin-bookings')
  const isUserBookingsPage = location.pathname.startsWith('/user-bookings')
  const isTicketsPage =
    location.pathname.startsWith('/tickets') ||
    location.pathname.startsWith('/ticket-list') ||
    location.pathname.startsWith('/ticket-details')
  const isNotificationsPage = location.pathname.startsWith('/notifications')
  const isProfilePage = location.pathname.startsWith('/profile')
  const isAuthPage = location.pathname.startsWith('/login') || location.pathname.startsWith('/signup')

  const isAdmin = isAdminRole(user?.role)
  const bookingPageRoute = isAdmin ? '/admin-bookings' : user ? '/user-bookings' : '/bookings'
  const bookingPageLabel = isAdmin ? 'Booking Approvals' : 'Bookings'

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  if (location.pathname.startsWith('/admin')) {
    return <Outlet />
  }

  return (
    <div
      className={`hub-app${isHomePage ? ' hub-app--home' : ''}${
        isResourcesPage ? ' hub-app--resources' : ''
      }${isBookingsPage ? ' hub-app--bookings' : ''}${isUserBookingsPage ? ' hub-app--user-bookings' : ''}${isTicketsPage ? ' hub-app--tickets' : ''}${
        isNotificationsPage ? ' hub-app--notifications' : ''
      }${isProfilePage ? ' hub-app--profile' : ''}${isAuthPage ? ' hub-app--auth' : ''}`}
    >
      <header className="hub-header">
        <div className="hub-header__inner">
          <NavLink to="/" className="hub-brand" end>
            <img src={sliitLogo} alt="SLIIT logo" className="hub-brand__mark" />
            <span className="hub-brand__text">Smart Campus Hub</span>
          </NavLink>
          <nav className="hub-nav" aria-label="Main">
            {user &&
              signedInNavigationItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass}>
                  {item.label}
                </NavLink>
              ))}
            {user && (
              <NavLink to={bookingPageRoute} className={linkClass}>
                {bookingPageLabel}
              </NavLink>
            )}
            {user &&
              authenticatedNavigationItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass}>
                  {item.label}
                </NavLink>
              ))}
            {!user &&
              guestNavigationItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass}>
                  {item.label}
                </NavLink>
              ))}
            {isAdmin &&
              adminNavigationItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass}>
                  {item.label}
                </NavLink>
              ))}
            {user && (
              <button type="button" className="hub-nav__button" onClick={handleLogout}>
                Logout
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="hub-main">
        <Outlet />
      </main>
    </div>
  )
}
