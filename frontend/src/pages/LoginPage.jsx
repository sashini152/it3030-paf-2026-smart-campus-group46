import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { postJson } from '../api/client'
import { useAuth } from '../auth/useAuth'

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
    <div className="hub-app hub-app--auth">
      <header className="hub-header">
        <div className="hub-header__inner">
          <Link to="/" className="hub-brand">
            <span className="hub-brand__text">Smart Campus Hub</span>
          </Link>
        </div>
      </header>

      <main className="hub-main">
        <div className="hub-auth-card hub-auth-card--playful">
          <div className="hub-auth-hero">
            <div className="hub-auth-kicker">SMART CAMPUS HUB</div>
            <h1>Welcome back</h1>
            <p className="hub-lead">
              Sign in to access your account, notifications, and role-based
              Smart Campus services.
            </p>
            <div className="hub-auth-pills">
              <span>Resources</span>
              <span>Bookings</span>
              <span>Tickets</span>
            </div>
          </div>

          <div className="hub-auth-panel">
            <div className="hub-auth-panel__orb"></div>
            <h2>Sign in</h2>

            <form onSubmit={handleSubmit}>
              <div className="hub-field">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="hub-field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              {error && <p className="hub-alert hub-alert--error">{error}</p>}

              <div className="hub-auth-actions">
                <button type="submit" className="hub-btn hub-btn--primary" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>

              <div className="hub-auth-actions">
                <a
                  href="http://localhost:8081/oauth2/authorization/google"
                  className="hub-btn"
                >
                  Continue with Google
                </a>
              </div>
            </form>

            <p className="hub-auth-note">
              Don't have an account? <Link to="/register">Create account</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
