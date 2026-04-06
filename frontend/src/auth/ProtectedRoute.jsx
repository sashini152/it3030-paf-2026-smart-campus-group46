import { useEffect, useState } from 'react'
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
      await putJson(`/api/notifications/${id}/read`)
      loadNotifications()
    } catch (err) {
      setError('Failed to mark as read')
    }
  }

  if (!user) {
    return (
      <div className="hub-page hub-page--narrow">
        <h1>Notifications</h1>
        <p>Please login first.</p>
      </div>
    )
  }

  return (
    <div className="hub-page hub-page--narrow">
      <h1>Notifications</h1>

      {error && <p className="hub-error">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications available.</p>
      ) : (
        <div className="hub-notification-list">
          {notifications.map((n) => (
            <div key={n.id} className="hub-notification-card">
              <h3>{n.type}</h3>
              <p>{n.message}</p>
              <p>
                <strong>Status:</strong>{' '}
                {n.read ? 'Read' : 'Unread'}
              </p>
              <p>
                <strong>Date:</strong>{' '}
                {new Date(n.createdAt).toLocaleString()}
              </p>

              {!n.read && (
                <button
                  className="hub-btn hub-btn--primary"
                  onClick={() => handleMarkAsRead(n.id)}
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}