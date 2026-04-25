import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteRequest, getJson, postJson, putJson } from '../api/client'
import ParallaxPanel from '../components/ParallaxPanel'
import Reveal from '../components/Reveal'
import Tooltip from '../components/Tooltip'
import { useAuth } from '../hooks/useAuth'

const USER_STORAGE_KEY = 'smartcampusUserId'
const STATUSES = ['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']
const insightSlides = [
  {
    title: 'Approved bookings unlock check-in',
    body: 'Once a reservation is approved, the QR shortcut appears directly in your booking row for faster entry.',
  },
  {
    title: 'Clear purpose text helps approval',
    body: 'Explain whether the request is for a lab, meeting, rehearsal, or class session so admins can validate the slot quickly.',
  },
  {
    title: 'Track one place, avoid duplicates',
    body: 'Use the status list below before sending another request for the same space and time window.',
  },
]

function addHoursToLocalDateTime(value, hours) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  date.setHours(date.getHours() + hours)
  return toDatetimeLocal(date.toISOString())
}

function toDatetimeLocal(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`
}

function fromDatetimeLocal(value) {
  if (!value) return null
  return new Date(value).toISOString()
}

function formatDateTime(iso) {
  if (!iso) return '-'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatStatusLabel(status) {
  return status ? status.replaceAll('_', ' ') : 'All'
}

function loadStoredUserId() {
  return localStorage.getItem(USER_STORAGE_KEY) || ''
}

function persistStoredUserId(value) {
  localStorage.setItem(USER_STORAGE_KEY, value)
}

function getFriendlyBookingError(error) {
  const message = error?.message || ''
  if (message.includes('status code 400')) {
    return 'Check the booking times. Start and end are required, and the end time must be after the start time.'
  }
  if (message.includes('endDateTime must be after startDateTime')) {
    return 'End time must be later than start time.'
  }
  if (message.includes('overlaps an existing pending or approved booking')) {
    return 'This time slot is already reserved or waiting for approval. Choose another time.'
  }
  if (message.includes('Resource is not available for booking')) {
    return 'This resource is not currently available for booking.'
  }
  return message
}

function getBookingStats(bookings) {
  return bookings.reduce(
    (acc, booking) => {
      const status = booking.status || ''
      if (status === 'PENDING') acc.pending += 1
      else if (status === 'APPROVED') acc.approved += 1
      else if (status === 'REJECTED') acc.rejected += 1
      else if (status === 'CANCELLED') acc.cancelled += 1
      if (status === 'APPROVED' && !booking.checkedInAt) acc.qrReady += 1
      if (booking.checkedInAt) acc.checkedIn += 1
      acc.total += 1
      return acc
    },
    { total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0, qrReady: 0, checkedIn: 0 }
  )
}

export default function UserBookingsPage() {
  const { user } = useAuth()
  const [manualUserId, setManualUserId] = useState(loadStoredUserId)
  const [resources, setResources] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [activeInsight, setActiveInsight] = useState(0)
  const [pauseInsights, setPauseInsights] = useState(false)
  const [form, setForm] = useState({
    resourceId: '',
    start: '',
    end: '',
    purpose: '',
    expectedAttendees: 1,
  })
  const [submitting, setSubmitting] = useState(false)

  const minDateTime = new Date().toISOString().slice(0, 16)

  const effectiveUserId = user?.email || manualUserId

  useEffect(() => {
    if (user?.email) {
      setManualUserId(user.email)
      persistStoredUserId(user.email)
    }
  }, [user?.email])

  const resourceNameById = useMemo(() => {
    const map = new Map()
    resources.forEach((resource) => map.set(resource.id, resource.name))
    return map
  }, [resources])

  const stats = useMemo(() => getBookingStats(bookings), [bookings])

  const loadResources = useCallback(async () => {
    const data = await getJson('/api/resources')
    setResources(Array.isArray(data) ? data : [])
  }, [])

  const loadBookings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getJson('/api/bookings')
      const allBookings = Array.isArray(data) ? data : []
      const mine = allBookings.filter((booking) => booking.requestedByUserId === effectiveUserId)
      const filtered = statusFilter ? mine.filter((booking) => booking.status === statusFilter) : mine
      setBookings(filtered)
    } catch (requestError) {
      setError(requestError.message)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [effectiveUserId, statusFilter])

  useEffect(() => {
    loadResources().catch((requestError) => setError(requestError.message))
  }, [loadResources])

  useEffect(() => {
    loadBookings().catch(() => {})
  }, [loadBookings])

  useEffect(() => {
    if (pauseInsights) return undefined
    const timer = setInterval(() => {
      setActiveInsight((current) => (current + 1) % insightSlides.length)
    }, 4600)
    return () => clearInterval(timer)
  }, [pauseInsights])

  async function handleCreate(event) {
    event.preventDefault()
    if (!effectiveUserId.trim()) {
      setError('Sign in first so your booking can be linked to your account.')
      return
    }

    const startDateTime = fromDatetimeLocal(form.start)
    const endDateTime = fromDatetimeLocal(form.end)
    const selectedResource = resources.find((resource) => resource.id === form.resourceId)
    const attendeeCount = Number(form.expectedAttendees)

    if (!form.resourceId) {
      setError('Choose a resource before submitting the booking.')
      return
    }
    if (!startDateTime || !endDateTime) {
      setError('Start and end time are both required.')
      return
    }
    if (new Date(startDateTime) < new Date()) {
      setError('Start time must be in the future.')
      return
    }
    if (new Date(endDateTime) <= new Date(startDateTime)) {
      setError('End time must be later than start time.')
      return
    }
    if (!form.purpose.trim()) {
      setError('Purpose is required.')
      return
    }
    if (!Number.isFinite(attendeeCount) || attendeeCount < 1) {
      setError('Expected attendees must be at least 1.')
      return
    }
    if (selectedResource && attendeeCount > selectedResource.capacity) {
      setError(`Expected attendees cannot exceed the selected resource capacity of ${selectedResource.capacity}.`)
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await postJson('/api/bookings', {
        resourceId: form.resourceId,
        requestedByUserId: effectiveUserId.trim(),
        startDateTime,
        endDateTime,
        purpose: form.purpose.trim(),
        expectedAttendees: attendeeCount,
      })
      setForm({
        resourceId: '',
        start: '',
        end: '',
        purpose: '',
        expectedAttendees: 1,
      })
      await loadBookings()
    } catch (requestError) {
      setError(getFriendlyBookingError(requestError))
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
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function removeBooking(id) {
    if (!window.confirm('Delete this booking record?')) return
    setError(null)
    try {
      await deleteRequest(`/api/bookings/${id}`)
      await loadBookings()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  function updateManualUserId(value) {
    setManualUserId(value)
    persistStoredUserId(value)
  }

  return (
    <div className="hub-page hub-page--wide hub-page--bookings hub-bookings-canvas space-y-6">
      <Reveal delay={30}>
        <section className="hub-bookings-hero hub-bookings-hero--elevated">
          <div className="hub-bookings-hero__content">
            <p className="hub-bookings-kicker">Student reservations</p>
            <h1>My Bookings</h1>
            <p className="hub-lead">
              Create new booking requests, watch approval status, and open QR check-in when a reservation is approved.
            </p>
            <div className="hub-bookings-hero__badges">
              <span>Approval tracking</span>
              <span>QR ready entries</span>
              <span>One student flow</span>
            </div>
          </div>
          <div className="hub-bookings-hero__panel">
            <p className="hub-bookings-hero__panel-kicker">Linked account</p>
            <h3>{effectiveUserId || 'Sign in to connect your bookings'}</h3>
            <p>{stats.qrReady} approved booking{stats.qrReady === 1 ? '' : 's'} ready for QR check-in right now.</p>
          </div>
        </section>
      </Reveal>

      <Reveal className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" delay={70}>
        <ParallaxPanel className="hub-booking-stat hub-booking-stat--total hub-lift" strength={6}>
          <span>Total</span>
          <strong>{stats.total}</strong>
        </ParallaxPanel>
        <ParallaxPanel className="hub-booking-stat hub-booking-stat--pending hub-lift" strength={6}>
          <span>Pending</span>
          <strong>{stats.pending}</strong>
        </ParallaxPanel>
        <ParallaxPanel className="hub-booking-stat hub-booking-stat--approved hub-lift" strength={6}>
          <span>Approved</span>
          <strong>{stats.approved}</strong>
        </ParallaxPanel>
        <ParallaxPanel className="hub-booking-stat hub-booking-stat--cancelled hub-lift" strength={6}>
          <span>QR ready</span>
          <strong>{stats.qrReady}</strong>
        </ParallaxPanel>
      </Reveal>

      {error && (
        <Reveal delay={95}>
          <div className="hub-alert hub-alert--error hub-alert--bookings" role="alert">
            {error}
          </div>
        </Reveal>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {!user?.email && (
            <Reveal delay={110}>
              <ParallaxPanel strength={8} className="hub-lift">
                <section className="hub-panel hub-bookings-panel">
                  <h2 className="hub-panel__title">Booking identity</h2>
                  <p className="hub-muted hub-muted--bookings">
                    Use a stable email-style ID so your reservations stay grouped under one student account.
                  </p>
                  <div className="hub-form-grid">
                    <label className="hub-field hub-field--grow">
                      <span className="inline-flex items-center gap-2">
                        <span>User ID</span>
                        <Tooltip text="This stays in local storage until you sign in with your real account." tone="ticket">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#B4182D] bg-white text-[11px] font-semibold text-[#B4182D]">
                            i
                          </span>
                        </Tooltip>
                      </span>
                      <input
                        value={manualUserId}
                        onChange={(event) => updateManualUserId(event.target.value)}
                        placeholder="student@example.com"
                      />
                    </label>
                  </div>
                </section>
              </ParallaxPanel>
            </Reveal>
          )}

          <Reveal delay={145}>
            <ParallaxPanel strength={10} className="hub-lift">
              <section className="hub-panel hub-bookings-panel">
                <h2 className="hub-panel__title">New booking request</h2>
                <form className="hub-form-grid" onSubmit={handleCreate}>
                  <label className="hub-field hub-field--grow">
                    <span className="inline-flex items-center gap-2">
                      <span>Resource</span>
                      <Tooltip text="Only ACTIVE resources appear here so you do not book unavailable spaces." tone="ticket">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#B4182D] bg-white text-[11px] font-semibold text-[#B4182D]">
                          i
                        </span>
                      </Tooltip>
                    </span>
                    <select
                      required
                      value={form.resourceId}
                      onChange={(event) => setForm((current) => ({ ...current, resourceId: event.target.value }))}
                    >
                      <option value="">Select a resource...</option>
                      {resources
                        .filter((resource) => resource.status === 'ACTIVE')
                        .map((resource) => (
                          <option key={resource.id} value={resource.id}>
                            {resource.name} - {resource.location} (cap {resource.capacity})
                          </option>
                        ))}
                    </select>
                  </label>

                  <label className="hub-field">
                    <span>Start</span>
                    <input
                      type="datetime-local"
                      required
                      min={minDateTime}
                      value={form.start}
                      onChange={(event) =>
                        setForm((current) => {
                          const nextStart = event.target.value
                          const nextEnd =
                            !current.end || new Date(current.end) <= new Date(nextStart)
                              ? addHoursToLocalDateTime(nextStart, 1)
                              : current.end
                          return { ...current, start: nextStart, end: nextEnd }
                        })
                      }
                    />
                  </label>

                  <label className="hub-field">
                    <span>End</span>
                    <input
                      type="datetime-local"
                      required
                      min={form.start || minDateTime}
                      value={form.end}
                      onChange={(event) => setForm((current) => ({ ...current, end: event.target.value }))}
                    />
                  </label>

                  <label className="hub-field">
                    <span>Expected attendees</span>
                    <input
                      type="number"
                      min={1}
                      required
                      value={form.expectedAttendees}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, expectedAttendees: event.target.value }))
                      }
                    />
                  </label>

                  <label className="hub-field hub-field--full">
                    <span>Purpose</span>
                    <input
                      required
                      value={form.purpose}
                      onChange={(event) => setForm((current) => ({ ...current, purpose: event.target.value }))}
                      placeholder="Lab session, meeting, rehearsal"
                    />
                  </label>

                  <div className="hub-field hub-field--actions hub-field--full">
                    <button
                      type="submit"
                      className="hub-btn hub-btn--primary hub-btn--bookings hub-button-pop"
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Submit request'}
                    </button>
                  </div>
                </form>
              </section>
            </ParallaxPanel>
          </Reveal>

          <Reveal delay={180}>
            <ParallaxPanel strength={12} className="hub-lift">
              <section className="hub-panel hub-bookings-panel">
                <h2 className="hub-panel__title">Booking history</h2>
                <div className="hub-booking-filter-chips" role="toolbar" aria-label="Booking status filters">
                  {STATUSES.map((status) => {
                    const active = statusFilter === status
                    return (
                      <button
                        key={status || 'ALL'}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        className={`hub-booking-filter-chip ${active ? 'hub-booking-filter-chip--active' : ''}`}
                      >
                        {formatStatusLabel(status)}
                      </button>
                    )
                  })}
                </div>

                <div className="hub-form-grid hub-form-grid--filters">
                  <label className="hub-field">
                    <span>Status</span>
                    <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                      {STATUSES.map((status) => (
                        <option key={status || 'ALL'} value={status}>
                          {formatStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="hub-field hub-field--actions">
                    <button
                      type="button"
                      className="hub-btn hub-btn--primary hub-btn--bookings hub-button-pop"
                      onClick={() => loadBookings()}
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                {loading ? (
                  <p className="hub-muted hub-muted--bookings">Loading bookings...</p>
                ) : bookings.length === 0 ? (
                  <div className="hub-empty-state">
                    <p>No bookings found for this filter.</p>
                    <p className="hub-muted hub-muted--bookings">Create a request above to get started.</p>
                  </div>
                ) : (
                  <div className="hub-table-wrap hub-table-wrap--bookings">
                    <table className="hub-table hub-table--bookings">
                      <thead>
                        <tr>
                          <th>Resource</th>
                          <th>When</th>
                          <th>Status</th>
                          <th>Purpose</th>
                          <th>Check-in</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking, index) => (
                          <tr
                            key={booking.id}
                            className="hub-ticket-list-row"
                            style={{ animationDelay: `${index * 45}ms` }}
                          >
                            <td>{resourceNameById.get(booking.resourceId) || booking.resourceId}</td>
                            <td className="hub-table__nowrap">
                              {formatDateTime(booking.startDateTime)} - {formatDateTime(booking.endDateTime)}
                            </td>
                            <td>
                              <span className={`hub-tag hub-tag--booking-${(booking.status || 'PENDING').toLowerCase()}`}>
                                {booking.status.replaceAll('_', ' ')}
                              </span>
                            </td>
                            <td className="hub-table__clip">{booking.adminReason || booking.purpose}</td>
                            <td>
                              {booking.status === 'APPROVED' ? (
                                booking.checkedInAt ? (
                                  <span className="hub-tag hub-tag--booking-approved">Checked in</span>
                                ) : (
                                  <Link
                                    to={`/booking-check-in?booking=${booking.id}`}
                                    className="hub-btn hub-btn--small hub-btn--bookings-secondary hub-button-pop"
                                  >
                                    Show QR
                                  </Link>
                                )
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="hub-table__actions">
                              {(booking.status === 'APPROVED' || booking.status === 'PENDING') && (
                                <button
                                  type="button"
                                  className="hub-btn hub-btn--small hub-btn--bookings-secondary hub-button-pop"
                                  onClick={() => cancelBooking(booking.id)}
                                >
                                  Cancel
                                </button>
                              )}
                              <button
                                type="button"
                                className="hub-btn hub-btn--small hub-btn--bookings-danger hub-button-pop"
                                onClick={() => removeBooking(booking.id)}
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
            </ParallaxPanel>
          </Reveal>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Reveal delay={220}>
            <ParallaxPanel strength={10}>
              <section
                className="hub-panel hub-bookings-panel hub-bookings-panel--insights"
                onMouseEnter={() => setPauseInsights(true)}
                onMouseLeave={() => setPauseInsights(false)}
              >
                <p className="hub-booking-insight-kicker">Queue insights</p>
                <div key={activeInsight} className="hub-booking-insight hub-fade-slide">
                  <h3>{insightSlides[activeInsight].title}</h3>
                  <p>{insightSlides[activeInsight].body}</p>
                </div>
                <div className="hub-booking-insight-controls">
                  <div className="hub-booking-insight-dots">
                    {insightSlides.map((slide, index) => (
                      <button
                        key={slide.title}
                        type="button"
                        className={`hub-booking-insight-dot ${
                          index === activeInsight ? 'hub-booking-insight-dot--active' : ''
                        }`}
                        onClick={() => setActiveInsight(index)}
                        aria-label={`Show insight ${index + 1}`}
                      />
                    ))}
                  </div>
                  <div className="hub-booking-insight-actions">
                    <button
                      type="button"
                      className="hub-booking-insight-action"
                      onClick={() =>
                        setActiveInsight((current) => (current === 0 ? insightSlides.length - 1 : current - 1))
                      }
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      className="hub-booking-insight-action"
                      onClick={() => setActiveInsight((current) => (current + 1) % insightSlides.length)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </section>
            </ParallaxPanel>
          </Reveal>

          <Reveal delay={260}>
            <ParallaxPanel strength={8}>
              <section className="hub-panel hub-bookings-panel hub-bookings-panel--checklist">
                <p className="hub-booking-insight-kicker">Before submitting</p>
                <ul className="hub-booking-checklist">
                  <li>Pick an ACTIVE resource that matches the activity.</li>
                  <li>Set enough time for setup and wrap-up, not only the main event.</li>
                  <li>Keep the purpose short and specific so approval is faster.</li>
                  <li>Use QR check-in only when the reservation is already approved.</li>
                </ul>
              </section>
            </ParallaxPanel>
          </Reveal>
        </aside>
      </div>
    </div>
  )
}

