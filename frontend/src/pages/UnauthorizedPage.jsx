import { useAuth } from '../auth/useAuth'
import { useNavigate } from 'react-router-dom'

export default function UnauthorizedPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div className="hub-page hub-page--centered">
      <div className="hub-error-card">
        <div className="hub-error-icon">⚠️</div>
        <h1>Access Denied</h1>
        
        {user && (
          <p>
            You don't have permission to access this page. 
            Your current role is <strong>{user.role}</strong>.
          </p>
        )}
        
        <p>
          If you believe this is an error, please contact your system administrator.
        </p>

        <div className="hub-error-actions">
          <button onClick={handleGoBack} className="hub-button hub-button--secondary">
            Go Back
          </button>
          <button onClick={handleLogout} className="hub-button hub-button--primary">
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

