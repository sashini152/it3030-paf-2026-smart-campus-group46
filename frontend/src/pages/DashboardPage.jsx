import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useTickets } from '../hooks/useTickets'
import { useBookings } from '../hooks/useBookings'
import { useResources } from '../hooks/useResources'
import LoadingSpinner from '../components/LoadingSpinner'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { tickets, loading: ticketsLoading, error: ticketsError } = useTickets()
  const { bookings, loading: bookingsLoading, error: bookingsError } = useBookings()
  const { resources, loading: resourcesLoading, error: resourcesError } = useResources()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

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
          </div>
        </div>
        
        <div className="mt-6">
          <button 
            className="hub-btn hub-btn--danger"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
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
