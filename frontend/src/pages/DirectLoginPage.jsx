import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function DirectLoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleDirectLogin = () => {
    setLoading(true)
    
    // Create user data directly (bypassing OAuth2 CORS issues)
    const userData = {
      name: 'Sashini Geshani',
      role: 'USER',
      email: 'sashinigeshani1@gmail.com',
      id: '69c956315ce6d42393e8bd3b'
    }
    
    // Create a mock token (in production, this would come from backend)
    const token = 'mock-jwt-token-' + Date.now()
    
    // Store user data
    login(userData, token)
    
    // Store in localStorage for persistence
    localStorage.setItem('userName', userData.name)
    localStorage.setItem('userEmail', userData.email)
    localStorage.setItem('userRole', userData.role)
    localStorage.setItem('userId', userData.id)
    localStorage.setItem('token', token)
    
    // Navigate to dashboard
    navigate('/dashboard')
  }

  const handleTestOAuth = () => {
    // Test OAuth2 with the actual backend URL
    window.location.href = 'http://localhost:8081/oauth2/authorization/google'
  }

  if (loading) {
    return (
      <div className="hub-login">
        <div className="hub-loading">Processing login...</div>
      </div>
    )
  }

  return (
    <div className="hub-login">
      <div className="hub-login-card">
        <div className="hub-login-header">
          <h1>Smart Campus Hub</h1>
          <p>Sign in to access your dashboard</p>
        </div>

        <div className="hub-login-form">
          <button
            onClick={handleDirectLogin}
            className="hub-button hub-button--primary hub-button--full-width"
          >
            🚀 Direct Login (Bypass CORS)
          </button>
          
          <div style={{ margin: '20px 0', textAlign: 'center' }}>
            <span style={{ color: '#666' }}>OR</span>
          </div>
          
          <button
            onClick={handleTestOAuth}
            className="hub-button hub-button--secondary hub-button--full-width"
          >
            🔗 Try OAuth2 Login
          </button>
        </div>

        <div className="hub-login-info">
          <h3>ℹ️ Login Options</h3>
          <p><strong>Direct Login:</strong> Bypasses CORS issues and gives you immediate access to your dashboard with your MongoDB data.</p>
          <p><strong>OAuth2 Login:</strong> Uses Google authentication (may have CORS issues).</p>
        </div>
      </div>
    </div>
  )
}

