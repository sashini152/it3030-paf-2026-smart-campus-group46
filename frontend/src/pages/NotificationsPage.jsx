import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import ParallaxPanel from '../components/ParallaxPanel'
import Reveal from '../components/Reveal'
import Tooltip from '../components/Tooltip'
import SurfaceCard from '../components/SurfaceCard'

const notificationSeed = [
  {
    id: 'n1',
    type: 'TICKET',
    title: 'Ticket #INC-214 moved to IN_PROGRESS',
    message: 'Support assigned a technician and started investigation for your network report.',
    timeLabel: '5 min ago',
    priority: 'HIGH',
    read: false,
    href: '/ticket-list',
    hrefLabel: 'Open ticket queue',
  },
  {
    id: 'n2',
    type: 'BOOKING',
    title: 'Lab booking approved',
    message: 'Your request for Lab C-204 was approved for tomorrow 09:00-11:00.',
    timeLabel: '22 min ago',
    priority: 'NORMAL',
    read: false,
    href: '/bookings',
    hrefLabel: 'Open bookings',
  },
  {
    id: 'n3',
    type: 'NOTICE',
    title: 'Library wing maintenance notice',
    message: 'Projector maintenance is scheduled from 14:00 to 16:00 in Block B.',
    timeLabel: '1 hr ago',
    priority: 'NORMAL',
    read: true,
    href: '/resources',
    hrefLabel: 'View resources',
  },
  {
    id: 'n4',
    type: 'TICKET',
    title: 'Comment added by support team',
    message: 'Support asked for a photo of the device label to continue troubleshooting.',
    timeLabel: '2 hr ago',
    priority: 'NORMAL',
    read: true,
    href: '/ticket-list',
    hrefLabel: 'Open ticket details',
  },
  {
    id: 'n5',
    type: 'BOOKING',
    title: 'Room reservation cancelled',
    message: 'A pending request was auto-cancelled because the selected slot expired.',
    timeLabel: '4 hr ago',
    priority: 'LOW',
    read: true,
    href: '/bookings',
    hrefLabel: 'Create new booking',
  },
]

const digestSlides = [
  {
    title: 'Track high-priority updates first',
    body: 'Pin unread ticket changes and notice alerts before reviewing normal updates.',
  },
  {
    title: 'Use one inbox for every module',
    body: 'This page combines ticket, booking, and service updates so students do not miss changes.',
  },
  {
    title: 'Resolve unread count daily',
    body: 'Clearing unread items once per day keeps your academic operations timeline clean.',
  },
]

const feedFilters = ['ALL', 'TICKET', 'BOOKING', 'NOTICE']

function formatFilterLabel(value) {
  if (value === 'ALL') return 'All'
  if (value === 'TICKET') return 'Tickets'
  if (value === 'BOOKING') return 'Bookings'
  return 'Campus notices'
}

function getNotificationStats(items) {
  return items.reduce(
    (acc, item) => {
      acc.total += 1
      if (!item.read) acc.unread += 1
      if (item.type === 'TICKET') acc.tickets += 1
      if (item.type === 'BOOKING') acc.bookings += 1
      if (item.type === 'NOTICE') acc.notices += 1
      return acc
    },
    { total: 0, unread: 0, tickets: 0, bookings: 0, notices: 0 }
  )
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(notificationSeed)
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [onlyUnread, setOnlyUnread] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeId, setActiveId] = useState(notificationSeed[0]?.id || null)
  const [activeDigest, setActiveDigest] = useState(0)
  const [pauseDigest, setPauseDigest] = useState(false)

  useEffect(() => {
    if (pauseDigest) return undefined
    const timer = setInterval(() => {
      setActiveDigest((current) => (current + 1) % digestSlides.length)
    }, 5200)
    return () => clearInterval(timer)
  }, [pauseDigest])

  const stats = useMemo(() => getNotificationStats(notifications), [notifications])

  const filtered = useMemo(() => {
    return notifications.filter((item) => {
      const typeMatches = typeFilter === 'ALL' || item.type === typeFilter
      const unreadMatches = !onlyUnread || !item.read
      const query = searchTerm.trim().toLowerCase()
      const queryMatches =
        query.length === 0 ||
        item.title.toLowerCase().includes(query) ||
        item.message.toLowerCase().includes(query)
      return typeMatches && unreadMatches && queryMatches
    })
  }, [notifications, onlyUnread, searchTerm, typeFilter])

  const activeNotification =
    filtered.find((item) => item.id === activeId) ||
    filtered[0] ||
    notifications.find((item) => item.id === activeId) ||
    null

  function toggleRead(id) {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, read: !item.read } : item))
    )
  }

  function markAllRead() {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })))
  }

  return (
    <div className="hub-page hub-page--notifications space-y-8 rounded-[34px] bg-[linear-gradient(180deg,#181A2F_0%,#242E49_52%,#37415C_100%)] p-6 text-white sm:p-8">
      <Reveal delay={30}>
        <section className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FDA481]">Notifications</p>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Keep up with campus updates
            </h1>
            <p className="max-w-3xl text-base leading-7 text-white">
              Track ticket progress, booking decisions, and campus notices from one interactive inbox.
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" delay={70}>
        <ParallaxPanel className="hub-notify-stat hub-notify-stat--total hub-lift">
          <span>Total</span>
          <strong>{stats.total}</strong>
        </ParallaxPanel>
        <ParallaxPanel className="hub-notify-stat hub-notify-stat--unread hub-lift">
          <span>Unread</span>
          <strong>{stats.unread}</strong>
        </ParallaxPanel>
        <ParallaxPanel className="hub-notify-stat hub-notify-stat--ticket hub-lift">
          <span>Tickets</span>
          <strong>{stats.tickets}</strong>
        </ParallaxPanel>
        <ParallaxPanel className="hub-notify-stat hub-notify-stat--booking hub-lift">
          <span>Bookings</span>
          <strong>{stats.bookings}</strong>
        </ParallaxPanel>
        <ParallaxPanel className="hub-notify-stat hub-notify-stat--notice hub-lift">
          <span>Notices</span>
          <strong>{stats.notices}</strong>
        </ParallaxPanel>
      </Reveal>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Reveal delay={120}>
          <SurfaceCard className="space-y-5 !border-[#FDA481] !bg-white !text-[#181A2F] shadow-none">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#181A2F]">Inbox feed</h2>
                <p className="mt-2 text-sm leading-6 text-[#37415C]">
                  Click any item to open details and jump directly to the related module.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={markAllRead}
                  className="hub-btn hub-btn--small hub-notify-action hub-button-pop"
                >
                  Mark all read
                </button>
                <label className="inline-flex items-center gap-2 text-sm font-medium text-[#181A2F]">
                  <input
                    type="checkbox"
                    checked={onlyUnread}
                    onChange={(event) => setOnlyUnread(event.target.checked)}
                  />
                  Unread only
                </label>
              </div>
            </div>

            <div className="hub-notify-filter-chips" role="toolbar" aria-label="Notification type filters">
              {feedFilters.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTypeFilter(value)}
                  className={`hub-notify-filter-chip ${typeFilter === value ? 'hub-notify-filter-chip--active' : ''}`}
                >
                  {formatFilterLabel(value)}
                </button>
              ))}
            </div>

            <label className="block">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-[#181A2F]">
                <span>Search notifications</span>
                <Tooltip text="Search by title or message text." tone="ticket">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#B4182D] bg-white text-[11px] font-semibold text-[#B4182D]">
                    i
                  </span>
                </Tooltip>
              </span>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by keyword..."
                className="mt-2 w-full rounded-2xl border border-[#37415C] bg-white px-4 py-3 text-sm text-[#181A2F] outline-none transition focus:border-[#B4182D]"
              />
            </label>

            {filtered.length === 0 ? (
              <EmptyState
                title="No notifications match this filter"
                description="Try a different type filter or disable unread-only mode."
                tone="ticket"
              />
            ) : (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
                <div className="space-y-3">
                  {filtered.map((item, index) => {
                    const selected = activeNotification?.id === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveId(item.id)}
                        className={`hub-notify-item ${selected ? 'hub-notify-item--active' : ''}`}
                        style={{ animationDelay: `${index * 45}ms` }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B4182D]">
                              {formatFilterLabel(item.type)}
                            </p>
                            <h3 className="mt-1 text-left text-sm font-semibold text-[#181A2F]">{item.title}</h3>
                          </div>
                          {!item.read && <span className="hub-notify-item__dot" aria-hidden="true" />}
                        </div>
                        <p className="mt-2 text-left text-sm leading-6 text-[#37415C]">{item.message}</p>
                        <div className="mt-3 flex items-center justify-between text-xs text-[#37415C]">
                          <span>{item.timeLabel}</span>
                          <span>{item.priority}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {activeNotification && (
                  <div className="hub-notify-detail hub-fade-slide">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B4182D]">Details</p>
                    <h3 className="mt-2 text-lg font-semibold text-[#181A2F]">{activeNotification.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#37415C]">{activeNotification.message}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full border border-[#37415C] bg-white px-3 py-1 font-semibold text-[#181A2F]">
                        {formatFilterLabel(activeNotification.type)}
                      </span>
                      <span className="rounded-full border border-[#37415C] bg-white px-3 py-1 font-semibold text-[#181A2F]">
                        {activeNotification.timeLabel}
                      </span>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleRead(activeNotification.id)}
                        className="hub-btn hub-btn--small hub-notify-action hub-button-pop"
                      >
                        {activeNotification.read ? 'Mark unread' : 'Mark read'}
                      </button>
                      <Link to={activeNotification.href} className="hub-btn hub-btn--small hub-notify-link hub-button-pop">
                        {activeNotification.hrefLabel}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </SurfaceCard>
        </Reveal>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Reveal delay={180}>
            <ParallaxPanel strength={10}>
              <SurfaceCard
                className="space-y-4 !border-[#54162B] !bg-[#54162B] !text-white shadow-none"
                onMouseEnter={() => setPauseDigest(true)}
                onMouseLeave={() => setPauseDigest(false)}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FDA481]">Live digest</p>
                <div key={activeDigest} className="hub-notify-digest hub-fade-slide">
                  <h3 className="text-base font-semibold text-white">{digestSlides[activeDigest].title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white">{digestSlides[activeDigest].body}</p>
                </div>
                <div className="hub-notify-digest__controls">
                  <div className="hub-notify-digest__dots">
                    {digestSlides.map((slide, index) => (
                      <button
                        key={slide.title}
                        type="button"
                        onClick={() => setActiveDigest(index)}
                        className={`hub-notify-digest__dot ${
                          index === activeDigest ? 'hub-notify-digest__dot--active' : ''
                        }`}
                        aria-label={`Show digest slide ${index + 1}`}
                      />
                    ))}
                  </div>
                  <div className="hub-notify-digest__actions">
                    <button
                      type="button"
                      className="hub-notify-digest__action"
                      onClick={() =>
                        setActiveDigest((current) => (current === 0 ? digestSlides.length - 1 : current - 1))
                      }
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      className="hub-notify-digest__action"
                      onClick={() => setActiveDigest((current) => (current + 1) % digestSlides.length)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </SurfaceCard>
            </ParallaxPanel>
          </Reveal>

          <Reveal delay={240}>
            <ParallaxPanel strength={8}>
              <SurfaceCard className="space-y-3 !border-[#37415C] !bg-white !text-[#181A2F] shadow-none">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#B4182D]">Navigation shortcuts</p>
                <div className="grid gap-2">
                  <Link className="hub-notify-shortcut hub-button-pop" to="/ticket-list">
                    Ticket history
                  </Link>
                  <Link className="hub-notify-shortcut hub-button-pop" to="/bookings">
                    Booking updates
                  </Link>
                  <Link className="hub-notify-shortcut hub-button-pop" to="/resources">
                    Resource status
                  </Link>
                </div>
              </SurfaceCard>
            </ParallaxPanel>
          </Reveal>
        </aside>
      </section>
    </div>
  )
}
