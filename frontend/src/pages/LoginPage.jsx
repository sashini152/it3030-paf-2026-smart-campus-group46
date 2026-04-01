import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, user, loading } = useAuth()
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
<<<<<<< HEAD
    if (user) {
      navigate(user.role === 'ADMIN' ? '/admin' : '/')
=======
    // If user is already logged in, redirect to profile
    if (user) {
      navigate('/profile')
>>>>>>> 277136eee2e5728305516bcf0bc8384f1c4a6ba3
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

<<<<<<< HEAD
        if (token && role && name) {
          const userData = { name, role, email }
          login(userData, token)
          window.history.replaceState({}, document.title, window.location.pathname)
          setTimeout(() => {
            navigate(role === 'ADMIN' ? '/admin' : '/')
          }, 100)
=======
        console.log("OAuth callback params:", { token, role, name, email, error });

        // Handle OAuth errors
        if (error) {
          console.error("❌ OAuth error received:", error);
          setProcessing(false);
          return;
        }

        if (token && role && name) {
          try {
            const userData = { name, role, email }
            console.log("✅ Logging in with user data:", userData);
            login(userData, token)
            window.history.replaceState({}, document.title, window.location.pathname)
            setTimeout(() => { navigate('/profile') }, 100)
          } catch (loginError) {
            console.error("❌ Login error:", loginError);
            setProcessing(false);
          }
>>>>>>> 277136eee2e5728305516bcf0bc8384f1c4a6ba3
        } else {
          setProcessing(false)
        }
      } catch {
        setProcessing(false)
      }
    }

    const timeoutId = setTimeout(checkOAuthCallback, 100)
    return () => clearTimeout(timeoutId)
  }, [login, navigate])

  const handleGoogleLogin = () => {
    setProcessing(true)
<<<<<<< HEAD
    window.location.assign('/oauth2/authorization/google')
=======
    // Redirect to Google OAuth2 via backend
    console.log('🔐 Initiating Google OAuth login...')
    window.location.href = 'http://localhost:8081/oauth2/authorization/google'
>>>>>>> 277136eee2e5728305516bcf0bc8384f1c4a6ba3
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
    <div className="hub-page hub-page--narrow">
      <div className="hub-auth-card">
        <p className="hub-auth-kicker">Welcome back</p>
        <h1>Smart Campus Login</h1>
        <p className="hub-lead">
          Sign in with your Google account to access the Smart Campus system.
        </p>

        <div className="hub-placeholder">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              className="hub-btn hub-btn--primary"
              onClick={handleGoogleLogin}
              disabled={processing}
            >
              Sign in with Google
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              New here? <Link to="/signup">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
