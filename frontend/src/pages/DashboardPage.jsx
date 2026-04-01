import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
<<<<<<< HEAD
import { useAuth } from '../contexts/AuthContext'
=======
import { useTickets } from '../hooks/useTickets'
import { useBookings } from '../hooks/useBookings'
import { useResources } from '../hooks/useResources'
import LoadingSpinner from '../components/LoadingSpinner'
>>>>>>> 277136eee2e5728305516bcf0bc8384f1c4a6ba3

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
<<<<<<< HEAD
  const [activeSection, setActiveSection] = useState('overview')
=======
  const { tickets, loading: ticketsLoading, error: ticketsError } = useTickets()
  const { bookings, loading: bookingsLoading, error: bookingsError } = useBookings()
  const { resources, loading: resourcesLoading, error: resourcesError } = useResources()
>>>>>>> 277136eee2e5728305516bcf0bc8384f1c4a6ba3

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

<<<<<<< HEAD
  const bookingPageRoute = user?.role === 'ADMIN' ? '/admin-bookings' : '/bookings'
  const bookingPageLabel = user?.role === 'ADMIN' ? 'Booking approvals' : 'My bookings'

  const sections = [
    {
      id: 'overview',
      label: 'Overview',
      title: `Welcome, ${user?.name || 'User'}!`,
      body: 'Your dashboard groups campus actions into one place. Use the left menu to move between resources, bookings, and support without leaving the page context.',
      meta: [
        { label: 'Email', value: user?.email || 'Not available' },
        { label: 'Role', value: user?.role || 'USER' },
      ],
      highlights: [
        { title: 'Resources', text: 'Browse active rooms and equipment.' },
        { title: 'Bookings', text: 'Create or review reservation requests.' },
        { title: 'Support', text: 'Track campus issues and responses.' },
      ],
      actionLabel: 'Open resources',
      action: () => navigate('/resources'),
    },
    {
      id: 'resources',
      label: 'Resources',
      title: 'Browse campus resources',
      body: 'Open the resource catalogue to check active spaces, equipment, locations, and capacity before making a booking request.',
      meta: [
        { label: 'What you can do', value: 'Search rooms and equipment' },
        { label: 'Best next step', value: 'Filter by location or capacity' },
      ],
      highlights: [
        { title: 'Lecture halls', text: 'Check capacity and room availability.' },
        { title: 'Labs', text: 'Find practical spaces by location.' },
        { title: 'Equipment', text: 'See bookable assets before reserving.' },
      ],
      actionLabel: 'View resources',
      action: () => navigate('/resources'),
    },
    {
      id: 'bookings',
      label: 'Bookings',
      title: bookingPageLabel,
      body:
        user?.role === 'ADMIN'
          ? 'Review pending booking requests and manage approval decisions from the admin booking view.'
          : 'Create new booking requests, track request status, and review your latest reservations in one place.',
      meta: [
        { label: 'Access', value: user?.role === 'ADMIN' ? 'Admin booking queue' : 'Student booking requests' },
        { label: 'Route', value: bookingPageRoute },
      ],
      highlights: [
        { title: 'Create', text: 'Request a slot with date, time, and purpose.' },
        { title: 'Track', text: 'Follow pending, approved, or cancelled states.' },
        { title: 'Manage', text: user?.role === 'ADMIN' ? 'Approve or reject pending requests.' : 'Review your latest requests quickly.' },
      ],
      actionLabel: user?.role === 'ADMIN' ? 'Open approvals' : 'Open bookings',
      action: () => navigate(bookingPageRoute),
    },
    {
      id: 'tickets',
      label: 'Support',
      title: 'Campus support tickets',
      body: 'Raise a support request, attach evidence, and track updates from the support team through the ticket workflow.',
      meta: [
        { label: 'Use case', value: 'Hardware, software, and campus issues' },
        { label: 'Tracking', value: 'Follow ticket status and comments' },
      ],
      highlights: [
        { title: 'Submit', text: 'Report an issue with title and description.' },
        { title: 'Track', text: 'See ticket status updates and comments.' },
        { title: 'Resolve', text: 'Follow support progress from one place.' },
      ],
      actionLabel: 'Open tickets',
      action: () => navigate('/tickets'),
    },
  ]

  const currentSection =
    sections.find((section) => section.id === activeSection) ?? sections[0]

  return (
    <div className="hub-page hub-page--dashboard">
      <h1>Dashboard</h1>
      <div className="hub-dashboard-shell">
        <aside className="hub-dashboard-sidebar">
          <p className="hub-dashboard-sidebar__kicker">Navigation</p>
          <div className="hub-dashboard-sidebar__menu" role="tablist" aria-label="Dashboard sections">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                role="tab"
                aria-selected={currentSection.id === section.id}
                className={`hub-dashboard-sidebar__item${
                  currentSection.id === section.id ? ' hub-dashboard-sidebar__item--active' : ''
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
              </button>
            ))}
=======
  // Determine booking page route based on user role
  const bookingPageRoute = user?.role === 'ADMIN' ? '/bookings' : '/user-bookings'

  // Calculate statistics
  const stats = {
    tickets: {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'OPEN').length,
      inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
      resolved: tickets.filter(t => t.status === 'RESOLVED').length,
    },
    bookings: {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'PENDING').length,
      approved: bookings.filter(b => b.status === 'APPROVED').length,
      rejected: bookings.filter(b => b.status === 'REJECTED').length,
    },
    resources: {
      total: resources.length,
      active: resources.filter(r => r.status === 'ACTIVE').length,
      outOfService: resources.filter(r => r.status === 'OUT_OF_SERVICE').length,
    }
  }

  const isLoading = ticketsLoading || bookingsLoading || resourcesLoading
  const hasError = ticketsError || bookingsError || resourcesError

  if (isLoading) {
    return (
      <div className="hub-page">
        <div className="text-center">
          <LoadingSpinner />
          <p>Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="hub-page">
        <div className="hub-card">
          <h1>Dashboard</h1>
          <div className="text-center text-red-500">
            <p>Error loading dashboard data. Please try again.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="hub-page">
      <h1>Profile</h1>
      
      {/* User Info Card */}
      <div className="hub-card">
        <h2>Welcome, {user?.name}!</h2>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>
        
        <div className="mt-6">
          <h3>Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button 
              className="hub-btn hub-btn--primary"
              onClick={() => navigate('/resources')}
            >
              View Resources
            </button>
            <button 
              className="hub-btn hub-btn--secondary"
              onClick={() => navigate(bookingPageRoute)}
            >
              My Bookings
            </button>
            <button 
              className="hub-btn hub-btn--secondary"
              onClick={() => navigate('/tickets')}
            >
              Support Tickets
            </button>
>>>>>>> 277136eee2e5728305516bcf0bc8384f1c4a6ba3
          </div>

          <button
            type="button"
            className="hub-btn hub-btn--danger hub-dashboard-sidebar__logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </aside>

        <section className="hub-dashboard-panel" role="tabpanel">
          <div className="hub-dashboard-panel__header">
            <div>
              <h2>{currentSection.title}</h2>
              <p className="hub-dashboard-panel__lead">{currentSection.body}</p>
            </div>
            <button
              type="button"
              className="hub-btn hub-btn--primary"
              onClick={currentSection.action}
            >
              {currentSection.actionLabel}
            </button>
          </div>

          <div className="hub-dashboard-panel__body">
            <div className="hub-dashboard-panel__meta">
              {currentSection.meta.map((item) => (
                <div key={item.label} className="hub-dashboard-panel__meta-card">
                  <span className="hub-dashboard-panel__meta-label">{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>

            <div className="hub-dashboard-panel__highlights">
              {currentSection.highlights.map((item) => (
                <article key={item.title} className="hub-dashboard-panel__highlight-card">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Tickets Stats */}
        <div className="hub-card">
          <h3 className="text-lg font-semibold mb-4">Support Tickets</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-semibold">{stats.tickets.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Open:</span>
              <span className="text-yellow-600">{stats.tickets.open}</span>
            </div>
            <div className="flex justify-between">
              <span>In Progress:</span>
              <span className="text-blue-600">{stats.tickets.inProgress}</span>
            </div>
            <div className="flex justify-between">
              <span>Resolved:</span>
              <span className="text-green-600">{stats.tickets.resolved}</span>
            </div>
          </div>
        </div>

        {/* Bookings Stats */}
        <div className="hub-card">
          <h3 className="text-lg font-semibold mb-4">Bookings</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-semibold">{stats.bookings.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending:</span>
              <span className="text-yellow-600">{stats.bookings.pending}</span>
            </div>
            <div className="flex justify-between">
              <span>Approved:</span>
              <span className="text-green-600">{stats.bookings.approved}</span>
            </div>
            <div className="flex justify-between">
              <span>Rejected:</span>
              <span className="text-red-600">{stats.bookings.rejected}</span>
            </div>
          </div>
        </div>

        {/* Resources Stats */}
        <div className="hub-card">
          <h3 className="text-lg font-semibold mb-4">Resources</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-semibold">{stats.resources.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Active:</span>
              <span className="text-green-600">{stats.resources.active}</span>
            </div>
            <div className="flex justify-between">
              <span>Out of Service:</span>
              <span className="text-red-600">{stats.resources.outOfService}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="hub-card">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {/* Recent Tickets */}
            {tickets.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-2">Recent Tickets</h4>
                <div className="space-y-1">
                  {tickets.slice(0, 3).map(ticket => (
                    <div key={ticket.id} className="flex justify-between items-center py-1 border-b">
                      <span className="text-sm">{ticket.title}</span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {ticket.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Bookings */}
            {bookings.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-2">Recent Bookings</h4>
                <div className="space-y-1">
                  {bookings.slice(0, 3).map(booking => (
                    <div key={booking.id} className="flex justify-between items-center py-1 border-b">
                      <span className="text-sm">{booking.resourceName || 'Resource Booking'}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        booking.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
