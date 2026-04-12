import { useAuth } from '../auth/useAuth'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ 
  children, 
  requiredRole = null, 
  requiredRoles = [],
  redirectTo = '/login' 
}) {
  const { isAuthenticated, hasRole, hasAnyRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="hub-loading">
        <div className="hub-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  // Check role requirements
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
