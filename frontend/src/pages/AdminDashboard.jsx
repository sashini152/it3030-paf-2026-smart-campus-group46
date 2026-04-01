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

function cls(...values) {
  return values.filter(Boolean).join(' ')
}

function label(text) {
  return (text || '').replaceAll('_', ' ')
}

function dt(value) {
  if (!value) return '-'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleString()
}

const emptyResource = { type: 'LECTURE_HALL', name: '', capacity: 0, location: '', availabilityWindows: '', status: 'ACTIVE' }
const emptyNotice = { title: '', message: '', type: 'SYSTEM', targetUserId: '' }

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

  const [busyId, setBusyId] = useState(null)
  const [ticketQuery, setTicketQuery] = useState('')

  const loadResources = useCallback(async () => {
    setResourcesLoading(true)
    setResourcesError(null)
    try {
      const data = await getJson('/api/resources')
      setResources(Array.isArray(data) ? data : [])
    } catch (error) {
      setResources([])
      setResourcesError(error.message)
    } finally {
      setResourcesLoading(false)
    }
  }, [])

  const loadBookings = useCallback(async () => {
    setBookingsLoading(true)
    setBookingsError(null)
    try {
      const data = await getJson('/api/bookings')
      setBookings(Array.isArray(data) ? data : [])
    } catch (error) {
      setBookings([])
      setBookingsError(error.message)
    } finally {
      setBookingsLoading(false)
    }
  }, [])

  const loadNotifications = useCallback(async () => {
    setNotificationsLoading(true)
    setNotificationsError(null)
    try {
      const data = await getJson('/api/admin/notifications')
      setNotifications(Array.isArray(data) ? data : [])
    } catch (error) {
      setNotifications([])
      setNotificationsError(error.message)
    } finally {
      setNotificationsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadResources().catch(() => {})
    loadBookings().catch(() => {})
    loadNotifications().catch(() => {})
    reloadTickets().catch(() => {})
  }, [loadBookings, loadNotifications, loadResources, reloadTickets])

  const ticketCounts = useMemo(() => {
    const counts = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0, WAITING_FOR_CLIENT: 0, WAITING_FOR_SUPPORT: 0 }
    tickets.forEach((item) => {
      const key = (item.status || 'OPEN').toUpperCase()
      counts[key] = (counts[key] || 0) + 1
    })
    return counts
  }, [tickets])

  const pendingBookings = useMemo(() => bookings.filter((item) => item.status === 'PENDING'), [bookings])
  const visibleBookings = useMemo(() => bookingFilter === 'ALL' ? bookings : bookings.filter((item) => item.status === bookingFilter), [bookingFilter, bookings])
  const visibleTickets = useMemo(() => {
    const q = ticketQuery.trim().toLowerCase()
    if (!q) return tickets
    return tickets.filter((item) =>
      [item.title, item.description, item.createdBy, item.status].filter(Boolean).join(' ').toLowerCase().includes(q)
    )
  }, [ticketQuery, tickets])

  const unreadNotifications = notifications.filter((item) => !item.read).length
  const activeTickets = ticketCounts.OPEN + ticketCounts.IN_PROGRESS + ticketCounts.WAITING_FOR_CLIENT + ticketCounts.WAITING_FOR_SUPPORT

  async function saveResource(event) {
    event.preventDefault()
    setResourcesError(null)
    try {
      const payload = {
        type: resourceForm.type,
        name: resourceForm.name.trim(),
        capacity: Number(resourceForm.capacity),
        location: resourceForm.location.trim(),
        availabilityWindows: resourceForm.availabilityWindows.trim() || null,
        status: resourceForm.status,
      }
      if (resourceEditId) await putJson(`/api/resources/${resourceEditId}`, payload)
      else await postJson('/api/resources', payload)
      setResourceEditId(null)
      setResourceForm(emptyResource)
      await loadResources()
    } catch (error) {
      setResourcesError(error.message)
    }
  }

  async function deleteResource(id) {
    if (!window.confirm('Delete this resource?')) return
    setResourcesError(null)
    try {
      await deleteJson(`/api/resources/${id}`)
      await loadResources()
    } catch (error) {
      setResourcesError(error.message)
    }
  }

  async function runBookingAction(id, action, body = {}) {
    setBusyId(id)
    setBookingsError(null)
    try {
      await putJson(`/api/bookings/${id}/${action}`, body)
      await loadBookings()
      await loadNotifications()
    } catch (error) {
      setBookingsError(error.message)
    } finally {
      setBusyId(null)
    }
  }

  async function deleteBooking(id) {
    if (!window.confirm('Delete this booking?')) return
    setBusyId(id)
    setBookingsError(null)
    try {
      await deleteJson(`/api/bookings/${id}`)
      await loadBookings()
    } catch (error) {
      setBookingsError(error.message)
    } finally {
      setBusyId(null)
    }
  }

  async function updateTicketStatus(ticket, status) {
    setBusyId(ticket.id)
    try {
      await updateAnyTicketStatus(ticket, status)
      await reloadTickets()
      await loadNotifications()
    } finally {
      setBusyId(null)
    }
  }

  async function deleteTicket(ticket) {
    if (!window.confirm('Delete this ticket?')) return
    setBusyId(ticket.id)
    try {
      await deleteAnyTicket(ticket)
      await reloadTickets()
    } finally {
      setBusyId(null)
    }
  }

  async function createNotification(event) {
    event.preventDefault()
    setNotificationsError(null)
    try {
      await postJson('/api/admin/notifications', {
        title: notificationForm.title.trim(),
        message: notificationForm.message.trim(),
        type: notificationForm.type,
        targetUserId: notificationForm.targetUserId.trim() || null,
      })
      setNotificationForm(emptyNotice)
      await loadNotifications()
    } catch (error) {
      setNotificationsError(error.message)
    }
  }

  async function toggleRead(notification) {
    setBusyId(notification.id)
    setNotificationsError(null)
    try {
      await patchJson(`/api/admin/notifications/${notification.id}/read`, { read: !notification.read })
      await loadNotifications()
    } catch (error) {
      setNotificationsError(error.message)
    } finally {
      setBusyId(null)
    }
  }

  async function deleteNotification(id) {
    if (!window.confirm('Delete this notification?')) return
    setBusyId(id)
    setNotificationsError(null)
    try {
      await deleteJson(`/api/admin/notifications/${id}`)
      await loadNotifications()
    } catch (error) {
      setNotificationsError(error.message)
    } finally {
      setBusyId(null)
    }
  }

  async function markAllRead() {
    setNotificationsError(null)
    try {
      await patchJson('/api/admin/notifications/read-all', {})
      await loadNotifications()
    } catch (error) {
      setNotificationsError(error.message)
    }
  }

  function sidebarView() {
    return (
      <div className="flex h-full flex-col">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-sm font-bold text-white">SC</div>
          <div>
            <p className="text-lg font-semibold text-slate-900">Smart Campus</p>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Admin Desk</p>
          </div>
        </div>
        <nav className="space-y-1.5">
          {SECTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSection(item)}
              className={cls(
                'block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition',
                section === item ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/login', { replace: true })
          }}
          className="mt-6 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-600"
        >
          Logout
        </button>
        <div className="mt-auto rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
          All admin sections are now completed in one dashboard page.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#edf3f0] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/70 bg-white/85 px-6 py-8 xl:block">{sidebarView()}</aside>
        {menuOpen && (
          <div className="fixed inset-0 z-40 bg-slate-900/35 xl:hidden" onClick={() => setMenuOpen(false)}>
            <aside className="h-full w-72 bg-white px-6 py-8" onClick={(event) => event.stopPropagation()}>
              {sidebarView()}
            </aside>
          </div>
        )}
        <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto max-w-[1480px] rounded-[36px] border border-white/70 bg-white/70 p-4 shadow-[0_30px_80px_rgba(148,163,184,0.28)] md:p-6 lg:p-8">
            <header className="mb-8 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <button type="button" onClick={() => setMenuOpen(true)} className="mt-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 xl:hidden">Menu</button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">Smart Campus Admin</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Operations dashboard</h1>
                  <p className="mt-2 max-w-2xl text-sm text-slate-500">Manage resources, bookings, tickets, and notifications from one page.</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right text-sm">
                <p className="font-semibold text-slate-900">{user?.name || 'Campus Admin'}</p>
                <p className="text-slate-500">{user?.email || 'admin@smartcampus.local'}</p>
              </div>
            </header>

            {section === 'overview' && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-[24px] bg-slate-900 p-5 text-white"><p>Total Tickets</p><p className="mt-2 text-3xl font-semibold">{tickets.length}</p><p className="text-sm opacity-80">{activeTickets} active queue</p></article>
                <article className="rounded-[24px] bg-emerald-50 p-5"><p>Resources</p><p className="mt-2 text-3xl font-semibold">{resources.length}</p><p className="text-sm text-slate-500">{resources.filter((r) => r.status === 'ACTIVE').length} active</p></article>
                <article className="rounded-[24px] bg-sky-50 p-5"><p>Pending Bookings</p><p className="mt-2 text-3xl font-semibold">{pendingBookings.length}</p><p className="text-sm text-slate-500">Awaiting review</p></article>
                <article className="rounded-[24px] bg-amber-50 p-5"><p>Unread Notifications</p><p className="mt-2 text-3xl font-semibold">{unreadNotifications}</p><p className="text-sm text-slate-500">Admin inbox</p></article>
                <section className="col-span-full rounded-[24px] border border-slate-200 bg-white p-5">
                  <h2 className="text-xl font-semibold">Pending Booking Approvals</h2>
                  {pendingBookings.length === 0 ? <p className="mt-2 text-sm text-slate-500">No pending bookings.</p> : (
                    <div className="mt-3 space-y-2">{pendingBookings.slice(0, 5).map((item) => <div key={item.id} className="rounded-xl bg-slate-50 p-3 text-sm"><span className="font-semibold">{item.resourceId}</span> by {item.requestedByUserId} - {dt(item.startDateTime)}</div>)}</div>
                  )}
                </section>
              </div>
            )}

            {section === 'resources' && (
              <div className="space-y-5">
                <section className="rounded-[24px] border border-slate-200 bg-white p-5">
                  <h2 className="text-xl font-semibold">{resourceEditId ? 'Edit resource' : 'Add resource'}</h2>
                  <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={saveResource}>
                    <select value={resourceForm.type} onChange={(e) => setResourceForm((v) => ({ ...v, type: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2">{RESOURCE_TYPES.map((x) => <option key={x} value={x}>{label(x)}</option>)}</select>
                    <input required placeholder="Name" value={resourceForm.name} onChange={(e) => setResourceForm((v) => ({ ...v, name: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2" />
                    <input type="number" min={0} required placeholder="Capacity" value={resourceForm.capacity} onChange={(e) => setResourceForm((v) => ({ ...v, capacity: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2" />
                    <input required placeholder="Location" value={resourceForm.location} onChange={(e) => setResourceForm((v) => ({ ...v, location: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2" />
                    <input placeholder="Availability window" value={resourceForm.availabilityWindows} onChange={(e) => setResourceForm((v) => ({ ...v, availabilityWindows: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2 md:col-span-2" />
                    <select value={resourceForm.status} onChange={(e) => setResourceForm((v) => ({ ...v, status: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2">{RESOURCE_STATUSES.map((x) => <option key={x} value={x}>{label(x)}</option>)}</select>
                    <div className="flex items-center gap-2"><button type="submit" className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white">{resourceEditId ? 'Update' : 'Create'}</button>{resourceEditId && <button type="button" onClick={() => { setResourceEditId(null); setResourceForm(emptyResource) }} className="rounded-xl border border-slate-300 px-4 py-2 text-sm">Cancel</button>}</div>
                  </form>
                  {resourcesError && <p className="mt-2 text-sm text-rose-600">{resourcesError}</p>}
                </section>
                <section className="rounded-[24px] border border-slate-200 bg-white p-5">
                  <h2 className="text-xl font-semibold">Resource List</h2>
                  {resourcesLoading ? <p className="mt-2 text-sm text-slate-500">Loading...</p> : (
                    <div className="mt-3 overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="text-left text-xs text-slate-500"><th className="py-2">Name</th><th>Type</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead><tbody>{resources.map((item) => <tr key={item.id} className="border-t border-slate-100"><td className="py-2 font-semibold">{item.name}</td><td>{label(item.type)}</td><td>{item.location}</td><td>{label(item.status)}</td><td className="space-x-2"><button type="button" onClick={() => { setResourceEditId(item.id); setResourceForm({ type: item.type, name: item.name, capacity: item.capacity, location: item.location, availabilityWindows: item.availabilityWindows || '', status: item.status }) }} className="rounded-lg border border-slate-300 px-2 py-1 text-xs">Edit</button><button type="button" onClick={() => deleteResource(item.id)} className="rounded-lg bg-rose-500 px-2 py-1 text-xs text-white">Delete</button></td></tr>)}</tbody></table></div>
                  )}
                </section>
              </div>
            )}

            {section === 'bookings' && (
              <section className="rounded-[24px] border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-semibold">Booking Management</h2><select value={bookingFilter} onChange={(e) => setBookingFilter(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">{BOOKING_FILTERS.map((x) => <option key={x} value={x}>{x === 'ALL' ? 'All' : label(x)}</option>)}</select></div>
                {bookingsError && <p className="mb-2 text-sm text-rose-600">{bookingsError}</p>}
                {bookingsLoading ? <p className="text-sm text-slate-500">Loading...</p> : (
                  <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="text-left text-xs text-slate-500"><th className="py-2">Resource</th><th>User</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visibleBookings.map((item) => <tr key={item.id} className="border-t border-slate-100"><td className="py-2 font-semibold">{item.resourceId}</td><td>{item.requestedByUserId}</td><td>{dt(item.startDateTime)}</td><td>{label(item.status)}</td><td className="space-x-2">{item.status === 'PENDING' && <><button type="button" disabled={busyId === item.id} onClick={() => runBookingAction(item.id, 'approve')} className="rounded-lg bg-emerald-500 px-2 py-1 text-xs text-white">Approve</button><button type="button" disabled={busyId === item.id} onClick={() => { const reason = window.prompt('Rejection reason'); if (reason?.trim()) runBookingAction(item.id, 'reject', { reason: reason.trim() }) }} className="rounded-lg bg-amber-500 px-2 py-1 text-xs text-white">Reject</button></>}{(item.status === 'PENDING' || item.status === 'APPROVED') && <button type="button" disabled={busyId === item.id} onClick={() => runBookingAction(item.id, 'cancel')} className="rounded-lg border border-slate-300 px-2 py-1 text-xs">Cancel</button>}<button type="button" disabled={busyId === item.id} onClick={() => deleteBooking(item.id)} className="rounded-lg bg-rose-500 px-2 py-1 text-xs text-white">Delete</button></td></tr>)}</tbody></table></div>
                )}
              </section>
            )}

            {section === 'tickets' && (
              <section className="rounded-[24px] border border-slate-200 bg-white p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Ticket Operations</h2><input value={ticketQuery} onChange={(e) => setTicketQuery(e.target.value)} placeholder="Search ticket..." className="rounded-xl border border-slate-300 px-3 py-2 text-sm" /></div>
                {ticketsError && <p className="mb-2 text-sm text-rose-600">{String(ticketsError.message || ticketsError)}</p>}
                {ticketsLoading ? <p className="text-sm text-slate-500">Loading...</p> : (
                  <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="text-left text-xs text-slate-500"><th className="py-2">Title</th><th>Reporter</th><th>Created</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visibleTickets.map((item) => <tr key={`${item.ticketSource || 'ticket'}:${item.id}`} className="border-t border-slate-100"><td className="py-2"><p className="font-semibold">{item.title}</p><p className="max-w-[280px] text-xs text-slate-500">{item.description?.slice(0, 70)}</p></td><td>{item.createdBy || '-'}</td><td>{dt(item.createdAt)}</td><td><select value={item.status || 'OPEN'} disabled={busyId === item.id} onChange={(e) => updateTicketStatus(item, e.target.value)} className="rounded-xl border border-slate-300 px-2 py-1 text-xs">{TICKET_STATUSES.map((x) => <option key={x} value={x}>{label(x)}</option>)}</select></td><td className="space-x-2"><Link to={`/ticket-details/${item.id}`} className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:no-underline">View</Link><button type="button" disabled={busyId === item.id} onClick={() => deleteTicket(item)} className="rounded-lg bg-rose-500 px-2 py-1 text-xs text-white">Delete</button></td></tr>)}</tbody></table></div>
                )}
              </section>
            )}

            {section === 'notifications' && (
              <div className="space-y-5">
                <section className="rounded-[24px] border border-slate-200 bg-white p-5">
                  <div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-semibold">Create Notification</h2><button type="button" onClick={markAllRead} className="rounded-xl border border-slate-300 px-4 py-2 text-sm">Mark all read</button></div>
                  <form className="grid gap-3 md:grid-cols-2" onSubmit={createNotification}>
                    <input required placeholder="Title" value={notificationForm.title} onChange={(e) => setNotificationForm((v) => ({ ...v, title: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2" />
                    <select value={notificationForm.type} onChange={(e) => setNotificationForm((v) => ({ ...v, type: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2">{NOTIFICATION_TYPES.map((x) => <option key={x} value={x}>{label(x)}</option>)}</select>
                    <textarea required placeholder="Message" value={notificationForm.message} onChange={(e) => setNotificationForm((v) => ({ ...v, message: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2 md:col-span-2" rows={3} />
                    <input placeholder="Target user ID (optional)" value={notificationForm.targetUserId} onChange={(e) => setNotificationForm((v) => ({ ...v, targetUserId: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2" />
                    <div><button type="submit" className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white">Publish</button></div>
                  </form>
                  {notificationsError && <p className="mt-2 text-sm text-rose-600">{notificationsError}</p>}
                </section>
                <section className="rounded-[24px] border border-slate-200 bg-white p-5">
                  <h2 className="text-xl font-semibold">Notification Inbox</h2>
                  {notificationsLoading ? <p className="mt-2 text-sm text-slate-500">Loading...</p> : (
                    <div className="mt-3 overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="text-left text-xs text-slate-500"><th className="py-2">Title</th><th>Type</th><th>Target</th><th>Created</th><th>State</th><th>Actions</th></tr></thead><tbody>{notifications.map((item) => <tr key={item.id} className="border-t border-slate-100"><td className="py-2"><p className="font-semibold">{item.title}</p><p className="max-w-[280px] text-xs text-slate-500">{item.message}</p></td><td>{label(item.type)}</td><td>{item.targetUserId || 'Broadcast'}</td><td>{dt(item.createdAt)}</td><td>{item.read ? 'Read' : 'Unread'}</td><td className="space-x-2"><button type="button" disabled={busyId === item.id} onClick={() => toggleRead(item)} className="rounded-lg border border-slate-300 px-2 py-1 text-xs">{item.read ? 'Unread' : 'Read'}</button><button type="button" disabled={busyId === item.id} onClick={() => deleteNotification(item.id)} className="rounded-lg bg-rose-500 px-2 py-1 text-xs text-white">Delete</button></td></tr>)}</tbody></table></div>
                  )}
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
