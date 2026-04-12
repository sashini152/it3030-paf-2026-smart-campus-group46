import { useCallback, useEffect, useState } from 'react'
import { getJson, putJson } from '../api/client'

function toDatetimeLocal(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processingId, setProcessingId] = useState(null)

  const loadBookings = useCallback(async () => {
    try {
      const data = await getJson('/api/bookings?status=PENDING')
      setBookings(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleApprove = async (bookingId) => {
    setProcessingId(bookingId)
    try {
      await putJson(`/api/bookings/${bookingId}/approve`)
      await loadBookings()
    } catch (e) {
      setError(e.message)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (bookingId) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return
    
    setProcessingId(bookingId)
    try {
      await putJson(`/api/bookings/${bookingId}/reject`, { reason })
      await loadBookings()
    } catch (e) {
      setError(e.message)
    } finally {
      setProcessingId(null)
    }
  }

  useEffect(() => {
    loadBookings()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      console.log('Checking for new pending bookings...')
      loadBookings()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [loadBookings])

  return (
    <div className="hub-page hub-page--wide">
      <h1>Admin Bookings Management</h1>
      <p className="hub-lead">
        Manage all booking requests. Approve or reject pending bookings to allow users to access resources.
      </p>

      {error && (
        <div className="hub-alert hub-alert--error" role="alert">
          {error}
        </div>
      )}

      <section className="hub-panel">
        <h2 className="hub-panel__title">Pending Booking Approvals ({bookings.length})</h2>
        <p className="hub-muted hub-panel__hint">
          Review and approve booking requests. Overlapping approved slots are automatically blocked.
        </p>
        
        {loading ? (
          <div className="hub-loading">Loading pending bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="hub-empty">
            <p>No pending bookings to review.</p>
            <p className="hub-muted">New booking requests will appear here automatically.</p>
          </div>
        ) : (
          <div className="hub-table-wrap">
            <table className="hub-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>User</th>
                  <th>Purpose</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.resourceId}</td>
                    <td>{booking.requestedByUserId}</td>
                    <td className="hub-table__clip">{booking.purpose}</td>
                    <td className="hub-table__nowrap">
                      {toDatetimeLocal(booking.startDateTime)}
                    </td>
                    <td className="hub-table__nowrap">
                      {toDatetimeLocal(booking.endDateTime)}
                    </td>
                    <td className="hub-table__actions">
                      <button
                        type="button"
                        className="hub-btn hub-btn--small hub-btn--primary"
                        onClick={() => handleApprove(booking.id)}
                        disabled={processingId === booking.id}
                      >
                        {processingId === booking.id ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        className="hub-btn hub-btn--small hub-btn--danger"
                        onClick={() => handleReject(booking.id)}
                        disabled={processingId === booking.id}
                      >
                        {processingId === booking.id ? 'Rejecting...' : 'Reject'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

