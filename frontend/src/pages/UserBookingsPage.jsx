import { useCallback, useEffect, useState, useMemo } from 'react'
import { buildQuery, deleteRequest, getJson, postJson, putJson } from '../api/client'
import '../styles/home.css'

const USER_STORAGE_KEY = 'smartcampusUserId'

function loadUserId() {
  return localStorage.getItem(USER_STORAGE_KEY) || ''
}

function saveUserId(id) {
  localStorage.setItem(USER_STORAGE_KEY, id)
}

function toDatetimeLocal(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

function fromDatetimeLocal(s) {
  if (!s) return null
  const d = new Date(s)
  return d.toISOString()
}

const STATUSES = ['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

export default function UserBookingsPage() {
  const [userId, setUserId] = useState(loadUserId)
  const [resources, setResources] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [listFilter, setListFilter] = useState({ status: '', mineOnly: true })
  const [form, setForm] = useState({
    resourceId: '',
    start: '',
    end: '',
    purpose: '',
    expectedAttendees: 1,
  })
  const [submitting, setSubmitting] = useState(false)

  const resourceNameById = useMemo(() => {
    const m = new Map()
    resources.forEach((r) => m.set(r.id, r.name))
    return m
  }, [resources])

  const loadResources = useCallback(async () => {
    const data = await getJson('/api/resources')
    setResources(Array.isArray(data) ? data : [])
  }, [])

  const loadBookings = useCallback(async () => {
    try {
      const q = buildQuery({
        status: listFilter.status || undefined,
        userId: listFilter.mineOnly ? userId : undefined,
      })
      const data = await getJson(`/api/bookings${q}`)
      setBookings(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [listFilter.mineOnly, listFilter.status, userId])

  useEffect(() => {
    loadResources().catch((e) => setError(e.message))
  }, [loadResources])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  function persistUserId(next) {
    setUserId(next)
    saveUserId(next)
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!userId.trim()) {
      setError('Set your user ID first (used until OAuth is wired).')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await postJson('/api/bookings', {
        resourceId: form.resourceId,
        requestedByUserId: userId.trim(),
        startDateTime: fromDatetimeLocal(form.start),
        endDateTime: fromDatetimeLocal(form.end),
        purpose: form.purpose,
        expectedAttendees: Number(form.expectedAttendees),
      })
      setForm((f) => ({
        ...f,
        purpose: '',
        start: '',
        end: '',
      }))
      await loadBookings()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function cancelBooking(id) {
    if (!window.confirm('Cancel this booking?')) return
    setError(null)
    try {
      await putJson(`/api/bookings/${id}/cancel`, {})
      await loadBookings()
    } catch (e) {
      setError(e.message)
    }
  }

  async function removeBooking(id) {
    if (!window.confirm('Permanently delete this booking record?')) return
    setError(null)
    try {
      await deleteRequest(`/api/bookings/${id}`)
      await loadBookings()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="hub-page hub-page--wide">
      <h1>My Bookings</h1>
      <p className="hub-lead">
        Manage your booking requests. View status of your bookings and cancel if needed.
        Admin approval is required for bookings to be confirmed.
      </p>

      {error && (
        <div className="hub-alert hub-alert--error" role="alert">
          {error}
        </div>
      )}

      <section className="hub-panel">
        <h2 className="hub-panel__title">Your identity (temporary)</h2>
        <p className="hub-muted hub-panel__hint">
          Enter your user ID to see your bookings.
        </p>
        <div className="hub-form-grid">
          <label className="hub-field hub-field--grow">
            <span>User ID</span>
            <input
              value={userId}
              onChange={(e) => persistUserId(e.target.value)}
              placeholder="e.g. student-1001"
            />
          </label>
        </div>
      </section>

      <section className="hub-panel">
        <h2 className="hub-panel__title">New booking request</h2>
        <form className="hub-form-grid" onSubmit={handleCreate}>
          <label className="hub-field hub-field--grow">
            <span>Resource</span>
            <select
              required
              value={form.resourceId}
              onChange={(e) =>
                setForm((f) => ({ ...f, resourceId: e.target.value }))
              }
            >
              <option value="">Select…</option>
              {resources
                .filter((r) => r.status === 'ACTIVE')
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {r.location} (cap {r.capacity})
                  </option>
                ))}
            </select>
          </label>
          <label className="hub-field">
            <span>Start</span>
            <input
              type="datetime-local"
              required
              value={form.start}
              onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))}
            />
          </label>
          <label className="hub-field">
            <span>End</span>
            <input
              type="datetime-local"
              required
              value={form.end}
              onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))}
            />
          </label>
          <label className="hub-field">
            <span>Expected attendees</span>
            <input
              type="number"
              min={1}
              required
              value={form.expectedAttendees}
              onChange={(e) =>
                setForm((f) => ({ ...f, expectedAttendees: e.target.value }))
              }
            />
          </label>
          <label className="hub-field hub-field--full">
            <span>Purpose</span>
            <input
              required
              value={form.purpose}
              onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
              placeholder="Lab session, meeting, etc."
            />
          </label>
          <div className="hub-field hub-field--actions hub-field--full">
            <button
              type="submit"
              className="hub-btn hub-btn--primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting…' : 'Submit request'}
            </button>
          </div>
        </form>
      </section>

      <section className="hub-panel">
        <h2 className="hub-panel__title">My booking history</h2>
        <div className="hub-form-grid hub-form-grid--filters">
          <label className="hub-field">
            <span>Status</span>
            <select
              value={listFilter.status}
              onChange={(e) =>
                setListFilter((f) => ({ ...f, status: e.target.value }))
              }
            >
              {STATUSES.map((s) => (
                <option key={s || 'ALL'} value={s}>
                  {s ? s.replaceAll('_', ' ') : 'All'}
                </option>
              ))}
            </select>
          </label>
        </div>
        
        {loading ? (
          <div className="hub-loading">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="hub-empty">
            <p>No bookings found.</p>
            <p className="hub-muted">Submit a booking request to get started.</p>
          </div>
        ) : (
          <div className="hub-table-wrap">
            <table className="hub-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>When</th>
                  <th>Status</th>
                  <th>Purpose</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>{resourceNameById.get(b.resourceId) || b.resourceId}</td>
                    <td className="hub-table__nowrap">
                      {toDatetimeLocal(b.startDateTime)} →{' '}
                      {toDatetimeLocal(b.endDateTime)}
                    </td>
                    <td>
                      <span className={`hub-status hub-status--${b.status.toLowerCase()}`}>
                        {b.status.replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td className="hub-table__clip">{b.adminReason || b.purpose}</td>
                    <td className="hub-table__actions">
                      {(b.status === 'APPROVED' || b.status === 'PENDING') && (
                        <button
                          type="button"
                          className="hub-btn hub-btn--small hub-btn--warning"
                          onClick={() => cancelBooking(b.id)}
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="button"
                        className="hub-btn hub-btn--small hub-btn--danger"
                        onClick={() => removeBooking(b.id)}
                      >
                        Delete
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
