import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTickets } from '../hooks/useTickets'
import { getJson, putJson } from '../api/client'

// Booking management component for admin
function BookingManagement() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processingId, setProcessingId] = useState(null) // Track which booking is being processed

  const loadBookings = async () => {
    try {
      const data = await getJson('/api/bookings?status=PENDING')
      setBookings(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (bookingId) => {
    setProcessingId(bookingId) // Disable button for this booking
    try {
      await putJson(`/api/bookings/${bookingId}/approve`)
      await loadBookings() // Refresh list
    } catch (e) {
      setError(e.message)
    } finally {
      setProcessingId(null) // Re-enable button
    }
  }

  const handleReject = async (bookingId) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return
    
    setProcessingId(bookingId) // Disable button for this booking
    try {
      await putJson(`/api/bookings/${bookingId}/reject`, { reason })
      await loadBookings() // Refresh list
    } catch (e) {
      setError(e.message)
    } finally {
      setProcessingId(null) // Re-enable button
    }
  }

  useEffect(() => {
    loadBookings()
    
    // Auto-refresh every 30 seconds to check for new pending bookings
    const interval = setInterval(() => {
      console.log('Checking for new pending bookings...')
      loadBookings()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-slate-900 mb-4">Pending Booking Approvals</h2>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {loading ? (
        <p className="text-slate-500">Loading pending bookings...</p>
      ) : bookings.length === 0 ? (
        <p className="text-slate-500">No pending bookings to review.</p>
      ) : (
        <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Resource</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Purpose</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Start Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">End Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {booking.resourceId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {booking.requestedByUserId}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {booking.purpose}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {new Date(booking.startDateTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {new Date(booking.endDateTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleApprove(booking.id)}
                      disabled={processingId === booking.id}
                      className={`mr-2 px-3 py-1 text-xs rounded ${
                        processingId === booking.id 
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                          : 'bg-emerald-500 text-white hover:bg-emerald-600'
                      }`}
                    >
                      {processingId === booking.id ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(booking.id)}
                      disabled={processingId === booking.id}
                      className={`px-3 py-1 text-xs rounded ${
                        processingId === booking.id 
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
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
    </div>
  )
}

const navItems = [
  { label: 'Overview', to: '/admin', active: true },
  { label: 'Resources', to: '/admin-resources' },
  { label: 'Bookings', to: '/admin-bookings-dashboard' },
  { label: 'Tickets', to: '/tickets' },
  { label: 'Notifications', to: '/notifications' },
  { label: 'Profile', to: '/login' },
]

const statusChip = {
  OPEN: 'bg-amber-100 text-amber-800',
  IN_PROGRESS: 'bg-sky-100 text-sky-800',
  RESOLVED: 'bg-emerald-100 text-emerald-800',
  CLOSED: 'bg-slate-200 text-slate-700',
  WAITING_FOR_CLIENT: 'bg-violet-100 text-violet-800',
  WAITING_FOR_SUPPORT: 'bg-orange-100 text-orange-800',
}

const moduleTiles = [
  ['Incident Queue', 'Live data from the ticket API.', 'Live', 'bg-emerald-100 text-emerald-700'],
  ['Bookings', 'Real-time booking approvals and management.', 'Live', 'bg-sky-100 text-sky-700'],
  ['Resources', 'Live resource availability and management.', 'Live', 'bg-amber-100 text-amber-700'],
  ['Notifications', 'Unread and delivery health can surface here.', 'Planned', 'bg-violet-100 text-violet-700'],
]

function cls(...values) {
  return values.filter(Boolean).join(' ')
}

function statusName(value) {
  return (value || 'OPEN').toUpperCase()
}

function label(value) {
  return statusName(value).replaceAll('_', ' ')
}

function dateText(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function minutesBetween(start, end) {
  if (!start || !end) return null
  const a = new Date(start).getTime()
  const b = new Date(end).getTime()
  if (Number.isNaN(a) || Number.isNaN(b)) return null
  return Math.max(0, Math.round((b - a) / 60000))
}

function durationText(minutes) {
  if (minutes === null) return 'Pending'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

function ageText(value) {
  if (!value) return '-'
  const diff = Math.max(0, Date.now() - new Date(value).getTime())
  const minutes = Math.round(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function buildTrend(tickets) {
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1)
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString(undefined, { month: 'short' }),
      opened: 0,
      resolved: 0,
    }
  })
  const lookup = Object.fromEntries(months.map((item) => [item.key, item]))

  tickets.forEach((ticket) => {
    if (ticket.createdAt) {
      const date = new Date(ticket.createdAt)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      if (lookup[key]) lookup[key].opened += 1
    }
    if (ticket.resolvedAt) {
      const date = new Date(ticket.resolvedAt)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      if (lookup[key]) lookup[key].resolved += 1
    }
  })

  return months
}

function linePoints(values, width = 480, height = 230, pad = 24) {
  const max = Math.max(...values, 1)
  return values
    .map((value, index) => {
      const x = pad + ((width - pad * 2) * index) / Math.max(values.length - 1, 1)
      const y = height - pad - (value / max) * (height - pad * 2)
      return `${x},${y}`
    })
    .join(' ')
}

function Sidebar() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-sm font-bold text-white shadow-lg shadow-emerald-500/20">
          SC
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900">Smart Campus</p>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Admin Desk</p>
        </div>
      </div>

      <nav className="space-y-1.5">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={cls(
              'block rounded-2xl px-4 py-3 text-sm font-medium transition',
              item.active ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
        Ticket operations are live. The other campus modules are scaffolded so that dashboard can grow without another redesign.
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { tickets, loading: ticketsLoading, error: ticketsError } = useTickets()
  const [bookings, setBookings] = useState([])
  const [resources, setResources] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [resourcesLoading, setResourcesLoading] = useState(true)
  const [bookingsError, setBookingsError] = useState(null)
  const [resourcesError, setResourcesError] = useState(null)
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  // Fetch bookings data
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await getJson('/api/bookings')
        setBookings(Array.isArray(data) ? data : [])
      } catch (e) {
        setBookingsError(e.message)
        setBookings([])
      } finally {
        setBookingsLoading(false)
      }
    }
    loadBookings()
  }, [])

  // Fetch resources data
  useEffect(() => {
    const loadResources = async () => {
      try {
        const data = await getJson('/api/resources')
        setResources(Array.isArray(data) ? data : [])
      } catch (e) {
        setResourcesError(e.message)
        setResources([])
      } finally {
        setResourcesLoading(false)
      }
    }
    loadResources()
  }, [])

  const summary = useMemo(() => {
    // Ticket statistics
    const counts = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0, WAITING_FOR_CLIENT: 0, WAITING_FOR_SUPPORT: 0 }
    let responseTotal = 0
    let responseCount = 0

    tickets.forEach((ticket) => {
      const status = statusName(ticket.status)
      counts[status] = (counts[status] || 0) + 1
      const response = minutesBetween(ticket.createdAt, ticket.firstResponseAt)
      if (response !== null) {
        responseTotal += response
        responseCount += 1
      }
    })

    const active = counts.OPEN + counts.IN_PROGRESS + counts.WAITING_FOR_CLIENT + counts.WAITING_FOR_SUPPORT

    // Booking statistics
    const bookingStats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'PENDING').length,
      approved: bookings.filter(b => b.status === 'APPROVED').length,
      rejected: bookings.filter(b => b.status === 'REJECTED').length,
      cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
    }

    // Resource statistics
    const resourceStats = {
      total: resources.length,
      active: resources.filter(r => r.status === 'ACTIVE').length,
      outOfService: resources.filter(r => r.status === 'OUT_OF_SERVICE').length,
      lectureHall: resources.filter(r => r.type === 'LECTURE_HALL').length,
      lab: resources.filter(r => r.type === 'LAB').length,
      meetingRoom: resources.filter(r => r.type === 'MEETING_ROOM').length,
      equipment: resources.filter(r => r.type === 'EQUIPMENT').length,
    }

    return {
      counts,
      bookingStats,
      resourceStats,
      cards: [
        ['Total Tickets', tickets.length, `${active} need action`, 'bg-slate-900 text-white'],
        ['Open Queue', active, `${counts.IN_PROGRESS} in progress`, 'bg-emerald-50 text-slate-900'],
        ['Resolved', counts.RESOLVED + counts.CLOSED, `${counts.CLOSED} closed`, 'bg-sky-50 text-slate-900'],
        ['Avg Response', durationText(responseCount ? Math.round(responseTotal / responseCount) : null), 'First reply speed', 'bg-amber-50 text-slate-900'],
        ['Total Bookings', bookingStats.total, `${bookingStats.pending} pending`, 'bg-purple-50 text-slate-900'],
        ['Approved Bookings', bookingStats.approved, `${bookingStats.rejected} rejected`, 'bg-blue-50 text-slate-900'],
        ['Total Resources', resourceStats.total, `${resourceStats.active} active`, 'bg-green-50 text-slate-900'],
        ['Available Resources', resourceStats.active, `${resourceStats.outOfService} out of service`, 'bg-orange-50 text-slate-900'],
      ],
      trend: buildTrend(tickets),
    }
  }, [tickets, bookings, resources])

  const visibleTickets = useMemo(() => {
    const query = search.trim().toLowerCase()
    const sorted = [...tickets].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    const filtered = !query
      ? sorted
      : sorted.filter((ticket) =>
          [ticket.title, ticket.description, ticket.createdBy, label(ticket.status)]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(query)
        )
    return filtered.slice(0, 8)
  }, [search, tickets])

  const openedLine = linePoints(summary.trend.map((item) => item.opened))
  const resolvedLine = linePoints(summary.trend.map((item) => item.resolved))

  return (
    <div className="min-h-screen bg-[#edf3f0] text-slate-900">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-emerald-200/45 blur-3xl" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-sky-100/60 blur-3xl" />
      </div>

      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/70 bg-white/85 px-6 py-8 backdrop-blur xl:block">
          <Sidebar />
        </aside>

        {menuOpen && (
          <div className="fixed inset-0 z-40 bg-slate-900/35 xl:hidden" onClick={() => setMenuOpen(false)}>
            <aside className="h-full w-72 bg-white px-6 py-8" onClick={(event) => event.stopPropagation()}>
              <Sidebar />
            </aside>
          </div>
        )}

        <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto max-w-[1480px] rounded-[36px] border border-white/70 bg-white/70 p-4 shadow-[0_30px_80px_rgba(148,163,184,0.28)] backdrop-blur md:p-6 lg:p-8">
            <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <button type="button" onClick={() => setMenuOpen(true)} className="mt-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm xl:hidden">
                  Menu
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">Smart Campus Admin</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Operations dashboard</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                    This follows the analytics-panel shape from your reference, but the content is mapped to your website:
                    incident tickets live now, with room for resources, bookings, and notification health next.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search ticket, reporter, or status"
                  className="min-w-[260px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none placeholder:text-slate-400"
                />
                <Link to="/tickets" className="rounded-2xl bg-emerald-500 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 hover:no-underline">
                  Review Ticket Inbox
                </Link>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">Campus Admin</p>
                    <p className="text-xs text-slate-500">Operations lead</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">SC</div>
                </div>
              </div>
            </header>

            <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
              {summary.cards.map(([title, value, note, tone]) => (
                <article key={title} className={cls('rounded-[28px] p-5 shadow-[0_24px_60px_rgba(15,23,42,0.07)]', tone)}>
                  <p className="text-sm font-medium opacity-75">{title}</p>
                  <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
                  <p className="mt-2 text-sm opacity-70">{note}</p>
                </article>
              ))}
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.7fr)]">
              <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Ticket trend</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Opened vs resolved</h2>
                <p className="mt-1 text-sm text-slate-500">Monthly movement for the last six months.</p>
                <div className="mt-6 overflow-hidden rounded-[28px] bg-slate-50 p-4">
                  <div className="mb-4 flex gap-5 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Opened</span>
                    <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-sky-500" />Resolved</span>
                  </div>
                  <svg viewBox="0 0 480 230" className="h-72 w-full">
                    {[0, 1, 2, 3, 4].map((index) => (
                      <line key={index} x1="24" x2="456" y1={24 + index * 45} y2={24 + index * 45} stroke="#dbe4ee" strokeDasharray="6 8" />
                    ))}
                    <polyline points={openedLine} fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points={resolvedLine} fill="none" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    {summary.trend.map((item, index) => (
                      <text key={item.label} x={24 + (432 * index) / 5} y="222" textAnchor="middle" fill="#94a3b8" fontSize="11">
                        {item.label}
                      </text>
                    ))}
                  </svg>
                </div>
              </article>

              <BookingManagement />
            </section>

            <section className="mt-6 rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Queue summary</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Ticket lifecycle</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                {[
                  ['Open', summary.counts.OPEN, 'text-amber-700 bg-amber-100'],
                  ['In Progress', summary.counts.IN_PROGRESS, 'text-sky-700 bg-sky-100'],
                  ['Waiting', summary.counts.WAITING_FOR_CLIENT + summary.counts.WAITING_FOR_SUPPORT, 'text-violet-700 bg-violet-100'],
                  ['Closed', summary.counts.CLOSED, 'text-slate-700 bg-slate-200'],
                ].map(([name, value, tone]) => (
                  <div key={name} className="rounded-[24px] bg-slate-50 p-4">
                    <span className={cls('inline-flex rounded-full px-3 py-1 text-xs font-semibold', tone)}>{name}</span>
                    <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-[24px] bg-slate-900 p-5 text-sm leading-6 text-slate-300">
                Ticket SLA and queue health belong at top because tickets are your only live admin dataset today. The other modules can attach to this same shell later.
              </div>
            </section>

            <section className="mt-6">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Platform sections</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Campus modules</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                {moduleTiles.map(([title, text, badge, tone]) => (
                  <article key={title} className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-lg font-semibold text-slate-900">{title}</p>
                      <span className={cls('rounded-full px-3 py-1 text-xs font-semibold', tone)}>{badge}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-6 rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Live queue</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Recent incident tickets</h2>
                </div>
                <div className="text-sm text-slate-500">{ticketsLoading ? 'Loading ticket feed...' : `${visibleTickets.length} visible ticket rows`}</div>
              </div>
              {ticketsError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Ticket data could not be loaded. Check the incident-ticket service.
                </div>
              ) : ticketsLoading ? (
                <div className="rounded-[24px] bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">Loading current ticket activity...</div>
              ) : visibleTickets.length === 0 ? (
                <div className="rounded-[24px] bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  No tickets match the current search.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-3 text-left">
                    <thead>
                      <tr className="text-xs uppercase tracking-[0.22em] text-slate-400">
                        <th className="px-4 py-2 font-semibold">Incident</th>
                        <th className="px-4 py-2 font-semibold">Reporter</th>
                        <th className="px-4 py-2 font-semibold">Status</th>
                        <th className="px-4 py-2 font-semibold">Created</th>
                        <th className="px-4 py-2 font-semibold">Response SLA</th>
                        <th className="px-4 py-2 font-semibold">Age</th>
                        <th className="px-4 py-2 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleTickets.map((ticket) => {
                        const response = minutesBetween(ticket.createdAt, ticket.firstResponseAt)
                        const status = statusName(ticket.status)

                        return (
                          <tr key={ticket.id} className="bg-slate-50 text-sm text-slate-600 shadow-sm">
                            <td className="rounded-l-[22px] px-4 py-4">
                              <div className="font-semibold text-slate-900">
                                <Link to={`/ticket-details/${ticket.id}`} className="hover:no-underline">{ticket.title || 'Untitled incident'}</Link>
                              </div>
                              <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">{ticket.description?.slice(0, 90) || 'No description provided.'}</p>
                            </td>
                            <td className="px-4 py-4">
                              <p className="font-medium text-slate-900">{ticket.createdBy || 'Anonymous'}</p>
                              <p className="text-xs text-slate-500">{ticket.id ? `ID ${ticket.id.slice(0, 8)}` : 'Pending ID'}</p>
                            </td>
                            <td className="px-4 py-4">
                              <span className={cls('inline-flex rounded-full px-3 py-1 text-xs font-semibold', statusChip[status] || 'bg-slate-200 text-slate-700')}>
                                {label(status)}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-slate-900">{dateText(ticket.createdAt)}</td>
                            <td className="px-4 py-4">
                              <p className="font-medium text-slate-900">{durationText(response)}</p>
                              <p className="text-xs text-slate-500">{ticket.firstResponseAt ? `Started ${dateText(ticket.firstResponseAt)}` : 'Awaiting response'}</p>
                            </td>
                            <td className="px-4 py-4">
                              <p className="font-medium text-slate-900">{ageText(ticket.createdAt)}</p>
                              <p className="text-xs text-slate-500">{ticket.resolvedAt ? `Resolved ${dateText(ticket.resolvedAt)}` : 'Still active'}</p>
                            </td>
                            <td className="rounded-r-[22px] px-4 py-4">
                              <Link to={`/ticket-details/${ticket.id}`} className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-emerald-200 hover:text-emerald-700 hover:no-underline">
                                View
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
