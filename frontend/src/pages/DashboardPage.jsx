import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="hub-page">
      <h1>Dashboard</h1>
      <div className="hub-card">
        <h2>Welcome, {user?.name}!</h2>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>
        
        <div className="mt-6">
          <h3>Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button 
              className="hub-btn hub-btn--primary"
              onClick={() => navigate('/resources')}
            >
              View Resources
            </button>
            <button 
              className="hub-btn hub-btn--secondary"
              onClick={() => navigate('/bookings')}
            >
              My Bookings
            </button>
            <button 
              className="hub-btn hub-btn--secondary"
              onClick={() => navigate('/tickets')}
            >
              Support Tickets
            </button>
          </div>
        </div>
        
        <div className="mt-6">
          <button 
            className="hub-btn hub-btn--danger"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
