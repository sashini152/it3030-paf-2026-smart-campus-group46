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
