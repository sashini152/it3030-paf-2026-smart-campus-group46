import { useCallback, useEffect, useMemo, useState } from 'react'
import { getJson, patchJson } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { useTickets } from '../hooks/useTickets'
import { normalizeTicketWorkflowStatus } from '../utils/ticketPresentation'
import AdminSidebar from '../components/AdminSidebar'
import BookingCharts from '../components/BookingCharts'

const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']
const ADMIN_REQUEST_TIMEOUT_MS = 4000

const TICKET_GRAPH_COLORS = {
  OPEN: 'bg-sky-500',
  IN_PROGRESS: 'bg-indigo-500',
  RESOLVED: 'bg-emerald-500',
  CLOSED: 'bg-slate-500',
  REJECTED: 'bg-rose-500',
}

function cls(...values) {
  return values.filter(Boolean).join(' ')
}

function label(value) {
  return (value || '').replaceAll('_', ' ')
}

function withTimeout(request, labelText) {
  let timeoutId

  return Promise.race([
    request,
    new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(
          new Error(
            `${labelText} request timed out. Reload the page and make sure the backend is still running.`
          )
        )
      }, ADMIN_REQUEST_TIMEOUT_MS)
    }),
  ]).finally(() => clearTimeout(timeoutId))
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

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export default function AdminDashboard() {
  const { user } = useAuth()

  const {
    tickets,
    loading: ticketsLoading,
    error: ticketsError,
    reload: reloadTickets,
  } = useTickets()

  const [menuOpen, setMenuOpen] = useState(false)

  const [resources, setResources] = useState([])
  const [resourcesLoading, setResourcesLoading] = useState(true)
  const [resourcesError, setResourcesError] = useState(null)

  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [bookingsError, setBookingsError] = useState(null)
  const [bookingViewMode, setBookingViewMode] = useState('table')

  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  const [notificationsError, setNotificationsError] = useState(null)

  const [analytics, setAnalytics] = useState({
    topResources: [],
    peakBookingHours: [],
  })
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [analyticsError, setAnalyticsError] = useState(null)

  const safeTickets = Array.isArray(tickets) ? tickets : []
  const safeResources = Array.isArray(resources) ? resources : []
  const safeBookings = Array.isArray(bookings) ? bookings : []
  const safeNotifications = Array.isArray(notifications) ? notifications : []

  const safeTopResources = Array.isArray(analytics?.topResources)
    ? analytics.topResources
    : []

  const safePeakBookingHours = Array.isArray(analytics?.peakBookingHours)
    ? analytics.peakBookingHours
    : []

  const loadResources = useCallback(async () => {
    setResourcesLoading(true)
    setResourcesError(null)

    try {
      const data = await withTimeout(getJson('/api/resources'), 'Resource list')
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
      const data = await withTimeout(getJson('/api/bookings'), 'Booking list')
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
      const data = await withTimeout(
        getJson('/api/admin/notifications'),
        'Notification inbox'
      )

      setNotifications(Array.isArray(data) ? data : [])
    } catch (error) {
      setNotifications([])
      setNotificationsError(error.message)
    } finally {
      setNotificationsLoading(false)
    }
  }, [])

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true)
    setAnalyticsError(null)

    try {
      const data = await withTimeout(
        getJson('/api/admin/analytics/usage'),
        'Usage analytics'
      )

      setAnalytics({
        topResources: Array.isArray(data?.topResources) ? data.topResources : [],
        peakBookingHours: Array.isArray(data?.peakBookingHours)
          ? data.peakBookingHours
          : [],
      })
    } catch (error) {
      setAnalytics({
        topResources: [],
        peakBookingHours: [],
      })
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
  }, [loadAnalytics, loadBookings, loadNotifications, loadResources])

  useEffect(() => {
    reloadTickets?.().catch(() => {})
    // Run only once. Keeping reloadTickets in dependency can cause dashboard reload loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pendingBookings = useMemo(
    () => safeBookings.filter((item) => item.status === 'PENDING'),
    [safeBookings]
  )

  const ticketSummary = useMemo(() => {
    let active = 0
    let firstResponseTotal = 0
    let firstResponseCount = 0
    let resolutionTotal = 0
    let resolutionCount = 0

    safeTickets.forEach((ticket) => {
      const status = normalizeTicketWorkflowStatus(ticket.status)

      if (['OPEN', 'IN_PROGRESS'].includes(status)) {
        active += 1
      }

      const firstResponseMinutes = minutesBetween(
        ticket.createdAt,
        ticket.firstResponseAt
      )

      if (firstResponseMinutes !== null) {
        firstResponseTotal += firstResponseMinutes
        firstResponseCount += 1
      }

      const resolutionMinutes = minutesBetween(ticket.createdAt, ticket.resolvedAt)

      if (resolutionMinutes !== null) {
        resolutionTotal += resolutionMinutes
        resolutionCount += 1
      }
    })

    return {
      active,
      avgFirstResponse: firstResponseCount
        ? Math.round(firstResponseTotal / firstResponseCount)
        : null,
      avgResolution: resolutionCount
        ? Math.round(resolutionTotal / resolutionCount)
        : null,
    }
  }, [safeTickets])

  const ticketStatusChart = useMemo(() => {
    const counts = TICKET_STATUSES.map((status) => ({
      status,
      count: safeTickets.filter(
        (item) => normalizeTicketWorkflowStatus(item.status || 'OPEN') === status
      ).length,
    })).filter((item) => item.count > 0)

    const total = counts.reduce((sum, item) => sum + item.count, 0)

    return { counts, total }
  }, [safeTickets])

  const ticketRaisedTrend = useMemo(() => {
    const days = 7
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const points = Array.from({ length: days }, (_, index) => {
      const day = new Date(today)
      day.setDate(today.getDate() - (days - index - 1))

      const key = day.toISOString().slice(0, 10)

      return {
        key,
        date: day,
        count: 0,
      }
    })

    const pointMap = new Map(points.map((point) => [point.key, point]))

    safeTickets.forEach((ticket) => {
      const createdAt = new Date(ticket.createdAt || ticket.updatedAt || 0)

      if (Number.isNaN(createdAt.getTime())) return

      const key = new Date(
        createdAt.getFullYear(),
        createdAt.getMonth(),
        createdAt.getDate()
      )
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

    return {
      points,
      max,
      path,
    }
  }, [safeTickets])

  async function markAllRead() {
    try {
      await patchJson('/api/admin/notifications/read-all', {})
      await loadNotifications()
    } catch (error) {
      setNotificationsError(error.message)
    }
  }

  const unreadNotificationCount = safeNotifications.filter((item) => !item.read).length

  const activeResourceCount = safeResources.filter(
    (item) => item.status === 'ACTIVE'
  ).length

  const maxResourceCount = Math.max(
    ...safeTopResources.map((item) => Number(item.bookingCount) || 0),
    1
  )

  const maxHourCount = Math.max(
    ...safePeakBookingHours.map((item) => Number(item.bookingCount) || 0),
    1
  )

  return (
    <div className="min-h-screen bg-[#edf3f0] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/70 bg-white/85 px-6 py-8 xl:block">
          <AdminSidebar currentPage="/admin" />
        </aside>

        {menuOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/35 xl:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <aside
              className="h-full w-72 bg-white px-6 py-8"
              onClick={(event) => event.stopPropagation()}
            >
              <AdminSidebar currentPage="/admin" />
            </aside>
          </div>
        )}

        <main className="flex-1 overflow-x-hidden px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="w-full rounded-[36px] border border-white/70 bg-white/70 p-4 shadow-[0_30px_80px_rgba(148,163,184,0.28)] md:p-6 lg:p-8">
            <header className="mb-8 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  className="mt-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 xl:hidden"
                >
                  Menu
                </button>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">
                    Smart Campus Admin
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                    Operations dashboard
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-slate-500">
                    Manage resources, bookings, tickets, notifications, and analytics from one page.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right text-sm">
                <p className="font-semibold text-slate-900">
                  {user?.name || 'Campus Admin'}
                </p>
                <p className="text-slate-500">
                  {user?.email || 'admin@smartcampus.local'}
                </p>
              </div>
            </header>

            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <article className="hub-quarter-fade rounded-[24px] bg-slate-900 p-5 text-white">
                  <p>Total tickets</p>
                  <p className="mt-2 text-3xl font-semibold">
                    {safeTickets.length}
                  </p>
                  <p className="text-sm opacity-80">
                    {ticketSummary.active} active queue
                  </p>
                </article>

                <article className="hub-quarter-fade rounded-[24px] bg-emerald-50 p-5">
                  <p>Resources</p>
                  {resourcesLoading ? (
                    <p className="mt-2 text-sm text-slate-500">Loading resources...</p>
                  ) : resourcesError ? (
                    <p className="mt-2 text-sm text-rose-600">{resourcesError}</p>
                  ) : (
                    <>
                      <p className="mt-2 text-3xl font-semibold">
                        {safeResources.length}
                      </p>
                      <p className="text-sm text-slate-500">
                        {activeResourceCount} active
                      </p>
                    </>
                  )}
                </article>

                <article className="hub-quarter-fade rounded-[24px] bg-sky-50 p-5">
                  <p>Pending bookings</p>
                  {bookingsLoading ? (
                    <p className="mt-2 text-sm text-slate-500">Loading bookings...</p>
                  ) : bookingsError ? (
                    <p className="mt-2 text-sm text-rose-600">{bookingsError}</p>
                  ) : (
                    <>
                      <p className="mt-2 text-3xl font-semibold">
                        {pendingBookings.length}
                      </p>
                      <p className="text-sm text-slate-500">Awaiting review</p>
                    </>
                  )}
                </article>

                <article className="hub-quarter-fade rounded-[24px] bg-amber-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p>Unread notifications</p>
                      {notificationsLoading ? (
                        <p className="mt-2 text-sm text-slate-500">
                          Loading notifications...
                        </p>
                      ) : notificationsError ? (
                        <p className="mt-2 text-sm text-rose-600">
                          {notificationsError}
                        </p>
                      ) : (
                        <>
                          <p className="mt-2 text-3xl font-semibold">
                            {unreadNotificationCount}
                          </p>
                          <p className="text-sm text-slate-500">Admin inbox</p>
                        </>
                      )}
                    </div>

                    {!notificationsLoading &&
                      !notificationsError &&
                      unreadNotificationCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllRead}
                          className="rounded-2xl border border-amber-200 bg-amber-100 px-3 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-200"
                        >
                          Mark all read
                        </button>
                      )}
                  </div>
                </article>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <section className="hub-quarter-fade rounded-[24px] border border-slate-200 bg-white p-5">
                  <h2 className="text-xl font-semibold">Tickets raised over time</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Line chart for the last 7 days of ticket submissions.
                  </p>

                  {ticketsLoading ? (
                    <p className="mt-3 text-sm text-slate-500">Loading tickets...</p>
                  ) : ticketsError ? (
                    <p className="mt-3 text-sm text-rose-600">{ticketsError}</p>
                  ) : (
                    <div className="mt-4 space-y-4">
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-4 flex items-end justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium text-slate-500">
                              Total raised this week
                            </p>
                            <p className="mt-1 text-3xl font-semibold text-slate-900">
                              {ticketRaisedTrend.points.reduce(
                                (sum, point) => sum + point.count,
                                0
                              )}
                            </p>
                          </div>

                          <p className="text-sm text-slate-500">
                            Peak day:{' '}
                            {Math.max(
                              ...ticketRaisedTrend.points.map((point) => point.count),
                              0
                            )}
                          </p>
                        </div>

                        <svg
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          className="h-44 w-full overflow-visible"
                        >
                          <line
                            x1="0"
                            y1="100"
                            x2="100"
                            y2="100"
                            stroke="#cbd5e1"
                            strokeWidth="1.2"
                          />
                          <line
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="100"
                            stroke="#cbd5e1"
                            strokeWidth="1.2"
                          />
                          <path
                            d={ticketRaisedTrend.path}
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          {ticketRaisedTrend.points.map((point, index) => {
                            const x =
                              ticketRaisedTrend.points.length === 1
                                ? 50
                                : (index / (ticketRaisedTrend.points.length - 1)) *
                                  100

                            const y =
                              100 - (point.count / ticketRaisedTrend.max) * 100

                            return (
                              <circle
                                key={point.key}
                                cx={x}
                                cy={y}
                                r="2.6"
                                fill="#2563eb"
                                stroke="#ffffff"
                                strokeWidth="1.4"
                              />
                            )
                          })}
                        </svg>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-7">
                        {ticketRaisedTrend.points.map((point) => (
                          <div
                            key={point.key}
                            className="rounded-2xl border border-slate-200 bg-white p-3 text-center"
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                              {formatChartDay(point.date)}
                            </p>
                            <p className="mt-2 text-2xl font-semibold text-slate-900">
                              {point.count}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatShortDate(point.date)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                <section className="hub-quarter-fade rounded-[24px] border border-slate-200 bg-white p-5">
                  <h2 className="text-xl font-semibold">Ticket status stack</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Stacked status view for the current raised-ticket queue.
                  </p>

                  {ticketsLoading ? (
                    <p className="mt-3 text-sm text-slate-500">Loading tickets...</p>
                  ) : ticketsError ? (
                    <p className="mt-3 text-sm text-rose-600">{ticketsError}</p>
                  ) : (
                    <div className="mt-4 space-y-4">
                      {ticketStatusChart.counts.length === 0 ? (
                        <p className="text-sm text-slate-500">No tickets yet.</p>
                      ) : (
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-slate-500">
                              Total tracked tickets
                            </p>
                            <p className="text-2xl font-semibold text-slate-900">
                              {ticketStatusChart.total}
                            </p>
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
                          <div
                            key={item.status}
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cls(
                                    'h-3 w-3 rounded-full',
                                    TICKET_GRAPH_COLORS[item.status] || 'bg-slate-400'
                                  )}
                                />
                                <span className="text-sm font-medium text-slate-700">
                                  {label(item.status)}
                                </span>
                              </div>

                              <span className="text-sm font-semibold text-slate-900">
                                {item.count}
                              </span>
                            </div>

                            <p className="mt-2 text-xs text-slate-500">
                              {ticketStatusChart.total
                                ? `${Math.round(
                                    (item.count / ticketStatusChart.total) * 100
                                  )}% of current queue`
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
                      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-500">
                        Usage analytics
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                        Resource rhythm
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Top resources and peak approved-booking hours.
                      </p>
                    </div>
                    <div className="hidden h-14 w-14 rounded-[20px] bg-[radial-gradient(circle_at_30%_30%,#7dd3fc,transparent_58%),linear-gradient(135deg,#eff6ff,#dbeafe)] sm:block" />
                  </div>

                  {analyticsError && (
                    <p className="mt-3 text-sm text-rose-600">{analyticsError}</p>
                  )}

                  {analyticsLoading ? (
                    <p className="mt-3 text-sm text-slate-500">
                      Loading analytics...
                    </p>
                  ) : (
                    <div className="mt-4 space-y-5">
                      <div className="rounded-[26px] border border-emerald-100 bg-[linear-gradient(180deg,#ffffff_0%,#f0fdf4_100%)] p-4">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
                          Top resources
                        </h3>

                        <div className="mt-3 space-y-4">
                          {safeTopResources.length === 0 ? (
                            <p className="text-sm text-slate-500">
                              No approved bookings yet.
                            </p>
                          ) : (
                            safeTopResources.map((item) => (
                              <div
                                key={item.resourceId || item.resourceName}
                                className="rounded-[20px] bg-white/90 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                              >
                                <div className="mb-2 flex items-center justify-between text-sm">
                                  <span className="font-semibold text-slate-700">
                                    {item.resourceName || 'Unknown resource'}
                                  </span>
                                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                    {item.bookingCount || 0}
                                  </span>
                                </div>

                                <div className="h-2.5 rounded-full bg-emerald-50">
                                  <div
                                    className="h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                                    style={{
                                      width: `${
                                        ((Number(item.bookingCount) || 0) /
                                          maxResourceCount) *
                                        100
                                      }%`,
                                    }}
                                  />
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">
                          Peak booking hours
                        </h3>

                        <div className="mt-3">
                          {safePeakBookingHours.length === 0 ? (
                            <p className="text-sm text-slate-500">
                              No approved bookings yet.
                            </p>
                          ) : (
                            <div className="rounded-[26px] border border-sky-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eff6ff_100%)] p-5">
                              <div className="flex min-h-[220px] items-end gap-4">
                                {safePeakBookingHours.map((item) => (
                                  <div
                                    key={item.hour}
                                    className="flex min-w-0 flex-1 flex-col items-center gap-3"
                                  >
                                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-sky-600 shadow-sm">
                                      {item.bookingCount || 0}
                                    </span>

                                    <div className="flex h-36 w-full items-end rounded-[24px] border border-white/70 bg-white/90 px-2 py-2 shadow-[inset_0_10px_18px_rgba(191,219,254,0.3)]">
                                      <div
                                        className="w-full rounded-[18px] bg-gradient-to-t from-sky-500 via-cyan-400 to-sky-300 shadow-[0_10px_20px_rgba(14,165,233,0.28)]"
                                        style={{
                                          height: `${Math.max(
                                            ((Number(item.bookingCount) || 0) /
                                              maxHourCount) *
                                              100,
                                            12
                                          )}%`,
                                        }}
                                      />
                                    </div>

                                    <span className="text-center text-[11px] font-medium leading-4 text-slate-600">
                                      {item.label || item.hour}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                <section className="hub-quarter-fade rounded-[30px] border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f0f9ff_100%)] p-6 shadow-[0_20px_45px_rgba(59,130,246,0.08)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-blue-500">
                        Booking analytics
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                        Comprehensive charts
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Visual insights into booking patterns, resource utilization, and trends.
                      </p>
                    </div>
                    <div className="hidden h-14 w-14 rounded-[20px] bg-[radial-gradient(circle_at_30%_30%,#93c5fd,transparent_58%),linear-gradient(135deg,#eff6ff,#dbeafe)] sm:block" />
                  </div>

                  <div className="mt-4">
                    {bookingsLoading ? (
                      <p className="text-sm text-slate-500">
                        Loading booking data...
                      </p>
                    ) : bookingsError ? (
                      <p className="text-sm text-rose-600">{bookingsError}</p>
                    ) : (
                      <div className="rounded-[24px] border border-blue-100 bg-white p-4">
                        <BookingCharts
                          bookings={safeBookings}
                          resources={safeResources}
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => window.open('/admin-bookings', '_blank')}
                      className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                    >
                      View detailed charts
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setBookingViewMode(
                          bookingViewMode === 'table' ? 'charts' : 'table'
                        )
                      }
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      {bookingViewMode === 'table' ? 'Show charts' : 'Show table'}
                    </button>
                  </div>
                </section>

                <section className="hub-quarter-fade rounded-[30px] border border-rose-100 bg-[linear-gradient(180deg,#ffffff_0%,#fff7fb_100%)] p-6 shadow-[0_20px_45px_rgba(244,114,182,0.08)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-rose-500">
                        Ticket care
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                        SLA summary
                      </h2>
                    </div>
                    <div className="hidden h-14 w-14 rounded-[20px] bg-[radial-gradient(circle_at_30%_30%,#f9a8d4,transparent_58%),linear-gradient(135deg,#fff1f2,#ffe4e6)] sm:block" />
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <article className="rounded-[24px] border border-rose-100 bg-[linear-gradient(180deg,#ffffff_0%,#fff1f2_100%)] p-5 shadow-[0_12px_24px_rgba(251,113,133,0.08)]">
                      <p className="text-sm font-medium text-slate-500">
                        Average first response
                      </p>
                      <p className="mt-3 text-3xl font-semibold text-slate-900">
                        {durationLabel(ticketSummary.avgFirstResponse)}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-rose-500">
                        Support pickup speed
                      </p>
                    </article>

                    <article className="rounded-[24px] border border-amber-100 bg-[linear-gradient(180deg,#ffffff_0%,#fffbeb_100%)] p-5 shadow-[0_12px_24px_rgba(251,191,36,0.08)]">
                      <p className="text-sm font-medium text-slate-500">
                        Average resolution
                      </p>
                      <p className="mt-3 text-3xl font-semibold text-slate-900">
                        {durationLabel(ticketSummary.avgResolution)}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-amber-500">
                        End-to-end closure
                      </p>
                    </article>
                  </div>

                  <div className="mt-4 rounded-[24px] border border-slate-200 bg-white/80 p-4 text-sm leading-7 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                    First response is captured when support first picks up a ticket or leaves an admin/support comment.
                    Resolution time ends when a ticket moves to RESOLVED or CLOSED.
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// import { useCallback, useEffect, useMemo, useState } from 'react'
// import { getJson, patchJson } from '../api/client'
// import { useAuth } from '../hooks/useAuth'
// import { useTickets } from '../hooks/useTickets'
// import { normalizeTicketWorkflowStatus } from '../utils/ticketPresentation'
// import AdminSidebar from '../components/AdminSidebar'
// import BookingCharts from '../components/BookingCharts'

// const RESOURCE_TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT']
// const RESOURCE_STATUSES = ['ACTIVE', 'OUT_OF_SERVICE']
// const BOOKING_FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']
// const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']
// const NOTIFICATION_TYPES = ['BOOKING', 'TICKET', 'COMMENT', 'SYSTEM']
// const ADMIN_REQUEST_TIMEOUT_MS = 4000
// const TICKET_GRAPH_COLORS = {
//   OPEN: 'bg-sky-500',
//   IN_PROGRESS: 'bg-indigo-500',
//   RESOLVED: 'bg-emerald-500',
//   CLOSED: 'bg-slate-500',
//   REJECTED: 'bg-rose-500',
// }

// function cls(...values) {
//   return values.filter(Boolean).join(' ')
// }

// function label(value) {
//   return (value || '').replaceAll('_', ' ')
// }

// function withTimeout(request, labelText) {
//   let timeoutId
//   return Promise.race([
//     request,
//     new Promise((_, reject) => {
//       timeoutId = setTimeout(
//         () =>
//           reject(
//             new Error(
//               `${labelText} request timed out. Reload the page and make sure the backend is still running.`
//             )
//           ),
//         ADMIN_REQUEST_TIMEOUT_MS
//       )
//     }),
//   ]).finally(() => clearTimeout(timeoutId))
// }


// function minutesBetween(start, end) {
//   if (!start || !end) return null
//   const startTime = new Date(start).getTime()
//   const endTime = new Date(end).getTime()
//   if (Number.isNaN(startTime) || Number.isNaN(endTime)) return null
//   return Math.max(0, Math.round((endTime - startTime) / 60000))
// }

// function durationLabel(minutes) {
//   if (minutes === null) return 'Pending'
//   if (minutes < 60) return `${minutes} min`
//   const hours = Math.floor(minutes / 60)
//   const remainder = minutes % 60
//   return remainder ? `${hours}h ${remainder}m` : `${hours}h`
// }

// function formatChartDay(value) {
//   const date = new Date(value)
//   if (Number.isNaN(date.getTime())) return '-'
//   return date.toLocaleDateString(undefined, { weekday: 'short' })
// }

// function formatShortDate(value) {
//   const date = new Date(value)
//   if (Number.isNaN(date.getTime())) return '-'
//   return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
// }
// export default function AdminDashboard() {
//   const { user } = useAuth()
//   const {
//     tickets,
//     loading: ticketsLoading,
//     error: ticketsError,
//     reload: reloadTickets,
//   } = useTickets()

//   const [menuOpen, setMenuOpen] = useState(false)

//   const [resources, setResources] = useState([])
//   const [RESOURCES_LOADING, setResourcesLoading] = useState(true)
//   const [resourcesError, setResourcesError] = useState(null)

//   const [bookings, setBookings] = useState([])
//   const [bookingsLoading, setBookingsLoading] = useState(true)
//   const [bookingsError, setBookingsError] = useState(null)
//   const [bookingViewMode, setBookingViewMode] = useState('table')

//   const [notifications, setNotifications] = useState([])
//   const [notificationsLoading, setNotificationsLoading] = useState(true)
//   const [notificationsError, setNotificationsError] = useState(null)
  
//   const [analytics, setAnalytics] = useState({
//     topResources: [],
//     peakBookingHours: [],
//   })
//   const [analyticsLoading, setAnalyticsLoading] = useState(true)
//   const [analyticsError, setAnalyticsError] = useState(null)


//   const loadResources = useCallback(async () => {
//     setResourcesLoading(true)
//     setResourcesError(null)
//     try {
//       const data = await withTimeout(getJson('/api/resources'), 'Resource list')
//       setResources(Array.isArray(data) ? data : [])
//     } catch (error) {
//       setResources([])
//       setResourcesError(error.message)
//     } finally {
//       setResourcesLoading(false)
//     }
//   }, [])

//   const loadBookings = useCallback(async () => {
//     setBookingsLoading(true)
//     setBookingsError(null)
//     try {
//       const data = await withTimeout(getJson('/api/bookings'), 'Booking list')
//       setBookings(Array.isArray(data) ? data : [])
//     } catch (error) {
//       setBookings([])
//       setBookingsError(error.message)
//     } finally {
//       setBookingsLoading(false)
//     }
//   }, [])

//   const loadNotifications = useCallback(async () => {
//     setNotificationsLoading(true)
//     setNotificationsError(null)
//     try {
//       const data = await withTimeout(
//         getJson('/api/admin/notifications'),
//         'Notification inbox'
//       )
//       setNotifications(Array.isArray(data) ? data : [])
//     } catch (error) {
//       setNotifications([])
//       setNotificationsError(error.message)
//     } finally {
//       setNotificationsLoading(false)
//     }
//   }, [])

//   const loadAnalytics = useCallback(async () => {
//     setAnalyticsLoading(true)
//     setAnalyticsError(null)
//     try {
//       const data = await withTimeout(
//         getJson('/api/admin/analytics/usage'),
//         'Usage analytics'
//       )
//       setAnalytics({
//         topResources: Array.isArray(data?.topResources) ? data.topResources : [],
//         peakBookingHours: Array.isArray(data?.peakBookingHours)
//           ? data.peakBookingHours
//           : [],
//       })
//     } catch (error) {
//       setAnalytics({ topResources: [], peakBookingHours: [] })
//       setAnalyticsError(error.message)
//     } finally {
//       setAnalyticsLoading(false)
//     }
//   }, [])

//   useEffect(() => {
//     loadResources().catch(() => {})
//     loadBookings().catch(() => {})
//     loadNotifications().catch(() => {})
//     loadAnalytics().catch(() => {})
//     reloadTickets().catch(() => {})
//   }, [loadAnalytics, loadBookings, loadNotifications, loadResources, reloadTickets])

//   const pendingBookings = useMemo(
//     () => bookings.filter((item) => item.status === 'PENDING'),
//     [bookings]
//   )

  
  
//   const ticketSummary = useMemo(() => {
//     let active = 0
//     let firstResponseTotal = 0
//     let firstResponseCount = 0
//     let resolutionTotal = 0
//     let resolutionCount = 0

//     tickets.forEach((ticket) => {
//       if (
//         ['OPEN', 'IN_PROGRESS'].includes(
//           normalizeTicketWorkflowStatus(ticket.status)
//         )
//       ) {
//         active += 1
//       }

//       const firstResponseMinutes = minutesBetween(
//         ticket.createdAt,
//         ticket.firstResponseAt
//       )
//       if (firstResponseMinutes !== null) {
//         firstResponseTotal += firstResponseMinutes
//         firstResponseCount += 1
//       }

//       const resolutionMinutes = minutesBetween(
//         ticket.createdAt,
//         ticket.resolvedAt
//       )
//       if (resolutionMinutes !== null) {
//         resolutionTotal += resolutionMinutes
//         resolutionCount += 1
//       }
//     })

//     return {
//       active,
//       avgFirstResponse: firstResponseCount
//         ? Math.round(firstResponseTotal / firstResponseCount)
//         : null,
//       avgResolution: resolutionCount
//         ? Math.round(resolutionTotal / resolutionCount)
//         : null,
//     }
//   }, [tickets])

//   const ticketStatusChart = useMemo(() => {
//     const counts = TICKET_STATUSES.map((status) => ({
//       status,
//       count: tickets.filter(
//         (item) =>
//           normalizeTicketWorkflowStatus(item.status || 'OPEN') === status
//       ).length,
//     })).filter((item) => item.count > 0)

//     const total = counts.reduce((sum, item) => sum + item.count, 0)
//     return { counts, total }
//   }, [tickets])

//   const ticketRaisedTrend = useMemo(() => {
//     const days = 7
//     const today = new Date()
//     today.setHours(0, 0, 0, 0)

//     const points = Array.from({ length: days }, (_, index) => {
//       const day = new Date(today)
//       day.setDate(today.getDate() - (days - index - 1))
//       const key = day.toISOString().slice(0, 10)
//       return { key, date: day, count: 0 }
//     })

//     const pointMap = new Map(points.map((point) => [point.key, point]))

//     tickets.forEach((ticket) => {
//       const createdAt = new Date(ticket.createdAt || ticket.updatedAt || 0)
//       if (Number.isNaN(createdAt.getTime())) return

//       const key = new Date(
//         createdAt.getFullYear(),
//         createdAt.getMonth(),
//         createdAt.getDate()
//       )
//         .toISOString()
//         .slice(0, 10)

//       const point = pointMap.get(key)
//       if (point) point.count += 1
//     })

//     const max = Math.max(...points.map((point) => point.count), 1)

//     const path = points
//       .map((point, index) => {
//         const x =
//           points.length === 1 ? 50 : (index / (points.length - 1)) * 100
//         const y = 100 - (point.count / max) * 100
//         return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
//       })
//       .join(' ')

//     return { points, max, path }
//   }, [tickets])

  
  
  
  
  
  
  
//   async function markAllRead() {
//     try {
//       await patchJson('/api/admin/notifications/read-all', {})
//       await loadNotifications()
//     } catch (error) {
//       setNotificationsError(error.message)
//     }
//   }

//   const maxResourceCount = Math.max(
//     ...analytics.topResources.map((item) => item.bookingCount),
//     1
//   )

//   const maxHourCount = Math.max(
//     ...analytics.peakBookingHours.map((item) => item.bookingCount),
//     1
//   )

//   return (
//     <div className="min-h-screen bg-[#edf3f0] text-slate-900">
//       <div className="flex min-h-screen">
//         <aside className="hidden w-72 shrink-0 border-r border-white/70 bg-white/85 px-6 py-8 xl:block">
//           <AdminSidebar currentPage="/admin" />
//         </aside>

//         {menuOpen && (
//           <div
//             className="fixed inset-0 z-40 bg-slate-900/35 xl:hidden"
//             onClick={() => setMenuOpen(false)}
//           >
//             <aside
//               className="h-full w-72 bg-white px-6 py-8"
//               onClick={(event) => event.stopPropagation()}
//             >
//               <AdminSidebar currentPage="/admin" />
//             </aside>
//           </div>
//         )}

//         <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 overflow-x-hidden">
//           <div className="w-full rounded-[36px] border border-white/70 bg-white/70 p-4 shadow-[0_30px_80px_rgba(148,163,184,0.28)] md:p-6 lg:p-8">
//             <header className="mb-8 flex items-start justify-between gap-4">
//               <div className="flex items-start gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setMenuOpen(true)}
//                   className="mt-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 xl:hidden"
//                 >
//                   Menu
//                 </button>
//                 <div>
//                   <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">
//                     Smart Campus Admin
//                   </p>
//                   <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
//                     Operations dashboard
//                   </h1>
//                   <p className="mt-2 max-w-2xl text-sm text-slate-500">
//                     Manage resources, bookings, tickets, notifications, and analytics from one page.
//                   </p>
//                 </div>
//               </div>

//               <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right text-sm">
//                 <p className="font-semibold text-slate-900">
//                   {user?.name || 'Campus Admin'}
//                 </p>
//                 <p className="text-slate-500">
//                   {user?.email || 'admin@smartcampus.local'}
//                 </p>
//               </div>
//             </header>

//             <div className="space-y-5">
//               <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
//                 <article className="hub-quarter-fade rounded-[24px] bg-slate-900 p-5 text-white">
//                   <p>Total tickets</p>
//                   <p className="mt-2 text-3xl font-semibold">{tickets.length}</p>
//                   <p className="text-sm opacity-80">
//                     {ticketSummary.active} active queue
//                   </p>
//                 </article>

//                 <article className="hub-quarter-fade rounded-[24px] bg-emerald-50 p-5">
//                   <p>Resources</p>
//                   {resourcesError ? (
//                     <p className="mt-2 text-sm text-rose-600">{resourcesError}</p>
//                   ) : (
//                     <>
//                       <p className="mt-2 text-3xl font-semibold">{resources.length}</p>
//                       <p className="text-sm text-slate-500">
//                         {resources.filter((item) => item.status === 'ACTIVE').length} active
//                       </p>
//                     </>
//                   )}
//                 </article>

//                 <article className="hub-quarter-fade rounded-[24px] bg-sky-50 p-5">
//                   <p>Pending bookings</p>
//                   <p className="mt-2 text-3xl font-semibold">
//                     {pendingBookings.length}
//                   </p>
//                   <p className="text-sm text-slate-500">Awaiting review</p>
//                 </article>

//                 <article className="hub-quarter-fade rounded-[24px] bg-amber-50 p-5">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p>Unread notifications</p>
//                       {notificationsLoading ? (
//                         <p className="mt-2 text-sm text-slate-500">Loading notifications...</p>
//                       ) : notificationsError ? (
//                         <p className="mt-2 text-sm text-rose-600">{notificationsError}</p>
//                       ) : (
//                         <>
//                           <p className="mt-2 text-3xl font-semibold">
//                             {notifications.filter((item) => !item.read).length}
//                           </p>
//                           <p className="text-sm text-slate-500">Admin inbox</p>
//                         </>
//                       )}
//                     </div>
//                     {!notificationsLoading && !notificationsError && notifications.filter((item) => !item.read).length > 0 && (
//                       <button
//                         onClick={markAllRead}
//                         className="rounded-2xl border border-amber-200 bg-amber-100 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-200 transition-colors"
//                       >
//                         Mark all read
//                       </button>
//                     )}
//                   </div>
//                 </article>
//               </div>

//               <div className="grid gap-5 lg:grid-cols-2">
//                 <section className="hub-quarter-fade rounded-[24px] border border-slate-200 bg-white p-5">
//                   <h2 className="text-xl font-semibold">Tickets raised over time</h2>
//                   <p className="mt-1 text-sm text-slate-500">
//                     Line chart for the last 7 days of ticket submissions.
//                   </p>

//                   {ticketsLoading ? (
//                     <p className="mt-3 text-sm text-slate-500">
//                       Loading tickets...
//                     </p>
//                   ) : ticketsError ? (
//                     <p className="mt-3 text-sm text-rose-600">{ticketsError}</p>
//                   ) : (
//                     <div className="mt-4 space-y-4">
//                       <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
//                         <div className="mb-4 flex items-end justify-between gap-4">
//                           <div>
//                             <p className="text-sm font-medium text-slate-500">
//                               Total raised this week
//                             </p>
//                             <p className="mt-1 text-3xl font-semibold text-slate-900">
//                               {ticketRaisedTrend.points.reduce(
//                                 (sum, point) => sum + point.count,
//                                 0
//                               )}
//                             </p>
//                           </div>
//                           <p className="text-sm text-slate-500">
//                             Peak day:{' '}
//                             {Math.max(
//                               ...ticketRaisedTrend.points.map((point) => point.count),
//                               0
//                             )}
//                           </p>
//                         </div>

//                         <svg
//                           viewBox="0 0 100 100"
//                           preserveAspectRatio="none"
//                           className="h-44 w-full overflow-visible"
//                         >
//                           <line
//                             x1="0"
//                             y1="100"
//                             x2="100"
//                             y2="100"
//                             stroke="#cbd5e1"
//                             strokeWidth="1.2"
//                           />
//                           <line
//                             x1="0"
//                             y1="0"
//                             x2="0"
//                             y2="100"
//                             stroke="#cbd5e1"
//                             strokeWidth="1.2"
//                           />
//                           <path
//                             d={ticketRaisedTrend.path}
//                             fill="none"
//                             stroke="#2563eb"
//                             strokeWidth="2.5"
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                           />
//                           {ticketRaisedTrend.points.map((point, index) => {
//                             const x =
//                               ticketRaisedTrend.points.length === 1
//                                 ? 50
//                                 : (index / (ticketRaisedTrend.points.length - 1)) *
//                                   100
//                             const y =
//                               100 - (point.count / ticketRaisedTrend.max) * 100

//                             return (
//                               <circle
//                                 key={point.key}
//                                 cx={x}
//                                 cy={y}
//                                 r="2.6"
//                                 fill="#2563eb"
//                                 stroke="#ffffff"
//                                 strokeWidth="1.4"
//                               />
//                             )
//                           })}
//                         </svg>
//                       </div>

//                       <div className="grid gap-3 sm:grid-cols-7">
//                         {ticketRaisedTrend.points.map((point) => (
//                           <div
//                             key={point.key}
//                             className="rounded-2xl border border-slate-200 bg-white p-3 text-center"
//                           >
//                             <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
//                               {formatChartDay(point.date)}
//                             </p>
//                             <p className="mt-2 text-2xl font-semibold text-slate-900">
//                               {point.count}
//                             </p>
//                             <p className="mt-1 text-xs text-slate-500">
//                               {formatShortDate(point.date)}
//                             </p>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </section>

//                 <section className="hub-quarter-fade rounded-[24px] border border-slate-200 bg-white p-5">
//                   <h2 className="text-xl font-semibold">Ticket status stack</h2>
//                   <p className="mt-1 text-sm text-slate-500">
//                     Stacked status view for the current raised-ticket queue.
//                   </p>

//                   {ticketsLoading ? (
//                     <p className="mt-3 text-sm text-slate-500">
//                       Loading tickets...
//                     </p>
//                   ) : ticketsError ? (
//                     <p className="mt-3 text-sm text-rose-600">{ticketsError}</p>
//                   ) : (
//                     <div className="mt-4 space-y-4">
//                       {ticketStatusChart.counts.length === 0 ? (
//                         <p className="text-sm text-slate-500">No tickets yet.</p>
//                       ) : (
//                         <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
//                           <div className="mb-3 flex items-center justify-between gap-3">
//                             <p className="text-sm font-medium text-slate-500">
//                               Total tracked tickets
//                             </p>
//                             <p className="text-2xl font-semibold text-slate-900">
//                               {ticketStatusChart.total}
//                             </p>
//                           </div>

//                           <div className="overflow-hidden rounded-full bg-white">
//                             <div className="flex h-5 w-full">
//                               {ticketStatusChart.counts.map((item) => (
//                                 <div
//                                   key={item.status}
//                                   className={cls(
//                                     TICKET_GRAPH_COLORS[item.status] || 'bg-slate-400',
//                                     item.count === 0 ? 'hidden' : ''
//                                   )}
//                                   style={{
//                                     width: ticketStatusChart.total
//                                       ? `${(item.count / ticketStatusChart.total) * 100}%`
//                                       : '0%',
//                                   }}
//                                 />
//                               ))}
//                             </div>
//                           </div>
//                         </div>
//                       )}

//                       <div className="grid gap-3 sm:grid-cols-2">
//                         {ticketStatusChart.counts.map((item) => (
//                           <div
//                             key={item.status}
//                             className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
//                           >
//                             <div className="flex items-center justify-between gap-3">
//                               <div className="flex items-center gap-2">
//                                 <span
//                                   className={cls(
//                                     'h-3 w-3 rounded-full',
//                                     TICKET_GRAPH_COLORS[item.status] || 'bg-slate-400'
//                                   )}
//                                 />
//                                 <span className="text-sm font-medium text-slate-700">
//                                   {label(item.status)}
//                                 </span>
//                               </div>
//                               <span className="text-sm font-semibold text-slate-900">
//                                 {item.count}
//                               </span>
//                             </div>

//                             <p className="mt-2 text-xs text-slate-500">
//                               {ticketStatusChart.total
//                                 ? `${Math.round(
//                                     (item.count / ticketStatusChart.total) * 100
//                                   )}% of current queue`
//                                 : 'No tickets yet'}
//                             </p>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </section>

//                 <section className="hub-quarter-fade rounded-[30px] border border-sky-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-6 shadow-[0_20px_45px_rgba(148,163,184,0.14)]">
//                   <div className="flex items-start justify-between gap-4">
//                     <div>
//                       <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-500">
//                         Usage analytics
//                       </p>
//                       <h2 className="mt-2 text-2xl font-semibold text-slate-900">
//                         Resource rhythm
//                       </h2>
//                       <p className="mt-1 text-sm text-slate-500">
//                         Top resources and peak approved-booking hours.
//                       </p>
//                     </div>
//                     <div className="hidden h-14 w-14 rounded-[20px] bg-[radial-gradient(circle_at_30%_30%,#7dd3fc,transparent_58%),linear-gradient(135deg,#eff6ff,#dbeafe)] sm:block" />
//                   </div>

//                   {analyticsError && (
//                     <p className="mt-3 text-sm text-rose-600">{analyticsError}</p>
//                   )}

//                   {analyticsLoading ? (
//                     <p className="mt-3 text-sm text-slate-500">
//                       Loading analytics...
//                     </p>
//                   ) : (
//                     <div className="mt-4 space-y-5">
//                       <div className="rounded-[26px] border border-emerald-100 bg-[linear-gradient(180deg,#ffffff_0%,#f0fdf4_100%)] p-4">
//                         <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
//                           Top resources
//                         </h3>
//                         <div className="mt-3 space-y-4">
//                           {analytics.topResources.length === 0 ? (
//                             <p className="text-sm text-slate-500">
//                               No approved bookings yet.
//                             </p>
//                           ) : (
//                             analytics.topResources.map((item) => (
//                               <div
//                                 key={item.resourceId}
//                                 className="rounded-[20px] bg-white/90 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
//                               >
//                                 <div className="mb-2 flex items-center justify-between text-sm">
//                                   <span className="font-semibold text-slate-700">
//                                     {item.resourceName}
//                                   </span>
//                                   <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
//                                     {item.bookingCount}
//                                   </span>
//                                 </div>
//                                 <div className="h-2.5 rounded-full bg-emerald-50">
//                                   <div
//                                     className="h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
//                                     style={{
//                                       width: `${(item.bookingCount / maxResourceCount) * 100}%`,
//                                     }}
//                                   />
//                                 </div>
//                               </div>
//                             ))
//                           )}
//                         </div>
//                       </div>

//                       <div>
//                         <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">
//                           Peak booking hours
//                         </h3>
//                         <div className="mt-3">
//                           {analytics.peakBookingHours.length === 0 ? (
//                             <p className="text-sm text-slate-500">
//                               No approved bookings yet.
//                             </p>
//                           ) : (
//                             <div className="rounded-[26px] border border-sky-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eff6ff_100%)] p-5">
//                               <div className="flex min-h-[220px] items-end gap-4">
//                                 {analytics.peakBookingHours.map((item) => (
//                                   <div
//                                     key={item.hour}
//                                     className="flex min-w-0 flex-1 flex-col items-center gap-3"
//                                   >
//                                     <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-sky-600 shadow-sm">
//                                       {item.bookingCount}
//                                     </span>
//                                     <div className="flex h-36 w-full items-end rounded-[24px] border border-white/70 bg-white/90 px-2 py-2 shadow-[inset_0_10px_18px_rgba(191,219,254,0.3)]">
//                                       <div
//                                         className="w-full rounded-[18px] bg-gradient-to-t from-sky-500 via-cyan-400 to-sky-300 shadow-[0_10px_20px_rgba(14,165,233,0.28)]"
//                                         style={{
//                                           height: `${Math.max(
//                                             (item.bookingCount / maxHourCount) * 100,
//                                             12
//                                           )}%`,
//                                         }}
//                                       />
//                                     </div>
//                                     <span className="text-center text-[11px] font-medium leading-4 text-slate-600">
//                                       {item.label}
//                                     </span>
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </section>

//                 <section className="hub-quarter-fade rounded-[30px] border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f0f9ff_100%)] p-6 shadow-[0_20px_45px_rgba(59,130,246,0.08)]">
//                   <div className="flex items-start justify-between gap-4">
//                     <div>
//                       <p className="text-xs font-semibold uppercase tracking-[0.26em] text-blue-500">
//                         Booking analytics
//                       </p>
//                       <h2 className="mt-2 text-2xl font-semibold text-slate-900">
//                         Comprehensive charts
//                       </h2>
//                       <p className="mt-1 text-sm text-slate-500">
//                         Visual insights into booking patterns, resource utilization, and trends.
//                       </p>
//                     </div>
//                     <div className="hidden h-14 w-14 rounded-[20px] bg-[radial-gradient(circle_at_30%_30%,#93c5fd,transparent_58%),linear-gradient(135deg,#eff6ff,#dbeafe)] sm:block" />
//                   </div>

//                   <div className="mt-4">
//                     {bookingsLoading ? (
//                       <p className="text-sm text-slate-500">Loading booking data...</p>
//                     ) : bookingsError ? (
//                       <p className="text-sm text-rose-600">{bookingsError}</p>
//                     ) : (
//                       <div className="rounded-[24px] border border-blue-100 bg-white p-4">
//                         <BookingCharts bookings={bookings} resources={resources} />
//                       </div>
//                     )}
//                   </div>

//                   <div className="mt-4 flex gap-2">
//                     <button
//                       onClick={() => window.open('/admin-bookings', '_blank')}
//                       className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
//                     >
//                       View detailed charts
//                     </button>
//                     <button
//                       onClick={() => setBookingViewMode(bookingViewMode === 'table' ? 'charts' : 'table')}
//                       className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
//                     >
//                       {bookingViewMode === 'table' ? 'Show charts' : 'Show table'}
//                     </button>
//                   </div>
//                 </section>

//                 <section className="hub-quarter-fade rounded-[30px] border border-rose-100 bg-[linear-gradient(180deg,#ffffff_0%,#fff7fb_100%)] p-6 shadow-[0_20px_45px_rgba(244,114,182,0.08)]">
//                   <div className="flex items-start justify-between gap-4">
//                     <div>
//                       <p className="text-xs font-semibold uppercase tracking-[0.26em] text-rose-500">
//                         Ticket care
//                       </p>
//                       <h2 className="mt-2 text-2xl font-semibold text-slate-900">
//                         SLA summary
//                       </h2>
//                     </div>
//                     <div className="hidden h-14 w-14 rounded-[20px] bg-[radial-gradient(circle_at_30%_30%,#f9a8d4,transparent_58%),linear-gradient(135deg,#fff1f2,#ffe4e6)] sm:block" />
//                   </div>

//                   <div className="mt-4 grid gap-4 md:grid-cols-2">
//                     <article className="rounded-[24px] border border-rose-100 bg-[linear-gradient(180deg,#ffffff_0%,#fff1f2_100%)] p-5 shadow-[0_12px_24px_rgba(251,113,133,0.08)]">
//                       <p className="text-sm font-medium text-slate-500">
//                         Average first response
//                       </p>
//                       <p className="mt-3 text-3xl font-semibold text-slate-900">
//                         {durationLabel(ticketSummary.avgFirstResponse)}
//                       </p>
//                       <p className="mt-2 text-xs uppercase tracking-[0.16em] text-rose-500">
//                         Support pickup speed
//                       </p>
//                     </article>

//                     <article className="rounded-[24px] border border-amber-100 bg-[linear-gradient(180deg,#ffffff_0%,#fffbeb_100%)] p-5 shadow-[0_12px_24px_rgba(251,191,36,0.08)]">
//                       <p className="text-sm font-medium text-slate-500">
//                         Average resolution
//                       </p>
//                       <p className="mt-3 text-3xl font-semibold text-slate-900">
//                         {durationLabel(ticketSummary.avgResolution)}
//                       </p>
//                       <p className="mt-2 text-xs uppercase tracking-[0.16em] text-amber-500">
//                         End-to-end closure
//                       </p>
//                     </article>
//                   </div>

//                   <div className="mt-4 rounded-[24px] border border-slate-200 bg-white/80 p-4 text-sm leading-7 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
//                     First response is captured when support first picks up a ticket or leaves an admin/support comment. Resolution time ends when a ticket moves to RESOLVED or CLOSED.
//                   </div>
//                 </section>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   )
// }
