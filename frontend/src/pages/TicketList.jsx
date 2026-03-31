import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ChatBot from '../components/ChatBot'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import PageIntro from '../components/PageIntro'
import StatusBadge from '../components/StatusBadge'
import SurfaceCard from '../components/SurfaceCard'
import { useTickets } from '../hooks/useTickets'
import {
  TICKET_STATUS_OPTIONS,
  formatTicketDateTime,
  getTicketPriorityTone,
  getTicketSummaryStats,
} from '../utils/ticketPresentation'

const statConfig = [
  { key: 'open', label: 'Open', accent: 'text-[#327f7d]' },
  { key: 'inProgress', label: 'In progress', accent: 'text-[#1d4f91]' },
  { key: 'resolved', label: 'Resolved', accent: 'text-[#327f7d]' },
  { key: 'closed', label: 'Closed', accent: 'text-[#475569]' },
  { key: 'waitingForClient', label: 'Waiting for client', accent: 'text-[#6d4ca8]' },
  { key: 'waitingForSupport', label: 'Waiting for support', accent: 'text-[#a44a1a]' },
]

function formatFilterLabel(status) {
  return status === 'ALL' ? 'All statuses' : status.replaceAll('_', ' ')
}

export default function TicketList() {
  const { tickets, loading, error } = useTickets()
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filteredTickets = useMemo(() => {
    if (statusFilter === 'ALL') return tickets
    return tickets.filter((ticket) => ticket.status === statusFilter)
  }, [statusFilter, tickets])

  const stats = useMemo(() => getTicketSummaryStats(tickets), [tickets])

  return (
    <div className="hub-page space-y-8">
      <PageIntro
        eyebrow="Support Dashboard"
        title="Browse and track submitted tickets"
        description="Review ticket history, filter the queue by status, and open each ticket to read progress, comments, and support updates."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {statConfig.map((card) => (
          <SurfaceCard key={card.key} tone="subtle" className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
              {card.label}
            </p>
            <p className={`text-3xl font-semibold ${card.accent}`}>{stats[card.key]}</p>
          </SurfaceCard>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <SurfaceCard className="space-y-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#0f172a]">Ticket list</h2>
              <p className="mt-2 text-sm leading-6 text-[#64748b]">
                Each row links to a full ticket thread with comments, progress, and status history.
              </p>
            </div>

            <label className="block min-w-[220px]">
              <span className="text-sm font-medium text-[#1e293b]">Filter by status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#d9e2ec] bg-[#fbfdff] px-4 py-3 text-sm text-[#0f172a] outline-none"
              >
                {TICKET_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {formatFilterLabel(status)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {loading && <LoadingSpinner label="Loading tickets..." />}

          {error && !loading && (
            <EmptyState
              title="Ticket list is unavailable"
              description={error.message || 'The ticket service did not respond successfully.'}
            />
          )}

          {!loading && !error && filteredTickets.length === 0 && (
            <EmptyState
              title="No tickets match this filter"
              description="Try another status or submit a new ticket from the student intake page."
              action={
                <Link to="/tickets" className="text-sm font-semibold text-[#327f7d]">
                  Open ticket page
                </Link>
              }
            />
          )}

          {!loading && !error && filteredTickets.length > 0 && (
            <div className="overflow-x-auto rounded-[24px] border border-[#dde5ef]">
              <table className="min-w-full border-collapse bg-white">
                <thead className="bg-[#f7fafc]">
                  <tr className="text-left text-sm text-[#475569]">
                    <th className="px-4 py-3 font-semibold">Ticket</th>
                    <th className="px-4 py-3 font-semibold">Student</th>
                    <th className="px-4 py-3 font-semibold">Assigned</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Priority</th>
                    <th className="px-4 py-3 font-semibold">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => {
                    const student = ticket.createdBy || 'Student'
                    const technician = ticket.assignedTechnician || 'Unassigned'

                    return (
                      <tr
                        key={ticket.id}
                        className="border-t border-[#e6edf4] align-top transition hover:bg-[#f8fbff]"
                      >
                        <td className="px-4 py-4">
                          <Link
                            to={`/ticket-details/${ticket.id}`}
                            className="text-sm font-semibold text-[#0f172a] hover:text-[#327f7d]"
                          >
                            {ticket.title}
                          </Link>
                          <p className="mt-1 max-w-[28ch] text-xs leading-5 text-[#64748b]">
                            {ticket.description?.slice(0, 90)}
                            {ticket.description?.length > 90 ? '...' : ''}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-sm text-[#334155]">{student}</td>
                        <td className="px-4 py-4 text-sm text-[#334155]">{technician}</td>
                        <td className="px-4 py-4 text-sm text-[#334155]">
                          {ticket.category || 'General'}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={ticket.status} />
                        </td>
                        <td
                          className={`px-4 py-4 text-sm font-semibold ${getTicketPriorityTone(
                            ticket.priority
                          )}`}
                        >
                          {ticket.priority || 'LOW'}
                        </td>
                        <td className="px-4 py-4 text-sm text-[#64748b]">
                          {formatTicketDateTime(ticket.updatedAt)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SurfaceCard>

        <div className="space-y-6">
          <SurfaceCard tone="subtle" className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#327f7d]">
              Queue Guide
            </p>
            <p className="text-sm leading-6 text-[#475569]">
              Open tickets first to see full progress, timestamps, and admin replies. Statuses
              such as waiting for client and waiting for support are grouped in the shared tracker
              flow so students can still follow where work is paused.
            </p>
          </SurfaceCard>

          <ChatBot />
        </div>
      </div>
    </div>
  )
}
