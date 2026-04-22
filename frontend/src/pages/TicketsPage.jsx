import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import ParallaxPanel from '../components/ParallaxPanel'
import Reveal from '../components/Reveal'
import SurfaceCard from '../components/SurfaceCard'
import TicketProgress from '../components/TicketProgress'
import TicketForm from '../components/TicketForm'
import Tooltip from '../components/Tooltip'
import { useAuth } from '../hooks/useAuth'
import { useTickets } from '../hooks/useTickets'
import { getTicketDisplayId } from '../utils/ticketIdentity'
import { formatTicketDate, normalizeTicketWorkflowStatus } from '../utils/ticketPresentation'
import { getStudentIdentity, getTicketReporterLabel, ticketMatchesStudent } from '../utils/studentIdentity'

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
  const { user } = useAuth()
  const { tickets, loading, error, reload } = useTickets()
  const studentIdentity = getStudentIdentity(user)
  const [openHelpIndex, setOpenHelpIndex] = useState(0)

  const trackedTickets = useMemo(() => {
    const sorted = [...tickets].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    if (!studentIdentity.studentId.trim()) return sorted.slice(0, 4)

    const mine = sorted.filter((ticket) => ticketMatchesStudent(ticket, user))

    return mine.slice(0, 4)
  }, [studentIdentity.studentId, tickets, user])

  const queueStats = useMemo(() => {
    return [
      {
        label: 'Open',
        value: tickets.filter((ticket) => normalizeTicketWorkflowStatus(ticket.status) === 'OPEN').length,
        tone: 'border-[#37415C] bg-white text-[#181A2F]',
      },
      {
        label: 'In progress',
        value: tickets.filter((ticket) => normalizeTicketWorkflowStatus(ticket.status) === 'IN_PROGRESS').length,
        tone: 'border-[#242E49] bg-[#242E49] text-white',
      },
      {
        label: 'Resolved',
        value: tickets.filter((ticket) => normalizeTicketWorkflowStatus(ticket.status) === 'RESOLVED').length,
        tone: 'border-[#FDA481] bg-[#FDA481] text-[#181A2F]',
      },
      {
        label: 'Closed',
        value: tickets.filter((ticket) => normalizeTicketWorkflowStatus(ticket.status) === 'CLOSED').length,
        tone: 'border-[#54162B] bg-[#54162B] text-white',
      },
      {
        label: 'Rejected',
        value: tickets.filter((ticket) => normalizeTicketWorkflowStatus(ticket.status) === 'REJECTED').length,
        tone: 'border-[#B4182D] bg-[#B4182D] text-white',
      },
    ]
  }, [tickets])

  return (
    <div className="hub-page hub-page--tickets hub-ticket-flow space-y-8 rounded-[36px] bg-white p-6 text-[#181A2F] sm:p-8">
      <Reveal className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" delay={20}>
        {queueStats.map((stat, index) => (
          <ParallaxPanel
            key={stat.label}
            strength={8 + index}
            className={`hub-lift rounded-[24px] border p-5 shadow-none ${stat.tone}`}
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
              <SurfaceCard className="space-y-4 !border-[#FDA481] !bg-white !text-[#181A2F] shadow-none">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FDA481]">Live replies</p>
                <h2 className="text-xl font-semibold text-[#181A2F]">Use the chat inside your ticket</h2>
                <p className="text-sm leading-6 text-[#37415C]">
                  Each ticket has its own reply thread. Open your ticket from the tracker below to read admin messages and send your reply in the correct conversation.
                </p>
              </SurfaceCard>
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

            {studentIdentity.studentId && (
              <p className="mt-3 text-sm text-[#37415C]">
                Showing tickets for <span className="font-semibold text-[#181A2F]">{studentIdentity.studentId}</span>.
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
                            {getTicketReporterLabel(ticket)} / {formatTicketDate(ticket.createdAt)}
                          </p>
                          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FDA481]/90">
                            Ticket ID {getTicketDisplayId(ticket)}
                          </p>
                        </div>
                        <Link
                          to={`/ticket-details/${ticket.id}`}
                          className="inline-flex items-center rounded-full border border-white bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#242E49] transition hover:border-[#FDA481] hover:bg-[#FDA481] hover:text-[#181A2F] hover:no-underline"
                        >
                          Open
                        </Link>
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

