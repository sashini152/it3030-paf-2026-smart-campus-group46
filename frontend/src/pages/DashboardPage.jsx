import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

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

  // Check if current user needs admin access
 if (
  (user?.email === 'sashini.unilocatelk@gmail.com' ||
   user?.email === 'it23220492@my.sliit.lk' ||
   user?.email === 'chamodyadewmini08@gmail.com') &&
  user.role !== 'ADMIN'
) {
    return (
      <div className="hub-page hub-page--narrow">
        <div className="text-center">
          <h1>Admin Access Required</h1>
          <p>You need admin permissions to access the admin dashboard.</p>
          <button
            onClick={() => {
              // Set admin role locally for testing
              const updatedUser = { ...user, role: 'ADMIN' }
              localStorage.setItem('user', JSON.stringify(updatedUser))
              localStorage.setItem('userRole', 'ADMIN')
              window.location.href = '/admin'
            }}
            className="hub-btn hub-btn--primary mt-4"
          >
            Grant Admin Access (Testing)
          </button>
        </div>
      </div>
    )
  }

  return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/'} replace />
}

