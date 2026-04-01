import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, user, loading } = useAuth()
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (user) {
      navigate(user.role === 'ADMIN' ? '/admin' : '/')
    }
  }, [user, navigate])

  useEffect(() => {
    const checkOAuthCallback = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')
        const role = urlParams.get('role')
        const name = urlParams.get('name')
        const email = urlParams.get('email')
        const error = urlParams.get('error')

        if (error) {
          setProcessing(false)
          return
        }

        if (token && role && name) {
          const userData = { name, role, email }
          login(userData, token)
          window.history.replaceState({}, document.title, window.location.pathname)
          setTimeout(() => {
            navigate(role === 'ADMIN' ? '/admin' : '/')
          }, 100)
          return
        }

        setProcessing(false)
      } catch {
        setProcessing(false)
      }
    }

    const timeoutId = setTimeout(checkOAuthCallback, 100)
    return () => clearTimeout(timeoutId)
  }, [login, navigate])

  const handleGoogleLogin = () => {
    setProcessing(true)
    window.location.assign('http://localhost:8081/oauth2/authorization/google')
  }

  if (loading || processing) {
    return (
      <div className="hub-page hub-page--narrow">
        <div className="text-center">
          <h1>Signing in...</h1>
          <p>Please wait while we authenticate you with Google.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="hub-page hub-page--narrow hub-auth-page">
      <div className="hub-auth-card hub-auth-card--playful">
        <div className="hub-auth-hero">
          <p className="hub-auth-kicker">Welcome back</p>
          <h1>Smart Campus Login</h1>
          <p className="hub-lead">
            Sign in with your Google account to open the student workspace and continue where you left off.
          </p>
          <div className="hub-auth-pills">
            <span>Bookings</span>
            <span>Tickets</span>
            <span>Notifications</span>
          </div>
        </div>

        <div className="hub-auth-panel">
          <div className="hub-auth-panel__orb" aria-hidden="true" />
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              className="hub-btn hub-btn--primary hub-auth-button"
              onClick={handleGoogleLogin}
              disabled={processing}
            >
              Sign in with Google
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="hub-auth-note">
              New here? <Link to="/signup">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
