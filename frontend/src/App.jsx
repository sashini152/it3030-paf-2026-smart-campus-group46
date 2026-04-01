import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './layout/Layout'
import HomePage from './pages/HomePage'
import ResourcesPage from './pages/ResourcesPage'
import BookingsPage from './pages/BookingsPage'
import UserBookingsPage from './pages/UserBookingsPage'
import AdminBookingsPage from './pages/AdminBookingsPage'
import TicketsPage from './pages/TicketsPage'
import TicketList from './pages/TicketList'
import TicketDetails from './pages/TicketDetails'
import AdminDashboard from './pages/AdminDashboard'
import NotificationsPage from './pages/NotificationsPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { isAuthenticated, hasRole } = useAuth()
  return isAuthenticated && hasRole('ADMIN') ? children : <Navigate to="/login" replace />
}

function DashboardRoute() {
  const { isAuthenticated, hasRole } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (hasRole('ADMIN')) return <Navigate to="/admin" replace />
  return <Navigate to="/" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route
          path="user-bookings"
          element={
            <ProtectedRoute>
              <UserBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin-bookings"
          element={
            <AdminRoute>
              <AdminBookingsPage />
            </AdminRoute>
          }
        />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="ticket-list" element={<TicketList />} />
        <Route path="ticket-details/:id" element={<TicketDetails />} />
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="notifications" element={<NotificationsPage />} />
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
