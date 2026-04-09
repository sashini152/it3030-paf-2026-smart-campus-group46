<<<<<<< HEAD
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import Layout from './layout/Layout'
import HomePage from './pages/HomePage'
import ResourcesPage from './pages/ResourcesPage'
import BookingsPage from './pages/BookingsPage'
import UserBookingsPage from './pages/UserBookingsPage'
import AdminResourcesPage from './pages/AdminResourcesPage'
import AdminBookingsDashboard from './pages/AdminBookingsDashboard'
import AdminTicketsPage from './pages/AdminTicketsPage'
import TicketsPage from './pages/TicketsPage'
import TicketList from './pages/TicketList'
import TicketDetails from './pages/TicketDetails'
import AdminDashboard from './pages/AdminDashboard'
import UserProfilePage from './pages/UserProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import BookingCheckInPage from './pages/BookingCheckInPage'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function AuthLoadingScreen() {
  return (
    <div className="hub-page hub-page--narrow">
      <div className="text-center">
        <h1>Loading...</h1>
        <p>Checking your sign-in status.</p>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <AuthLoadingScreen />
  return isAuthenticated ? children : <Navigate to="/signup" replace />
}

function AdminRoute({ children }) {
  const { isAuthenticated, hasRole, loading } = useAuth()
  if (loading) return <AuthLoadingScreen />
  return isAuthenticated && hasRole('ADMIN') ? children : <Navigate to="/login" replace />
}

function DashboardRoute() {
  const { isAuthenticated, hasRole, loading } = useAuth()
  if (loading) return <AuthLoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (hasRole('ADMIN')) return <Navigate to="/admin" replace />
  return <Navigate to="/" replace />
}

function HomeRoute() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <AuthLoadingScreen />
  return isAuthenticated ? <HomePage /> : <Navigate to="/signup" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomeRoute />} />
        <Route
          path="resources"
          element={
            <ProtectedRoute>
              <ResourcesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="bookings"
          element={
            <ProtectedRoute>
              <BookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="user-bookings"
          element={
            <ProtectedRoute>
              <UserBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="tickets"
          element={
            <ProtectedRoute>
              <TicketsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="ticket-list"
          element={
            <ProtectedRoute>
              <TicketList />
            </ProtectedRoute>
          }
        />
        <Route
          path="ticket-details/:id"
          element={
            <ProtectedRoute>
              <TicketDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="booking-check-in"
          element={
            <ProtectedRoute>
              <BookingCheckInPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="admin-resources"
          element={
            <AdminRoute>
              <AdminResourcesPage />
            </AdminRoute>
          }
        />
        <Route
          path="admin-bookings-dashboard"
          element={
            <AdminRoute>
              <AdminBookingsDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="admin-bookings"
          element={
            <AdminRoute>
              <AdminBookingsDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="admin-tickets"
          element={
            <AdminRoute>
              <AdminTicketsPage />
            </AdminRoute>
          }
        />
        <Route
          path="notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="dashboard" element={<DashboardRoute />} />
      </Route>
    </Routes>
=======
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
            <div className="brand-badge">🏫</div>
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
>>>>>>> 4b40911d003429830a1ef19786124d62873a6777
  )
}

export default function App() {
  return (
<<<<<<< HEAD
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
=======
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
>>>>>>> 4b40911d003429830a1ef19786124d62873a6777
  )
}