import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { deleteJson, getJson, patchJson, postJson, putJson } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { useTickets } from '../hooks/useTickets'
import { deleteAnyTicket, updateAnyTicketStatus } from '../services/ticketService'

const SECTIONS = ['overview', 'resources', 'bookings', 'tickets', 'notifications']
const RESOURCE_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT']
const RESOURCE_STATUSES = ['ACTIVE', 'OUT_OF_SERVICE']
const BOOKING_FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']
const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED', 'WAITING_FOR_CLIENT', 'WAITING_FOR_SUPPORT']
const NOTIFICATION_TYPES = ['BOOKING', 'TICKET', 'COMMENT', 'SYSTEM']
const emptyResource = { type: 'LECTURE_HALL', name: '', capacity: 0, location: '', availabilityWindows: '', status: 'ACTIVE' }
const emptyNotice = { title: '', message: '', type: 'SYSTEM', targetUserId: '' }

function cls(...values) { return values.filter(Boolean).join(' ') }
function label(value) { return (value || '').replaceAll('_', ' ') }
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

  const loadResources = useCallback(async () => {
    setResourcesLoading(true); setResourcesError(null)
    try { const data = await getJson('/api/resources'); setResources(Array.isArray(data) ? data : []) }
    catch (error) { setResources([]); setResourcesError(error.message) }
    finally { setResourcesLoading(false) }
  }, [])

  const loadBookings = useCallback(async () => {
    setBookingsLoading(true); setBookingsError(null)
    try { const data = await getJson('/api/bookings'); setBookings(Array.isArray(data) ? data : []) }
    catch (error) { setBookings([]); setBookingsError(error.message) }
    finally { setBookingsLoading(false) }
  }, [])

  const loadNotifications = useCallback(async () => {
    setNotificationsLoading(true); setNotificationsError(null)
    try { const data = await getJson('/api/admin/notifications'); setNotifications(Array.isArray(data) ? data : []) }
    catch (error) { setNotifications([]); setNotificationsError(error.message) }
    finally { setNotificationsLoading(false) }
  }, [])

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true); setAnalyticsError(null)
    try {
      const data = await getJson('/api/admin/analytics/usage')
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
    loadResources().catch(() => {})
    loadBookings().catch(() => {})
    loadNotifications().catch(() => {})
    loadAnalytics().catch(() => {})
    reloadTickets().catch(() => {})
  }, [loadAnalytics, loadBookings, loadNotifications, loadResources, reloadTickets])

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
      if (['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CLIENT', 'WAITING_FOR_SUPPORT'].includes(ticket.status)) active += 1
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
        <nav className="space-y-1.5">{SECTIONS.map((item) => <button key={item} type="button" onClick={() => setSection(item)} className={cls('block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition', section === item ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900')}>{item[0].toUpperCase() + item.slice(1)}</button>)}</nav>
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
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right text-sm"><p className="font-semibold text-slate-900">{user?.name || 'Campus Admin'}</p><p className="text-slate-500">{user?.email || 'admin@smartcampus.local'}</p></div>
            </header>

            {section === 'overview' && (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <article className="rounded-[24px] bg-slate-900 p-5 text-white"><p>Total tickets</p><p className="mt-2 text-3xl font-semibold">{tickets.length}</p><p className="text-sm opacity-80">{ticketSummary.active} active queue</p></article>
                  <article className="rounded-[24px] bg-emerald-50 p-5"><p>Resources</p><p className="mt-2 text-3xl font-semibold">{resources.length}</p><p className="text-sm text-slate-500">{resources.filter((item) => item.status === 'ACTIVE').length} active</p></article>
                  <article className="rounded-[24px] bg-sky-50 p-5"><p>Pending bookings</p><p className="mt-2 text-3xl font-semibold">{pendingBookings.length}</p><p className="text-sm text-slate-500">Awaiting review</p></article>
                  <article className="rounded-[24px] bg-amber-50 p-5"><p>Unread notifications</p><p className="mt-2 text-3xl font-semibold">{notifications.filter((item) => !item.read).length}</p><p className="text-sm text-slate-500">Admin inbox</p></article>
                </div>
                <div className="grid gap-5 lg:grid-cols-2">
                  <section className="rounded-[24px] border border-slate-200 bg-white p-5">
                    <h2 className="text-xl font-semibold">Usage analytics</h2>
                    <p className="mt-1 text-sm text-slate-500">Top resources and peak approved-booking hours.</p>
                    {analyticsError && <p className="mt-3 text-sm text-rose-600">{analyticsError}</p>}
                    {analyticsLoading ? <p className="mt-3 text-sm text-slate-500">Loading analytics...</p> : <div className="mt-4 space-y-5">
                      <div><h3 className="text-sm font-semibold text-slate-900">Top resources</h3><div className="mt-3 space-y-3">{analytics.topResources.length === 0 ? <p className="text-sm text-slate-500">No approved bookings yet.</p> : analytics.topResources.map((item) => <div key={item.resourceId}><div className="mb-1 flex items-center justify-between text-sm"><span className="font-medium text-slate-700">{item.resourceName}</span><span className="text-slate-500">{item.bookingCount}</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${(item.bookingCount / maxResourceCount) * 100}%` }} /></div></div>)}</div></div>
                      <div><h3 className="text-sm font-semibold text-slate-900">Peak booking hours</h3><div className="mt-3 space-y-3">{analytics.peakBookingHours.length === 0 ? <p className="text-sm text-slate-500">No approved bookings yet.</p> : analytics.peakBookingHours.map((item) => <div key={item.hour}><div className="mb-1 flex items-center justify-between text-sm"><span className="font-medium text-slate-700">{item.label}</span><span className="text-slate-500">{item.bookingCount}</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-sky-500" style={{ width: `${(item.bookingCount / maxHourCount) * 100}%` }} /></div></div>)}</div></div>
                    </div>}
                  </section>
                  <section className="rounded-[24px] border border-slate-200 bg-white p-5">
                    <h2 className="text-xl font-semibold">Ticket SLA summary</h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <article className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Average first response</p><p className="mt-2 text-2xl font-semibold text-slate-900">{durationLabel(ticketSummary.avgFirstResponse)}</p></article>
                      <article className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Average resolution</p><p className="mt-2 text-2xl font-semibold text-slate-900">{durationLabel(ticketSummary.avgResolution)}</p></article>
                    </div>
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">First response is captured when support first picks up a ticket or leaves an admin/support comment. Resolution time ends when a ticket moves to RESOLVED or CLOSED.</div>
                  </section>
                </div>
              </div>
            )}

            {section === 'resources' && (
              <div className="space-y-5">
                <section className="rounded-[24px] border border-slate-200 bg-white p-5">
                  <h2 className="text-xl font-semibold">{resourceEditId ? 'Edit resource' : 'Add resource'}</h2>
                  <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={saveResource}>
                    <select value={resourceForm.type} onChange={(event) => setResourceForm((current) => ({ ...current, type: event.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2">{RESOURCE_TYPES.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select>
                    <input required placeholder="Name" value={resourceForm.name} onChange={(event) => setResourceForm((current) => ({ ...current, name: event.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2" />
                    <input type="number" min={0} required placeholder="Capacity" value={resourceForm.capacity} onChange={(event) => setResourceForm((current) => ({ ...current, capacity: event.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2" />
                    <input required placeholder="Location" value={resourceForm.location} onChange={(event) => setResourceForm((current) => ({ ...current, location: event.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2" />
                    <input placeholder="Availability window" value={resourceForm.availabilityWindows} onChange={(event) => setResourceForm((current) => ({ ...current, availabilityWindows: event.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2 md:col-span-2" />
                    <select value={resourceForm.status} onChange={(event) => setResourceForm((current) => ({ ...current, status: event.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2">{RESOURCE_STATUSES.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select>
                    <div className="flex items-center gap-2"><button type="submit" className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white">{resourceEditId ? 'Update' : 'Create'}</button>{resourceEditId && <button type="button" onClick={() => { setResourceEditId(null); setResourceForm(emptyResource) }} className="rounded-xl border border-slate-300 px-4 py-2 text-sm">Cancel</button>}</div>
                  </form>
                  {resourcesError && <p className="mt-2 text-sm text-rose-600">{resourcesError}</p>}
                </section>
                <section className="rounded-[24px] border border-slate-200 bg-white p-5">
                  <h2 className="text-xl font-semibold">Resource list</h2>
                  {resourcesLoading ? <p className="mt-2 text-sm text-slate-500">Loading...</p> : <div className="mt-3 overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="text-left text-xs text-slate-500"><th className="py-2">Name</th><th>Type</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead><tbody>{resources.map((item) => <tr key={item.id} className="border-t border-slate-100"><td className="py-2 font-semibold">{item.name}</td><td>{label(item.type)}</td><td>{item.location}</td><td>{label(item.status)}</td><td className="space-x-2"><button type="button" onClick={() => { setResourceEditId(item.id); setResourceForm({ type: item.type, name: item.name, capacity: item.capacity, location: item.location, availabilityWindows: item.availabilityWindows || '', status: item.status }) }} className="rounded-lg border border-slate-300 px-2 py-1 text-xs">Edit</button><button type="button" onClick={() => deleteResource(item.id)} className="rounded-lg bg-rose-500 px-2 py-1 text-xs text-white">Delete</button></td></tr>)}</tbody></table></div>}
                </section>
              </div>
            )}

            {section === 'bookings' && (
              <section className="rounded-[24px] border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-semibold">Booking management</h2><select value={bookingFilter} onChange={(event) => setBookingFilter(event.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">{BOOKING_FILTERS.map((item) => <option key={item} value={item}>{item === 'ALL' ? 'All' : label(item)}</option>)}</select></div>
                {bookingsError && <p className="mb-2 text-sm text-rose-600">{bookingsError}</p>}
                {bookingsLoading ? <p className="text-sm text-slate-500">Loading...</p> : <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="text-left text-xs text-slate-500"><th className="py-2">Resource</th><th>User</th><th>Time</th><th>Status</th><th>Check-in</th><th>Actions</th></tr></thead><tbody>{visibleBookings.map((item) => <tr key={item.id} className="border-t border-slate-100"><td className="py-2 font-semibold">{item.resourceId}</td><td>{item.requestedByUserId}</td><td>{dt(item.startDateTime)}</td><td>{label(item.status)}</td><td>{item.checkedInAt ? <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Verified</span> : item.status === 'APPROVED' ? <Link to={`/booking-check-in?booking=${item.id}`} className="text-xs font-semibold text-emerald-700">QR / verify</Link> : '-'}</td><td className="space-x-2">{item.status === 'PENDING' && <><button type="button" disabled={busyId === item.id} onClick={() => runBookingAction(item.id, 'approve')} className="rounded-lg bg-emerald-500 px-2 py-1 text-xs text-white">Approve</button><button type="button" disabled={busyId === item.id} onClick={() => { const reason = window.prompt('Rejection reason'); if (reason?.trim()) runBookingAction(item.id, 'reject', { reason: reason.trim() }) }} className="rounded-lg bg-amber-500 px-2 py-1 text-xs text-white">Reject</button></>}{(item.status === 'PENDING' || item.status === 'APPROVED') && <button type="button" disabled={busyId === item.id} onClick={() => runBookingAction(item.id, 'cancel')} className="rounded-lg border border-slate-300 px-2 py-1 text-xs">Cancel</button>}<button type="button" disabled={busyId === item.id} onClick={() => deleteBooking(item.id)} className="rounded-lg bg-rose-500 px-2 py-1 text-xs text-white">Delete</button></td></tr>)}</tbody></table></div>}
              </section>
            )}

            {section === 'tickets' && (
              <section className="rounded-[24px] border border-slate-200 bg-white p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Ticket operations</h2><input value={ticketQuery} onChange={(event) => setTicketQuery(event.target.value)} placeholder="Search ticket..." className="rounded-xl border border-slate-300 px-3 py-2 text-sm" /></div>
                {ticketsError && <p className="mb-2 text-sm text-rose-600">{String(ticketsError.message || ticketsError)}</p>}
                {ticketsLoading ? <p className="text-sm text-slate-500">Loading...</p> : <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="text-left text-xs text-slate-500"><th className="py-2">Title</th><th>Reporter</th><th>Status</th><th>First response</th><th>Resolution</th><th>Actions</th></tr></thead><tbody>{visibleTickets.map((item) => <tr key={`${item.ticketSource || 'ticket'}:${item.id}`} className="border-t border-slate-100"><td className="py-2"><p className="font-semibold">{item.title}</p><p className="max-w-[280px] text-xs text-slate-500">{item.description?.slice(0, 70)}</p></td><td>{item.createdBy || '-'}</td><td><select value={item.status || 'OPEN'} disabled={busyId === item.id} onChange={(event) => updateTicketStatus(item, event.target.value)} className="rounded-xl border border-slate-300 px-2 py-1 text-xs">{TICKET_STATUSES.map((status) => <option key={status} value={status}>{label(status)}</option>)}</select></td><td>{durationLabel(minutesBetween(item.createdAt, item.firstResponseAt))}</td><td>{durationLabel(minutesBetween(item.createdAt, item.resolvedAt))}</td><td className="space-x-2"><Link to={`/ticket-details/${item.id}`} className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:no-underline">View</Link><button type="button" disabled={busyId === item.id} onClick={() => deleteTicket(item)} className="rounded-lg bg-rose-500 px-2 py-1 text-xs text-white">Delete</button></td></tr>)}</tbody></table></div>}
              </section>
            )}

            {section === 'notifications' && (
              <div className="space-y-5">
                <section className="rounded-[24px] border border-slate-200 bg-white p-5">
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
                <section className="rounded-[24px] border border-slate-200 bg-white p-5">
                  <h2 className="text-xl font-semibold">Notification inbox</h2>
                  {notificationsLoading ? <p className="mt-2 text-sm text-slate-500">Loading...</p> : <div className="mt-3 overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="text-left text-xs text-slate-500"><th className="py-2">Title</th><th>Type</th><th>Target</th><th>Created</th><th>State</th><th>Actions</th></tr></thead><tbody>{notifications.map((item) => <tr key={item.id} className="border-t border-slate-100"><td className="py-2"><p className="font-semibold">{item.title}</p><p className="max-w-[280px] text-xs text-slate-500">{item.message}</p></td><td>{label(item.type)}</td><td>{item.targetUserId || 'Broadcast'}</td><td>{dt(item.createdAt)}</td><td>{item.read ? 'Read' : 'Unread'}</td><td className="space-x-2"><button type="button" disabled={busyId === item.id} onClick={() => toggleRead(item)} className="rounded-lg border border-slate-300 px-2 py-1 text-xs">{item.read ? 'Unread' : 'Read'}</button><button type="button" disabled={busyId === item.id} onClick={() => deleteNotification(item.id)} className="rounded-lg bg-rose-500 px-2 py-1 text-xs text-white">Delete</button></td></tr>)}</tbody></table></div>}
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
