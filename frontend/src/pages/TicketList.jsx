import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTickets } from '../hooks/useTickets'
import ChatBot from '../components/ChatBot'

const statusOptions = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'WAITING_FOR_CLIENT', 'WAITING_FOR_SUPPORT']

const statusColors = {
  OPEN: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-blue-100 text-blue-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  WAITING_FOR_CLIENT: 'bg-purple-100 text-purple-800',
  WAITING_FOR_SUPPORT: 'bg-orange-100 text-orange-800',
}

const priorityColors = {
  LOW: 'text-green-600',
  MEDIUM: 'text-yellow-600',
  HIGH: 'text-red-600',
}

export default function TicketList() {
  const { tickets, loading, error } = useTickets()
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filteredTickets = useMemo(() => {
    if (statusFilter === 'ALL') return tickets
    return tickets.filter(ticket => ticket.status === statusFilter)
  }, [tickets, statusFilter])

  const stats = useMemo(() => {
    const base = {
      openTickets: 0,
      inProgressTickets: 0,
      resolvedTickets: 0,
      closedTickets: 0,
      waitingClient: 0,
      waitingSupport: 0,
    }
    tickets.forEach(ticket => {
      switch (ticket.status) {
        case 'OPEN':
          base.openTickets += 1
          break
        case 'IN_PROGRESS':
          base.inProgressTickets += 1
          break
        case 'RESOLVED':
          base.resolvedTickets += 1
          break
        case 'CLOSED':
          base.closedTickets += 1
          break
        case 'WAITING_FOR_CLIENT':
          base.waitingClient += 1
          break
        case 'WAITING_FOR_SUPPORT':
          base.waitingSupport += 1
          break
      }
    })
    return base
  }, [tickets])

  const statCards = [
    { title: 'Open Tickets', value: stats.openTickets, color: 'bg-blue-500' },
    { title: 'In Progress', value: stats.inProgressTickets, color: 'bg-yellow-500' },
    { title: 'Resolved', value: stats.resolvedTickets, color: 'bg-green-500' },
    { title: 'Closed', value: stats.closedTickets, color: 'bg-gray-500' },
    { title: 'Waiting Client', value: stats.waitingClient, color: 'bg-purple-500' },
    { title: 'Waiting Support', value: stats.waitingSupport, color: 'bg-orange-500' },
  ]

  if (loading) return <div className="hub-page hub-page--narrow"><p>Loading tickets...</p></div>
  if (error) return <div className="hub-page hub-page--narrow"><p className="text-red-500">Error: {error.message}</p></div>

  return (
    <div className="hub-page">
      <h1>Ticketing Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-5">
        {statCards.map((card) => (
          <article key={card.title} className={`p-4 rounded-xl text-white ${card.color}`}>
            <div className="text-xs uppercase tracking-wider">{card.title}</div>
            <div className="text-3xl font-bold mt-2">{card.value}</div>
          </article>
        ))}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Filter by Status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white"
        >
          {statusOptions.map(status => (
            <option key={status} value={status}>{status === 'ALL' ? 'All Statuses' : status}</option>
          ))}
        </select>
      </div>

      {filteredTickets.length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-slate-800 border border-slate-700 rounded-lg">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium">Ticket</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Student</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Agent</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Category</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Priority</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Last Update</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => {
                const student = ticket.createdBy || 'Student Name'
                const agent = ticket.assignedTechnician || 'Unassigned'
                const studentInitial = student.charAt(0).toUpperCase()

                return (
                  <tr key={ticket.id} className="border-t border-slate-600 hover:bg-slate-700">
                    <td className="px-4 py-3">
                      <Link to={`/ticket-details/${ticket.id}`} className="text-blue-300 hover:text-blue-200 font-medium">
                        {ticket.title}
                      </Link>
                      <p className="text-xs text-slate-400 mt-1">{ticket.description?.slice(0, 64)}{ticket.description?.length > 64 ? '...' : ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-slate-600 text-xs font-semibold flex items-center justify-center">{studentInitial}</div>
                        <div className="text-sm text-slate-100">{student}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{agent}</td>
                    <td className="px-4 py-3 text-sm">{ticket.category || 'General'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status] || 'bg-gray-100 text-gray-800'}`}>
                        {ticket.status || 'OPEN'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={priorityColors[ticket.priority] || 'text-gray-600'}>{ticket.priority || 'LOW'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">{ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8">
        <ChatBot />
      </div>
    </div>
  )
}
