import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJson, patchJson, putJson } from '../api/client'
import ParallaxPanel from '../components/ParallaxPanel'
import Reveal from '../components/Reveal'
import Tooltip from '../components/Tooltip'
import { useAuth } from '../contexts/AuthContext'
import { getUserLookupKeys } from '../utils/studentIdentity'

const notificationTypes = ['ALL', 'BOOKING', 'TICKET', 'COMMENT', 'SYSTEM']
const digestSlides = [
  {
    title: 'Stay ahead of booking changes',
    body: 'Unread booking notices usually point to approvals, rejections, or time changes that need attention.',
  },
  {
    title: 'Support updates move fastest here',
    body: 'Ticket notifications shorten the gap between a reply from support and the next action from you.',
  },
  {
    title: 'Tune the feed to your workflow',
    body: 'Switch categories on or off so the notification list feels focused instead of noisy.',
  },
]

function formatType(type) {
  return type === 'ALL' ? 'All' : type.replaceAll('_', ' ')
}

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString()
}

function dedupeNotifications(items) {
  const seen = new Set()
  return items.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [preferences, setPreferences] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [error, setError] = useState(null)
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [onlyUnread, setOnlyUnread] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeDigest, setActiveDigest] = useState(0)

  const userKeys = useMemo(() => getUserLookupKeys(user), [user])
  const preferenceKey = user?.studentId || user?.email || user?.name || ''

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const responses = userKeys.length > 0
        ? await Promise.all(userKeys.map((key) => getJson(`/api/notifications?targetUserId=${encodeURIComponent(key)}`)))
        : [await getJson('/api/notifications')]
      const merged = dedupeNotifications(responses.flat().filter(Boolean))
      setNotifications(
        merged.sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())
      )
    } catch (requestError) {
      setNotifications([])
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [userKeys])

  const loadPreferences = useCallback(async () => {
    if (!preferenceKey) return
    try {
      const data = await getJson(`/api/notification-preferences/${encodeURIComponent(preferenceKey)}`)
      setPreferences(data)
    } catch (requestError) {
      setError(requestError.message)
    }
  }, [preferenceKey])

  useEffect(() => {
    loadNotifications().catch(() => {})
  }, [loadNotifications])

  useEffect(() => {
    loadPreferences().catch(() => {})
  }, [loadPreferences])

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveDigest((current) => (current + 1) % digestSlides.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return notifications.filter((item) => {
      const typeMatches = typeFilter === 'ALL' || item.type === typeFilter
      const unreadMatches = !onlyUnread || !item.read
      const searchMatches =
        query.length === 0 ||
        item.title?.toLowerCase().includes(query) ||
        item.message?.toLowerCase().includes(query)
      return typeMatches && unreadMatches && searchMatches
    })
  }, [notifications, onlyUnread, searchTerm, typeFilter])

  const summary = useMemo(() => ({
    total: notifications.length,
    unread: notifications.filter((item) => !item.read).length,
    bookings: notifications.filter((item) => item.type === 'BOOKING').length,
    tickets: notifications.filter((item) => item.type === 'TICKET').length,
  }), [notifications])

  async function markRead(id, read) {
    try {
      const updated = await patchJson(`/api/notifications/${id}/read`, { read })
      setNotifications((current) => current.map((item) => (item.id === id ? updated : item)))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function markAllRead() {
    try {
      const key = preferenceKey ? `?targetUserId=${encodeURIComponent(preferenceKey)}` : ''
      await patchJson(`/api/notifications/read-all${key}`, {})
      await loadNotifications()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function savePreferences(nextPreferences) {
    if (!preferenceKey) return
    setSavingPrefs(true)
    setError(null)
    try {
      const saved = await putJson(`/api/notification-preferences/${encodeURIComponent(preferenceKey)}`, {
        bookingEnabled: nextPreferences.bookingEnabled,
        ticketEnabled: nextPreferences.ticketEnabled,
        commentEnabled: nextPreferences.commentEnabled,
        systemEnabled: nextPreferences.systemEnabled,
      })
      setPreferences(saved)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingPrefs(false)
    }
  }

  function togglePreference(key) {
    if (!preferences) return
    const next = { ...preferences, [key]: !preferences[key] }
    setPreferences(next)
    savePreferences(next).catch(() => {})
  }

  return (
    <div className="hub-page hub-page--wide hub-page--notifications hub-notify-page space-y-6">
      <Reveal delay={30}>
        <ParallaxPanel className="hub-notify-hero" strength={8}>
          <p className="hub-notify-kicker">Message center</p>
          <h1>Notifications</h1>
          <p className="hub-lead">
            Review booking, ticket, comment, and system updates in one place and control what gets delivered.
          </p>
          {error && (
            <div className="hub-alert hub-alert--error hub-notify-alert" role="alert">
              {error}
            </div>
          )}
        </ParallaxPanel>
      </Reveal>

      <Reveal className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" delay={70}>
        <ParallaxPanel className="hub-notify-stat-card hub-notify-stat-card--total hub-lift" strength={6}>
          <span>Total</span>
          <strong>{summary.total}</strong>
        </ParallaxPanel>
        <ParallaxPanel className="hub-notify-stat-card hub-notify-stat-card--unread hub-lift" strength={6}>
          <span>Unread</span>
          <strong>{summary.unread}</strong>
        </ParallaxPanel>
        <ParallaxPanel className="hub-notify-stat-card hub-notify-stat-card--booking hub-lift" strength={6}>
          <span>Booking</span>
          <strong>{summary.bookings}</strong>
        </ParallaxPanel>
        <ParallaxPanel className="hub-notify-stat-card hub-notify-stat-card--ticket hub-lift" strength={6}>
          <span>Ticket</span>
          <strong>{summary.tickets}</strong>
        </ParallaxPanel>
      </Reveal>

      <Reveal delay={100}>
        <ParallaxPanel className="hub-notify-carousel" strength={8}>
          <p className="hub-notify-panel__eyebrow">Delivery flow</p>
          <div key={activeDigest} className="hub-notify-carousel__slide hub-fade-slide">
            <h2>{digestSlides[activeDigest].title}</h2>
            <p>{digestSlides[activeDigest].body}</p>
          </div>
          <div className="hub-notify-carousel__controls">
            <div className="hub-notify-carousel__dots">
              {digestSlides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  className={`hub-notify-carousel__dot ${index === activeDigest ? 'hub-notify-carousel__dot--active' : ''}`}
                  onClick={() => setActiveDigest(index)}
                  aria-label={`Show digest ${index + 1}`}
                />
              ))}
            </div>
            <div className="hub-notify-carousel__actions">
              <button type="button" className="hub-notify-carousel__button" onClick={() => setActiveDigest((current) => (current === 0 ? digestSlides.length - 1 : current - 1))}>
                Prev
              </button>
              <button type="button" className="hub-notify-carousel__button" onClick={() => setActiveDigest((current) => (current + 1) % digestSlides.length)}>
                Next
              </button>
            </div>
          </div>
        </ParallaxPanel>
      </Reveal>

      {preferences && (
        <Reveal delay={130}>
          <ParallaxPanel className="hub-notify-panel" strength={8}>
            <div className="hub-notify-panel__header">
              <div>
                <p className="hub-notify-panel__eyebrow">Preferences</p>
                <h2>Notification categories</h2>
              </div>
            </div>
            <div className="hub-notify-pref-grid">
              {[
                ['bookingEnabled', 'Booking updates'],
                ['ticketEnabled', 'Ticket updates'],
                ['commentEnabled', 'Comment updates'],
                ['systemEnabled', 'System notices'],
              ].map(([key, label], index) => (
                <article key={key} className={`hub-notify-pref-card hub-notify-pref-card--${index % 4}`}>
                  <div>
                    <p className="hub-notify-pref-card__label">{label}</p>
                    <p className="hub-notify-pref-card__state">
                      {preferences[key] ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`hub-notify-toggle ${preferences[key] ? 'hub-notify-toggle--on' : ''}`}
                    disabled={savingPrefs}
                    onClick={() => togglePreference(key)}
                  >
                    {preferences[key] ? 'On' : 'Off'}
                  </button>
                </article>
              ))}
            </div>
          </ParallaxPanel>
        </Reveal>
      )}

      <Reveal delay={160}>
        <ParallaxPanel className="hub-notify-panel" strength={10}>
          <div className="hub-notify-toolbar">
            <label className="hub-notify-field">
              <span className="hub-notify-field__label">
                Category
                <Tooltip text="Switch the message feed between booking, ticket, comment, and system updates." tone="ticket">
                  <span className="hub-notify-field__info">i</span>
                </Tooltip>
              </span>
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                {notificationTypes.map((type) => (
                  <option key={type} value={type}>
                    {formatType(type)}
                  </option>
                ))}
              </select>
            </label>

            <label className="hub-notify-field hub-notify-field--grow">
              <span className="hub-notify-field__label">
                Search
                <Tooltip text="Search inside notification titles and message text." tone="ticket">
                  <span className="hub-notify-field__info">i</span>
                </Tooltip>
              </span>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search title or message"
              />
            </label>

            <button
              type="button"
              className={`hub-notify-filter-toggle ${onlyUnread ? 'hub-notify-filter-toggle--active' : ''}`}
              onClick={() => setOnlyUnread((current) => !current)}
            >
              {onlyUnread ? 'Unread only' : 'Show all'}
            </button>

            <button type="button" className="hub-notify-primary-btn" onClick={markAllRead}>
              Mark all read
            </button>
          </div>

          {loading ? (
            <div className="hub-loading hub-notify-loading">Loading notifications...</div>
          ) : filtered.length === 0 ? (
            <div className="hub-notify-empty">
              <p>No notifications found.</p>
              <p className="hub-notify-empty__sub">Try another filter or wait for the next update.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((item, index) => (
                <ParallaxPanel key={item.id} className="hub-notify-card hub-lift" strength={5} style={{ animationDelay: `${index * 45}ms` }}>
                  <div className="hub-notify-card__content">
                    <div className="hub-notify-card__meta">
                      <span className="hub-notify-card__type">{formatType(item.type)}</span>
                      <span className={`hub-notify-state ${item.read ? 'hub-notify-state--read' : 'hub-notify-state--unread'}`}>
                        {item.read ? 'Read' : 'Unread'}
                      </span>
                    </div>
                    <h2>{item.title}</h2>
                    <p className="hub-notify-card__message">{item.message}</p>
                    <p className="hub-notify-card__time">{formatDateTime(item.createdAt)}</p>
                  </div>
                  <div className="hub-notify-card__actions">
                    <button
                      type="button"
                      className="hub-notify-secondary-btn"
                      onClick={() => markRead(item.id, !item.read)}
                    >
                      {item.read ? 'Mark unread' : 'Mark read'}
                    </button>
                    {item.referenceType === 'BOOKING' && (
                      <Link to="/user-bookings" className="hub-notify-link-btn">
                        Open booking
                      </Link>
                    )}
                    {item.referenceType === 'TICKET' && (
                      <Link to={item.referenceId ? `/ticket-details/${item.referenceId}` : '/tickets'} className="hub-notify-link-btn">
                        Open ticket
                      </Link>
                    )}
                  </div>
                </ParallaxPanel>
              ))}
            </div>
          )}
        </ParallaxPanel>
      </Reveal>
    </div>
  )
}
