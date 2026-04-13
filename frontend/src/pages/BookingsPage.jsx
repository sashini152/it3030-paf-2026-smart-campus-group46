import { useCallback, useEffect, useMemo, useState } from 'react'

import { buildQuery, deleteRequest, getJson, postJson, putJson } from '../api/client'

import ParallaxPanel from '../components/ParallaxPanel'

import { useAuth } from '../hooks/useAuth'

import Reveal from '../components/Reveal'

import Tooltip from '../components/Tooltip'



const USER_STORAGE_KEY = 'smartcampusUserId'

const STATUSES = ['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']



const insightSlides = [

  {

    title: 'Submit early for peak hours',

    body: 'Morning labs and afternoon lecture slots fill quickly. Submit requests earlier to reduce conflicts.',

  },

  {

    title: 'Use clear purpose details',

    body: 'A clear purpose helps admins approve faster because they can validate room and equipment fit quickly.',

  },

  {

    title: 'Track status before re-requesting',

    body: 'Check PENDING and APPROVED history first to avoid creating duplicate reservations for the same slot.',

  },

]



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

  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(

    d.getMinutes()

  )}`

}



function fromDatetimeLocal(value) {

  if (!value) return null

  const d = new Date(value)

  return d.toISOString()

}



function formatStatusLabel(status) {

  return status ? status.replaceAll('_', ' ') : 'All'

}



function getBookingStats(bookings) {

  return bookings.reduce(

    (acc, booking) => {

      const status = booking.status || ''

      if (status === 'PENDING') acc.pending += 1

      else if (status === 'APPROVED') acc.approved += 1

      else if (status === 'REJECTED') acc.rejected += 1

      else if (status === 'CANCELLED') acc.cancelled += 1

      acc.total += 1

      return acc

    },

    { total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0 }

  )

}



export default function BookingsPage() {

  const [userId, setUserId] = useState(loadUserId)

  const [resources, setResources] = useState([])

  const [bookings, setBookings] = useState([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState(null)

  const [listFilter, setListFilter] = useState({ status: '', mineOnly: true })

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



  useEffect(() => {

    if (pauseInsights) return undefined

    const timer = setInterval(() => {

      setActiveInsight((current) => (current + 1) % insightSlides.length)

    }, 5000)

    return () => clearInterval(timer)

  }, [pauseInsights])



  function persistUserId(next) {

    setUserId(next)

    saveUserId(next)

  }



  async function handleCreate(event) {

    event.preventDefault()

    if (!userId.trim()) {

      setError('Set your user ID first (used until OAuth is wired).')

      return

    }



    // Prevent duplicate submissions

    if (submitting) {

      return

    }



    // Validate form data

    if (!form.resourceId || !form.start || !form.end || !form.purpose) {

      setError('Please fill in all required fields')

      return

    }



    // Validate time logic

    const startTime = new Date(fromDatetimeLocal(form.start))

    const endTime = new Date(fromDatetimeLocal(form.end))

    if (startTime >= endTime) {

      setError('End time must be after start time')

      return

    }



    if (startTime <= new Date()) {

      setError('Start time must be in the future')

      return

    }



    setSubmitting(true)

    setError(null)

    

    // Debug: Log the booking data being sent

    const bookingData = {

      resourceId: form.resourceId,

      requestedByUserId: userId.trim(),

      startDateTime: fromDatetimeLocal(form.start),

      endDateTime: fromDatetimeLocal(form.end),

      purpose: form.purpose,

      expectedAttendees: Number(form.expectedAttendees),

    }

    console.log('Sending booking data:', bookingData)

    console.log('Current bookings for conflict check:', bookings.filter(b => b.resourceId === form.resourceId))

    

    try {

      await postJson('/api/bookings', bookingData)

      setForm((current) => ({

        ...current,

        purpose: '',

        start: '',

        end: '',

      }))

      await loadBookings()

    } catch (e) {

      console.log('Booking error details:', e)

      console.log('Error message:', e.message)

      console.log('Error status:', e.status)

      console.log('Error data:', e.data)

      

      if (e.status === 409) {

        setError('Booking conflict: This time slot is already booked or conflicts with an existing reservation. Please choose a different time.')

      } else if (e.message && e.message.includes('duplicate')) {

        setError('Duplicate booking detected. Please wait a moment and try again.')

      } else {

        setError(e.message || 'Failed to create booking. Please try again.')

      }

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

    <div className="hub-page hub-page--wide hub-page--bookings hub-bookings-canvas space-y-6">

      <Reveal delay={30}>

        <div className="hub-bookings-hero hub-bookings-hero--elevated">

          <div className="hub-bookings-hero__content">

            <p className="hub-bookings-kicker">Campus reservations</p>

            <h1>Bookings</h1>

            <p className="hub-lead">

              Request slots, avoid overlaps, and follow <strong>PENDING -&gt; APPROVED / REJECTED</strong>;

              approved requests can be <strong>CANCELLED</strong>.

            </p>

            <div className="hub-bookings-hero__badges">

              <span>Conflict-aware slots</span>

              <span>Faster approvals</span>

              <span>Student tracking</span>

            </div>

          </div>

          <div className="hub-bookings-hero__panel">

            <p className="hub-bookings-hero__panel-kicker">Today&apos;s focus</p>

            <h3>Keep requests clean and specific</h3>

            <p>

              Use exact room names, realistic attendee counts, and clear purpose text to reduce back-and-forth.

            </p>

          </div>

        </div>

      </Reveal>



      <Reveal className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" delay={70}>

        <ParallaxPanel className="hub-booking-stat hub-booking-stat--total hub-lift">

          <span>Total</span>

          <strong>{stats.total}</strong>

        </ParallaxPanel>

        <ParallaxPanel className="hub-booking-stat hub-booking-stat--pending hub-lift">

          <span>Pending</span>

          <strong>{stats.pending}</strong>

        </ParallaxPanel>

        <ParallaxPanel className="hub-booking-stat hub-booking-stat--approved hub-lift">

          <span>Approved</span>

          <strong>{stats.approved}</strong>

        </ParallaxPanel>

        <ParallaxPanel className="hub-booking-stat hub-booking-stat--rejected hub-lift">

          <span>Rejected</span>

          <strong>{stats.rejected}</strong>

        </ParallaxPanel>

        <ParallaxPanel className="hub-booking-stat hub-booking-stat--cancelled hub-lift">

          <span>Cancelled</span>

          <strong>{stats.cancelled}</strong>

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

          <Reveal delay={110}>

            <ParallaxPanel strength={8} className="hub-lift">

              <section className="hub-panel hub-bookings-panel">

                <h2 className="hub-panel__title">Your identity (temporary)</h2>

                <p className="hub-muted hub-panel__hint">

                  Until Google OAuth is connected, enter a stable user ID so "my bookings" and ownership

                  make sense.

                </p>

                <div className="hub-form-grid">

                  <label className="hub-field hub-field--grow">

                    <span className="inline-flex items-center gap-2">

                      <span>User ID</span>

                      <Tooltip

                        text="Use the same ID each time so your booking history and ownership checks remain accurate."

                        tone="ticket"

                      >

                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#B4182D] bg-white text-[11px] font-semibold text-[#B4182D]">

                          i

                        </span>

                      </Tooltip>

                    </span>

                    <input

                      value={userId}

                      onChange={(e) => persistUserId(e.target.value)}

                      placeholder="e.g. student-1001"

                    />

                  </label>

                </div>

              </section>

            </ParallaxPanel>

          </Reveal>



          <Reveal delay={145}>

            <ParallaxPanel strength={10} className="hub-lift">

              <section className="hub-panel hub-bookings-panel">

                <h2 className="hub-panel__title">New booking request</h2>

                <form className="hub-form-grid" onSubmit={handleCreate}>

                  <label className="hub-field hub-field--grow">

                    <span>Resource</span>

                    <select

                      required

                      value={form.resourceId}

                      onChange={(e) => setForm((current) => ({ ...current, resourceId: e.target.value }))}

                    >

                      <option value="">Select...</option>

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

                      value={form.start}

                      onChange={(e) => setForm((current) => ({ ...current, start: e.target.value }))}

                    />

                  </label>



                  <label className="hub-field">

                    <span>End</span>

                    <input

                      type="datetime-local"

                      required

                      value={form.end}

                      onChange={(e) => setForm((current) => ({ ...current, end: e.target.value }))}

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

                        setForm((current) => ({ ...current, expectedAttendees: e.target.value }))

                      }

                    />

                  </label>



                  <label className="hub-field hub-field--full">

                    <span>Purpose</span>

                    <input

                      required

                      value={form.purpose}

                      onChange={(e) => setForm((current) => ({ ...current, purpose: e.target.value }))}

                      placeholder="Lab session, meeting, seminar, exam prep"

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

                <div className="hub-booking-filter-chips" role="toolbar" aria-label="Quick booking status filters">

                  {STATUSES.map((status) => {

                    const active = listFilter.status === status

                    return (

                      <button

                        key={status || 'ALL'}

                        type="button"

                        onClick={() => setListFilter((current) => ({ ...current, status }))}

                        className={`hub-booking-filter-chip ${active ? 'hub-booking-filter-chip--active' : ''}`}

                      >

                        {formatStatusLabel(status)}

                      </button>

                    )

                  })}

                </div>



                <div className="hub-form-grid hub-form-grid--filters">

                  <label className="hub-field">

                    <span className="inline-flex items-center gap-2">

                      <span>Status</span>

                      <Tooltip text="Refine the table to one workflow stage." tone="ticket">

                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#B4182D] bg-white text-[11px] font-semibold text-[#B4182D]">

                          i

                        </span>

                      </Tooltip>

                    </span>

                    <select

                      value={listFilter.status}

                      onChange={(e) =>

                        setListFilter((current) => ({ ...current, status: e.target.value }))

                      }

                    >

                      {STATUSES.map((status) => (

                        <option key={status || 'ALL'} value={status}>

                          {formatStatusLabel(status)}

                        </option>

                      ))}

                    </select>

                  </label>



                  <label className="hub-field hub-field--checkbox">

                    <input

                      type="checkbox"

                      checked={listFilter.mineOnly}

                      onChange={(e) =>

                        setListFilter((current) => ({ ...current, mineOnly: e.target.checked }))

                      }

                    />

                    <span>Only my bookings</span>

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

                  <p className="hub-muted hub-muted--bookings">Loading...</p>

                ) : bookings.length === 0 ? (

                  <p className="hub-muted hub-muted--bookings">No bookings for this filter.</p>

                ) : (

                  <div className="hub-table-wrap hub-table-wrap--bookings">

                    <table className="hub-table hub-table--bookings">

                      <thead>

                        <tr>

                          <th>Resource</th>

                          <th>When</th>

                          <th>User</th>

                          <th>Attendees</th>

                          <th>Status</th>

                          <th>Notes</th>

                          <th>Actions</th>

                        </tr>

                      </thead>

                      <tbody>

                        {bookings.map((booking, index) => (

                          <tr

                            key={booking.id}

                            className="hub-ticket-list-row"

                            style={{ animationDelay: `${index * 50}ms` }}

                          >

                            <td>{resourceNameById.get(booking.resourceId) || booking.resourceId}</td>

                            <td className="hub-table__nowrap">

                              {toDatetimeLocal(booking.startDateTime)} - {toDatetimeLocal(booking.endDateTime)}

                            </td>

                            <td>{booking.requestedByUserId}</td>

                            <td>{booking.expectedAttendees}</td>

                            <td>

                              <span className={`hub-tag hub-tag--booking-${booking.status?.toLowerCase()}`}>

                                {booking.status}

                              </span>

                            </td>

                            <td className="hub-table__clip">{booking.adminReason || booking.purpose}</td>

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

                  <li>Pick a resource marked ACTIVE.</li>

                  <li>Set start and end times with enough setup buffer.</li>

                  <li>Use a clear purpose so approval is faster.</li>

                  <li>Track status in this page before creating another request.</li>

                </ul>

              </section>

            </ParallaxPanel>

          </Reveal>

        </aside>

      </div>

    </div>

  )

}



