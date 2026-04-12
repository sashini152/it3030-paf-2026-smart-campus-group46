import { useMemo, useState, useEffect } from 'react'
import { deleteRequest } from '../api/client'
import { useLocation } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import ParallaxPanel from '../components/ParallaxPanel'
import Reveal from '../components/Reveal'
import SurfaceCard from '../components/SurfaceCard'
import Tooltip from '../components/Tooltip'
import AdminSidebar from '../components/AdminSidebar'
import { formatTicketStatus, getAllowedTicketStatusTransitions, normalizeTicketWorkflowStatus, TICKET_STATUSES } from '../utils/ticketPresentation'
import * as ticketService from '../services/ticketService'

const STATUSES = TICKET_STATUSES

const statConfig = [
  { key: 'open', label: 'Open', accent: 'text-[#181A2F]', tone: 'border-[#242E49] bg-white text-[#181A2F]' },
  { key: 'inProgress', label: 'In Progress', accent: 'text-white', tone: 'border-[#37415C] bg-[#242E49] text-white' },
  { key: 'resolved', label: 'Resolved', accent: 'text-[#181A2F]', tone: 'border-[#FDA481] bg-[#FDA481] text-[#181A2F]' },
  { key: 'closed', label: 'Closed', accent: 'text-white', tone: 'border-[#54162B] bg-[#54162B] text-white' },
  { key: 'rejected', label: 'Rejected', accent: 'text-white', tone: 'border-[#B4182D] bg-[#B4182D] text-white' },
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

export default function AdminTicketsPage() {
  const location = useLocation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    status: 'ALL',
    priority: '',
    q: '',
  })
  const [hoveredTicketId, setHoveredTicketId] = useState(null)
  const [processing, setProcessing] = useState({})

  // Calculate statistics
  const stats = useMemo(() => {
    const open = items.filter(t => normalizeTicketWorkflowStatus(t.status) === 'OPEN').length
    const inProgress = items.filter(t => normalizeTicketWorkflowStatus(t.status) === 'IN_PROGRESS').length
    const resolved = items.filter(t => normalizeTicketWorkflowStatus(t.status) === 'RESOLVED').length
    const closed = items.filter(t => normalizeTicketWorkflowStatus(t.status) === 'CLOSED').length
    const rejected = items.filter(t => normalizeTicketWorkflowStatus(t.status) === 'REJECTED').length
    
    return {
      open,
      inProgress,
      resolved,
      closed,
      rejected,
    }
  }, [items])

  // Filter items based on filters
  const filteredItems = useMemo(() => {
    let filtered = items
    
    // Apply status filter
    if (filters.status && filters.status !== 'ALL') {
      filtered = filtered.filter(item => normalizeTicketWorkflowStatus(item.status) === filters.status)
    }
    
    // Apply priority filter
    if (filters.priority) {
      filtered = filtered.filter(item => 
        item.priority?.toLowerCase().includes(filters.priority.toLowerCase())
      )
    }
    
    // Apply search filter
    if (filters.q) {
      const query = filters.q.toLowerCase()
      filtered = filtered.filter(item => 
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.createdByName?.toLowerCase().includes(query) ||
        item.createdBy?.toLowerCase().includes(query) ||
        item.userEmail?.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }, [items, filters])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await ticketService.fetchAllTickets()
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'The ticket service did not respond successfully.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (ticket, newStatus) => {
    setProcessing(prev => ({ ...prev, [ticket.id]: 'updating' }))
    try {
      let rejectionReason = ''
      if (newStatus === 'REJECTED') {
        rejectionReason = window.prompt('Enter the rejection reason for this ticket:')
        if (rejectionReason === null) {
          return
        }
        if (!rejectionReason.trim()) {
          throw new Error('Rejection reason is required.')
        }
      }
      await ticketService.updateStatus(ticket.id, newStatus, rejectionReason.trim())
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setProcessing(prev => ({ ...prev, [ticket.id]: null }))
    }
  }

  const handleDelete = async (ticketId) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return
    setProcessing(prev => ({ ...prev, [ticketId]: 'deleting' }))
    try {
      await deleteRequest(`/api/tickets/${ticketId}`)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setProcessing(prev => ({ ...prev, [ticketId]: null }))
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
                Ticket Management Dashboard
              </p>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Manage all support tickets
                </h1>
                <p className="max-w-3xl text-base leading-7 text-white">
                  Review support tickets from all users, update ticket status, and monitor resolution progress.
                  Filter by status and priority to focus on critical issues.
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
                    <h2 className="text-xl font-semibold text-[#181A2F]">Ticket list</h2>
                    <p className="mt-2 text-sm leading-6 text-[#37415C]">
                      Review all support tickets, update status, and manage resolution workflow.
                    </p>
                  </div>

                  <label className="block min-w-[220px]">
                    <span className="flex items-center gap-2 text-sm font-medium text-[#181A2F]">
                      <span>Filter by status</span>
                      <Tooltip text="Filter tickets by status to focus on specific workflows." tone="ticket">
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

                {loading && <LoadingSpinner label="Loading tickets..." tone="ticket" />}

                {error && !loading && (
                  <EmptyState
                    title="Ticket list is unavailable"
                    description={error.message || 'The ticket service did not respond successfully.'}
                    tone="ticket"
                  />
                )}

                {!loading && !error && filteredItems.length === 0 && (
                  <EmptyState
                    title="No tickets match this filter"
                    description="Try another status filter or check back later for new tickets."
                    tone="ticket"
                  />
                )}

                {!loading && !error && filteredItems.length > 0 && (
                  <div className="overflow-x-auto rounded-[24px] border border-[#37415C] bg-[#242E49] p-2">
                    <table className="min-w-full border-separate border-spacing-y-2">
                      <thead>
                        <tr className="text-left text-sm text-[#FDA481]">
                          <th className="px-4 py-3 font-semibold">Ticket</th>
                          <th className="px-4 py-3 font-semibold">Reported by</th>
                          <th className="px-4 py-3 font-semibold">Priority</th>
                          <th className="px-4 py-3 font-semibold">Created</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                          <th className="px-4 py-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.map((ticket, index) => {
                          const hovered = hoveredTicketId === ticket.id
                          const isProcessing = processing[ticket.id]
                          const currentStatus = normalizeTicketWorkflowStatus(ticket.status)
                          const allowedStatuses = [currentStatus, ...getAllowedTicketStatusTransitions(ticket.status)].filter(
                            (status, statusIndex, values) => status && values.indexOf(status) === statusIndex
                          )

                          return (
                            <tr
                              key={ticket.id}
                              onMouseEnter={() => setHoveredTicketId(ticket.id)}
                              onMouseLeave={() => setHoveredTicketId(null)}
                              className={`hub-ticket-list-row align-top transition ${hovered ? 'hub-ticket-list-row--active' : ''}`}
                              style={{ animationDelay: `${index * 55}ms` }}
                            >
                              <td className="rounded-l-[18px] bg-white px-4 py-4">
                                <div className="text-sm font-semibold text-[#181A2F]">
                                  {ticket.title || 'Untitled Ticket'}
                                </div>
                                <p className="mt-1 max-w-[28ch] text-xs leading-5 text-[#37415C]">
                                  {ticket.description || 'No description available'}
                                </p>
                              </td>
                              <td className="bg-white px-4 py-4 text-sm text-[#181A2F]">
                                <div className="font-medium">{ticket.createdByName || ticket.createdBy || 'Unknown User'}</div>
                                <div className="text-xs text-[#37415C]">{ticket.userEmail || ''}</div>
                              </td>
                              <td className="bg-white px-4 py-4 text-sm text-[#181A2F]">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  ticket.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                                  ticket.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {ticket.priority || 'MEDIUM'}
                                </span>
                              </td>
                              <td className="bg-white px-4 py-4 text-sm text-[#181A2F]">
                                <div className="font-medium">{formatDate(ticket.createdAt)}</div>
                                <div className="text-xs text-[#37415C]">{formatDate(ticket.updatedAt)}</div>
                              </td>
                              <td className="bg-white px-4 py-4">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  currentStatus === 'OPEN' ? 'bg-amber-100 text-amber-800' :
                                  currentStatus === 'IN_PROGRESS' ? 'bg-sky-100 text-sky-800' :
                                  currentStatus === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                                  currentStatus === 'CLOSED' ? 'bg-slate-100 text-slate-700' :
                                  currentStatus === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                                  'bg-orange-100 text-orange-800'
                                }`}>
                                  {formatFilterLabel(currentStatus)}
                                </span>
                              </td>
                              <td className="rounded-r-[18px] bg-white px-4 py-4">
                                <div className="flex gap-2">
                                  <select
                                    value={currentStatus}
                                    onChange={(e) => handleUpdateStatus(ticket, e.target.value)}
                                    disabled={isProcessing === 'updating' || allowedStatuses.length <= 1}
                                    className="text-xs px-2 py-1 border border-gray-300 rounded text-gray-700 disabled:opacity-50"
                                  >
                                    {allowedStatuses.map((status) => (
                                      <option key={status} value={status}>
                                        {formatTicketStatus(status)}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => handleDelete(ticket.id)}
                                    disabled={isProcessing === 'deleting'}
                                    className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 disabled:opacity-50"
                                  >
                                    {isProcessing === 'deleting' ? '...' : 'Delete'}
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
                <h3 className="text-lg font-semibold text-[#181A2F]">Quick Actions</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-medium text-amber-900">Open Tickets</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      {stats.open} ticket{stats.open !== 1 ? 's' : ''} waiting for attention
                    </p>
                  </div>
                  
                  <div className="p-4 bg-sky-50 rounded-lg">
                    <h4 className="font-medium text-sky-900">In Progress</h4>
                    <p className="text-sm text-sky-700 mt-1">
                      {stats.inProgress} ticket{stats.inProgress !== 1 ? 's' : ''} currently being worked on
                    </p>
                  </div>
                  
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <h4 className="font-medium text-emerald-900">Resolved Today</h4>
                    <p className="text-sm text-emerald-700 mt-1">
                      {stats.resolved} ticket{stats.resolved !== 1 ? 's' : ''} successfully resolved
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

