import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { postJson } from '../api/client'
import { useAuth } from '../hooks/useAuth'

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
    <header className="hub-header hub-header--auth">
      <div className="hub-header__inner">
        <Link to="/" className="hub-brand">
          <div className="hub-brand__badge">SC</div>
          <span className="hub-brand__text">Smart Campus Hub</span>
        </Link>

        <div className="hub-header__nav">
          <button
            type="button"
            className="hub-header__pill hub-header__pill--active"
          >
            Sign in
          </button>

          <Link to="/register" className="hub-header__pill">
            Sign up
          </Link>
        </div>
      </div>
    </header>

    <main className="hub-main hub-main--auth">
      {/* Your full login section stays here */}
    </main>
  </div>
)

      <main className="hub-main hub-main--auth">
        <section className="hub-auth-grid">
          <div className="hub-auth-showcase">
            <div className="hub-auth-kicker">SMART CAMPUS HUB</div>
            <h1>Welcome back to your campus control center.</h1>
            <p className="hub-lead">
              Sign in to manage resources, track tickets, approve bookings, and
              stay updated with role-based campus services from one place.
            </p>

            <div className="hub-auth-pills">
              <span>Resources</span>
              <span>Bookings</span>
              <span>Tickets</span>
            </div>

            <div className="hub-auth-stats">
              <article>
                <p>Resources</p>
                <strong>Manage</strong>
              </article>
              <article>
                <p>Bookings</p>
                <strong>Approve</strong>
              </article>
              <article>
                <p>Tickets</p>
                <strong>Resolve</strong>
              </article>
            </div>
          </div>

          <div className="hub-auth-card hub-auth-card--clean">
            <div className="hub-auth-panel">
              <div className="hub-auth-panel__orb"></div>

              <div className="hub-auth-heading">
                <div className="hub-auth-kicker">Sign in</div>
                <h2>Access your account</h2>
                <p>
                  Enter your email and password or continue with Google to access
                  your Smart Campus dashboard.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="hub-auth-form">
                <label className="hub-field">
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </label>

                <label className="hub-field">
                  <span>Password</span>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                  />
                </label>

                {error && <p className="hub-alert hub-alert--error">{error}</p>}

                <div className="hub-auth-actions">
                  <button
                    type="submit"
                    className="hub-btn hub-btn--primary hub-btn--full"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>

                <div className="hub-auth-divider">
                  <span>or</span>
                </div>

                <div className="hub-auth-actions">
                  <a
                    href="http://localhost:8081/oauth2/authorization/google"
                    className="hub-btn hub-btn--google hub-btn--full"
                  >
                    <svg
                      className="hub-btn__icon"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </a>
                </div>
              </form>

              <p className="hub-auth-note">
                Don&apos;t have an account? <Link to="/register">Create account</Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}