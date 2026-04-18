import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { postJson } from '../api/client'

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
  })
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
      setLoading(true)
      await postJson('/api/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      })
      setSuccess('Registration successful')
      setTimeout(() => navigate('/login'), 1000)
    } catch (err) {
      setError(err.message || 'Registration failed')
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
<Link to="/login">Sign in</Link>
<Link to="/register">Sign up</Link>
          </div>
        </div>
      </div>

      <div className="auth-shell">
        <div className="auth-layout">
          <div className="auth-brand-card">
            <div className="auth-badge">SMART CAMPUS HUB</div>
            <h1>Create account</h1>
            <p>
              Register as a USER or ADMIN to access booking, notification, and
              role-based features in the Smart Campus platform.
            </p>
          </div>

          <div className="auth-card">
            <h2>Register</h2>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

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
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              <div className="auth-field">
                <label>Role</label>
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              {error && <p className="auth-error">{error}</p>}
              {success && <p className="auth-success">{success}</p>}

              <button type="submit" className="auth-primary-btn" disabled={loading}>
                {loading ? 'Registering...' : 'Create account'}
              </button>
            </form>

            <p className="auth-footer">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

