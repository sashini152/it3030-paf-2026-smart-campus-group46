import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('=== OAuth Callback Debug ===')
    console.log('Full URL:', window.location.href)
    console.log('Search string:', window.location.search)

    const checkOAuthCallback = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')
        const role = urlParams.get('role')
        const name = urlParams.get('name')
        const email = urlParams.get('email')

        console.log('OAuth callback params:', { token, role, name, email })

        if (token && role && name) {
          try {
            const userData = { name, role, email }
            console.log('✅ Logging in with user data:', userData)
            login(userData, token)
            window.history.replaceState({}, document.title, window.location.pathname)
            setTimeout(() => {
              window.location.href = '/dashboard'
            }, 100)
          } catch (loginError) {
            console.error('❌ Login error:', loginError)
            setLoading(false)
          }
        } else {
          console.log('❌ No OAuth parameters found - showing login page')
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ OAuth callback error:', error)
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(checkOAuthCallback, 100)
    return () => clearTimeout(timeoutId)
  }, [login])

  const handleGoogleLogin = () => {
    window.location.assign('http://localhost:8081/oauth2/authorization/google')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="border-b border-slate-200 bg-[#1f2a44]">
          <div className="mx-auto flex max-w-7xl items-center px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-slate-900 shadow-sm">
                SC
              </div>
              <p className="text-lg font-semibold text-white">Smart Campus Hub</p>
            </div>
          </div>
        </div>

        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6">
          <div className="rounded-[28px] border border-slate-200 bg-white px-8 py-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
            <p className="mt-4 text-sm font-medium text-slate-600">Processing login...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="border-b border-slate-200 bg-[#1f2a44]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-slate-900 shadow-sm">
              SC
            </div>
            <p className="text-lg font-semibold text-white">Smart Campus Hub</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white">
              Sign in
            </button>
            <button className="rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
              Sign up
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-2">
        <div className="hidden lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">
            Smart Campus Hub
          </p>
          <h1 className="mt-4 text-5xl font-bold leading-tight text-slate-900">
            Welcome back to your campus control center.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-500">
            Sign in to manage resources, track tickets, approve bookings, and stay updated with
            campus-wide notifications from one modern admin platform.
          </p>

          <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Resources</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">Manage</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Bookings</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">Approve</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Tickets</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">Resolve</p>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-10">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">
                Sign in
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">Access your account</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Continue with Google to access your Smart Campus dashboard.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-600">Quick access</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Use your authorized Google account to sign in as student or admin based on your assigned permissions.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
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
            </button>

            <a
              href="http://localhost:8081/oauth2/authorization/google"
              className="mt-3 flex h-12 w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Direct Google Login (Backup)
            </a>

            <div className="my-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Secure access
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Role-based access</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Admin and user experiences are assigned automatically after sign-in.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Google protected</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Authentication is handled through your authorized Google account.
                </p>
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-slate-500">
              By signing in, you agree to our{' '}
              <span className="font-semibold text-slate-900">Terms of Service</span> and{' '}
              <span className="font-semibold text-slate-900">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}