import { useMemo, useState, useEffect, useCallback } from 'react'
import { buildQuery, deleteRequest, getJson, postJson, putJson } from '../api/client'
import { useLocation } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import ParallaxPanel from '../components/ParallaxPanel'
import Reveal from '../components/Reveal'
import SurfaceCard from '../components/SurfaceCard'
import Tooltip from '../components/Tooltip'
import AdminSidebar from '../components/AdminSidebar'
import ResourceCharts from '../components/ResourceCharts'

const TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT']
const STATUSES = ['ACTIVE', 'OUT_OF_SERVICE']

const statConfig = [
  { key: 'active', label: 'Active', accent: 'text-[#181A2F]', tone: 'border-[#242E49] bg-white text-[#181A2F]' },
  { key: 'outOfService', label: 'Out of Service', accent: 'text-white', tone: 'border-[#37415C] bg-[#242E49] text-white' },
  { key: 'lectureHall', label: 'Lecture Halls', accent: 'text-[#181A2F]', tone: 'border-[#FDA481] bg-[#FDA481] text-[#181A2F]' },
  { key: 'lab', label: 'Labs', accent: 'text-white', tone: 'border-[#54162B] bg-[#54162B] text-white' },
  { key: 'meetingRoom', label: 'Meeting Rooms', accent: 'text-white', tone: 'border-[#B4182D] bg-[#B4182D] text-white' },
  { key: 'equipment', label: 'Equipment', accent: 'text-white', tone: 'border-[#37415C] bg-[#37415C] text-white' },
]

function formatFilterLabel(status) {
  return status === 'ALL' ? 'All types' : status.replaceAll('_', ' ')
}

const emptyForm = {
  type: 'LECTURE_HALL',
  name: '',
  capacity: 0,
  location: '',
  availabilityWindows: '',
  status: 'ACTIVE',
}

export default function AdminResourcesPage() {
  const location = useLocation()
  const [items, setItems] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    type: 'ALL',
    location: '',
    minCapacity: '',
    q: '',
  })
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [hoveredResourceId, setHoveredResourceId] = useState(null)

  // Calculate statistics
  const stats = useMemo(() => {
    const active = items.filter(r => r.status === 'ACTIVE').length
    const outOfService = items.filter(r => r.status === 'OUT_OF_SERVICE').length
    const lectureHall = items.filter(r => r.type === 'LECTURE_HALL').length
    const lab = items.filter(r => r.type === 'LAB').length
    const meetingRoom = items.filter(r => r.type === 'MEETING_ROOM').length
    const equipment = items.filter(r => r.type === 'EQUIPMENT').length
    
    return {
      active,
      outOfService,
      lectureHall,
      lab,
      meetingRoom,
      equipment
    }
  }, [items])

  // Filter items based on filters
  const filteredItems = useMemo(() => {
    let filtered = items
    
    // Apply type filter
    if (filters.type && filters.type !== 'ALL') {
      filtered = filtered.filter(item => item.type === filters.type)
    }
    
    // Apply other filters
    if (filters.location) {
      filtered = filtered.filter(item => 
        item.location?.toLowerCase().includes(filters.location.toLowerCase())
      )
    }
    
    if (filters.minCapacity) {
      filtered = filtered.filter(item => item.capacity >= parseInt(filters.minCapacity))
    }
    
    if (filters.q) {
      const query = filters.q.toLowerCase()
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(query) ||
        item.location?.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }, [items, filters])

  const loadBookings = async () => {
    try {
      const data = await getJson('/api/bookings')
      setBookings(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed to load bookings:', e.message)
      setBookings([])
    }
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const q = buildQuery({
        type: filters.type && filters.type !== 'ALL' ? filters.type : undefined,
        location: filters.location || undefined,
        minCapacity: filters.minCapacity || undefined,
        q: filters.q || undefined,
      })
      const data = await getJson(`/api/resources${q}`)
      setItems(Array.isArray(data) ? data : [])
      await loadBookings()
    } catch (e) {
      setError(e.message)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await putJson(`/api/resources/${editingId}`, form)
        setEditingId(null)
      } else {
        await postJson('/api/resources', form)
      }
      setForm(emptyForm)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item) => {
    setForm({
      type: item.type,
      name: item.name,
      capacity: item.capacity,
      location: item.location,
      availabilityWindows: item.availabilityWindows || '',
      status: item.status,
    })
    setEditingId(item.id)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this resource?')) return
    try {
      await deleteRequest(`/api/resources/${id}`)
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const handleCancel = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  useEffect(() => {
    load()
  }, [load])

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
                Resource Management Dashboard
              </p>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Manage campus resources
                </h1>
                <p className="max-w-3xl text-base leading-7 text-white">
                  Review resource inventory, filter by type and location, and manage resource availability.
                  Add new resources or edit existing ones to keep catalogue up to date.
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

          {/* Resource Analytics Charts */}
          <Reveal delay={120}>
            <SurfaceCard className="!border-[#FDA481] !bg-white !text-[#181A2F] shadow-none">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-500">Resource analytics</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#181A2F]">Resource insights</h2>
                  <p className="mt-1 text-sm text-[#37415C]">Visual breakdown of campus resources by type, status, and utilization.</p>
                </div>
                <div className="hidden h-14 w-14 rounded-[20px] bg-[radial-gradient(circle_at_30%_30%,#7dd3fc,transparent_58%),linear-gradient(135deg,#eff6ff,#dbeafe)] sm:block" />
              </div>
              {loading ? (
                <div className="mt-4 flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#B4182D] mr-3"></div>
                  <span className="text-sm text-[#37415C]">Loading resource analytics...</span>
                </div>
              ) : (
                <div className="mt-4">
                  <ResourceCharts resources={items} bookings={bookings} />
                </div>
              )}
            </SurfaceCard>
          </Reveal>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <Reveal delay={130}>
              <SurfaceCard className="space-y-5 !border-[#FDA481] !bg-white !text-[#181A2F] shadow-none">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-[#181A2F]">Resource list</h2>
                    <p className="mt-2 text-sm leading-6 text-[#37415C]">
                      Browse all campus resources, filter by type, and manage resource details.
                    </p>
                  </div>

                  <label className="block min-w-[220px]">
                    <span className="flex items-center gap-2 text-sm font-medium text-[#181A2F]">
                      <span>Filter by type</span>
                      <Tooltip text="Filter resources by type to narrow down list." tone="ticket">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#B4182D] bg-white text-[11px] font-semibold text-[#B4182D]">
                          i
                        </span>
                      </Tooltip>
                    </span>
                    <select
                      value={filters.type}
                      onChange={(event) => setFilters({ ...filters, type: event.target.value })}
                      className="hub-button-pop mt-2 w-full rounded-2xl border border-[#37415C] bg-white px-4 py-3 text-sm text-[#181A2F] outline-none transition focus:border-[#B4182D]"
                    >
                      <option value="ALL">All types</option>
                      {TYPES.map((type) => (
                        <option key={type} value={type}>
                          {formatFilterLabel(type)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {loading && <LoadingSpinner label="Loading resources..." tone="ticket" />}

                {error && !loading && (
                  <EmptyState
                    title="Resource list is unavailable"
                    description={error.message || 'The resource service did not respond successfully.'}
                    tone="ticket"
                  />
                )}

                {!loading && !error && filteredItems.length === 0 && (
                  <EmptyState
                    title="No resources match this filter"
                    description="Try another filter or add new resources to catalogue."
                    tone="ticket"
                  />
                )}

                {!loading && !error && filteredItems.length > 0 && (
                  <div className="overflow-x-auto rounded-[24px] border border-[#37415C] bg-[#242E49] p-2">
                    <table className="min-w-full border-separate border-spacing-y-2">
                      <thead>
                        <tr className="text-left text-sm text-[#FDA481]">
                          <th className="px-4 py-3 font-semibold">Resource</th>
                          <th className="px-4 py-3 font-semibold">Type</th>
                          <th className="px-4 py-3 font-semibold">Location</th>
                          <th className="px-4 py-3 font-semibold">Capacity</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                          <th className="px-4 py-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.map((resource, index) => {
                          const hovered = hoveredResourceId === resource.id

                          return (
                            <tr
                              key={resource.id}
                              onMouseEnter={() => setHoveredResourceId(resource.id)}
                              onMouseLeave={() => setHoveredResourceId(null)}
                              className={`hub-ticket-list-row align-top transition ${hovered ? 'hub-ticket-list-row--active' : ''}`}
                              style={{ animationDelay: `${index * 55}ms` }}
                            >
                              <td className="rounded-l-[18px] bg-white px-4 py-4">
                                <div className="text-sm font-semibold text-[#181A2F]">
                                  {resource.name}
                                </div>
                                <p className="mt-1 max-w-[28ch] text-xs leading-5 text-[#37415C]">
                                  {resource.availabilityWindows || 'Availability not specified'}
                                </p>
                              </td>
                              <td className="bg-white px-4 py-4 text-sm text-[#181A2F]">
                                {formatFilterLabel(resource.type)}
                              </td>
                              <td className="bg-white px-4 py-4 text-sm text-[#181A2F]">{resource.location}</td>
                              <td className="bg-white px-4 py-4 text-sm text-[#181A2F]">{resource.capacity}</td>
                              <td className="bg-white px-4 py-4">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  resource.status === 'ACTIVE' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {resource.status}
                                </span>
                              </td>
                              <td className="rounded-r-[18px] bg-white px-4 py-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEdit(resource)}
                                    className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(resource.id)}
                                    className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                                  >
                                    Delete
                                  </button>
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
                <h3 className="text-lg font-semibold text-[#181A2F]">
                  {editingId ? 'Edit Resource' : 'Add New Resource'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#181A2F]">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[#37415C] bg-white px-3 py-2 text-sm text-[#181A2F] focus:border-[#B4182D] focus:outline-none"
                    >
                      {TYPES.map((type) => (
                        <option key={type} value={type}>
                          {formatFilterLabel(type)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#181A2F]">Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[#37415C] bg-white px-3 py-2 text-sm text-[#181A2F] focus:border-[#B4182D] focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#181A2F]">Capacity</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={form.capacity}
                      onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) })}
                      className="mt-1 w-full rounded-lg border border-[#37415C] bg-white px-3 py-2 text-sm text-[#181A2F] focus:border-[#B4182D] focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#181A2F]">Location</label>
                    <input
                      type="text"
                      required
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[#37415C] bg-white px-3 py-2 text-sm text-[#181A2F] focus:border-[#B4182D] focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#181A2F]">Availability Windows</label>
                    <input
                      type="text"
                      value={form.availabilityWindows}
                      onChange={(e) => setForm({ ...form, availabilityWindows: e.target.value })}
                      placeholder="e.g. Mon-Fri 08:00-18:00"
                      className="mt-1 w-full rounded-lg border border-[#37415C] bg-white px-3 py-2 text-sm text-[#181A2F] focus:border-[#B4182D] focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#181A2F]">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[#37415C] bg-white px-3 py-2 text-sm text-[#181A2F] focus:border-[#B4182D] focus:outline-none"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status.replaceAll('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 rounded-lg bg-[#B4182D] px-4 py-2 text-sm font-medium text-white hover:bg-[#54162B] disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : (editingId ? 'Update' : 'Add')}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="flex-1 rounded-lg border border-[#37415C] px-4 py-2 text-sm font-medium text-[#181A2F] hover:bg-[#242E49]"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </SurfaceCard>
            </Reveal>
          </section>
        </div>
      </main>
    </div>
  )
}

