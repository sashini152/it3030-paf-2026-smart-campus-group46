import { useCallback, useEffect, useMemo, useState } from 'react'
import { buildQuery, deleteRequest, getJson, postJson, putJson } from '../api/client'
import ParallaxPanel from '../components/ParallaxPanel'
import Reveal from '../components/Reveal'
import Tooltip from '../components/Tooltip'
import { useAuth } from '../auth/useAuth'
import { isAdminRole } from '../utils/session'

const TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT']
const STATUSES = ['ACTIVE', 'OUT_OF_SERVICE']

const emptyForm = {
  type: 'LECTURE_HALL',
  name: '',
  capacity: 0,
  location: '',
  availabilityWindows: '',
  status: 'ACTIVE',
}

const insightSlides = [
  {
    title: 'Keep active spaces visible',
    body: 'Most student actions depend on ACTIVE resources. Keep availability and status accurate to reduce failed bookings.',
  },
  {
    title: 'Use location-rich names',
    body: 'Resource names with building and floor context make search and assignment much faster for students.',
  },
  {
    title: 'Update outages quickly',
    body: 'Mark rooms or equipment OUT_OF_SERVICE early so students avoid dead-end booking requests.',
  },
]

function formatTypeLabel(type) {
  return type.replaceAll('_', ' ')
}

function getResourceStats(items) {
  return items.reduce(
    (acc, item) => {
      if (item.status === 'ACTIVE') acc.active += 1
      else acc.outOfService += 1
      acc.total += 1
      return acc
    },
    { total: 0, active: 0, outOfService: 0 }
  )
}

export default function ResourcesPage() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    minCapacity: '',
    q: '',
  })
  const [activeInsight, setActiveInsight] = useState(0)
  const [pauseInsights, setPauseInsights] = useState(false)
  const [hoveredResourceId, setHoveredResourceId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const isAdmin = isAdminRole(user?.role)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const q = buildQuery({
        type: filters.type || undefined,
        location: filters.location || undefined,
        minCapacity: filters.minCapacity || undefined,
        q: filters.q || undefined,
      })
      const data = await getJson(`/api/resources${q}`)
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (pauseInsights) return undefined
    const timer = setInterval(() => {
      setActiveInsight((current) => (current + 1) % insightSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [pauseInsights])

  const visibleItems = useMemo(
    () => items.filter((resource) => isAdmin || resource.status === 'ACTIVE'),
    [items, isAdmin]
  )
  const stats = useMemo(() => getResourceStats(items), [items])

  function startEdit(resource) {
    setEditingId(resource.id)
    setForm({
      type: resource.type,
      name: resource.name,
      capacity: resource.capacity,
      location: resource.location,
      availabilityWindows: resource.availabilityWindows ?? '',
      status: resource.status,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {
        type: form.type,
        name: form.name,
        capacity: Number(form.capacity),
        location: form.location,
        availabilityWindows: form.availabilityWindows || null,
        status: form.status,
      }
      if (editingId) {
        await putJson(`/api/resources/${editingId}`, payload)
      } else {
        await postJson('/api/resources', payload)
      }
      cancelEdit()
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this resource?')) return
    setError(null)
    try {
      await deleteRequest(`/api/resources/${id}`)
      if (editingId === id) cancelEdit()
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="hub-page hub-page--wide hub-page--resources space-y-6">
      <Reveal delay={30}>
        <div className="hub-resources-hero">
          <p className="hub-resources-kicker">Campus assets</p>
          <h1>Resources</h1>
          <p className="hub-lead">
            {isAdmin
              ? 'Catalogue bookable spaces and equipment. Filter the list, then add or edit entries. Bookings only allow '
              : 'Browse available spaces and equipment. Filter the catalogue and explore only '}
            <span className="hub-inline-status-pill">ACTIVE</span> resources.
          </p>
        </div>
      </Reveal>

      <Reveal className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" delay={70}>
        <ParallaxPanel className="hub-resource-stat hub-resource-stat--total hub-lift">
          <span>Total</span>
          <strong>{stats.total}</strong>
        </ParallaxPanel>
        <ParallaxPanel className="hub-resource-stat hub-resource-stat--active hub-lift">
          <span>Active</span>
          <strong>{stats.active}</strong>
        </ParallaxPanel>
        <ParallaxPanel className="hub-resource-stat hub-resource-stat--out hub-lift">
          <span>Out of service</span>
          <strong>{stats.outOfService}</strong>
        </ParallaxPanel>
        <ParallaxPanel className="hub-resource-stat hub-resource-stat--visible hub-lift">
          <span>Visible now</span>
          <strong>{visibleItems.length}</strong>
        </ParallaxPanel>
      </Reveal>

      {error && (
        <Reveal delay={95}>
          <div className="hub-alert hub-alert--error hub-alert--resources" role="alert">
            {error}
          </div>
        </Reveal>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Reveal delay={110}>
            <ParallaxPanel strength={8} className="hub-lift">
              <section className="hub-panel hub-resources-panel">
                <h2 className="hub-panel__title">Search &amp; filters</h2>
                <div className="hub-resource-filter-chips" role="toolbar" aria-label="Quick type filters">
                  <button
                    type="button"
                    onClick={() => setFilters((current) => ({ ...current, type: '' }))}
                    className={`hub-resource-filter-chip ${filters.type === '' ? 'hub-resource-filter-chip--active' : ''}`}
                  >
                    All
                  </button>
                  {TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFilters((current) => ({ ...current, type }))}
                      className={`hub-resource-filter-chip ${filters.type === type ? 'hub-resource-filter-chip--active' : ''}`}
                    >
                      {formatTypeLabel(type)}
                    </button>
                  ))}
                </div>

                <div className="hub-form-grid hub-form-grid--filters">
                  <label className="hub-field">
                    <span className="inline-flex items-center gap-2">
                      <span>Type</span>
                      <Tooltip text="Use quick chips or dropdown to narrow by resource type." tone="ticket">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#B4182D] bg-white text-[11px] font-semibold text-[#B4182D]">
                          i
                        </span>
                      </Tooltip>
                    </span>
                    <select
                      value={filters.type}
                      onChange={(event) =>
                        setFilters((current) => ({ ...current, type: event.target.value }))
                      }
                    >
                      <option value="">Any</option>
                      {TYPES.map((type) => (
                        <option key={type} value={type}>
                          {formatTypeLabel(type)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="hub-field">
                    <span>Location contains</span>
                    <input
                      value={filters.location}
                      onChange={(event) =>
                        setFilters((current) => ({ ...current, location: event.target.value }))
                      }
                      placeholder="e.g. Block A"
                    />
                  </label>
                  <label className="hub-field">
                    <span>Min capacity</span>
                    <input
                      type="number"
                      min={0}
                      value={filters.minCapacity}
                      onChange={(event) =>
                        setFilters((current) => ({ ...current, minCapacity: event.target.value }))
                      }
                    />
                  </label>
                  <label className="hub-field hub-field--grow">
                    <span>Search name / location</span>
                    <input
                      value={filters.q}
                      onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
                      placeholder="Keyword"
                    />
                  </label>
                  <div className="hub-field hub-field--actions">
                    <button
                      type="button"
                      className="hub-btn hub-btn--primary hub-btn--resources hub-button-pop"
                      onClick={load}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </section>
            </ParallaxPanel>
          </Reveal>

          {isAdmin && (
            <Reveal delay={145}>
              <ParallaxPanel strength={10} className="hub-lift">
                <section className="hub-panel hub-resources-panel">
                  <h2 className="hub-panel__title">{editingId ? 'Edit resource' : 'Add resource'}</h2>
                  <form className="hub-form-grid" onSubmit={handleSubmit}>
                    <label className="hub-field">
                      <span>Type</span>
                      <select
                        value={form.type}
                        onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
                      >
                        {TYPES.map((type) => (
                          <option key={type} value={type}>
                            {formatTypeLabel(type)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="hub-field hub-field--grow">
                      <span>Name</span>
                      <input
                        required
                        value={form.name}
                        onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                      />
                    </label>
                    <label className="hub-field">
                      <span>Capacity</span>
                      <input
                        type="number"
                        min={0}
                        required
                        value={form.capacity}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, capacity: event.target.value }))
                        }
                      />
                    </label>
                    <label className="hub-field hub-field--grow">
                      <span>Location</span>
                      <input
                        required
                        value={form.location}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, location: event.target.value }))
                        }
                      />
                    </label>
                    <label className="hub-field hub-field--full">
                      <span>Availability windows</span>
                      <input
                        value={form.availabilityWindows}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            availabilityWindows: event.target.value,
                          }))
                        }
                        placeholder="e.g. Mon-Fri 08:00-18:00"
                      />
                    </label>
                    <label className="hub-field">
                      <span>Status</span>
                      <select
                        value={form.status}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, status: event.target.value }))
                        }
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status.replaceAll('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="hub-field hub-field--actions hub-field--full">
                      <button
                        type="submit"
                        className="hub-btn hub-btn--primary hub-btn--resources hub-button-pop"
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                      </button>
                      {editingId && (
                        <button
                          type="button"
                          className="hub-btn hub-btn--resources-secondary hub-button-pop"
                          onClick={cancelEdit}
                          disabled={saving}
                        >
                          Cancel edit
                        </button>
                      )}
                    </div>
                  </form>
                </section>
              </ParallaxPanel>
            </Reveal>
          )}

          <Reveal delay={180}>
            <ParallaxPanel strength={12} className="hub-lift">
              <section className="hub-panel hub-resources-panel">
                <h2 className="hub-panel__title">Catalogue</h2>
                {loading ? (
                  <p className="hub-muted hub-muted--resources">Loading...</p>
                ) : visibleItems.length === 0 ? (
                  <p className="hub-muted hub-muted--resources">No resources match your filters.</p>
                ) : (
                  <div className="hub-table-wrap hub-table-wrap--resources">
                    <table className="hub-table hub-table--resources">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Type</th>
                          <th>Capacity</th>
                          <th>Location</th>
                          <th>Status</th>
                          <th>Availability</th>
                          {isAdmin && <th />}
                        </tr>
                      </thead>
                      <tbody>
                        {visibleItems.map((resource, index) => {
                          const hovered = hoveredResourceId === resource.id
                          return (
                            <tr
                              key={resource.id}
                              className={`hub-resource-row ${hovered ? 'hub-resource-row--active' : ''}`}
                              style={{ animationDelay: `${index * 45}ms` }}
                              onMouseEnter={() => setHoveredResourceId(resource.id)}
                              onMouseLeave={() => setHoveredResourceId(null)}
                            >
                              <td>{resource.name}</td>
                              <td>{resource.type?.replaceAll('_', ' ')}</td>
                              <td>{resource.capacity}</td>
                              <td>{resource.location}</td>
                              <td>
                                <span
                                  className={
                                    resource.status === 'ACTIVE'
                                      ? 'hub-tag hub-tag--resource-active'
                                      : 'hub-tag hub-tag--resource-warn'
                                  }
                                >
                                  {resource.status?.replaceAll('_', ' ')}
                                </span>
                              </td>
                              <td className="hub-table__clip">{resource.availabilityWindows || '-'}</td>
                              {isAdmin && (
                                <td className="hub-table__actions">
                                  <button
                                    type="button"
                                    className="hub-btn hub-btn--small hub-btn--resources-secondary hub-button-pop"
                                    onClick={() => startEdit(resource)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="hub-btn hub-btn--small hub-btn--resources-danger hub-button-pop"
                                    onClick={() => handleDelete(resource.id)}
                                  >
                                    Delete
                                  </button>
                                </td>
                              )}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </ParallaxPanel>
          </Reveal>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Reveal delay={220}>
            <ParallaxPanel strength={10}>
              <section
                className="hub-panel hub-resources-panel hub-resources-panel--insights"
                onMouseEnter={() => setPauseInsights(true)}
                onMouseLeave={() => setPauseInsights(false)}
              >
                <p className="hub-resource-insight-kicker">Resource insights</p>
                <div key={activeInsight} className="hub-resource-insight hub-fade-slide">
                  <h3>{insightSlides[activeInsight].title}</h3>
                  <p>{insightSlides[activeInsight].body}</p>
                </div>

                <div className="hub-resource-insight-controls">
                  <div className="hub-resource-insight-dots">
                    {insightSlides.map((slide, index) => (
                      <button
                        key={slide.title}
                        type="button"
                        className={`hub-resource-insight-dot ${
                          index === activeInsight ? 'hub-resource-insight-dot--active' : ''
                        }`}
                        onClick={() => setActiveInsight(index)}
                        aria-label={`Show insight ${index + 1}`}
                      />
                    ))}
                  </div>
                  <div className="hub-resource-insight-actions">
                    <button
                      type="button"
                      className="hub-resource-insight-action"
                      onClick={() =>
                        setActiveInsight((current) => (current === 0 ? insightSlides.length - 1 : current - 1))
                      }
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      className="hub-resource-insight-action"
                      onClick={() => setActiveInsight((current) => (current + 1) % insightSlides.length)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </section>
            </ParallaxPanel>
          </Reveal>

          <Reveal delay={260}>
            <ParallaxPanel strength={8}>
              <section className="hub-panel hub-resources-panel hub-resources-panel--checklist">
                <p className="hub-resource-insight-kicker">Quick checks</p>
                <ul className="hub-resource-checklist">
                  <li>Keep names clear with location hints.</li>
                  <li>Update OUT_OF_SERVICE entries as soon as faults appear.</li>
                  <li>Use capacity values that match real seat counts.</li>
                  <li>Set windows that reflect actual access times.</li>
                </ul>
              </section>
            </ParallaxPanel>
          </Reveal>
        </aside>
      </div>
    </div>
  )
}

