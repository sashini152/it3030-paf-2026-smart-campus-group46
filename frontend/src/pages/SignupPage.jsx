import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function SignupPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (user) {
      navigate(user.role === 'ADMIN' ? '/admin' : '/')
    }
  }, [user, navigate])

  const handleGoogleSignup = () => {
    setProcessing(true)
    window.location.assign('http://localhost:8081/oauth2/authorization/google')
  }

  if (loading || processing) {
    return (
      <div className="hub-page hub-page--narrow">
        <div className="text-center">
          <h1>Creating your account...</h1>
          <p>Please wait while we connect your Google account.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="hub-page hub-page--narrow hub-auth-page">
      <div className="hub-auth-card hub-auth-card--playful">
        <div className="hub-auth-hero">
          <p className="hub-auth-kicker">Get started</p>
          <h1>Create your Smart Campus account</h1>
          <p className="hub-lead">
            Use your Google account to register and access bookings, tickets, resources,
            and notifications.
          </p>
          <div className="hub-auth-pills">
            <span>Google sign-in</span>
            <span>Student access</span>
            <span>One campus flow</span>
          </div>
        </div>

        <div className="hub-auth-panel">
          <div className="hub-auth-panel__orb" aria-hidden="true" />
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              className="hub-btn hub-btn--primary hub-auth-button"
              onClick={handleGoogleSignup}
              disabled={processing}
            >
              Sign up with Google
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="hub-auth-note">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
