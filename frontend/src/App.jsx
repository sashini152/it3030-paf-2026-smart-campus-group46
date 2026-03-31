import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './layout/Layout'
import HomePage from './pages/HomePage'
import ResourcesPage from './pages/ResourcesPage'
import BookingsPage from './pages/BookingsPage'
import TicketsPage from './pages/TicketsPage'
import TicketList from './pages/TicketList'
import TicketDetails from './pages/TicketDetails'
import AdminDashboard from './pages/AdminDashboard'
import NotificationsPage from './pages/NotificationsPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { isAdminRole } from './utils/session'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { isAuthenticated, hasRole } = useAuth()
  return isAuthenticated && hasRole('ADMIN') ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="resources" element={
          <ProtectedRoute>
            <ResourcesPage />
          </ProtectedRoute>
        } />
        <Route path="bookings" element={
          <ProtectedRoute>
            <BookingsPage />
          </ProtectedRoute>
        } />
        <Route path="tickets" element={
          <ProtectedRoute>
            <TicketsPage />
          </ProtectedRoute>
        } />
        <Route path="ticket-list" element={
          <ProtectedRoute>
            <TicketList />
          </ProtectedRoute>
        } />
        <Route path="ticket-details/:id" element={
          <ProtectedRoute>
            <TicketDetails />
          </ProtectedRoute>
        } />
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="notifications" element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        } />
        <Route path="login" element={<LoginPage />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
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
