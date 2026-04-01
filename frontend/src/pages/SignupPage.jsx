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
    window.location.assign('/oauth2/authorization/google')
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
    <div className="hub-page hub-page--narrow">
      <div className="hub-auth-card">
        <p className="hub-auth-kicker">Get started</p>
        <h1>Create your Smart Campus account</h1>
        <p className="hub-lead">
          Use your Google account to register and access bookings, tickets, resources,
          and notifications.
        </p>

        <div className="hub-placeholder">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              className="hub-btn hub-btn--primary"
              onClick={handleGoogleSignup}
              disabled={processing}
            >
              Sign up with Google
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
