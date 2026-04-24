import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { postJson } from '../api/client'

export default function RegisterPage() {
 const [form, setForm] = useState({
  name: '',
  email: '',
  password: '',
})
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

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
    setSuccess('')

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Please fill all fields')
      return
    }

    try {
   await postJson('/api/auth/register', {
  name: form.name.trim(),
  email: form.email.trim(),
  password: form.password,
})
      setSuccess('Registration successful. Redirecting to login...')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err.message || 'Registration failed')
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
            <Link to="/login" className="hub-header__pill">
              Sign in
            </Link>
            <span className="hub-header__pill hub-header__pill--active">
              Sign up
            </span>
          </div>
        </div>
      </header>

      <main className="hub-main hub-main--auth">
        <section className="hub-auth-grid">
          <div className="hub-auth-showcase">
            <div>
              <div className="hub-auth-kicker">SMART CAMPUS HUB</div>
              <h1>Create your campus account.</h1>
              <p className="hub-lead">
                Join the Smart Campus platform to access resources, manage bookings,
                receive notifications, and use role-based services from one place.
              </p>

              <div className="hub-auth-pills">
                <span>Register Fast</span>
                <span>Role Based Access</span>
                <span>Campus Services</span>
              </div>
            </div>

            <div className="hub-auth-stats">
              <article>
                <p>Account</p>
                <strong>Create</strong>
              </article>
              <article>
                <p>Access</p>
                <strong>Secure</strong>
              </article>
              <article>
                <p>Start</p>
                <strong>Now</strong>
              </article>
            </div>
          </div>

          <div className="hub-auth-card hub-auth-card--clean">
            <div className="hub-auth-panel">
              <div className="hub-auth-panel__orb"></div>

              <div className="hub-auth-heading">
                <div className="hub-auth-kicker">Register</div>
                <h2>Create account</h2>
                <p>
                  Fill in your details to create a Smart Campus account and continue
                  to the platform.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="hub-auth-form">
                <label className="hub-field">
                  <span>Name</span>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                  />
                </label>

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
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Create a password"
                      value={form.password}
                      onChange={handleChange}
                      style={{ paddingRight: '90px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        border: 'none',
                        background: 'transparent',
                        color: '#6366f1',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </label>

              

                {error && <p className="hub-alert hub-alert--error">{error}</p>}

                {success && <p className="hub-alert hub-alert--success">{success}</p>}

                <div className="hub-auth-actions">
                  <button
                    type="submit"
                    className="hub-btn hub-btn--primary hub-btn--full"
                    disabled={loading}
                  >
                    {loading ? 'Registering...' : 'Create account'}
                  </button>
                </div>
              </form>

              <p className="hub-auth-note">
                Already have an account? <Link to="/login">Sign in</Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}