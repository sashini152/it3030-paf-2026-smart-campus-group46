import { useMemo, useState, useEffect } from 'react'
import { getJson } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import ParallaxPanel from '../components/ParallaxPanel'
import Reveal from '../components/Reveal'
import SurfaceCard from '../components/SurfaceCard'
import Tooltip from '../components/Tooltip'

const statConfig = [
  { key: 'myBookings', label: 'My Bookings', accent: 'text-[#181A2F]', tone: 'border-[#242E49] bg-white text-[#181A2F]' },
  { key: 'pending', label: 'Pending', accent: 'text-white', tone: 'border-[#37415C] bg-[#242E49] text-white' },
  { key: 'approved', label: 'Approved', accent: 'text-[#181A2F]', tone: 'border-[#FDA481] bg-[#FDA481] text-[#181A2F]' },
  { key: 'availableResources', label: 'Available Resources', accent: 'text-white', tone: 'border-[#54162B] bg-[#54162B] text-white' },
  { key: 'myTickets', label: 'My Tickets', accent: 'text-white', tone: 'border-[#B4182D] bg-[#B4182D] text-white' },
  { key: 'openTickets', label: 'Open Tickets', accent: 'text-white', tone: 'border-[#37415C] bg-[#37415C] text-white' },
]

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function UserDashboard() {
  const { user } = useAuth()
  const [myBookings, setMyBookings] = useState([])
  const [myTickets, setMyTickets] = useState([])
  const [availableResources, setAvailableResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Calculate statistics
  const stats = useMemo(() => {
    const pending = myBookings.filter(b => b.status === 'PENDING').length
    const approved = myBookings.filter(b => b.status === 'APPROVED').length
    const available = availableResources.filter(r => r.status === 'ACTIVE').length
    const ticketCount = myTickets.length
    const openTickets = myTickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length
    
    return {
      myBookings: myBookings.length,
      pending,
      approved,
      availableResources: available,
      myTickets: ticketCount,
      openTickets
    }
  }, [myBookings, myTickets, availableResources])

  // Fetch user-specific data
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch user bookings
        const bookingsData = await getJson('/api/bookings')
        const userBookings = Array.isArray(bookingsData) 
          ? bookingsData.filter(booking => booking.bookedEmail === user?.email)
          : []
        setMyBookings(userBookings)

        // Fetch user tickets
        const ticketsData = await getJson('/api/tickets')
        const userTickets = Array.isArray(ticketsData)
          ? ticketsData.filter(ticket => ticket.createdBy === user?.email)
          : []
        setMyTickets(userTickets)

        // Fetch available resources
        const resourcesData = await getJson('/api/resources')
        const activeResources = Array.isArray(resourcesData)
          ? resourcesData.filter(resource => resource.status === 'ACTIVE')
          : []
        setAvailableResources(activeResources)

      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    if (user?.email) {
      loadUserData()
    }
  }, [user?.email])

  // Get recent activities
  const recentBookings = useMemo(() => {
    return [...myBookings]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5)
  }, [myBookings])

  const recentTickets = useMemo(() => {
    return [...myTickets]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5)
  }, [myTickets])

  return (
    <div className="hub-page hub-ticket-flow space-y-8 rounded-[36px] bg-[linear-gradient(180deg,#181A2F_0%,#242E49_52%,#37415C_100%)] p-6 text-white sm:p-8">
      <Reveal delay={30}>
        <section className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FDA481]">
            User Dashboard
          </p>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="max-w-3xl text-base leading-7 text-white">
              Manage your bookings, track support tickets, and explore available campus resources.
              Your personal dashboard shows all your activities and quick access to campus services.
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal className="grid gap-4 md:grid-cols-2 xl:grid-cols-6" delay={80}>
        {statConfig.map((card, index) => (
          <ParallaxPanel
            key={card.key}
            strength={8 + index}
            className={`hub-lift rounded-[24px] border p-5 shadow-none ${card.tone}`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-90">{card.label}</p>
            <p className={`mt-3 text-3xl font-semibold ${card.accent}`}>{stats[card.key]}</p>
          </ParallaxPanel>
        ))}
      </Reveal>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Reveal delay={130}>
          <SurfaceCard className="space-y-5 !border-[#FDA481] !bg-white !text-[#181A2F] shadow-none">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#181A2F]">Your Recent Activity</h2>
                <p className="mt-2 text-sm leading-6 text-[#37415C]">
                  Your latest bookings and support tickets. Track the status of your requests.
                </p>
              </div>
            </div>

            {loading && <LoadingSpinner label="Loading your data..." tone="ticket" />}

            {error && !loading && (
              <EmptyState
                title="Unable to load your data"
                description={error.message || 'Please try refreshing the page.'}
                tone="ticket"
              />
            )}

            {!loading && !error && (
              <div className="space-y-6">
                {/* Recent Bookings */}
                <div>
                  <h3 className="text-lg font-medium text-[#181A2F] mb-3">Recent Bookings</h3>
                  {recentBookings.length === 0 ? (
                    <div className="text-center py-4 text-[#37415C]">
                      <p className="text-sm">No bookings yet</p>
                      <a href="/user-bookings" className="inline-block mt-2 text-sm text-[#B4182D] hover:underline">
                        Create your first booking
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentBookings.map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-[#242E49] rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-white">{booking.resourceName || 'Resource'}</p>
                            <p className="text-xs text-[#FDA481]">{formatDate(booking.startDateTime)}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            booking.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Tickets */}
                <div>
                  <h3 className="text-lg font-medium text-[#181A2F] mb-3">Recent Support Tickets</h3>
                  {recentTickets.length === 0 ? (
                    <div className="text-center py-4 text-[#37415C]">
                      <p className="text-sm">No support tickets yet</p>
                      <a href="/tickets" className="inline-block mt-2 text-sm text-[#B4182D] hover:underline">
                        Create a support ticket
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentTickets.map((ticket) => (
                        <div key={ticket.id} className="flex items-center justify-between p-3 bg-[#242E49] rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-white">{ticket.title || 'Untitled'}</p>
                            <p className="text-xs text-[#FDA481]">{formatDate(ticket.createdAt)}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            ticket.status === 'OPEN' ? 'bg-amber-100 text-amber-800' :
                            ticket.status === 'IN_PROGRESS' ? 'bg-sky-100 text-sky-800' :
                            ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </SurfaceCard>
        </Reveal>

        <Reveal delay={160} className="space-y-6">
          <SurfaceCard className="!border-[#FDA481] !bg-white !text-[#181A2F] shadow-none">
            <h3 className="text-lg font-semibold text-[#181A2F]">Quick Actions</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">New Booking</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Reserve campus resources for your needs
                </p>
                <a href="/user-bookings" className="inline-block mt-2 text-sm text-blue-600 hover:underline">
                  Create Booking →
                </a>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900">Browse Resources</h4>
                <p className="text-sm text-green-700 mt-1">
                  {stats.availableResources} resources available
                </p>
                <a href="/resources" className="inline-block mt-2 text-sm text-green-600 hover:underline">
                  Explore Resources →
                </a>
              </div>
              
              <div className="p-4 bg-amber-50 rounded-lg">
                <h4 className="font-medium text-amber-900">Support Request</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Get help with campus services
                </p>
                <a href="/tickets" className="inline-block mt-2 text-sm text-amber-600 hover:underline">
                  Create Ticket →
                </a>
              </div>
            </div>
          </SurfaceCard>
        </Reveal>
      </section>
    </div>
  )
}
