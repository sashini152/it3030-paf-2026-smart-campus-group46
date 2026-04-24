import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { postJson } from '../api/client'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      setError('Please enter both email and password.')
      return
    }

    try {
      setLoading(true)

      const response = await postJson('/api/auth/login', {
        email: form.email.trim(),
        password: form.password,
      })

      login(response, response?.token)

      if (response?.role === 'ADMIN' || response?.role === 'SUPER_ADMIN') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/user-dashboard', { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleGoogleLogin() {
    window.location.href = 'http://localhost:8081/oauth2/authorization/google'
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-slate-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3 hover:no-underline">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-sm font-bold">
              SC
            </div>
            <div>
              <p className="text-lg font-semibold leading-none">Smart Campus Hub</p>
              <p className="mt-1 text-xs uppercase tracking-[0.26em] text-slate-300">
                Campus Services Platform
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl border border-white/30 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 hover:no-underline"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100 hover:no-underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl gap-8 px-6 py-10 lg:grid-cols-2 lg:items-center">
        <section className="relative overflow-hidden rounded-[32px] bg-slate-900 px-8 py-10 text-white shadow-2xl lg:min-h-[620px] lg:px-10">
          <div className="absolute -left-10 top-8 h-40 w-40 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute right-20 top-24 h-24 w-24 rounded-full bg-cyan-400/20 blur-2xl" />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.30em] text-emerald-300">
                Welcome back
              </p>
              <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
                Access your smart campus tools from one place.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
                Manage resource bookings, track support tickets, receive notifications,
                and enter role-based dashboards with a clean unified experience.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-100">
                  Resource Booking
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-100">
                  Ticket Support
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-100">
                  Admin Dashboard
                </span>
              </div>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-2xl font-semibold">24/7</p>
                <p className="mt-1 text-sm text-slate-300">Digital campus access</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-2xl font-semibold">Fast</p>
                <p className="mt-1 text-sm text-slate-300">Role-based navigation</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-2xl font-semibold">Secure</p>
                <p className="mt-1 text-sm text-slate-300">Google or account sign-in</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_25px_80px_rgba(15,23,42,0.10)] sm:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">
                Sign in
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">
                Welcome back
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter your account details to continue to Smart Campus Hub.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <div className="flex items-center rounded-2xl border border-slate-300 bg-slate-50 px-4 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100">
                  <span className="mr-3 text-slate-400">✉️</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="h-14 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="flex items-center rounded-2xl border border-slate-300 bg-slate-50 px-4 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100">
                  <span className="mr-3 text-slate-400">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="h-14 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="ml-3 text-sm font-medium text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-sm text-slate-400">or</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <span className="text-lg">🌐</span>
              Continue with Google
            </button>

            <p className="mt-8 text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link
                to="/signup"
                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:no-underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}