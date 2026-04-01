import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, user, loading } = useAuth()
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  useEffect(() => {
    // Check for OAuth callback parameters
    const checkOAuthCallback = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')
        const role = urlParams.get('role')
        const name = urlParams.get('name')
        const email = urlParams.get('email')

        console.log("OAuth callback params:", { token, role, name, email });

        if (token && role && name) {
          try {
            const userData = { name, role, email }
            console.log("✅ Logging in with user data:", userData);
            login(userData, token)
            window.history.replaceState({}, document.title, window.location.pathname)
            setTimeout(() => { navigate('/dashboard') }, 100)
          } catch (loginError) {
            console.error("❌ Login error:", loginError);
            setProcessing(false);
          }
        } else {
          console.log("❌ No OAuth parameters found - showing login page");
          setProcessing(false);
        }
      } catch (error) {
        console.error("❌ OAuth callback error:", error);
        setProcessing(false);
      }
    }

    const timeoutId = setTimeout(checkOAuthCallback, 100)
    return () => clearTimeout(timeoutId)
  }, [login, navigate])

  const handleGoogleLogin = () => {
    setProcessing(true)
    // Redirect to Google OAuth2
    window.location.assign('http://localhost:8080/oauth2/authorization/google')
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
            <span className="mr-2">🔗</span>
            Sign in with Google
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            By signing in, you agree to the Smart Campus terms of service.
          </p>
        </div>
      </div>
    </div>
  )
}
