import { useTickets } from '../hooks/useTickets'
import TicketForm from '../components/TicketForm'

export default function TicketsPage() {
  const { tickets, loading, error, reload } = useTickets()

  return (
    <div className="hub-page hub-page--narrow">
      <h1>Tickets</h1>
      <TicketForm onCreated={reload} />
      {loading && <p>Loading tickets...</p>}
      {error && <p className="text-red-500">Error: {error.message}</p>}
      {!loading && !error && tickets.length === 0 && <p>No tickets found yet.</p>}
      {tickets.length > 0 && (
        <ul className="space-y-3">
          {tickets.map((ticket) => (
            <li key={ticket.id} className="rounded-lg p-3 border border-slate-700 bg-slate-800">
              <p className="font-semibold">{ticket.title}</p>
              <p>{ticket.description}</p>
              <div className="mt-2">
                <span className="text-xs text-slate-400">{ticket.status}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
