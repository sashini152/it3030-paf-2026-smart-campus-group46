import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function DashboardPage() {
  const { loading, user } = useAuth()

  if (loading) {
    return (
      <div className="hub-page hub-page--narrow">
        <div className="text-center">
          <h1>Loading dashboard...</h1>
          <p>Please wait while your session is restored.</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/'} replace />
}
