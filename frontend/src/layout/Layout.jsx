import { NavLink, Outlet } from 'react-router-dom'

const linkClass = ({ isActive }) =>
  'hub-nav__link' + (isActive ? ' hub-nav__link--active' : '')

export default function Layout() {
  return (
    <div className="hub-app">
      <header className="hub-header">
        <div className="hub-header__inner">
          <NavLink to="/" className="hub-brand" end>
            <span className="hub-brand__mark" aria-hidden="true" />
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
