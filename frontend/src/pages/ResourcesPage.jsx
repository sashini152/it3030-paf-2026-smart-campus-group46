import { useCallback, useEffect, useState } from 'react'
import { buildQuery, deleteRequest, getJson, postJson, putJson } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
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

  function startEdit(r) {
    setEditingId(r.id)
    setForm({
      type: r.type,
      name: r.name,
      capacity: r.capacity,
      location: r.location,
      availabilityWindows: r.availabilityWindows ?? '',
      status: r.status,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e) {
    e.preventDefault()
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
    <div className="hub-page hub-page--wide hub-page--resources">
      <div className="hub-resources-hero">
        <p className="hub-resources-kicker">Campus assets</p>
        <h1>Resources</h1>
        <p className="hub-lead">
          {isAdmin
            ? 'Catalogue bookable spaces and equipment. Filter the list, then add or edit entries. Bookings only allow '
            : 'Browse available spaces and equipment. Filter the catalogue and explore only '}
          <code>ACTIVE</code> resources.
        </p>
      </div>

      {error && (
        <div className="hub-alert hub-alert--error hub-alert--resources" role="alert">
          {error}
        </div>
      )}

      <section className="hub-panel hub-resources-panel">
        <h2 className="hub-panel__title">Search &amp; filters</h2>
        <div className="hub-form-grid hub-form-grid--filters">
          <label className="hub-field">
            <span>Type</span>
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((f) => ({ ...f, type: e.target.value }))
              }
            >
              <option value="">Any</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="hub-field">
            <span>Location contains</span>
            <input
              value={filters.location}
              onChange={(e) =>
                setFilters((f) => ({ ...f, location: e.target.value }))
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
              onChange={(e) =>
                setFilters((f) => ({ ...f, minCapacity: e.target.value }))
              }
            />
          </label>
          <label className="hub-field hub-field--grow">
            <span>Search name / location</span>
            <input
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              placeholder="Keyword"
            />
          </label>
          <div className="hub-field hub-field--actions">
            <button
              type="button"
              className="hub-btn hub-btn--primary hub-btn--resources"
              onClick={load}
            >
              Apply
            </button>
          </div>
        </div>
      </section>

      {isAdmin && (
        <section className="hub-panel hub-resources-panel">
          <h2 className="hub-panel__title">
            {editingId ? 'Edit resource' : 'Add resource'}
          </h2>
          <form className="hub-form-grid" onSubmit={handleSubmit}>
            <label className="hub-field">
              <span>Type</span>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
            </label>
            <label className="hub-field hub-field--grow">
              <span>Name</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </label>
            <label className="hub-field">
              <span>Capacity</span>
              <input
                type="number"
                min={0}
                required
                value={form.capacity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, capacity: e.target.value }))
                }
              />
            </label>
            <label className="hub-field hub-field--grow">
              <span>Location</span>
              <input
                required
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
              />
            </label>
            <label className="hub-field hub-field--full">
              <span>Availability windows</span>
              <input
                value={form.availabilityWindows}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    availabilityWindows: e.target.value,
                  }))
                }
                placeholder="e.g. Mon–Fri 08:00–18:00"
              />
            </label>
            <label className="hub-field">
              <span>Status</span>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
            </label>
            <div className="hub-field hub-field--actions hub-field--full">
              <button
                type="submit"
                className="hub-btn hub-btn--primary hub-btn--resources"
                disabled={saving}
              >
                {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="hub-btn hub-btn--resources-secondary"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      <section className="hub-panel hub-resources-panel">
        <h2 className="hub-panel__title">Catalogue</h2>
        {loading ? (
          <p className="hub-muted hub-muted--resources">Loading…</p>
        ) : items.length === 0 ? (
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
                {items
                  .filter((r) => isAdmin || r.status === 'ACTIVE')
                  .map((r) => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>{r.type?.replaceAll('_', ' ')}</td>
                      <td>{r.capacity}</td>
                      <td>{r.location}</td>
                      <td>
                        <span
                          className={
                            r.status === 'ACTIVE'
                              ? 'hub-tag hub-tag--resource-active'
                              : 'hub-tag hub-tag--resource-warn'
                          }
                        >
                          {r.status?.replaceAll('_', ' ')}
                        </span>
                      </td>
                      <td className="hub-table__clip">{r.availabilityWindows || '—'}</td>
                      {isAdmin && (
                        <td className="hub-table__actions">
                          <button
                            type="button"
                            className="hub-btn hub-btn--small hub-btn--resources-secondary"
                            onClick={() => startEdit(r)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="hub-btn hub-btn--small hub-btn--resources-danger"
                            onClick={() => handleDelete(r.id)}
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
