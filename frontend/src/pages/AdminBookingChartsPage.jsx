import { useMemo, useState, useEffect } from 'react'
import { buildQuery, getJson } from '../api/client'
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

export default function AdminBookingChartsPage() {
  const [items, setItems] = useState([])
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('charts') // 'table' or 'charts'
  const [filters, setFilters] = useState({
    status: 'ALL',
    resourceType: '',
    q: '',
  })

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
      console.log('Fetching booking data for charts...')
      const q = buildQuery({
        status: filters.status && filters.status !== 'ALL' ? filters.status : undefined,
        resourceType: filters.resourceType || undefined,
        q: filters.q || undefined,
      })
      const data = await getJson(`/api/bookings${q}`)
      console.log('Booking data received:', data)
      setItems(Array.isArray(data) ? data : [])
    } catch (apiError) {
      console.log('Failed to load bookings:', apiError.message)
      setError(`Failed to load bookings: ${apiError.message}`)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    loadResources()
  }, [filters])

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden">
      <div className="w-full space-y-4 rounded-[24px] bg-[linear-gradient(180deg,#181A2F_0%,#242E49_52%,#37415C_100%)] p-4 text-white sm:p-6">
        <Reveal delay={30}>
          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FDA481]">
              Booking Analytics
            </p>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Booking Charts
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-white">
                Visual analytics for booking patterns and resource utilization.
              </p>
            </div>
          </section>
        </Reveal>

        <section className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {statConfig.map((card, index) => (
            <Reveal key={card.key} delay={80 + index * 20}>
              <ParallaxPanel
                strength={8 + index}
                className={`hub-lift rounded-[16px] border p-3 shadow-none ${card.tone}`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-90">{card.label}</p>
                <p className={`mt-2 text-2xl font-semibold ${card.accent}`}>{stats[card.key]}</p>
              </ParallaxPanel>
            </Reveal>
          ))}
        </section>

        <section className="space-y-4">
          <Reveal delay={130}>
            <SurfaceCard className="space-y-3 !border-[#FDA481] !bg-white !text-[#181A2F] shadow-none">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#181A2F]">Filters</h2>
                  <p className="mt-1 text-sm leading-5 text-[#37415C]">
                    Customize charts by filtering booking data.
                  </p>
                </div>
                <div className="flex gap-2" style={{border: '2px solid #FDA481', padding: '8px', borderRadius: '6px', backgroundColor: '#242e49'}}>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
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
                    onClick={() => setViewMode('charts')}
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
                    Chart View
                  </button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="block">
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
                      className="hub-button-pop mt-1 w-full rounded-lg border border-[#37415C] bg-white px-3 py-2 text-sm text-[#181A2F] outline-none transition focus:border-[#B4182D]"
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

                <div>
                  <label className="block">
                    <span className="text-sm font-medium text-[#181A2F]">Resource Type</span>
                    <input
                      type="text"
                      value={filters.resourceType}
                      onChange={(event) => setFilters({ ...filters, resourceType: event.target.value })}
                      placeholder="e.g. LECTURE_HALL"
                      className="hub-button-pop mt-1 w-full rounded-lg border border-[#37415C] bg-white px-3 py-2 text-sm text-[#181A2F] outline-none transition focus:border-[#B4182D]"
                    />
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-sm font-medium text-[#181A2F]">Search</span>
                    <input
                      type="text"
                      value={filters.q}
                      onChange={(event) => setFilters({ ...filters, q: event.target.value })}
                      placeholder="Resource, user, or purpose..."
                      className="hub-button-pop mt-1 w-full rounded-lg border border-[#37415C] bg-white px-3 py-2 text-sm text-[#181A2F] outline-none transition focus:border-[#B4182D]"
                    />
                  </label>
                </div>
              </div>

              {loading && <LoadingSpinner label="Loading booking data..." tone="ticket" />}

              {error && !loading && (
                <EmptyState
                  title="Booking data is unavailable"
                  description={error || 'The booking service did not respond successfully.'}
                  tone="ticket"
                />
              )}

              {!loading && !error && filteredItems.length === 0 && (
                <EmptyState
                  title="No bookings match this filter"
                  description="Try adjusting your filters or check back later for new booking data."
                  tone="ticket"
                />
              )}
            </SurfaceCard>
          </Reveal>
        </section>

        {/* Table and Charts Section */}
        {!loading && !error && filteredItems.length > 0 && (
          <Reveal delay={140}>
            <section className="w-full space-y-6">
              {viewMode === 'table' ? (
                <div className="overflow-x-auto rounded-[24px] border border-[#37415C] bg-[#242E49] p-2">
                  <div className="flex items-center justify-between mb-4 px-4">
                    <h3 className="text-xl font-semibold text-white">Booking Table</h3>
                    <div className="text-sm text-[#FDA481]">
                      Showing {filteredItems.length} of {items.length} bookings
                    </div>
                  </div>
                  <table className="min-w-full border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-left text-sm text-[#FDA481]">
                        <th className="px-4 py-3 font-semibold">Booking</th>
                        <th className="px-4 py-3 font-semibold">Resource</th>
                        <th className="px-4 py-3 font-semibold">Booked by</th>
                        <th className="px-4 py-3 font-semibold">Time</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((booking, index) => (
                        <tr
                          key={booking.id}
                          className="align-top transition"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <td className="rounded-l-[18px] bg-white px-4 py-3">
                            <div className="text-sm font-semibold text-[#181A2F]">
                              {booking.purpose || 'Resource Booking'}
                            </div>
                            <p className="mt-1 max-w-[28ch] text-xs leading-5 text-[#37415C]">
                              {booking.notes || 'No additional notes'}
                            </p>
                          </td>
                          <td className="bg-white px-4 py-3 text-sm text-[#181A2F]">
                            <div className="font-medium">{booking.resourceName || 'Unknown Resource'}</div>
                            <div className="text-xs text-[#37415C]">{booking.resourceType || ''}</div>
                          </td>
                          <td className="bg-white px-4 py-3 text-sm text-[#181A2F]">
                            <div className="font-medium">{booking.bookedBy || 'Unknown User'}</div>
                            <div className="text-xs text-[#37415C]">{booking.bookedEmail || ''}</div>
                          </td>
                          <td className="bg-white px-4 py-3 text-sm text-[#181A2F]">
                            <div className="font-medium">{formatDate(booking.startDateTime)}</div>
                            <div className="text-xs text-[#37415C]">to {formatDate(booking.endDateTime)}</div>
                          </td>
                          <td className="rounded-r-[18px] bg-white px-4 py-3">
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="w-full bg-white rounded-[24px] border border-[#37415C] p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-[#181A2F]">Booking Analytics & Charts</h3>
                    <div className="text-sm text-[#37415C]">
                      Showing {filteredItems.length} of {items.length} bookings
                    </div>
                  </div>
                  <div className="w-full">
                    <BookingCharts bookings={filteredItems} resources={resources} />
                  </div>
                </div>
              )}
              
              {/* Quick Actions */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900">Quick Filters</h4>
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

              {/* Recent Bookings Summary */}
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
      </div>
    </main>
  )
}