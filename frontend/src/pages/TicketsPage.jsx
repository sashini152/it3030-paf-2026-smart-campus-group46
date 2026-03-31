import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import ChatBot from '../components/ChatBot'
import TicketForm from '../components/TicketForm'
import { useTickets } from '../hooks/useTickets'

function statusLabel(status) {
  return (status || 'OPEN').replaceAll('_', ' ')
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function getStatusIndex(status) {
  switch (status) {
    case 'IN_PROGRESS':
      return 1
    case 'RESOLVED':
      return 2
    case 'CLOSED':
      return 3
    default:
      return 0
  }
}

function getStatusTone(status) {
  switch (status) {
    case 'IN_PROGRESS':
      return 'border-[#d7e6f7] bg-[#eef6ff] text-[#1d4f91]'
    case 'RESOLVED':
      return 'border-[#b9d7d6] bg-[#f7fbfb] text-[#327f7d]'
    case 'CLOSED':
      return 'border-[#d8e0ea] bg-[#eef2f7] text-[#334155]'
    default:
      return 'border-[#dbe4ef] bg-white text-[#334155]'
  }
}

export default function TicketsPage() {
  const { tickets, loading, error, reload } = useTickets()
  const studentName = localStorage.getItem('ticket.userName') || ''

  const trackedTickets = useMemo(() => {
    const sorted = [...tickets].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    if (!studentName.trim()) return sorted.slice(0, 4)

    const mine = sorted.filter(
      (ticket) => (ticket.createdBy || '').trim().toLowerCase() === studentName.trim().toLowerCase()
    )

    return mine.slice(0, 4)
  }, [studentName, tickets])

  return (
    <div className="hub-page space-y-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <TicketForm onCreated={reload} />

        <aside className="space-y-6">
          <div className="rounded-[30px] border border-[#d8e0ea] bg-[linear-gradient(180deg,#ffffff_0%,#f3f7fb_100%)] p-6 text-[#0f172a] shadow-[0_20px_48px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#327f7d]">Student Help</p>
            <div className="mt-5 space-y-5 text-sm leading-6 text-[#475569]">
              <div>
                <p className="font-semibold text-[#0f172a]">Write the issue clearly</p>
                <p className="mt-1">Include the room, lab, or resource name so support can identify the problem quickly.</p>
              </div>
              <div>
                <p className="font-semibold text-[#0f172a]">Add useful details</p>
                <p className="mt-1">Explain when the issue started and how it affects your class, work, or booking.</p>
              </div>
              <div>
                <p className="font-semibold text-[#0f172a]">Track updates later</p>
                <p className="mt-1">Use the tracker below to check your status and read replies on your ticket.</p>
              </div>
            </div>
          </div>

          <ChatBot />

          <div className="rounded-[30px] border border-[#d8e0ea] bg-[linear-gradient(180deg,#ffffff_0%,#f2f6fb_100%)] p-6 text-[#0f172a] shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#327f7d]">Ticket Tracker</p>
                <h2 className="mt-2 text-xl font-semibold">Track your status</h2>
              </div>
              <Link to="/ticket-list" className="text-sm font-semibold text-[#327f7d] hover:text-[#286765]">
                View all
              </Link>
            </div>

            {studentName && (
              <p className="mt-3 text-sm text-[#64748b]">
                Showing tickets submitted by <span className="font-semibold text-[#0f172a]">{studentName}</span>.
              </p>
            )}

            {loading && <p className="mt-5 text-sm text-[#64748b]">Loading ticket tracker...</p>}
            {error && (
              <div className="mt-5 rounded-[22px] border border-[#e8c8c0] bg-[#fff7f5] px-4 py-4 text-sm text-[#8a3f32]">
                Ticket tracking is temporarily unavailable. The incident ticket service did not respond successfully.
              </div>
            )}
            {!loading && !error && trackedTickets.length === 0 && (
              <p className="mt-5 text-sm text-[#64748b]">
                No tickets found to track yet. Submit your first ticket and it will appear here.
              </p>
            )}

            {!loading && !error && trackedTickets.length > 0 && (
              <div className="mt-5 space-y-3">
                {trackedTickets.map((ticket) => {
                  const status = statusLabel(ticket.status)
                  const currentStep = getStatusIndex(ticket.status)
                  const steps = ['Submitted', 'In progress', 'Resolved', 'Closed']

                  return (
                    <article key={ticket.id} className="rounded-[24px] border border-[#dde5ef] bg-[#f8fbff] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link to={`/ticket-details/${ticket.id}`} className="text-sm font-semibold text-[#0f172a] hover:text-[#327f7d]">
                          {ticket.title}
                        </Link>
                        <p className="mt-1 text-xs text-[#64748b]">{ticket.createdBy || 'Anonymous'} / {formatDate(ticket.createdAt)}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${getStatusTone(ticket.status)}`}>
                        {status}
                      </span>
                    </div>

                      <div className="mt-4 grid grid-cols-4 gap-2">
                        {steps.map((step, index) => {
                          const complete = index <= currentStep
                          return (
                            <div key={step} className="space-y-2">
                              <div className={`h-2 rounded-full ${complete ? 'bg-[#327f7d]' : 'bg-[#d9e2ec]'}`} />
                              <p className={`text-[11px] font-medium ${complete ? 'text-[#0f172a]' : 'text-[#94a3b8]'}`}>
                                {step}
                              </p>
                            </div>
                          )
                        })}
                      </div>

                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#475569]">
                        {ticket.description}
                      </p>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  )
}
