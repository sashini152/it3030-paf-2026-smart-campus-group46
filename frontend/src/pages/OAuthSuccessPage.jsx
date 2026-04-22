import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function OAuthSuccessPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    function handleOAuthCallback() {
      try {
        // Parse URL parameters from OAuth success handler
        const urlParams = new URLSearchParams(window.location.search)
        const email = urlParams.get('email')
        const name = urlParams.get('name')
        const role = urlParams.get('role')
        const picture = urlParams.get('picture')

        console.log('OAuth callback params:', { email, name, role, picture })

        if (!email || !name || !role) {
          throw new Error('Missing required OAuth parameters')
        }

        // Create user data object
        const userData = {
          email,
          name,
          role,
          picture,
          studentId: '' // Will be populated later if needed
        }

        // Create a mock token (in production, this would come from backend)
        const token = 'oauth-token-' + Date.now()

        console.log('Logging in with OAuth user:', userData)
        
        // Login user and redirect
        login(userData, token)
        
        // Redirect based on role
        if (role === 'SUPER_ADMIN') {
          navigate('/super-admin')
        } else if (role === 'ADMIN') {
          navigate('/admin')
        } else {
          navigate('/dashboard')
        }
        
      } catch (err) {
        console.error('OAuth callback error:', err)
        setError(err.message || 'OAuth login failed')
        
        // Fallback: try to load user from session
        loadUserFromSession()
      }
    }

    async function loadUserFromSession() {
      try {
        const res = await fetch('http://localhost:8081/api/auth/me', {
          credentials: 'include',
        })

        if (!res.ok) {
          throw new Error('Failed to load Google user')
        }

        const data = await res.json()

        if (!data.email) {
          throw new Error('No user session found')
        }

        login(data)
        navigate('/')
      } catch (sessionErr) {
        console.error('Session fallback failed:', sessionErr)
        setError('Authentication failed. Please try logging in again.')
      }
    }

    // Small delay to ensure URL parameters are loaded
    const timeoutId = setTimeout(handleOAuthCallback, 100)
    return () => clearTimeout(timeoutId)
  }, [login, navigate])

  return (
    <div className="page-wrap">
      <h1 className="page-title">Signing you in...</h1>
      {error && <p className="auth-error">{error}</p>}
    </div>
  )
}

