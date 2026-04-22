import { useMemo, useState, useEffect } from 'react'
import { buildQuery, getJson, putJson } from '../api/client'
import BookingCharts from '../components/BookingCharts'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import ParallaxPanel from '../components/ParallaxPanel'
import Reveal from '../components/Reveal'
import SurfaceCard from '../components/SurfaceCard'
import Tooltip from '../components/Tooltip'

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
    const [items, setItems] = useState([])
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('table') // 'table' or 'charts'
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

  const loadResources = async () => {
    try {
      console.log('Loading resources for charts...')
      const data = await getJson('/api/resources')
      setResources(Array.isArray(data) ? data : [])
    } catch (apiError) {
      console.log('Failed to load resources:', apiError.message)
      setResources([])
    }
  }

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Fetching real data from MongoDB via API')
      const q = buildQuery({
        status: filters.status && filters.status !== 'ALL' ? filters.status : undefined,
        resourceType: filters.resourceType || undefined,
        q: filters.q || undefined,
      })
      const data = await getJson(`/api/bookings${q}`)
      console.log('Real MongoDB data received:', data)
      setItems(Array.isArray(data) ? data : [])
    } catch (apiError) {
      console.log('MongoDB API failed:', apiError.message)
      console.log('Please check:')
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
    loadResources()
  }, [])

  return (
      <main className="flex-1 overflow-y-auto">
        <div className="w-full space-y-8 rounded-[36px] bg-[linear-gradient(180deg,#181A2F_0%,#242E49_52%,#37415C_100%)] p-6 text-white sm:p-8">
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

          <section className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {statConfig.map((card, index) => (
                <Reveal key={card.key} delay={80 + index * 20}>
                  <ParallaxPanel
                    strength={8 + index}
                    className={`hub-lift rounded-[24px] border p-5 shadow-none ${card.tone}`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-90">{card.label}</p>
                    <p className={`mt-3 text-3xl font-semibold ${card.accent}`}>{stats[card.key]}</p>
                  </ParallaxPanel>
                </Reveal>
              ))}
          </section>

          <section className="space-y-6">
            <Reveal delay={130}>
              <SurfaceCard className="space-y-5 !border-[#FDA481] !bg-white !text-[#181A2F] shadow-none">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-[#181A2F]">Booking Analytics</h2>
                    <p className="mt-2 text-sm leading-6 text-[#37415C]">
                      Review all booking requests, approve pending bookings, and manage resource allocations.
                    </p>
                  </div>

                  <div className="flex gap-2" style={{border: '2px solid #FDA481', padding: '8px', borderRadius: '6px', backgroundColor: '#242e49'}}>
                <button
                  type="button"
                  onClick={() => {
                    console.log('Switching to table view');
                    setViewMode('table');
                  }}
                  style={{
                    backgroundColor: viewMode === 'table' ? '#FDA481' : '#37415c',
                    color: '#ffffff',
                    border: '1px solid #FDA481',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginRight: '8px'
                  }}
                >
                  Table View
                </button>
                <button
                  type="button"
                  onClick={() => {
                    console.log('Switching to graph view');
                    setViewMode('charts');
                  }}
                  style={{
                    backgroundColor: viewMode === 'charts' ? '#FDA481' : '#37415c',
                    color: '#ffffff',
                    border: '1px solid #FDA481',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Graph View
                </button>
              </div>
            </div>

            <div>
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
              <>
                {viewMode === 'table' ? (
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
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  booking.status === 'APPROVED' ? 'bg-green-100 text-green-800 border border-green-200' :
                                  booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                  booking.status === 'REJECTED' ? 'bg-red-100 text-red-800 border border-red-200' :
                                  booking.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                                  'bg-gray-100 text-gray-800 border border-gray-200'
                                }`}>
                                  <span className="w-2 h-2 rounded-full mr-1.5 ${
                                    booking.status === 'APPROVED' ? 'bg-green-500' :
                                    booking.status === 'PENDING' ? 'bg-yellow-500' :
                                    booking.status === 'REJECTED' ? 'bg-red-500' :
                                    booking.status === 'CANCELLED' ? 'bg-gray-500' :
                                    'bg-gray-500'
                                  }"></span>
                                  {booking.status}
                                </span>
                              </td>
                              <td className="rounded-r-[18px] bg-white px-4 py-4">
                                <div className="flex gap-2 flex-wrap">
                                  {booking.status === 'PENDING' && (
                                    <>
                                      <button
                                        onClick={() => handleApprove(booking.id)}
                                        disabled={isProcessing === 'approving'}
                                        className="text-xs px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
                                      >
                                        {isProcessing === 'approving' ? (
                                          <span className="flex items-center gap-1">
                                            <span className="animate-spin">⏳</span> Processing...
                                          </span>
                                        ) : (
                                          <span>Approve</span>
                                        )}
                                      </button>
                                      <button
                                        onClick={() => {
                                          const reason = window.prompt('Please provide a reason for rejection:');
                                          if (reason && reason.trim()) {
                                            handleReject(booking.id, reason.trim());
                                          }
                                        }}
                                        disabled={isProcessing === 'rejecting'}
                                        className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
                                      >
                                        {isProcessing === 'rejecting' ? (
                                          <span className="flex items-center gap-1">
                                            <span className="animate-spin">⏳</span> Processing...
                                          </span>
                                        ) : (
                                          <span>Reject</span>
                                        )}
                                      </button>
                                    </>
                                  )}
                                  {(booking.status === 'APPROVED' || booking.status === 'PENDING') && (
                                    <button
                                      onClick={() => {
                                        if (window.confirm('Are you sure you want to cancel this booking?')) {
                                          handleCancel(booking.id);
                                        }
                                      }}
                                      disabled={isProcessing === 'cancelling'}
                                      className="text-xs px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
                                    >
                                      {isProcessing === 'cancelling' ? (
                                        <span className="flex items-center gap-1">
                                          <span className="animate-spin">⏳</span> Processing...
                                        </span>
                                      ) : (
                                        <span>Cancel</span>
                                      )}
                                    </button>
                                  )}
                                  {booking.status === 'APPROVED' && (
                                    <button
                                      onClick={() => {
                                        window.open(`/booking-check-in?booking=${booking.id}`, '_blank');
                                      }}
                                      className="text-xs px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm"
                                    >
                                      <span>Check-in</span>
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
                ) : (
                  <div className="space-y-6 min-h-[600px] w-full">
                    <div className="w-full h-[500px] bg-white rounded-[24px] border border-[#37415C] p-6 shadow-lg">
                      <h3 className="text-xl font-semibold text-[#181A2F] mb-4">Booking Analytics & Charts</h3>
                      <div className="w-full h-[420px] overflow-hidden">
                        <BookingCharts bookings={filteredItems} resources={resources} />
                      </div>
                    </div>
                    
                    {/* Admin-specific quick actions for chart view */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900">Admin Quick Actions</h4>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        <button
                          onClick={() => setFilters({ ...filters, status: 'PENDING' })}
                          className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 text-sm"
                        >
                          View Pending ({stats.pending})
                        </button>
                        <button
                          onClick={() => setFilters({ ...filters, status: 'APPROVED' })}
                          className="px-3 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200 text-sm"
                        >
                          View Approved ({stats.approved})
                        </button>
                        <button
                          onClick={() => setFilters({ ...filters, status: 'REJECTED' })}
                          className="px-3 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm"
                        >
                          View Rejected ({stats.rejected})
                        </button>
                        <button
                          onClick={() => setFilters({ ...filters, status: 'ALL' })}
                          className="px-3 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-sm"
                        >
                          View All ({filteredItems.length})
                        </button>
                      </div>
                    </div>

                    {/* Summary table for chart view */}
                    <div className="overflow-x-auto rounded-[24px] border border-[#37415C] bg-[#242E49] p-2">
                      <h4 className="text-white font-semibold mb-3 px-4">Recent Bookings Summary</h4>
                      <table className="min-w-full border-separate border-spacing-y-2">
                        <thead>
                          <tr className="text-left text-sm text-[#FDA481]">
                            <th className="px-4 py-3 font-semibold">Resource</th>
                            <th className="px-4 py-3 font-semibold">Booked by</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="px-4 py-3 font-semibold">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredItems.slice(0, 10).map((booking, index) => (
                            <tr
                              key={booking.id}
                              className="align-top transition"
                              style={{ animationDelay: `${index * 30}ms` }}
                            >
                              <td className="rounded-l-[18px] bg-white px-4 py-3 text-sm text-[#181A2F]">
                                {booking.resourceName || 'Unknown Resource'}
                              </td>
                              <td className="bg-white px-4 py-3 text-sm text-[#181A2F]">
                                {booking.bookedBy || 'Unknown User'}
                              </td>
                              <td className="bg-white px-4 py-3">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  booking.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                  booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                  booking.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {booking.status}
                                </span>
                              </td>
                              <td className="rounded-r-[18px] bg-white px-4 py-3 text-sm text-[#181A2F]">
                                {formatDate(booking.startDateTime)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </SurfaceCard>
        </Reveal>
          </section>

          {/* Graph View - Full Width Section */}
          {viewMode === 'charts' && !loading && !error && filteredItems.length > 0 && (
            <Reveal delay={140}>
              <section className="w-full space-y-6">
                <div className="w-full bg-white rounded-[24px] border border-[#37415C] p-6 shadow-lg">
                  <h3 className="text-xl font-semibold text-[#181A2F] mb-6">Booking Analytics & Charts</h3>
                  <div className="w-full">
                    <BookingCharts bookings={filteredItems} resources={resources} />
                  </div>
                </div>
                  
                {/* Admin-specific quick actions for chart view */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900">Admin Quick Actions</h4>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <button
                      onClick={() => setFilters({ ...filters, status: 'PENDING' })}
                      className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 text-sm"
                    >
                      View Pending ({stats.pending})
                    </button>
                    <button
                      onClick={() => setFilters({ ...filters, status: 'APPROVED' })}
                      className="px-3 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200 text-sm"
                    >
                      View Approved ({stats.approved})
                    </button>
                    <button
                      onClick={() => setFilters({ ...filters, status: 'REJECTED' })}
                      className="px-3 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm"
                    >
                      View Rejected ({stats.rejected})
                    </button>
                    <button
                      onClick={() => setFilters({ ...filters, status: 'ALL' })}
                      className="px-3 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-sm"
                    >
                      View All ({filteredItems.length})
                    </button>
                  </div>
                </div>

                {/* Summary table for chart view */}
                <div className="overflow-x-auto rounded-[24px] border border-[#37415C] bg-[#242E49] p-2">
                  <h4 className="text-white font-semibold mb-3 px-4">Recent Bookings Summary</h4>
                  <table className="min-w-full border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-left text-sm text-[#FDA481]">
                        <th className="px-4 py-3 font-semibold">Resource</th>
                        <th className="px-4 py-3 font-semibold">Booked by</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.slice(0, 10).map((booking, index) => (
                        <tr
                          key={booking.id}
                          className="align-top transition"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <td className="rounded-l-[18px] bg-white px-4 py-3 text-sm text-[#181A2F]">
                            {booking.resourceName || 'Unknown Resource'}
                          </td>
                          <td className="bg-white px-4 py-3 text-sm text-[#181A2F]">
                            {booking.bookedBy || 'Unknown User'}
                          </td>
                          <td className="bg-white px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              booking.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                              booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="rounded-r-[18px] bg-white px-4 py-3 text-sm text-[#181A2F]">
                            {formatDate(booking.startDateTime)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </Reveal>
          )}

      <section className="space-y-6">
        <Reveal delay={160} className="space-y-6">
          <SurfaceCard className="!border-[#FDA481] !bg-white !text-[#181A2F] shadow-none">
            <h3 className="text-lg font-semibold text-[#181A2F]">Quick Actions</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">Pending Approvals</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      {stats.pending} booking{stats.pending !== 1 ? 's' : ''} waiting for approval
                    </p>
                  </div>
                  {stats.pending > 0 && (
                    <button
                      onClick={() => setFilters({ ...filters, status: 'PENDING' })}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                    >
                      Review Now
                    </button>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-green-900">Today's Schedule</h4>
                    <p className="text-sm text-green-700 mt-1">
                      {stats.today} booking{stats.today !== 1 ? 's' : ''} scheduled for today
                    </p>
                  </div>
                  {stats.today > 0 && (
                    <button
                      onClick={() => {
                        const today = new Date().toISOString().split('T')[0];
                        setFilters({ ...filters, q: today });
                      }}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                    >
                      View Today
                    </button>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-purple-900">Weekly Overview</h4>
                    <p className="text-sm text-purple-700 mt-1">
                      {stats.thisWeek} booking{stats.thisWeek !== 1 ? 's' : ''} this week
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-900">{stats.thisWeek}</div>
                    <div className="text-xs text-purple-600">Total this week</div>
                  </div>
                </div>
              </div>

              {/* Bulk Actions */}
              {stats.pending > 0 && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-medium text-amber-900 mb-3">Bulk Actions</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const pendingBookings = filteredItems.filter(b => b.status === 'PENDING');
                        if (window.confirm(`Approve all ${pendingBookings.length} pending bookings?`)) {
                          pendingBookings.forEach(booking => {
                            handleApprove(booking.id);
                          });
                        }
                      }}
                      className="px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium transition-colors"
                    >
                      Approve All ({stats.pending})
                    </button>
                    <button
                      onClick={() => setFilters({ ...filters, status: 'ALL' })}
                      className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors"
                    >
                      View All
                    </button>
                  </div>
                </div>
              )}
            </div>
          </SurfaceCard>
        </Reveal>
      </section>
        </div>
      </main>
  )
}

