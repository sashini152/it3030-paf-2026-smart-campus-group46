import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './layout/Layout'
import HomePage from './pages/HomePage'
import ResourcesPage from './pages/ResourcesPage'
import MyBookingsPage from './pages/MyBookingsPage'
import TicketsPage from './pages/TicketsPage'
import NotificationsPage from './pages/NotificationsPage'
import LoginPage from './pages/LoginPage'
import DirectLoginPage from './pages/DirectLoginPage'
import DashboardPage from './pages/DashboardPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminDashboard from './pages/AdminDashboard.jsx'
import UnauthorizedPage from './pages/UnauthorizedPage'
import MyTicketsPage from './pages/MyTicketsPage'
import BookResourcesPageWorking from './pages/BookResourcesPageWorking'
import ProfilePage from './pages/ProfilePage'
import OAuthTestPage from './pages/OAuthTestPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<LoginPage />} />
          <Route path="/test-oauth" element={<OAuthTestPage />} />
          
          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="admin-dashboard" element={<AdminDashboardPage />} />
            <Route path="resources" element={<ResourcesPage />} />
            <Route path="bookings" element={<MyBookingsPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="my-tickets" element={<MyBookingsPage />} />
            <Route path="/book-resources" element={<BookResourcesPageWorking />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          
          {/* Role-based routes */}
          <Route 
            path="manager/*" 
            element={
              <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER']}>
                <div>Manager Panel</div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="technician/*" 
            element={
              <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER', 'TECHNICIAN']}>
                <div>Technician Panel</div>
              </ProtectedRoute>
            } 
          />
          
          {/* Error routes */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
