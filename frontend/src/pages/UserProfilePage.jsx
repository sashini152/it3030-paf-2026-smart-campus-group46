import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getJson, putJson } from '../api/client'
import { subscribeToBookingUpdates } from '../mock/mockData'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import ParallaxPanel from '../components/ParallaxPanel'
import Reveal from '../components/Reveal'
import Tooltip from '../components/Tooltip'
import { getTicketReporterLabel, getUserLookupKeys } from '../utils/studentIdentity'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buildProfileSlides(stats, recentBookings, recentTickets) {
  const latestBooking = recentBookings[0]
  const latestTicket = recentTickets[0]

  return [
    {
      title: 'Booking pulse',
      body:
        stats.pendingBookings > 0
          ? `${stats.pendingBookings} booking request${stats.pendingBookings === 1 ? '' : 's'} still waiting for approval.`
          : 'No booking requests are waiting right now.',
      accent: 'peach',
    },
    {
      title: 'Support pulse',
      body:
        stats.openTickets > 0
          ? `${stats.openTickets} support ticket${stats.openTickets === 1 ? '' : 's'} still need follow-up.`
          : 'All tracked support tickets are currently settled.',
      accent: 'crimson',
    },
    {
      title: 'Latest activity',
      body:
        latestBooking?.resourceName ||
        latestBooking?.resourceId ||
        latestTicket?.title ||
        'Create your first booking or ticket to start building activity history.',
      accent: 'steel',
    },
  ]
}

export default function UserProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userDetails, setUserDetails] = useState(null)
  const [bookings, setBookings] = useState([])
  const [tickets, setTickets] = useState([])
  const [activeSpotlight, setActiveSpotlight] = useState(0)
  const [pauseSpotlight, setPauseSpotlight] = useState(false)
  const [adminUsers, setAdminUsers] = useState([])
  const [newAdminEmail, setNewAdminEmail] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const loadAdminUsers = async () => {
    try {
      const usersData = await getJson('/api/users')
      if (Array.isArray(usersData)) {
        const admins = usersData.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN')
        setAdminUsers(admins)
      }
    } catch (err) {
      console.error('Failed to load admin users:', err)
    }
  }

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      alert('Please enter a valid email address')
      return
    }

    try {
      // Check if user exists
      const userResponse = await getJson(`/api/users/email/${newAdminEmail.trim()}`)
      if (!userResponse) {
        alert('User with this email does not exist')
        return
      }

      // Update user role to ADMIN
      await putJson(`/api/users/${userResponse.id}/role`, { role: 'ADMIN' })
      
      alert(`Admin access granted to ${newAdminEmail}`)
      setNewAdminEmail('')
      await loadAdminUsers() // Refresh admin list
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
      await putJson(`/api/users/${userId}/role`, { role: 'USER' })
      alert(`Admin access removed from ${userEmail}`)
      await loadAdminUsers() // Refresh admin list
    } catch (err) {
      console.error('Failed to remove admin:', err)
      alert('Failed to remove admin access. Please try again.')
    }
  }

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.email) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        try {
          const userData = await getJson(`/api/users/email/${user?.email}`)
          if (userData && userData.email === user?.email) {
            setUserDetails(userData)
          } else {
            throw new Error('User data mismatch or not found')
          }
        } catch {
          setUserDetails(user)
        }

        try {
          const bookingsData = await getJson('/api/bookings')
          if (Array.isArray(bookingsData)) {
            const userBookings = bookingsData.filter((booking) =>
              booking.bookedEmail === user?.email ||
              booking.createdBy === user?.email ||
              booking.email === user?.email
            )
            setBookings(userBookings)
          } else {
            setBookings([])
          }
        } catch {
          setBookings([])
        }

        try {
          const ticketsData = await getJson('/api/tickets')
          if (Array.isArray(ticketsData)) {
            const userKeys = new Set(getUserLookupKeys(user).map((value) => String(value).trim().toLowerCase()))
            const userTickets = ticketsData.filter((ticket) =>
              [ticket.createdBy, ticket.createdByName, ticket.email, ticket.submittedBy]
                .filter(Boolean)
                .some((value) => userKeys.has(String(value).trim().toLowerCase()))
            )
            setTickets(userTickets)
          } else {
            setTickets([])
          }
        } catch {
          setTickets([])
        }

        // Load admin users if user is super admin
        if ((user?.role === 'SUPER_ADMIN' || localStorage.getItem('userRole') === 'SUPER_ADMIN')) {
          await loadAdminUsers()
        }
      } catch (err) {
        setError(`Failed to load profile data: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [user?.email]) // eslint-disable-line react-hooks/exhaustive-deps

  const recentBookings = useMemo(
    () => [...bookings].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5),
    [bookings]
  )

  const recentTickets = useMemo(
    () => [...tickets].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5),
    [tickets]
  )

  const stats = useMemo(() => ({
    totalBookings: bookings.length,
    approvedBookings: bookings.filter((booking) => booking.status === 'APPROVED').length,
    pendingBookings: bookings.filter((booking) => booking.status === 'PENDING').length,
    totalTickets: tickets.length,
    resolvedTickets: tickets.filter((ticket) => ticket.status === 'RESOLVED').length,
    openTickets: tickets.filter((ticket) => ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS').length,
  }), [bookings, tickets])

  const profileSlides = useMemo(
    () => buildProfileSlides(stats, recentBookings, recentTickets),
    [recentBookings, recentTickets, stats]
  )

  useEffect(() => {
    if (!user?.email) return undefined

    const handleBookingUpdate = (updatedBooking) => {
      const isUserBooking =
        updatedBooking.bookedEmail === user?.email ||
        updatedBooking.createdBy === user?.email ||
        updatedBooking.email === user?.email

      if (isUserBooking) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) => (booking.id === updatedBooking.id ? updatedBooking : booking))
        )
      }
    }

    const unsubscribe = subscribeToBookingUpdates(handleBookingUpdate)
    return () => unsubscribe()
  }, [user?.email])

  useEffect(() => {
    if (pauseSpotlight) return undefined

    const timer = setInterval(() => {
      setActiveSpotlight((current) => (current + 1) % profileSlides.length)
    }, 4200)

    return () => clearInterval(timer)
  }, [pauseSpotlight, profileSlides.length])

  if (loading) {
    return (
      <div className="hub-profile-screen">
        <LoadingSpinner label="Loading your profile..." tone="ticket" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="hub-profile-screen">
        <EmptyState title="Profile unavailable" description={error} tone="ticket" />
      </div>
    )
  }

  return (
    <div className="hub-page hub-page--wide hub-profile-page">
      {/* Super Admin Access Button - Only for super admin email */}
      {((user?.email === 'sashini.unilocatelk@gmail.com') || 
        (localStorage.getItem('userEmail') === 'sashini.unilocatelk@gmail.com')) && 
        (user?.role !== 'SUPER_ADMIN' && localStorage.getItem('userRole') !== 'SUPER_ADMIN') && (
        <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '8px', margin: '20px 0' }}>
          <h3 style={{ color: '#92400e', margin: '0 0 10px 0' }}>Super Admin Access Available</h3>
          <p style={{ color: '#92400e', margin: '0 0 15px 0' }}>Click below to grant super admin permissions to your account</p>
          <button
            onClick={() => {
              // Force super admin access
              const currentUser = { 
                ...user, 
                role: 'SUPER_ADMIN', 
                name: user?.name || 'Sashini',
                email: user?.email || localStorage.getItem('userEmail')
              }
              localStorage.setItem('user', JSON.stringify(currentUser))
              localStorage.setItem('userRole', 'SUPER_ADMIN')
              localStorage.setItem('userEmail', currentUser.email)
              localStorage.setItem('userName', currentUser.name)
              alert('Super admin role granted! Redirecting to admin dashboard...')
              window.location.href = '/admin'
            }}
            style={{ 
              backgroundColor: '#7c3aed', 
              color: 'white', 
              padding: '12px 24px', 
              border: 'none', 
              borderRadius: '6px', 
              fontSize: '16px', 
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Grant Super Admin Access Now
          </button>
        </div>
      )}
      
      {/* Admin Access Button - For regular admin emails */}
      {((user?.email === 'it23220492@my.sliit.lk') || 
        (localStorage.getItem('userEmail') === 'it23220492@my.sliit.lk')) && 
        (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN' && 
         localStorage.getItem('userRole') !== 'ADMIN' && localStorage.getItem('userRole') !== 'SUPER_ADMIN') && (
        <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '8px', margin: '20px 0' }}>
          <h3 style={{ color: '#92400e', margin: '0 0 10px 0' }}>Admin Access Available</h3>
          <p style={{ color: '#92400e', margin: '0 0 15px 0' }}>Click below to grant admin permissions to your account</p>
          <button
            onClick={() => {
              // Force admin access
              const currentUser = { 
                ...user, 
                role: 'ADMIN', 
                name: user?.name || 'IT Student',
                email: user?.email || localStorage.getItem('userEmail')
              }
              localStorage.setItem('user', JSON.stringify(currentUser))
              localStorage.setItem('userRole', 'ADMIN')
              localStorage.setItem('userEmail', currentUser.email)
              localStorage.setItem('userName', currentUser.name)
              alert('Admin role granted! Redirecting to admin dashboard...')
              window.location.href = '/admin'
            }}
            style={{ 
              backgroundColor: '#dc2626', 
              color: 'white', 
              padding: '12px 24px', 
              border: 'none', 
              borderRadius: '6px', 
              fontSize: '16px', 
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Grant Admin Access Now
          </button>
        </div>
      )}
      
      <Reveal delay={30}>
        <ParallaxPanel as="section" className="hub-profile-hero hub-lift" strength={10}>
          <div className="hub-profile-avatar">
            {(userDetails?.name || user?.name)?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="hub-profile-hero__copy">
            <p className="hub-profile-kicker">Account overview</p>
            <h1>{userDetails?.name || user?.name || 'User'}</h1>
            <p className="hub-profile-email">{userDetails?.email || user?.email || 'N/A'}</p>
            <div className="hub-profile-badges">
              <span className={`hub-profile-badge ${
                (userDetails?.role || user?.role || 'USER') === 'SUPER_ADMIN' 
                  ? 'hub-profile-badge--purple' 
                  : (userDetails?.role || user?.role || 'USER') === 'ADMIN'
                  ? 'hub-profile-badge--accent'
                  : 'hub-profile-badge--dark'
              }`}>
                {userDetails?.role || user?.role || 'USER'}
              </span>
              {userDetails?.department && (
                <span className="hub-profile-badge hub-profile-badge--accent">{userDetails.department}</span>
              )}
            </div>
          </div>
          <div className="hub-profile-actions">
            <Tooltip text="Use this area later for editing personal details and account preferences." tone="ticket">
              <button type="button" className="hub-profile-action hub-profile-action--ghost hub-button-pop">Edit profile</button>
            </Tooltip>
            <Tooltip text="Account settings and notification tuning live here." tone="ticket">
              <button type="button" className="hub-profile-action hub-profile-action--accent hub-button-pop">Settings</button>
            </Tooltip>
            <button type="button" className="hub-profile-action hub-profile-action--danger hub-button-pop" onClick={handleLogout}>Logout</button>
          </div>
        </ParallaxPanel>
      </Reveal>

      <Reveal delay={70}>
        <section className="hub-profile-stats">
          <ParallaxPanel as="article" className="hub-profile-stat hub-profile-stat--light hub-lift" strength={6}>
            <span>Total bookings</span>
            <strong>{stats.totalBookings}</strong>
          </ParallaxPanel>
          <ParallaxPanel as="article" className="hub-profile-stat hub-profile-stat--peach hub-lift" strength={6}>
            <span>Approved</span>
            <strong>{stats.approvedBookings}</strong>
          </ParallaxPanel>
          <ParallaxPanel as="article" className="hub-profile-stat hub-profile-stat--berry hub-lift" strength={6}>
            <span>Pending</span>
            <strong>{stats.pendingBookings}</strong>
          </ParallaxPanel>
          <ParallaxPanel as="article" className="hub-profile-stat hub-profile-stat--navy hub-lift" strength={6}>
            <span>Total tickets</span>
            <strong>{stats.totalTickets}</strong>
          </ParallaxPanel>
          <ParallaxPanel as="article" className="hub-profile-stat hub-profile-stat--crimson hub-lift" strength={6}>
            <span>Resolved</span>
            <strong>{stats.resolvedTickets}</strong>
          </ParallaxPanel>
          <ParallaxPanel as="article" className="hub-profile-stat hub-profile-stat--steel hub-lift" strength={6}>
            <span>Open</span>
            <strong>{stats.openTickets}</strong>
          </ParallaxPanel>
        </section>
      </Reveal>

      <div className="hub-profile-grid">
        <div className="hub-profile-grid__sidebar">
          <Reveal delay={110}>
            <ParallaxPanel as="section" className="hub-profile-card hub-lift" strength={8}>
              <p className="hub-profile-card__eyebrow">Personal details</p>
              <div className="hub-profile-detail-list">
                <div className="hub-profile-detail-row">
                  <span>Full name</span>
                  <strong>{userDetails?.name || user?.name || 'N/A'}</strong>
                </div>
                <div className="hub-profile-detail-row">
                  <span>Email</span>
                  <strong>{userDetails?.email || user?.email || 'N/A'}</strong>
                </div>
                <div className="hub-profile-detail-row">
                  <span>Role</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${
                      (userDetails?.role || user?.role || 'USER') === 'SUPER_ADMIN'
                        ? 'text-purple-800'
                        : (userDetails?.role || user?.role || 'USER') === 'ADMIN'
                        ? 'text-blue-800'
                        : 'text-gray-800'
                    }`}>
                      {userDetails?.role || user?.role || 'USER'}
                    </span>
                    {((user?.email === 'sashini.unilocatelk@gmail.com') && user?.role !== 'SUPER_ADMIN') || 
                    ((localStorage.getItem('userEmail') === 'sashini.unilocatelk@gmail.com') && localStorage.getItem('userRole') !== 'SUPER_ADMIN') ? (
                      <button
                        onClick={() => {
                          // Force super admin access
                          const currentUser = { 
                            ...user, 
                            role: 'SUPER_ADMIN', 
                            name: user?.name || 'Sashini',
                            email: user?.email || localStorage.getItem('userEmail')
                          }
                          localStorage.setItem('user', JSON.stringify(currentUser))
                          localStorage.setItem('userRole', 'SUPER_ADMIN')
                          localStorage.setItem('userEmail', currentUser.email)
                          localStorage.setItem('userName', currentUser.name)
                          alert('Super admin role granted! Refreshing page...')
                          window.location.reload()
                        }}
                        className="hub-btn hub-btn--primary hub-btn--small"
                        style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#7c3aed' }}
                      >
                        Grant Super Admin
                      </button>
                    ) : ((user?.email === 'it23220492@my.sliit.lk') && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') || 
                       ((localStorage.getItem('userEmail') === 'it23220492@my.sliit.lk') && 
                        localStorage.getItem('userRole') !== 'ADMIN' && localStorage.getItem('userRole') !== 'SUPER_ADMIN') ? (
                      <button
                        onClick={() => {
                          // Force admin access
                          const currentUser = { 
                            ...user, 
                            role: 'ADMIN', 
                            name: user?.name || 'IT Student',
                            email: user?.email || localStorage.getItem('userEmail')
                          }
                          localStorage.setItem('user', JSON.stringify(currentUser))
                          localStorage.setItem('userRole', 'ADMIN')
                          localStorage.setItem('userEmail', currentUser.email)
                          localStorage.setItem('userName', currentUser.name)
                          alert('Admin role granted! Refreshing page...')
                          window.location.reload()
                        }}
                        className="hub-btn hub-btn--primary hub-btn--small"
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                      >
                        Grant Admin
                      </button>
                    ) : null}
                  </div>
                </div>
                {userDetails?.department && (
                  <div className="hub-profile-detail-row">
                    <span>Department</span>
                    <strong>{userDetails.department}</strong>
                  </div>
                )}
                {userDetails?.phone && (
                  <div className="hub-profile-detail-row">
                    <span>Phone</span>
                    <strong>{userDetails.phone}</strong>
                  </div>
                )}
                {userDetails?.studentId && (
                  <div className="hub-profile-detail-row">
                    <span>Student ID</span>
                    <strong>{userDetails.studentId}</strong>
                  </div>
                )}
              </div>
            </ParallaxPanel>
          </Reveal>

          <Reveal delay={150}>
            <ParallaxPanel
              as="section"
              className="hub-profile-card hub-profile-card--spotlight"
              strength={10}
              onMouseEnter={() => setPauseSpotlight(true)}
              onMouseLeave={() => setPauseSpotlight(false)}
            >
              <div className="hub-profile-card__header">
                <div>
                  <p className="hub-profile-card__eyebrow">Activity spotlight</p>
                  <h2>What needs your attention</h2>
                </div>
                <Tooltip text="This card rotates through booking, support, and recent activity cues." tone="ticket">
                  <span className="hub-profile-info-badge">i</span>
                </Tooltip>
              </div>
              <div key={activeSpotlight} className={`hub-profile-spotlight hub-profile-spotlight--${profileSlides[activeSpotlight].accent} hub-fade-slide`}>
                <h3>{profileSlides[activeSpotlight].title}</h3>
                <p>{profileSlides[activeSpotlight].body}</p>
              </div>
              <div className="hub-profile-spotlight__controls">
                <div className="hub-profile-spotlight__dots">
                  {profileSlides.map((slide, index) => (
                    <button
                      key={slide.title}
                      type="button"
                      className={`hub-profile-spotlight__dot ${index === activeSpotlight ? 'hub-profile-spotlight__dot--active' : ''}`}
                      onClick={() => setActiveSpotlight(index)}
                      aria-label={`Show activity spotlight ${index + 1}`}
                    />
                  ))}
                </div>
                <div className="hub-profile-spotlight__actions">
                  <button
                    type="button"
                    className="hub-profile-spotlight__button"
                    onClick={() => setActiveSpotlight((current) => (current === 0 ? profileSlides.length - 1 : current - 1))}
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    className="hub-profile-spotlight__button"
                    onClick={() => setActiveSpotlight((current) => (current + 1) % profileSlides.length)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </ParallaxPanel>
          </Reveal>

          <Reveal delay={190}>
            <ParallaxPanel as="section" className="hub-profile-card hub-lift" strength={8}>
              <p className="hub-profile-card__eyebrow">Quick actions</p>
              <div className="hub-profile-shortcuts">
                <Link to="/user-bookings" className="hub-profile-shortcut hub-profile-shortcut--peach hub-button-pop">
                  <strong>My bookings</strong>
                  <span>Manage your booking history and approvals.</span>
                </Link>
                <Link to="/resources" className="hub-profile-shortcut hub-profile-shortcut--navy hub-button-pop">
                  <strong>Browse resources</strong>
                  <span>Check rooms, labs, and equipment availability.</span>
                </Link>
                <Link to="/tickets" className="hub-profile-shortcut hub-profile-shortcut--berry hub-button-pop">
                  <strong>Support tickets</strong>
                  <span>Track service requests and latest updates.</span>
                </Link>
                <Link to="/notifications" className="hub-profile-shortcut hub-profile-shortcut--steel hub-button-pop">
                  <strong>Notifications</strong>
                  <span>Review booking, ticket, and system notices.</span>
                </Link>
              </div>
            </ParallaxPanel>
          </Reveal>

          {/* Super Admin Management Section */}
          {(user?.role === 'SUPER_ADMIN' || localStorage.getItem('userRole') === 'SUPER_ADMIN') && (
            <Reveal delay={220}>
              <ParallaxPanel as="section" className="hub-profile-card hub-lift" strength={8}>
                <div className="hub-profile-card__header">
                  <div>
                    <p className="hub-profile-card__eyebrow">Super Admin Controls</p>
                    <h2>Admin User Management</h2>
                  </div>
                  <Tooltip text="Manage admin user accounts and permissions." tone="ticket">
                    <span className="hub-profile-info-badge">i</span>
                  </Tooltip>
                </div>
                
                <div className="space-y-4">
                  {/* Add New Admin */}
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-900 mb-3">Grant Admin Access</h4>
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
                    <h4 className="font-medium text-gray-900 mb-3">Current Admin Users ({adminUsers.length})</h4>
                    {adminUsers.length === 0 ? (
                      <p className="text-gray-500 text-sm">No admin users found</p>
                    ) : (
                      <div className="space-y-2">
                        {adminUsers.map((adminUser) => (
                          <div key={adminUser.id} className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200">
                            <div>
                              <div className="font-medium text-gray-900">{adminUser.name || adminUser.email}</div>
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
                </div>
              </ParallaxPanel>
            </Reveal>
          )}
        </div>

        <div className="hub-profile-grid__content">
          <Reveal delay={110}>
            <ParallaxPanel as="section" className="hub-profile-card hub-lift" strength={8}>
              <div className="hub-profile-card__header">
                <div>
                  <p className="hub-profile-card__eyebrow">Recent activity</p>
                  <h2>Latest bookings</h2>
                </div>
              </div>
              {recentBookings.length === 0 ? (
                <div className="hub-profile-empty">
                  <p>No bookings yet.</p>
                  <Link to="/user-bookings">Create your first booking</Link>
                </div>
              ) : (
                <div className="hub-profile-timeline">
                  {recentBookings.map((booking) => (
                    <article key={booking.id} className="hub-profile-timeline__item">
                      <div className="hub-profile-timeline__dot" />
                      <div className="hub-profile-timeline__body">
                        <div className="hub-profile-timeline__top">
                          <strong>{booking.resourceName || booking.resourceId || 'Resource booking'}</strong>
                          <span className={`hub-profile-pill hub-profile-pill--${(booking.status || 'PENDING').toLowerCase()}`}>
                            {booking.status}
                          </span>
                        </div>
                        <p>{formatDate(booking.startDateTime)}</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </ParallaxPanel>
          </Reveal>

          <Reveal delay={150}>
            <ParallaxPanel as="section" className="hub-profile-card hub-lift" strength={8}>
              <div className="hub-profile-card__header">
                <div>
                  <p className="hub-profile-card__eyebrow">Support history</p>
                  <h2>Latest tickets</h2>
                </div>
              </div>
              {recentTickets.length === 0 ? (
                <div className="hub-profile-empty">
                  <p>No tickets yet.</p>
                  <Link to="/tickets">Open the support page</Link>
                </div>
              ) : (
                <div className="hub-profile-ticket-list">
                  {recentTickets.map((ticket) => (
                    <article key={ticket.id} className="hub-profile-ticket">
                      <div>
                        <strong>{ticket.title || 'Support request'}</strong>
                        <p>{ticket.description || 'No description provided.'}</p>
                        <small>{getTicketReporterLabel(ticket)}</small>
                      </div>
                      <div className="hub-profile-ticket__meta">
                        <span className={`hub-profile-pill hub-profile-pill--${(ticket.status || 'OPEN').toLowerCase().replaceAll('_', '-')}`}>
                          {ticket.status || 'OPEN'}
                        </span>
                        <small>{formatDate(ticket.createdAt)}</small>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </ParallaxPanel>
          </Reveal>
        </div>
      </div>
    </div>
  )
}

