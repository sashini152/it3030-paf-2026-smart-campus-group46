import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function LoginPage() {
  const { login } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("=== OAuth Callback Debug ===");
    console.log("Full URL:", window.location.href);
    console.log("Search string:", window.location.search);
    
    const checkOAuthCallback = () => {
      try {
        // Check if we have OAuth callback parameters
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')
        const role = urlParams.get('role')
        const name = urlParams.get('name')
        const email = urlParams.get('email')

        console.log("OAuth callback params:", { token, role, name, email });

        if (token && role && name) {
          try {
            // Successful OAuth login
            const userData = {
              name,
              role,
              email
            }
            
            console.log("✅ Logging in with data:", userData);
            
            login(userData, token)
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname)
            
            // Redirect to dashboard
            setTimeout(() => {
              window.location.href = '/dashboard'
            }, 100)
          } catch (loginError) {
            console.error("❌ Login error:", loginError);
            setLoading(false);
          }
        } else {
          console.log("❌ No OAuth callback parameters found");
          setLoading(false)
        }
      } catch (error) {
        console.error("❌ OAuth callback error:", error);
        setLoading(false);
      }
    }

    const timeoutId = setTimeout(checkOAuthCallback, 100)
    return () => clearTimeout(timeoutId)
  }, [login, setLoading]) // ✅ Add dependencies

  const handleGoogleLogin = () => {
    // Method 1: Direct assignment (should work)
    window.location.assign('http://localhost:8081/oauth2/authorization/google');
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
            onClick={handleGoogleLogin}
            className="hub-button hub-button--google hub-button--full-width"
          >
            <svg className="hub-button-icon" width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          
          {/* Backup direct link */}
          <a 
            href="http://localhost:8081/oauth2/authorization/google"
            className="hub-button hub-button--google hub-button--full-width"
            style={{marginTop: '10px', textDecoration: 'none', display: 'block', textAlign: 'center'}}
          >
            Direct Google Login (Backup)
          </a>
        </div>

        <div className="hub-login-footer">
          <p>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
