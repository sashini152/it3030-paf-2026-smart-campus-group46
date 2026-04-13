import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJson, putJson } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import '../index.css'

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadNotifications() {
    try {
      setLoading(true)
      setError('')
      const data = await getJson(
        `/api/notifications?email=${encodeURIComponent(user.email)}`
      )
      setNotifications(data)
    } catch (err) {
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.email) {
      loadNotifications()
    }
  }, [user])

  async function handleMarkAsRead(id) {
    try {
      setError('')
      await putJson(`/api/notifications/${id}/read`)
      loadNotifications()
    } catch (err) {
      setError('Failed to mark as read')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SC</span>
                </div>
                <span className="text-xl font-semibold text-slate-900">Smart Campus Hub</span>
              </Link>
              <nav className="flex space-x-8">
                <Link to="/" className="text-slate-600 hover:text-emerald-600 transition-colors">Home</Link>
                <Link to="/login" className="text-emerald-600 font-medium">Sign in</Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Notifications</h1>
            <p className="text-lg text-slate-600">Please sign in first.</p>
            <Link to="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 transition-colors mt-4">
              Sign in
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* Header */}
     

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Notifications</h1>
          <p className="text-lg text-slate-600">
            Stay updated with booking decisions and system notices.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <span className="ml-2 text-slate-600">Loading notifications...</span>
          </div>
        )}

        {/* Notifications List */}
        {!loading && (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                <div className="text-slate-400 text-5xl mb-4">inbox</div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No notifications</h3>
                <p className="text-slate-600">You do not have any notifications yet.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow ${
                    !n.read ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {!n.read && (
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          )}
                          <h3 className="text-lg font-semibold text-slate-900">{n.type}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            n.read ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {n.read ? 'Read' : 'Unread'}
                          </span>
                        </div>
                        <p className="text-slate-700 mb-4">{n.message}</p>
                        <div className="flex items-center text-sm text-slate-500">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {!n.read && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(n.id)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                        >
                          Mark as read
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}

