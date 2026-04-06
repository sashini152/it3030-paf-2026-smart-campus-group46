import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJson, putJson } from '../api/client'
import { useAuth } from '../auth/AuthContext'

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
            </div>
          </div>
        </div>

        <div className="page-wrap">
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Please sign in first.</p>
        </div>
      </>
    )
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
            <Link to="/notifications">Notifications</Link>
          </div>
        </div>
      </div>

      <div className="page-wrap">
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">
          Stay updated with booking decisions and system notices.
        </p>

        {error && <p className="auth-error">{error}</p>}
        {loading && <p className="page-subtitle">Loading...</p>}

        <div className="hub-notification-list">
          {notifications.length === 0 && !loading ? (
            <div className="hub-notification-card">
              <h3>No notifications</h3>
              <p>You do not have any notifications yet.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="hub-notification-card">
                <h3>{n.type}</h3>
                <p>{n.message}</p>
                <p>
                  <strong>Status:</strong> {n.read ? 'Read' : 'Unread'}
                </p>
                <p>
                  <strong>Date:</strong>{' '}
                  {new Date(n.createdAt).toLocaleString()}
                </p>

                {!n.read && (
                  <button
                    type="button"
                    className="auth-primary-btn"
                    onClick={() => handleMarkAsRead(n.id)}
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}