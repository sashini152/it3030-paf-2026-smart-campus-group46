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
    <div className="hub-page hub-page--tickets hub-ticket-flow space-y-8 rounded-[36px] bg-white p-6 text-[#181A2F] sm:p-8">
      <Reveal className="grid gap-4 sm:grid-cols-3" delay={20}>
        {queueStats.map((stat, index) => (
          <ParallaxPanel
            key={stat.label}
            strength={8 + index}
            className={`hub-lift rounded-[24px] border p-5 shadow-none ${
              index === 0
                ? 'border-[#37415C] bg-white text-[#181A2F]'
                : index === 1
                  ? 'border-[#242E49] bg-[#242E49] text-white'
                  : 'border-[#FDA481] bg-[#FDA481] text-[#181A2F]'
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em]">
              {stat.label}
            </p>
            <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
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
              <SurfaceCard className="space-y-5 !border-[#54162B] !bg-[#54162B] !text-white shadow-none">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FDA481]">Student Help</p>
            <div className="space-y-3">
              {helpItems.map((item, index) => {
                const open = openHelpIndex === index
                return (
                  <div key={item.title} className="rounded-[22px] border border-[#B4182D] bg-[#242E49] px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setOpenHelpIndex(open ? -1 : index)}
                      className="flex w-full items-center justify-between gap-3 text-left"
                    >
                      <span className="text-sm font-semibold text-white">{item.title}</span>
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#FDA481] text-sm text-[#FDA481] transition ${
                          open ? 'rotate-45 bg-[#B4182D]' : 'bg-[#181A2F]'
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
                      <div className="overflow-hidden text-sm leading-6 text-white">{item.copy}</div>
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
              <SurfaceCard className="space-y-5 !border-[#FDA481] !bg-white !text-[#181A2F] shadow-none">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#B4182D]">Ticket Tracker</p>
              <Tooltip text="This panel shows your latest four matching tickets and their current progress." tone="ticket">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#B4182D] bg-white text-[11px] font-semibold text-[#B4182D]">
                      i
                    </span>
                  </Tooltip>
                </div>
                <h2 className="mt-2 text-xl font-semibold">Track your status</h2>
              </div>
              <Link to="/ticket-list" className="text-sm font-semibold text-[#54162B] hover:text-[#B4182D]">
                View all
              </Link>
            </div>

            {studentName && (
              <p className="mt-3 text-sm text-[#37415C]">
                Showing tickets submitted by <span className="font-semibold text-[#181A2F]">{studentName}</span>.
              </p>
            )}

            {loading && <LoadingSpinner label="Loading ticket tracker..." tone="ticket" className="min-h-[140px]" />}
            {error && (
              <EmptyState
                title="Ticket tracking is unavailable"
                description="The incident ticket service did not respond successfully."
                tone="ticket"
              />
            )}
            {!loading && !error && trackedTickets.length === 0 && (
              <EmptyState
                title="No tickets to track yet"
                description="Submit your first ticket and it will appear here for status tracking and replies."
                tone="ticket"
              />
            )}

            {!loading && !error && trackedTickets.length > 0 && (
              <div className="space-y-3">
                {trackedTickets.map((ticket) => {
                  return (
                    <article key={ticket.id} className="hub-lift rounded-[24px] border border-[#242E49] bg-[#242E49] p-4 text-white shadow-none">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link
                            to={`/ticket-details/${ticket.id}`}
                            className="text-sm font-semibold text-white hover:text-[#FDA481]"
                          >
                            {ticket.title}
                          </Link>
                          <p className="mt-1 text-xs text-[#FDA481]">
                            {ticket.createdBy || 'Anonymous'} / {formatTicketDate(ticket.createdAt)}
                          </p>
                        </div>
                        <StatusBadge status={ticket.status} />
                      </div>

                      <TicketProgress status={ticket.status} compact className="mt-4" />

                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-white">
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
