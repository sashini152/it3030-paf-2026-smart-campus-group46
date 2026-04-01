import { useMemo, useState, useEffect } from 'react'
import { buildQuery, getJson, putJson } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { useLocation } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import ParallaxPanel from '../components/ParallaxPanel'
import Reveal from '../components/Reveal'
import SurfaceCard from '../components/SurfaceCard'
import Tooltip from '../components/Tooltip'
import AdminSidebar from '../components/AdminSidebar'

const STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

const statConfig = [
  { key: 'pending', label: 'Pending', accent: 'text-[#181A2F]', tone: 'border-[#242E49] bg-white text-[#181A2F]' },
  { key: 'approved', label: 'Approved', accent: 'text-white', tone: 'border-[#37415C] bg-[#242E49] text-white' },
  { key: 'rejected', label: 'Rejected', accent: 'text-[#181A2F]', tone: 'border-[#FDA481] bg-[#FDA481] text-[#181A2F]' },
  { key: 'cancelled', label: 'Cancelled', accent: 'text-white', tone: 'border-[#54162B] bg-[#54162B] text-white' },
  { key: 'today', label: 'Today', accent: 'text-white', tone: 'border-[#B4182D] bg-[#B4182D] text-white' },
  { key: 'thisWeek', label: 'This Week', accent: 'text-white', tone: 'border-[#37415C] bg-[#37415C] text-white' },
]

function formatFilterLabel(status) {
  return status === 'ALL' ? 'All statuses' : status.replaceAll('_', ' ')
}

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

function isToday(date) {
  const today = new Date()
  const checkDate = new Date(date)
  return checkDate.toDateString() === today.toDateString()
}

function isThisWeek(date) {
  const today = new Date()
  const checkDate = new Date(date)
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
  const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6))
  return checkDate >= weekStart && checkDate <= weekEnd
}

export default function AdminBookingsDashboard() {
  const { user } = useAuth()
  const location = useLocation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    status: 'ALL',
    resourceType: '',
    q: '',
  })
  const [hoveredBookingId, setHoveredBookingId] = useState(null)
  const [processing, setProcessing] = useState({})

  // Calculate statistics
  const stats = useMemo(() => {
    const pending = items.filter(b => b.status === 'PENDING').length
    const approved = items.filter(b => b.status === 'APPROVED').length
    const rejected = items.filter(b => b.status === 'REJECTED').length
    const cancelled = items.filter(b => b.status === 'CANCELLED').length
    const today = items.filter(b => isToday(b.startDateTime)).length
    const thisWeek = items.filter(b => isThisWeek(b.startDateTime)).length
    
    return {
      pending,
      approved,
      rejected,
      cancelled,
      today,
      thisWeek
    }
  }, [items])

  // Filter items based on filters
  const filteredItems = useMemo(() => {
    let filtered = items
    
    // Apply status filter
    if (filters.status && filters.status !== 'ALL') {
      filtered = filtered.filter(item => item.status === filters.status)
    }
    
    // Apply resource type filter
    if (filters.resourceType) {
      filtered = filtered.filter(item => 
        item.resourceType?.toLowerCase().includes(filters.resourceType.toLowerCase())
      )
    }
    
    // Apply search filter
    if (filters.q) {
      const query = filters.q.toLowerCase()
      filtered = filtered.filter(item => 
        item.resourceName?.toLowerCase().includes(query) ||
        item.bookedBy?.toLowerCase().includes(query) ||
        item.purpose?.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }, [items, filters])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('🌐 Fetching real data from MongoDB via API')
      const q = buildQuery({
        status: filters.status && filters.status !== 'ALL' ? filters.status : undefined,
        resourceType: filters.resourceType || undefined,
        q: filters.q || undefined,
      })
      const data = await getJson(`/api/bookings${q}`)
      console.log('✅ Real MongoDB data received:', data)
      setItems(Array.isArray(data) ? data : [])
    } catch (apiError) {
      console.log('❌ MongoDB API failed:', apiError.message)
      console.log('� Please check:')
      console.log('   1. Backend is running on port 8081')
      console.log('   2. API endpoints are implemented')
      console.log('   3. OAuth authentication is completed')
      console.log('   4. Database has booking data')
      setError(`Failed to load bookings: ${apiError.message}`)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (bookingId) => {
    setProcessing(prev => ({ ...prev, [bookingId]: 'approving' }))
    try {
      console.log(`🔄 Approving booking ${bookingId} via MongoDB API`)
      await putJson(`/api/bookings/${bookingId}/approve`)
      console.log('✅ Booking approved successfully')
      await load()
    } catch (apiError) {
      console.log('❌ Failed to approve booking:', apiError.message)
      setError(`Failed to approve booking: ${apiError.message}`)
    } finally {
      setProcessing(prev => ({ ...prev, [bookingId]: null }))
    }
  }

  const handleReject = async (bookingId, reason = 'Rejected by admin') => {
    setProcessing(prev => ({ ...prev, [bookingId]: 'rejecting' }))
    try {
      console.log(`🔄 Rejecting booking ${bookingId} via MongoDB API`)
      await putJson(`/api/bookings/${bookingId}/reject`, { reason })
      console.log('✅ Booking rejected successfully')
      await load()
    } catch (apiError) {
      console.log('❌ Failed to reject booking:', apiError.message)
      setError(`Failed to reject booking: ${apiError.message}`)
    } finally {
      setProcessing(prev => ({ ...prev, [bookingId]: null }))
    }
  }

  const handleCancel = async (bookingId) => {
    setProcessing(prev => ({ ...prev, [bookingId]: 'cancelling' }))
    try {
      console.log(`🔄 Cancelling booking ${bookingId} via MongoDB API`)
      await putJson(`/api/bookings/${bookingId}/cancel`)
      console.log('✅ Booking cancelled successfully')
      await load()
    } catch (apiError) {
      console.log('❌ Failed to cancel booking:', apiError.message)
      setError(`Failed to cancel booking: ${apiError.message}`)
    } finally {
      setProcessing(prev => ({ ...prev, [bookingId]: null }))
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-72 shrink-0 border-r border-white/70 bg-white/85 px-6 py-8 backdrop-blur xl:block">
        <AdminSidebar currentPage={location.pathname} />
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="hub-page hub-ticket-flow space-y-8 rounded-[36px] bg-[linear-gradient(180deg,#181A2F_0%,#242E49_52%,#37415C_100%)] p-6 text-white sm:p-8">
          <Reveal delay={30}>
            <section className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FDA481]">
                Booking Management Dashboard
              </p>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Manage all booking requests
                </h1>
                <p className="max-w-3xl text-base leading-7 text-white">
                  Review booking requests from all users, approve or reject pending bookings, and monitor 
                  resource utilization. Filter by status and search for specific bookings.
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
                <h2 className="text-xl font-semibold text-[#181A2F]">Booking requests</h2>
                <p className="mt-2 text-sm leading-6 text-[#37415C]">
                  Review all booking requests, approve pending bookings, and manage resource allocations.
                </p>
              </div>

              <label className="block min-w-[220px]">
                <span className="flex items-center gap-2 text-sm font-medium text-[#181A2F]">
                  <span>Filter by status</span>
                  <Tooltip text="Filter bookings by status to focus on specific workflows." tone="ticket">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#B4182D] bg-white text-[11px] font-semibold text-[#B4182D]">
                      i
                    </span>
                  </Tooltip>
                </span>
                <select
                  value={filters.status}
                  onChange={(event) => setFilters({ ...filters, status: event.target.value })}
                  className="hub-button-pop mt-2 w-full rounded-2xl border border-[#37415C] bg-white px-4 py-3 text-sm text-[#181A2F] outline-none transition focus:border-[#B4182D]"
                >
                  <option value="ALL">All statuses</option>
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {formatFilterLabel(status)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {loading && <LoadingSpinner label="Loading bookings..." tone="ticket" />}

            {error && !loading && (
              <EmptyState
                title="Booking list is unavailable"
                description={error.message || 'The booking service did not respond successfully.'}
                tone="ticket"
              />
            )}

            {!loading && !error && filteredItems.length === 0 && (
              <EmptyState
                title="No bookings match this filter"
                description="Try another status filter or check back later for new booking requests."
                tone="ticket"
              />
            )}

            {!loading && !error && filteredItems.length > 0 && (
              <div className="overflow-x-auto rounded-[24px] border border-[#37415C] bg-[#242E49] p-2">
                <table className="min-w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-left text-sm text-[#FDA481]">
                      <th className="px-4 py-3 font-semibold">Booking</th>
                      <th className="px-4 py-3 font-semibold">Resource</th>
                      <th className="px-4 py-3 font-semibold">Booked by</th>
                      <th className="px-4 py-3 font-semibold">Time</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((booking, index) => {
                      const hovered = hoveredBookingId === booking.id
                      const isProcessing = processing[booking.id]

                      return (
                        <tr
                          key={booking.id}
                          onMouseEnter={() => setHoveredBookingId(booking.id)}
                          onMouseLeave={() => setHoveredBookingId(null)}
                          className={`hub-ticket-list-row align-top transition ${hovered ? 'hub-ticket-list-row--active' : ''}`}
                          style={{ animationDelay: `${index * 55}ms` }}
                        >
                          <td className="rounded-l-[18px] bg-white px-4 py-4">
                            <div className="text-sm font-semibold text-[#181A2F]">
                              {booking.purpose || 'Resource Booking'}
                            </div>
                            <p className="mt-1 max-w-[28ch] text-xs leading-5 text-[#37415C]">
                              {booking.notes || 'No additional notes'}
                            </p>
                          </td>
                          <td className="bg-white px-4 py-4 text-sm text-[#181A2F]">
                            <div className="font-medium">{booking.resourceName || 'Unknown Resource'}</div>
                            <div className="text-xs text-[#37415C]">{booking.resourceType || ''}</div>
                          </td>
                          <td className="bg-white px-4 py-4 text-sm text-[#181A2F]">
                            <div className="font-medium">{booking.bookedBy || 'Unknown User'}</div>
                            <div className="text-xs text-[#37415C]">{booking.bookedEmail || ''}</div>
                          </td>
                          <td className="bg-white px-4 py-4 text-sm text-[#181A2F]">
                            <div className="font-medium">{formatDate(booking.startDateTime)}</div>
                            <div className="text-xs text-[#37415C]">to {formatDate(booking.endDateTime)}</div>
                          </td>
                          <td className="bg-white px-4 py-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              booking.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                              booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="rounded-r-[18px] bg-white px-4 py-4">
                            <div className="flex gap-2">
                              {booking.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(booking.id)}
                                    disabled={isProcessing === 'approving'}
                                    className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 disabled:opacity-50"
                                  >
                                    {isProcessing === 'approving' ? '...' : 'Approve'}
                                  </button>
                                  <button
                                    onClick={() => handleReject(booking.id)}
                                    disabled={isProcessing === 'rejecting'}
                                    className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 disabled:opacity-50"
                                  >
                                    {isProcessing === 'rejecting' ? '...' : 'Reject'}
                                  </button>
                                </>
                              )}
                              {(booking.status === 'APPROVED' || booking.status === 'PENDING') && (
                                <button
                                  onClick={() => handleCancel(booking.id)}
                                  disabled={isProcessing === 'cancelling'}
                                  className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 disabled:opacity-50"
                                >
                                  {isProcessing === 'cancelling' ? '...' : 'Cancel'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SurfaceCard>
        </Reveal>

        <Reveal delay={160} className="space-y-6">
          <SurfaceCard className="!border-[#FDA481] !bg-white !text-[#181A2F] shadow-none">
            <h3 className="text-lg font-semibold text-[#181A2F]">Quick Actions</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">Pending Approvals</h4>
                <p className="text-sm text-blue-700 mt-1">
                  {stats.pending} booking{stats.pending !== 1 ? 's' : ''} waiting for approval
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900">Today's Schedule</h4>
                <p className="text-sm text-green-700 mt-1">
                  {stats.today} booking{stats.today !== 1 ? 's' : ''} scheduled for today
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900">Weekly Overview</h4>
                <p className="text-sm text-purple-700 mt-1">
                  {stats.thisWeek} booking{stats.thisWeek !== 1 ? 's' : ''} this week
                </p>
              </div>
            </div>
          </SurfaceCard>
        </Reveal>
      </section>
        </div>
      </main>
    </div>
  )
}
