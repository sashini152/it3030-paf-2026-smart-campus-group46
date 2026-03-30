import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTickets } from '../hooks/useTickets'

const statusOptions = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

const statusColors = {
  OPEN: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-blue-100 text-blue-800',
  CLOSED: 'bg-gray-100 text-gray-800',
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

  if (loading) return <div className="hub-page hub-page--narrow"><p>Loading tickets...</p></div>
  if (error) return <div className="hub-page hub-page--narrow"><p className="text-red-500">Error: {error.message}</p></div>

  return (
    <div className="hub-page">
      <h1>Ticket List</h1>

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
                <th className="px-4 py-2 text-left text-sm font-medium">Title</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Priority</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Assigned Technician</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} className="border-t border-slate-600">
                  <td className="px-4 py-2 text-sm">
                    <Link to={`/ticket-details/${ticket.id}`} className="text-blue-400 hover:text-blue-300">
                      {ticket.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status] || 'bg-gray-100 text-gray-800'}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span className={priorityColors[ticket.priority] || 'text-gray-600'}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">{ticket.assignedTechnician || 'Unassigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}