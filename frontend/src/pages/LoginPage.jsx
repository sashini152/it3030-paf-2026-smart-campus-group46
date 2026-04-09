<<<<<<< HEAD
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
        const studentId = urlParams.get('studentId')
        const error = urlParams.get('error')

        if (error) {
          setProcessing(false)
          return
        }

        if (token && role && name) {
          const userData = { name, role, email, studentId: studentId || '' }
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
          <div className="hub-auth-actions flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              className="hub-btn hub-btn--primary hub-auth-button"
              onClick={handleGoogleLogin}
              disabled={processing}
            >
              Sign in with Google
            </button>
          </div>

          <div className="hub-auth-footer text-center">
            <p className="hub-auth-note">
              New here? <Link to="/signup">Create an account</Link>
            </p>
=======
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { postJson } from '../api/client'
import { useAuth } from '../auth/AuthContext'

export default function LoginPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.email.trim() || !form.password.trim()) {
      setError('Please enter email and password')
      return
    }

    try {
      setLoading(true)
      const data = await postJson('/api/auth/login', {
        email: form.email.trim(),
        password: form.password,
      })
      login(data)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">
            <div className="brand-badge">🏫</div>
            <span>Smart Campus Hub</span>
          </Link>

          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/register">Register</Link>
>>>>>>> 4b40911d003429830a1ef19786124d62873a6777
          </div>
        </div>
      </div>

      <div className="auth-shell">
        <div className="auth-layout">
          <div className="auth-brand-card">
            <div className="auth-badge">SMART CAMPUS HUB</div>
            <h1>Welcome back</h1>
            <p>
              Sign in to access your account, notifications, and role-based
              Smart Campus services.
            </p>
          </div>

          <div className="auth-card">
            <h2>Sign in</h2>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="auth-field">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="auth-primary-btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

              <a
                href="http://localhost:8081/oauth2/authorization/google"
                className="auth-primary-btn google-btn"
              >
                Continue with Google
              </a>
            </form>

            <p className="auth-footer">
              Don’t have an account? <Link to="/register">Create account</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}