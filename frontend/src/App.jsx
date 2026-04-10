import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import NotificationsPage from './pages/NotificationsPage'
import ProtectedRoute from './auth/ProtectedRoute'
import { useAuth } from './auth/AuthContext'
import OAuthSuccessPage from './pages/OAuthSuccessPage'

function HomePage() {
  const { user, logout } = useAuth()

  async function handleLogout() {
    try {
      await fetch('http://localhost:8081/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (e) {
      // ignore backend logout error
    }

    logout()
    window.location.href = 'http://localhost:5173/login'
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">
            <div className="brand-badge">??</div>
            <span>Smart Campus Hub</span>
          </Link>

          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/notifications">Notifications</Link>
            {user ? (
              <button type="button" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <>
                <Link to="/register">Register</Link>
                <Link to="/login">Sign in</Link>
              </>
            )}
          </div>
        </div>
      </div>

      <main className="dashboard-shell">
        <div className="hero-grid">
          <section className="hero-card">
            <div className="hero-kicker">SMART CAMPUS HUB</div>
            <h1>
              Student operations,
              <br />
              bookings, and
              <br />
              support in one
              <br />
              place
            </h1>
            <p className="hero-subtext">
              Manage resources, request spaces, stay updated with notifications,
              and access your role-based tools through one modern campus platform.
            </p>

            <div className="hero-actions">
              {!user ? (
                <>
                  <Link to="/register" className="primary-cta">
                    Create account
                  </Link>
                  <Link to="/login" className="secondary-cta">
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/notifications" className="primary-cta">
                    Open notifications
                  </Link>
                  <button
                    type="button"
                    className="secondary-cta"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </section>

          <aside className="side-card">
            <div className="side-card-top">
              <div className="side-label">For students</div>
              <div className="side-title">Fast access</div>
            </div>

            <div className="quick-list">
              <div className="quick-pill rooms">Rooms and labs</div>
              <div className="quick-pill bookings">Bookings</div>
              <div className="quick-pill tickets">Ticket tracking</div>
              <div className="quick-pill notices">Notices</div>
            </div>

            <p className="side-desc">
              Built for day-to-day student use with quick navigation and clear
              service access.
            </p>

            {user && (
              <div style={{ marginTop: '20px', color: '#475569', fontWeight: 700 }}>
                Logged in as: {user.name} ({user.role})
              </div>
            )}
          </aside>
        </div>
      </main>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth-success" element={<OAuthSuccessPage />} />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
