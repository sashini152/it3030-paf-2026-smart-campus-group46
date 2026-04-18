
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { deleteJson, getJson, patchJson, postJson, putJson } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { useTickets } from '../hooks/useTickets'
import { deleteAnyTicket, updateAnyTicketStatus } from '../services/ticketService'
import { getTicketReporterLabel } from '../utils/studentIdentity'
import { normalizeTicketWorkflowStatus } from '../utils/ticketPresentation'

const SECTIONS = ['overview', 'resources', 'bookings', 'tickets', 'notifications']
const RESOURCE_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT']
const RESOURCE_STATUSES = ['ACTIVE', 'OUT_OF_SERVICE']
const BOOKING_FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']
const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']
const NOTIFICATION_TYPES = ['BOOKING', 'TICKET', 'COMMENT', 'SYSTEM']
const emptyResource = { type: 'LECTURE_HALL', name: '', capacity: 0, location: '', availabilityWindows: '', status: 'ACTIVE' }
const emptyNotice = { title: '', message: '', type: 'SYSTEM', targetUserId: '' }
const ADMIN_REQUEST_TIMEOUT_MS = 4000
const TICKET_GRAPH_COLORS = {
  OPEN: 'bg-sky-500',
  IN_PROGRESS: 'bg-indigo-500',
  RESOLVED: 'bg-emerald-500',
  CLOSED: 'bg-slate-500',
  REJECTED: 'bg-rose-500',
}

function cls(...values) { return values.filter(Boolean).join(' ') }
function label(value) { return (value || '').replaceAll('_', ' ') }
function withTimeout(request, labelText) {
  let timeoutId
  return Promise.race([
    request,
    new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(`${labelText} request timed out. Reload the page and make sure the backend is still running.`)), ADMIN_REQUEST_TIMEOUT_MS)
    }),
  ]).finally(() => clearTimeout(timeoutId))
}
function dt(value) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString()
}
function minutesBetween(start, end) {
  if (!start || !end) return null
  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()
  if (Number.isNaN(startTime) || Number.isNaN(endTime)) return null
  return Math.max(0, Math.round((endTime - startTime) / 60000))
}
function durationLabel(minutes) {
  if (minutes === null) return 'Pending'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`
}
function formatChartDay(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString(undefined, { weekday: 'short' })
}
function formatShortDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { tickets, loading: ticketsLoading, error: ticketsError, reload: reloadTickets } = useTickets()
  const [section, setSection] = useState('overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [resources, setResources] = useState([])
  const [resourcesLoading, setResourcesLoading] = useState(true)
  const [resourcesError, setResourcesError] = useState(null)
  const [resourceForm, setResourceForm] = useState(emptyResource)
  const [resourceEditId, setResourceEditId] = useState(null)
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [bookingsError, setBookingsError] = useState(null)
  const [bookingFilter, setBookingFilter] = useState('ALL')
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  const [notificationsError, setNotificationsError] = useState(null)
  const [notificationForm, setNotificationForm] = useState(emptyNotice)
  const [analytics, setAnalytics] = useState({ topResources: [], peakBookingHours: [] })
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [analyticsError, setAnalyticsError] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [ticketQuery, setTicketQuery] = useState('')
  const [adminUsers, setAdminUsers] = useState([])
  const [adminUsersLoading, setAdminUsersLoading] = useState(true)
  const [adminUsersError, setAdminUsersError] = useState(null)
  const [newAdminEmail, setNewAdminEmail] = useState('')

  const loadResources = useCallback(async () => {
    setResourcesLoading(true); setResourcesError(null)
    try { const data = await withTimeout(getJson('/api/resources'), 'Resource list'); setResources(Array.isArray(data) ? data : []) }
    catch (error) { setResources([]); setResourcesError(error.message) }
    finally { setResourcesLoading(false) }
  }, [])

  const loadBookings = useCallback(async () => {
    setBookingsLoading(true); setBookingsError(null)
    try { const data = await withTimeout(getJson('/api/bookings'), 'Booking list'); setBookings(Array.isArray(data) ? data : []) }
    catch (error) { setBookings([]); setBookingsError(error.message) }
    finally { setBookingsLoading(false) }
  }, [])

  const loadAdminUsers = useCallback(async () => {
    setAdminUsersLoading(true); setAdminUsersError(null)
    try { 
      const data = await withTimeout(getJson('/api/users'), 'Admin users list'); 
      const admins = Array.isArray(data) ? data.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN') : []
      setAdminUsers(admins) 
    }
    catch (error) { setAdminUsers([]); setAdminUsersError(error.message) }
    finally { setAdminUsersLoading(false) }
  }, [])

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      alert('Please enter a valid email address')
      return
    }

    try {
      const userResponse = await withTimeout(getJson(`/api/users/email/${newAdminEmail.trim()}`), 'User lookup')
      if (!userResponse) {
        alert('User with this email does not exist')
        return
      }

      await withTimeout(putJson(`/api/users/${userResponse.id}/role`, { role: 'ADMIN' }), 'Grant admin access')
      
      alert(`Admin access granted to ${newAdminEmail}`)
      setNewAdminEmail('')
      await loadAdminUsers()
    } catch (err) {
      console.error('Failed to add admin:', err)
      alert('Failed to grant admin access. Please try again.')
    }
  }

  const handleRemoveAdmin = async (userId, userEmail) => {
    if (!confirm(`Are you sure you want to remove admin access from ${userEmail}?`)) {
      return
    }

    try {
      await withTimeout(putJson(`/api/users/${userId}/role`, { role: 'USER' }), 'Remove admin access')
      alert(`Admin access removed from ${userEmail}`)
      await loadAdminUsers()
    } catch (err) {
      console.error('Failed to remove admin:', err)
      alert('Failed to remove admin access. Please try again.')
    }
  }

  const loadNotifications = useCallback(async () => {
    setNotificationsLoading(true); setNotificationsError(null)
    try { const data = await withTimeout(getJson('/api/admin/notifications'), 'Notification inbox'); setNotifications(Array.isArray(data) ? data : []) }
    catch (error) { setNotifications([]); setNotificationsError(error.message) }
    finally { setNotificationsLoading(false) }
  }, [])

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true); setAnalyticsError(null)
    try {
      const data = await withTimeout(getJson('/api/admin/analytics/usage'), 'Usage analytics')
      setAnalytics({
        topResources: Array.isArray(data?.topResources) ? data.topResources : [],
        peakBookingHours: Array.isArray(data?.peakBookingHours) ? data.peakBookingHours : [],
      })
    } catch (error) {
      setAnalytics({ topResources: [], peakBookingHours: [] })
      setAnalyticsError(error.message)
    } finally {
      setAnalyticsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (section === 'overview') {
      loadAnalytics()
      loadBookings()
      loadNotifications()
      loadResources()
      reloadTickets().catch(() => {})
    } else if (section === 'resources') {
      loadResources()
    } else if (section === 'bookings') {
      loadBookings()
    } else if (section === 'tickets') {
      reloadTickets().catch(() => {})
    } else if (section === 'admin-management') {
      loadAdminUsers()
    }
  }, [section, loadAnalytics, loadBookings, loadNotifications, loadResources, reloadTickets, loadAdminUsers])

  const pendingBookings = useMemo(() => bookings.filter((item) => item.status === 'PENDING'), [bookings])
  const visibleBookings = useMemo(() => bookingFilter === 'ALL' ? bookings : bookings.filter((item) => item.status === bookingFilter), [bookingFilter, bookings])
  const visibleTickets = useMemo(() => {
    const query = ticketQuery.trim().toLowerCase()
    if (!query) return tickets
    return tickets.filter((item) => [item.title, item.description, item.createdBy, item.status].filter(Boolean).join(' ').toLowerCase().includes(query))
  }, [ticketQuery, tickets])

  const ticketSummary = useMemo(() => {
    let active = 0
    let firstResponseTotal = 0
    let firstResponseCount = 0
    let resolutionTotal = 0
    let resolutionCount = 0
    tickets.forEach((ticket) => {
      if (['OPEN', 'IN_PROGRESS'].includes(normalizeTicketWorkflowStatus(ticket.status))) active += 1
      const firstResponseMinutes = minutesBetween(ticket.createdAt, ticket.firstResponseAt)
      if (firstResponseMinutes !== null) { firstResponseTotal += firstResponseMinutes; firstResponseCount += 1 }
      const resolutionMinutes = minutesBetween(ticket.createdAt, ticket.resolvedAt)
      if (resolutionMinutes !== null) { resolutionTotal += resolutionMinutes; resolutionCount += 1 }
    })
    return {
      active,
      avgFirstResponse: firstResponseCount ? Math.round(firstResponseTotal / firstResponseCount) : null,
      avgResolution: resolutionCount ? Math.round(resolutionTotal / resolutionCount) : null,
    }
  }, [tickets])

  const ticketStatusChart = useMemo(() => {
    const counts = TICKET_STATUSES.map((status) => ({
      status,
      count: tickets.filter((item) => normalizeTicketWorkflowStatus(item.status || 'OPEN') === status).length,
    })).filter((item) => item.count > 0)
    const total = counts.reduce((sum, item) => sum + item.count, 0)
    return { counts, total }
  }, [tickets])

  const ticketRaisedTrend = useMemo(() => {
    const days = 7
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const points = Array.from({ length: days }, (_, index) => {
      const day = new Date(today)
      day.setDate(today.getDate() - (days - index - 1))
      const key = day.toISOString().slice(0, 10)
      return { key, date: day, count: 0 }
    })

    const pointMap = new Map(points.map((point) => [point.key, point]))

    tickets.forEach((ticket) => {
      const createdAt = new Date(ticket.createdAt || ticket.updatedAt || 0)
      if (Number.isNaN(createdAt.getTime())) return
      const key = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate())
        .toISOString()
        .slice(0, 10)
      const point = pointMap.get(key)
      if (point) point.count += 1
    })

    const max = Math.max(...points.map((point) => point.count), 1)
    const path = points
      .map((point, index) => {
        const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100
        const y = 100 - (point.count / max) * 100
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')

    return { points, max, path }
  }, [tickets])

  async function saveResource(event) {
    event.preventDefault()
    setResourcesError(null)
    try {
      const payload = { type: resourceForm.type, name: resourceForm.name.trim(), capacity: Number(resourceForm.capacity), location: resourceForm.location.trim(), availabilityWindows: resourceForm.availabilityWindows.trim() || null, status: resourceForm.status }
      if (resourceEditId) await putJson(`/api/resources/${resourceEditId}`, payload)
      else await postJson('/api/resources', payload)
      setResourceEditId(null); setResourceForm(emptyResource)
      await loadResources(); await loadAnalytics()
    } catch (error) { setResourcesError(error.message) }
  }

  async function deleteResource(id) {
    if (!window.confirm('Delete this resource?')) return
    try { await deleteJson(`/api/resources/${id}`); await loadResources(); await loadAnalytics() }
    catch (error) { setResourcesError(error.message) }
  }

  async function runBookingAction(id, action, body = {}) {
    setBusyId(id); setBookingsError(null)
    try { await putJson(`/api/bookings/${id}/${action}`, body); await loadBookings(); await loadNotifications(); await loadAnalytics() }
    catch (error) { setBookingsError(error.message) }
    finally { setBusyId(null) }
  }

  async function deleteBooking(id) {
    if (!window.confirm('Delete this booking?')) return
    setBusyId(id)
    try { await deleteJson(`/api/bookings/${id}`); await loadBookings(); await loadAnalytics() }
    catch (error) { setBookingsError(error.message) }
    finally { setBusyId(null) }
  }

  async function updateTicketStatus(ticket, status) { setBusyId(ticket.id); try { await updateAnyTicketStatus(ticket, status); await reloadTickets(); await loadNotifications() } finally { setBusyId(null) } }
  async function deleteTicket(ticket) { if (!window.confirm('Delete this ticket?')) return; setBusyId(ticket.id); try { await deleteAnyTicket(ticket); await reloadTickets() } finally { setBusyId(null) } }
  async function createNotification(event) {
    event.preventDefault()
    try {
      await postJson('/api/admin/notifications', { title: notificationForm.title.trim(), message: notificationForm.message.trim(), type: notificationForm.type, targetUserId: notificationForm.targetUserId.trim() || null })
      setNotificationForm(emptyNotice); await loadNotifications()
    } catch (error) { setNotificationsError(error.message) }
  }
  async function toggleRead(notification) { setBusyId(notification.id); try { await patchJson(`/api/admin/notifications/${notification.id}/read`, { read: !notification.read }); await loadNotifications() } catch (error) { setNotificationsError(error.message) } finally { setBusyId(null) } }
  async function deleteNotification(id) { if (!window.confirm('Delete this notification?')) return; setBusyId(id); try { await deleteJson(`/api/admin/notifications/${id}`); await loadNotifications() } catch (error) { setNotificationsError(error.message) } finally { setBusyId(null) } }
  async function markAllRead() { try { await patchJson('/api/admin/notifications/read-all', {}); await loadNotifications() } catch (error) { setNotificationsError(error.message) } }

  const maxResourceCount = Math.max(...analytics.topResources.map((item) => item.bookingCount), 1)
  const maxHourCount = Math.max(...analytics.peakBookingHours.map((item) => item.bookingCount), 1)

  function sidebarView() {
    return (
      <div className="flex h-full flex-col">
        <div className="mb-8 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-sm font-bold text-white">SC</div><div><p className="text-lg font-semibold text-slate-900">Smart Campus</p><p className="text-xs uppercase tracking-[0.28em] text-slate-400">Admin Desk</p></div></div>
        <nav className="space-y-1.5">{SECTIONS.map((item) => <button key={item} type="button" onClick={() => { console.log('Setting section to:', item); setSection(item) }} className={cls('block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition', section === item ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900')}>{item[0].toUpperCase() + item.slice(1)}</button>)}</nav>
        <button type="button" onClick={() => { logout(); navigate('/login', { replace: true }) }} className="mt-6 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-600">Logout</button>
        <div className="mt-auto rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">Review analytics, booking verification, support timers, and notification delivery from one workspace.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#edf3f0] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/70 bg-white/85 px-6 py-8 xl:block">{sidebarView()}</aside>
        {menuOpen && <div className="fixed inset-0 z-40 bg-slate-900/35 xl:hidden" onClick={() => setMenuOpen(false)}><aside className="h-full w-72 bg-white px-6 py-8" onClick={(event) => event.stopPropagation()}>{sidebarView()}</aside></div>}
        <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto max-w-[1480px] rounded-[36px] border border-white/70 bg-white/70 p-4 shadow-[0_30px_80px_rgba(148,163,184,0.28)] md:p-6 lg:p-8">
            <header className="mb-8 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3"><button type="button" onClick={() => setMenuOpen(true)} className="mt-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 xl:hidden">Menu</button><div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">Smart Campus Admin</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Operations dashboard</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Manage resources, bookings, tickets, notifications, and analytics from one page.</p></div></div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right text-sm">
                <p className="font-semibold text-slate-900">{user?.name || 'Campus Admin'}</p>
                <p className="text-slate-500">{user?.email || 'admin@smartcampus.local'}</p>
                {/* Super Admin Link - Only show for super admin email */}
                {((user?.email === 'sashini.unilocatelk@gmail.com') || 
                  (localStorage.getItem('userEmail') === 'sashini.unilocatelk@gmail.com')) && (
                  <button
                    onClick={() => navigate('/super-admin')}
                    className="mt-2 px-3 py-1 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 transition-colors"
                  >
                    🎯 Super Admin Dashboard
                  </button>
                )}
              </div>
            </header>

            {section === 'overview' && (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <article className="hub-quarter-fade rounded-[24px] bg-slate-900 p-5 text-white"><p>Total tickets</p><p className="mt-2 text-3xl font-semibold">{tickets.length}</p><p className="text-sm opacity-80">{ticketSummary.active} active queue</p></article>
                  <article className="hub-quarter-fade rounded-[24px] bg-emerald-50 p-5"><p>Resources</p><p className="mt-2 text-3xl font-semibold">{resources.length}</p><p className="text-sm text-slate-500">{resources.filter((item) => item.status === 'ACTIVE').length} active</p></article>
                  <article className="hub-quarter-fade rounded-[24px] bg-sky-50 p-5"><p>Pending bookings</p><p className="mt-2 text-3xl font-semibold">{pendingBookings.length}</p><p className="text-sm text-slate-500">Awaiting review</p></article>
                  <article className="hub-quarter-fade rounded-[24px] bg-amber-50 p-5"><p>Unread notifications</p><p className="mt-2 text-3xl font-semibold">{notifications.filter((item) => !item.read).length}</p><p className="text-sm text-slate-500">Admin inbox</p></article>
                </div>
                <div className="grid gap-5 lg:grid-cols-2">
                  <section className="hub-quarter-fade rounded-[24px] border border-slate-200 bg-white p-5">
                    <h2 className="text-xl font-semibold">Tickets raised over time</h2>
                    <p className="mt-1 text-sm text-slate-500">Line chart for the last 7 days of ticket submissions.</p>
                    {ticketsLoading ? (
                      <p className="mt-3 text-sm text-slate-500">Loading tickets...</p>
                    ) : (
                      <div className="mt-4 space-y-4">
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                          <div className="mb-4 flex items-end justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium text-slate-500">Total raised this week</p>
                              <p className="mt-1 text-3xl font-semibold text-slate-900">
                                {ticketRaisedTrend.points.reduce((sum, point) => sum + point.count, 0)}
                              </p>
                            </div>
                            <p className="text-sm text-slate-500">
                              Peak day: {Math.max(...ticketRaisedTrend.points.map((point) => point.count), 0)}
                            </p>
                          </div>

                          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-44 w-full overflow-visible">
                            <line x1="0" y1="100" x2="100" y2="100" stroke="#cbd5e1" strokeWidth="1.2" />
                            <line x1="0" y1="0" x2="0" y2="100" stroke="#cbd5e1" strokeWidth="1.2" />
                            <path
                              d={ticketRaisedTrend.path}
                              fill="none"
                              stroke="#2563eb"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            {ticketRaisedTrend.points.map((point, index) => {
                              const x = ticketRaisedTrend.points.length === 1 ? 50 : (index / (ticketRaisedTrend.points.length - 1)) * 100
                              const y = 100 - (point.count / ticketRaisedTrend.max) * 100
                              return (
                                <circle key={point.key} cx={x} cy={y} r="2.6" fill="#2563eb" stroke="#ffffff" strokeWidth="1.4" />
                              )
                            })}
                          </svg>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-7">
                          {ticketRaisedTrend.points.map((point) => (
                            <div key={point.key} className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                {formatChartDay(point.date)}
                              </p>
                              <p className="mt-2 text-2xl font-semibold text-slate-900">{point.count}</p>
                              <p className="mt-1 text-xs text-slate-500">{formatShortDate(point.date)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="hub-quarter-fade rounded-[24px] border border-slate-200 bg-white p-5">
                    <h2 className="text-xl font-semibold">Ticket status stack</h2>
                    <p className="mt-1 text-sm text-slate-500">Stacked status view for the current raised-ticket queue.</p>
                    {ticketsLoading ? (
                      <p className="mt-3 text-sm text-slate-500">Loading tickets...</p>
                    ) : (
                      <div className="mt-4 space-y-4">
                        {ticketStatusChart.counts.length === 0 ? (
                          <p className="text-sm text-slate-500">No tickets yet.</p>
                        ) : (
                          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <p className="text-sm font-medium text-slate-500">Total tracked tickets</p>
                              <p className="text-2xl font-semibold text-slate-900">{ticketStatusChart.total}</p>
                            </div>
                            <div className="overflow-hidden rounded-full bg-white">
                              <div className="flex h-5 w-full">
                                {ticketStatusChart.counts.map((item) => (
                                  <div
                                    key={item.status}
                                    className={cls(
                                      TICKET_GRAPH_COLORS[item.status] || 'bg-slate-400',
                                      item.count === 0 ? 'hidden' : ''
                                    )}
                                    style={{
                                      width: ticketStatusChart.total
                                        ? `${(item.count / ticketStatusChart.total) * 100}%`
                                        : '0%',
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="grid gap-3 sm:grid-cols-2">
                          {ticketStatusChart.counts.map((item) => (
                            <div key={item.status} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={cls(
                                      'h-3 w-3 rounded-full',
                                      TICKET_GRAPH_COLORS[item.status] || 'bg-slate-400'
                                    )}
                                  />
                                  <span className="text-sm font-medium text-slate-700">{label(item.status)}</span>
                                </div>
                                <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                              </div>
                              <p className="mt-2 text-xs text-slate-500">
                                {ticketStatusChart.total
                                  ? `${Math.round((item.count / ticketStatusChart.total) * 100)}% of current queue`
                                  : 'No tickets yet'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="hub-quarter-fade rounded-[30px] border border-sky-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-6 shadow-[0_20px_45px_rgba(148,163,184,0.14)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-500">Usage analytics</p>
                        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Resource rhythm</h2>
                        <p className="mt-1 text-sm text-slate-500">Top resources and peak approved-booking hours.</p>
                      </div>
                      <div className="hidden h-14 w-14 rounded-[20px] bg-[radial-gradient(circle_at_30%_30%,#7dd3fc,transparent_58%),linear-gradient(135deg,#eff6ff,#dbeafe)] sm:block" />
                    </div>
                    {analyticsError && <p className="mt-3 text-sm text-rose-600">{analyticsError}</p>}
                    {analyticsLoading ? <p className="mt-3 text-sm text-slate-500">Loading analytics...</p> : <div className="mt-4 space-y-5">
                      <div className="rounded-[26px] border border-emerald-100 bg-[linear-gradient(180deg,#ffffff_0%,#f0fdf4_100%)] p-4">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Top resources</h3>
                        <div className="mt-3 space-y-4">
                          {analytics.topResources.length === 0 ? <p className="text-sm text-slate-500">No approved bookings yet.</p> : analytics.topResources.map((item) => <div key={item.resourceId} className="rounded-[20px] bg-white/90 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"><div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold text-slate-700">{item.resourceName}</span><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{item.bookingCount}</span></div><div className="h-2.5 rounded-full bg-emerald-50"><div className="h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" style={{ width: `${(item.bookingCount / maxResourceCount) * 100}%` }} /></div></div>)}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">Peak booking hours</h3>
                        <div className="mt-3">
                          {analytics.peakBookingHours.length === 0 ? (
                            <p className="text-sm text-slate-500">No approved bookings yet.</p>
                          ) : (
                            <div className="rounded-[26px] border border-sky-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eff6ff_100%)] p-5">
                              <div className="flex min-h-[220px] items-end gap-4">
                                {analytics.peakBookingHours.map((item) => (
                                  <div key={item.hour} className="flex min-w-0 flex-1 flex-col items-center gap-3">
                                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-sky-600 shadow-sm">{item.bookingCount}</span>
                                    <div className="flex h-36 w-full items-end rounded-[24px] border border-white/70 bg-white/90 px-2 py-2 shadow-[inset_0_10px_18px_rgba(191,219,254,0.3)]">
                                      <div
                                        className="w-full rounded-[18px] bg-gradient-to-t from-sky-500 via-cyan-400 to-sky-300 shadow-[0_10px_20px_rgba(14,165,233,0.28)]"
                                        style={{
                                          height: `${Math.max((item.bookingCount / maxHourCount) * 100, 12)}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-center text-[11px] font-medium leading-4 text-slate-600">
                                      {item.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>}
                  </section>
                  <section className="hub-quarter-fade rounded-[30px] border border-rose-100 bg-[linear-gradient(180deg,#ffffff_0%,#fff7fb_100%)] p-6 shadow-[0_20px_45px_rgba(244,114,182,0.08)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-rose-500">Ticket care</p>
                        <h2 className="mt-2 text-2xl font-semibold text-slate-900">SLA summary</h2>
                      </div>
                      <div className="hidden h-14 w-14 rounded-[20px] bg-[radial-gradient(circle_at_30%_30%,#f9a8d4,transparent_58%),linear-gradient(135deg,#fff1f2,#ffe4e6)] sm:block" />
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <article className="rounded-[24px] border border-rose-100 bg-[linear-gradient(180deg,#ffffff_0%,#fff1f2_100%)] p-5 shadow-[0_12px_24px_rgba(251,113,133,0.08)]"><p className="text-sm font-medium text-slate-500">Average first response</p><p className="mt-3 text-3xl font-semibold text-slate-900">{durationLabel(ticketSummary.avgFirstResponse)}</p><p className="mt-2 text-xs uppercase tracking-[0.16em] text-rose-500">Support pickup speed</p></article>
                      <article className="rounded-[24px] border border-amber-100 bg-[linear-gradient(180deg,#ffffff_0%,#fffbeb_100%)] p-5 shadow-[0_12px_24px_rgba(251,191,36,0.08)]"><p className="text-sm font-medium text-slate-500">Average resolution</p><p className="mt-3 text-3xl font-semibold text-slate-900">{durationLabel(ticketSummary.avgResolution)}</p><p className="mt-2 text-xs uppercase tracking-[0.16em] text-amber-500">End-to-end closure</p></article>
                    </div>
                    <div className="mt-4 rounded-[24px] border border-slate-200 bg-white/80 p-4 text-sm leading-7 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">First response is captured when support first picks up a ticket or leaves an admin/support comment. Resolution time ends when a ticket moves to RESOLVED or CLOSED.</div>
                  </section>
                </div>
              </div>
            )}

            {section === 'resources' && (
              <div className="space-y-5">
                <section className="hub-quarter-fade rounded-[24px] border border-slate-200 bg-white p-5">
                  <h2 className="text-xl font-semibold">{resourceEditId ? 'Edit resource' : 'Add resource'}</h2>
                  <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={saveResource}>
                    <select value={resourceForm.type} onChange={(event) => setResourceForm((current) => ({ ...current, type: event.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2">{RESOURCE_TYPES.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select>
                    <input required placeholder="Name" value={resourceForm.name} onChange={(event) => setResourceForm((current) => ({ ...current, name: event.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2" />
                    <input type="number" min={0} required placeholder="Capacity" value={resourceForm.capacity} onChange={(event) => setResourceForm((current) => ({ ...current, capacity: event.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2" />
                    <input required placeholder="Location" value={resourceForm.location} onChange={(event) => setResourceForm((current) => ({ ...current, location: event.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2" />
                    <input placeholder="Availability window" value={resourceForm.availabilityWindows} onChange={(event) => setResourceForm((current) => ({ ...current, availabilityWindows: event.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2 md:col-span-2" />
                    <select value={resourceForm.status} onChange={(event) => setResourceForm((current) => ({ ...current, status: event.target.value }))} className="min-h-[50px] rounded-xl border border-slate-300 px-3 py-2">{RESOURCE_STATUSES.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select>
                    <div className="flex items-stretch gap-2 md:self-end">
                      <button type="submit" className="min-h-[50px] rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white">
                        {resourceEditId ? 'Update' : 'Create'}
                      </button>
                      {resourceEditId && (
                        <button
                          type="button"
                          onClick={() => { setResourceEditId(null); setResourceForm(emptyResource) }}
                          className="min-h-[50px] rounded-xl border border-slate-300 px-5 py-2 text-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                  {resourcesError && <p className="mt-2 text-sm text-rose-600">{resourcesError}</p>}
                </section>
                <section className="hub-quarter-fade rounded-[24px] border border-slate-200 bg-white p-5">
                  <h2 className="text-xl font-semibold">Resource list</h2>
                  {resourcesLoading ? <p className="mt-2 text-sm text-slate-500">Loading...</p> : <div className="mt-3 overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="text-left text-xs text-slate-500"><th className="py-2">Name</th><th>Type</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead><tbody>{resources.map((item) => <tr key={item.id} className="border-t border-slate-100"><td className="py-2 font-semibold">{item.name}</td><td>{label(item.type)}</td><td>{item.location}</td><td>{label(item.status)}</td><td className="space-x-2"><button type="button" onClick={() => { setResourceEditId(item.id); setResourceForm({ type: item.type, name: item.name, capacity: item.capacity, location: item.location, availabilityWindows: item.availabilityWindows || '', status: item.status }) }} className="rounded-lg border border-slate-300 px-2 py-1 text-xs">Edit</button><button type="button" onClick={() => deleteResource(item.id)} className="rounded-lg bg-rose-500 px-2 py-1 text-xs text-white">Delete</button></td></tr>)}</tbody></table></div>}
                </section>
              </div>
            )}

            {section === 'bookings' && (
              <section className="hub-quarter-fade rounded-[24px] border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-semibold">Booking management</h2><select value={bookingFilter} onChange={(event) => setBookingFilter(event.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">{BOOKING_FILTERS.map((item) => <option key={item} value={item}>{item === 'ALL' ? 'All' : label(item)}</option>)}</select></div>
                {bookingsError && <p className="mb-2 text-sm text-rose-600">{bookingsError}</p>}
                {bookingsLoading ? <p className="text-sm text-slate-500">Loading...</p> : <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="text-left text-xs text-slate-500"><th className="py-2">Resource</th><th>User</th><th>Time</th><th>Status</th><th>Check-in</th><th>Actions</th></tr></thead><tbody>{visibleBookings.map((item) => <tr key={item.id} className="border-t border-slate-100"><td className="py-2 font-semibold">{item.resourceId}</td><td>{item.requestedByUserId}</td><td>{dt(item.startDateTime)}</td><td>{label(item.status)}</td><td>{item.checkedInAt ? <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Verified</span> : item.status === 'APPROVED' ? <Link to={`/booking-check-in?booking=${item.id}`} className="text-xs font-semibold text-emerald-700">QR / verify</Link> : '-'}</td><td className="space-x-2">{item.status === 'PENDING' && <><button type="button" disabled={busyId === item.id} onClick={() => runBookingAction(item.id, 'approve')} className="rounded-lg bg-emerald-500 px-2 py-1 text-xs text-white">Approve</button><button type="button" disabled={busyId === item.id} onClick={() => { const reason = window.prompt('Rejection reason'); if (reason?.trim()) runBookingAction(item.id, 'reject', { reason: reason.trim() }) }} className="rounded-lg bg-amber-500 px-2 py-1 text-xs text-white">Reject</button></>}{(item.status === 'PENDING' || item.status === 'APPROVED') && <button type="button" disabled={busyId === item.id} onClick={() => runBookingAction(item.id, 'cancel')} className="rounded-lg border border-slate-300 px-2 py-1 text-xs">Cancel</button>}<button type="button" disabled={busyId === item.id} onClick={() => deleteBooking(item.id)} className="rounded-lg bg-rose-500 px-2 py-1 text-xs text-white">Delete</button></td></tr>)}</tbody></table></div>}
              </section>
            )}

            {section === 'tickets' && (
              <section className="hub-quarter-fade rounded-[24px] border border-slate-200 bg-white p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Ticket operations</h2><input value={ticketQuery} onChange={(event) => setTicketQuery(event.target.value)} placeholder="Search ticket..." className="rounded-xl border border-slate-300 px-3 py-2 text-sm" /></div>
                {ticketsError && <p className="mb-2 text-sm text-rose-600">{String(ticketsError.message || ticketsError)}</p>}
                {ticketsLoading ? <p className="text-sm text-slate-500">Loading...</p> : <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="text-left text-xs text-slate-500"><th className="py-2">Title</th><th>Reporter</th><th>Status</th><th>First response</th><th>Resolution</th><th>Actions</th></tr></thead><tbody>{visibleTickets.map((item) => <tr key={`${item.ticketSource || 'ticket'}:${item.id}`} className="border-t border-slate-100"><td className="py-2"><p className="font-semibold">{item.title}</p><p className="max-w-[280px] text-xs text-slate-500">{item.description?.slice(0, 70)}</p></td><td><p>{getTicketReporterLabel(item)}</p><p className="text-[11px] text-slate-400">{item.createdBy || '-'}</p></td><td><select value={normalizeTicketWorkflowStatus(item.status || 'OPEN')} disabled={busyId === item.id} onChange={(event) => updateTicketStatus(item, event.target.value)} className="rounded-xl border border-slate-300 px-2 py-1 text-xs">{TICKET_STATUSES.map((status) => <option key={status} value={status}>{label(status)}</option>)}</select></td><td>{durationLabel(minutesBetween(item.createdAt, item.firstResponseAt))}</td><td>{durationLabel(minutesBetween(item.createdAt, item.resolvedAt))}</td><td className="space-x-2"><Link to={`/ticket-details/${item.id}`} className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:no-underline">View</Link><button type="button" disabled={busyId === item.id} onClick={() => deleteTicket(item)} className="rounded-lg bg-rose-500 px-2 py-1 text-xs text-white">Delete</button></td></tr>)}</tbody></table></div>}
              </section>
            )}

            {section === 'notifications' && (
              <div className="space-y-5">
                <section className="hub-quarter-fade rounded-[24px] border border-slate-200 bg-white p-5">
                  <div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-semibold">Create notification</h2><button type="button" onClick={markAllRead} className="rounded-xl border border-slate-300 px-4 py-2 text-sm">Mark all read</button></div>
                  <form className="grid gap-3 md:grid-cols-2" onSubmit={createNotification}>
                    <input required placeholder="Title" value={notificationForm.title} onChange={(event) => setNotificationForm((current) => ({ ...current, title: event.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2" />
                    <select value={notificationForm.type} onChange={(event) => setNotificationForm((current) => ({ ...current, type: event.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2">{NOTIFICATION_TYPES.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select>
                    <textarea required placeholder="Message" value={notificationForm.message} onChange={(event) => setNotificationForm((current) => ({ ...current, message: event.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2 md:col-span-2" rows={3} />
                    <input placeholder="Target user ID (optional)" value={notificationForm.targetUserId} onChange={(event) => setNotificationForm((current) => ({ ...current, targetUserId: event.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2" />
                    <div><button type="submit" className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white">Publish</button></div>
                  </form>
                  {notificationsError && <p className="mt-2 text-sm text-rose-600">{notificationsError}</p>}
                </section>
                <section className="hub-quarter-fade rounded-[24px] border border-slate-200 bg-white p-5">
                  <h2 className="text-xl font-semibold text-slate-900">Notification inbox</h2>
                  {notificationsLoading ? (
                    <div className="mt-4 flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                      <span className="ml-2 text-sm text-slate-500">Loading notifications...</span>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="mt-4 text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-slate-400 text-4xl mb-2">inbox</div>
                      <p className="text-sm text-slate-500">No notifications found</p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-slate-500">{notifications.length} notifications</span>
                        <button
                          type="button"
                          onClick={markAllRead}
                          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Mark all as read
                        </button>
                      </div>
                      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <table className="min-w-full">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Target</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">State</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {notifications.map((item) => (
                              <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${!item.read ? 'bg-emerald-50' : ''}`}>
                                <td className="px-4 py-3">
                                  <div className="flex items-start">
                                    {!item.read && (
                                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    )}
                                    <div className="flex-1">
                                      <p className="font-medium text-slate-900 text-sm">{item.title}</p>
                                      <p className="text-xs text-slate-500 mt-1 max-w-xs">{item.message}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    item.type === 'INFO' ? 'bg-blue-100 text-blue-800' :
                                    item.type === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                                    item.type === 'ERROR' ? 'bg-red-100 text-red-800' :
                                    item.type === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {label(item.type)}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-600">
                                  {item.targetUserId || 'Broadcast'}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-600">
                                  {dt(item.createdAt)}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    item.read ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-700'
                                  }`}>
                                    {item.read ? 'Read' : 'Unread'}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex space-x-2">
                                    <button
                                      type="button"
                                      disabled={busyId === item.id}
                                      onClick={() => toggleRead(item)}
                                      className={`inline-flex items-center px-3 py-1 border text-xs font-medium rounded-md transition-colors ${
                                        item.read 
                                          ? 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100' 
                                          : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                                      } ${busyId === item.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                      {item.read ? 'Mark unread' : 'Mark read'}
                                    </button>
                                    <button
                                      type="button"
                                      disabled={busyId === item.id}
                                      onClick={() => deleteNotification(item.id)}
                                      className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors ${
                                        busyId === item.id ? 'opacity-50 cursor-not-allowed' : ''
                                      }`}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            )}

            {section === 'admin-management' && user?.role === 'SUPER_ADMIN' && (
              <div className="space-y-5">
                <section className="hub-quarter-fade rounded-[24px] border border-slate-200 bg-white p-5">
                  <h2 className="text-xl font-semibold mb-4">Super Admin Management</h2>
                  
                  {/* Add New Admin */}
                  <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h3 className="font-medium text-purple-900 mb-3">Grant Admin Access</h3>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="Enter user email"
                        className="flex-1 px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={handleAddAdmin}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                      >
                        Add Admin
                      </button>
                    </div>
                  </div>
                  
                  {/* Current Admins */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-3">
                      Current Admin Users ({adminUsers.length})
                    </h3>
                    {adminUsersLoading ? (
                      <p className="text-gray-500 text-sm">Loading admin users...</p>
                    ) : adminUsersError ? (
                      <p className="text-red-500 text-sm">Error: {adminUsersError}</p>
                    ) : adminUsers.length === 0 ? (
                      <p className="text-gray-500 text-sm">No admin users found</p>
                    ) : (
                      <div className="space-y-2">
                        {adminUsers.map((adminUser) => (
                          <div key={adminUser.id} className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200">
                            <div>
                              <div className="font-medium text-gray-900">
                                {adminUser.name || adminUser.email}
                              </div>
                              <div className="text-sm text-gray-500">{adminUser.email}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  adminUser.role === 'SUPER_ADMIN' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {adminUser.role}
                                </span>
                              </div>
                            </div>
                            {adminUser.role !== 'SUPER_ADMIN' && (
                              <button
                                onClick={() => handleRemoveAdmin(adminUser.id, adminUser.email)}
                                className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-sm"
                              >
                                Remove Admin
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
