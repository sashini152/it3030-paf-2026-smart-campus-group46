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