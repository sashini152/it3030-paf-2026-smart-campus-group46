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
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import UserDashboard from './pages/UserDashboard'
import UserProfilePage from './pages/UserProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import BookingCheckInPage from './pages/BookingCheckInPage'
import OAuthSuccessPage from './pages/OAuthSuccessPage'
import AdminAccessPage from './pages/AdminAccessPage'
import AdminRedirect from './components/AdminRedirect'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './hooks/useAuth'
import { ADMIN_EMAILS, SUPER_ADMIN_EMAILS } from './constants/auth'

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
  const { isAuthenticated, loading, user } = useAuth()
  console.log('ProtectedRoute check:', { isAuthenticated, loading, userEmail: user?.email, userRole: user?.role })
  if (loading) return <AuthLoadingScreen />
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { isAuthenticated, hasRole, loading, user } = useAuth()
  if (loading) return <AuthLoadingScreen />
  
  // Debug logging to check user role
  console.log('AdminRoute check:', { 
    isAuthenticated, 
    userRole: user?.role, 
    hasAdminRole: hasRole('ADMIN'),
    hasSuperAdminRole: hasRole('SUPER_ADMIN'),
    userEmail: user?.email,
    localStorageRole: localStorage.getItem('userRole')
  })
  
  // Strict admin check
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }
  
  // Multiple layers of admin role checking
  const isAdmin = hasRole('ADMIN') && user?.role === 'ADMIN' && localStorage.getItem('userRole') === 'ADMIN'
  const isSuperAdmin = hasRole('SUPER_ADMIN') && user?.role === 'SUPER_ADMIN' && localStorage.getItem('userRole') === 'SUPER_ADMIN'
  
  if (!isAdmin && !isSuperAdmin) {
    console.log('Not admin user, redirecting to user dashboard')
    // Redirect regular users to user dashboard instead of login
    return <Navigate to="/user-dashboard" replace />
  }
  
  // Additional check for specific admin email
  if (!ADMIN_EMAILS.includes(user?.email) && !SUPER_ADMIN_EMAILS.includes(user?.email)) {
    console.log('Not authorized admin email, redirecting to user dashboard')
    return <Navigate to="/user-dashboard" replace />
  }
  
  console.log('Admin access granted for:', user?.email)
  return children
}

function SuperAdminRoute({ children }) {
  const { isAuthenticated, hasRole, loading, user } = useAuth()
  if (loading) return <AuthLoadingScreen />
  
  // Debug logging to check user role
  console.log('SuperAdminRoute check:', { 
    isAuthenticated, 
    userRole: user?.role, 
    hasSuperAdminRole: hasRole('SUPER_ADMIN'),
    userEmail: user?.email,
    localStorageRole: localStorage.getItem('userRole')
  })
  
  // Strict super admin check
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }
  
  // Check if user is super admin
  const isSuperAdmin = hasRole('SUPER_ADMIN') && user?.role === 'SUPER_ADMIN' && localStorage.getItem('userRole') === 'SUPER_ADMIN'
  
  if (!isSuperAdmin) {
    console.log('Not super admin user, redirecting to admin dashboard')
    return <Navigate to="/admin" replace />
  }
  
  // Additional check for specific super admin email
  if (!SUPER_ADMIN_EMAILS.includes(user?.email)) {
    console.log('Not authorized super admin email, redirecting to admin dashboard')
    return <Navigate to="/admin" replace />
  }
  
  console.log('Super admin access granted for:', user?.email)
  return children
}

function DashboardRoute() {
  const { isAuthenticated, hasRole, loading } = useAuth()
  if (loading) return <AuthLoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (hasRole('ADMIN')) return <Navigate to="/admin" replace />
  return <Navigate to="/user-dashboard" replace />
}

function HomeRoute() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <AuthLoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <HomePage />
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
        <Route
          path="user-dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route
          path="super-admin"
          element={
            <SuperAdminRoute>
              <SuperAdminDashboard />
            </SuperAdminRoute>
          }
        />
        <Route path="dashboard" element={<DashboardRoute />} />
      </Route>
      {/* OAuth callback routes outside main layout */}
      <Route path="oauth-success" element={<OAuthSuccessPage />} />
      <Route path="admin-access" element={<AdminAccessPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}