import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ChatBot from '../components/ChatBot'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import ParallaxPanel from '../components/ParallaxPanel'
import Reveal from '../components/Reveal'
import StatusBadge from '../components/StatusBadge'
import SurfaceCard from '../components/SurfaceCard'
import TicketProgress from '../components/TicketProgress'
import TicketForm from '../components/TicketForm'
import Tooltip from '../components/Tooltip'
import { useTickets } from '../hooks/useTickets'
import { formatTicketDate } from '../utils/ticketPresentation'

const helpItems = [
  {
    title: 'Write the issue clearly',
    copy: 'Include the room, lab, or resource name so support can identify the problem quickly.',
  },
  {
    title: 'Add useful details',
    copy: 'Explain when the issue started and how it affects your class, work, or booking.',
  },
  {
    title: 'Track updates later',
    copy: 'Use the tracker below to check your status and read replies on your ticket.',
  },
]

export default function TicketsPage() {
  const { tickets, loading, error, reload } = useTickets()
  const studentName = localStorage.getItem('ticket.userName') || ''
  const [openHelpIndex, setOpenHelpIndex] = useState(0)

  const trackedTickets = useMemo(() => {
    const sorted = [...tickets].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    if (!studentName.trim()) return sorted.slice(0, 4)

    const mine = sorted.filter(
      (ticket) => (ticket.createdBy || '').trim().toLowerCase() === studentName.trim().toLowerCase()
    )

    return mine.slice(0, 4)
  }, [studentName, tickets])

  const queueStats = useMemo(() => {
    return [
      {
        label: 'Open queue',
        value: tickets.filter((ticket) => ticket.status === 'OPEN').length,
      },
      {
        label: 'In progress',
        value: tickets.filter((ticket) => ticket.status === 'IN_PROGRESS').length,
      },
      {
        label: 'Resolved',
        value: tickets.filter((ticket) => ticket.status === 'RESOLVED').length,
      },
    ]
  }, [tickets])

  return (
    <div className="hub-page space-y-8">
      <Reveal className="grid gap-4 sm:grid-cols-3" delay={20}>
        {queueStats.map((stat, index) => (
          <ParallaxPanel
            key={stat.label}
            strength={8 + index}
            className="hub-lift rounded-[24px] border border-[#d8e0ea] bg-[linear-gradient(180deg,#ffffff_0%,#f6f9fc_100%)] p-5 shadow-[0_18px_42px_rgba(15,23,42,0.08)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#64748b]">
              {stat.label}
            </p>
            <p className="mt-3 text-3xl font-semibold text-[#0f172a]">{stat.value}</p>
          </ParallaxPanel>
        ))}
      </Reveal>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Reveal delay={50}>
          <TicketForm onCreated={reload} />
        </Reveal>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Reveal delay={110}>
            <ParallaxPanel>
              <SurfaceCard className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#327f7d]">Student Help</p>
            <div className="space-y-3">
              {helpItems.map((item, index) => {
                const open = openHelpIndex === index
                return (
                  <div key={item.title} className="rounded-[22px] border border-[#dde5ef] bg-[#f8fbff] px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setOpenHelpIndex(open ? -1 : index)}
                      className="flex w-full items-center justify-between gap-3 text-left"
                    >
                      <span className="text-sm font-semibold text-[#0f172a]">{item.title}</span>
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#d8e0ea] text-sm text-[#475569] transition ${
                          open ? 'rotate-45 bg-white' : 'bg-[#f3f7fb]'
                        }`}
                      >
                        +
                      </span>
                    </button>
                    <div
                      className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ${
                        open ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-60'
                      }`}
                    >
                      <div className="overflow-hidden text-sm leading-6 text-[#475569]">{item.copy}</div>
                    </div>
                  </div>
                )
              })}
            </div>
              </SurfaceCard>
            </ParallaxPanel>
          </Reveal>

          <Reveal delay={170}>
            <ParallaxPanel strength={9}>
              <ChatBot />
            </ParallaxPanel>
          </Reveal>

          <Reveal delay={230}>
            <ParallaxPanel strength={10}>
              <SurfaceCard className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#327f7d]">Ticket Tracker</p>
                  <Tooltip text="This panel shows your latest four matching tickets and their current progress.">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#d8e0ea] bg-white text-[11px] font-semibold text-[#64748b]">
                      i
                    </span>
                  </Tooltip>
                </div>
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

            {loading && <LoadingSpinner label="Loading ticket tracker..." className="min-h-[140px]" />}
            {error && (
              <EmptyState
                title="Ticket tracking is unavailable"
                description="The incident ticket service did not respond successfully."
              />
            )}
            {!loading && !error && trackedTickets.length === 0 && (
              <EmptyState
                title="No tickets to track yet"
                description="Submit your first ticket and it will appear here for status tracking and replies."
              />
            )}

            {!loading && !error && trackedTickets.length > 0 && (
              <div className="space-y-3">
                {trackedTickets.map((ticket) => {
                  return (
                    <article key={ticket.id} className="hub-lift rounded-[24px] border border-[#dde5ef] bg-[#f8fbff] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link
                            to={`/ticket-details/${ticket.id}`}
                            className="text-sm font-semibold text-[#0f172a] hover:text-[#327f7d]"
                          >
                            {ticket.title}
                          </Link>
                          <p className="mt-1 text-xs text-[#64748b]">
                            {ticket.createdBy || 'Anonymous'} / {formatTicketDate(ticket.createdAt)}
                          </p>
                        </div>
                        <StatusBadge status={ticket.status} />
                      </div>

                      <TicketProgress status={ticket.status} compact className="mt-4" />

                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#475569]">
                        {ticket.description}
                      </p>
                    </article>
                  )
                })}
              </div>
            )}
              </SurfaceCard>
            </ParallaxPanel>
          </Reveal>
        </aside>
      </section>
    </div>
  )
}
