import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ChatBot from '../components/ChatBot'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import ParallaxPanel from '../components/ParallaxPanel'
import Reveal from '../components/Reveal'
import StatusBadge from '../components/StatusBadge'
import SurfaceCard from '../components/SurfaceCard'
import Tooltip from '../components/Tooltip'
import { useTickets } from '../hooks/useTickets'
import {
  TICKET_STATUS_OPTIONS,
  formatTicketDateTime,
  getTicketPriorityTone,
  getTicketSummaryStats,
} from '../utils/ticketPresentation'

const statConfig = [
  { key: 'open', label: 'Open', accent: 'text-[#181A2F]', tone: 'border-[#242E49] bg-white text-[#181A2F]' },
  { key: 'inProgress', label: 'In progress', accent: 'text-white', tone: 'border-[#37415C] bg-[#242E49] text-white' },
  { key: 'resolved', label: 'Resolved', accent: 'text-[#181A2F]', tone: 'border-[#FDA481] bg-[#FDA481] text-[#181A2F]' },
  { key: 'closed', label: 'Closed', accent: 'text-white', tone: 'border-[#54162B] bg-[#54162B] text-white' },
  { key: 'waitingForClient', label: 'Waiting for client', accent: 'text-white', tone: 'border-[#B4182D] bg-[#B4182D] text-white' },
  { key: 'waitingForSupport', label: 'Waiting for support', accent: 'text-white', tone: 'border-[#37415C] bg-[#37415C] text-white' },
]

const insightSlides = [
  {
    title: 'Prioritize active outages first',
    body: 'Check OPEN and IN_PROGRESS queues first so students see immediate movement on critical reports.',
  },
  {
    title: 'Use waiting states clearly',
    body: 'WAITING_FOR_CLIENT and WAITING_FOR_SUPPORT tell students exactly why a ticket is paused.',
  },
  {
    title: 'Keep updates visible',
    body: 'Ticket details and comments are the student-facing source of truth for progress and next action.',
  },
]

function formatFilterLabel(status) {
  return status === 'ALL' ? 'All statuses' : status.replaceAll('_', ' ')
}

export default function TicketList() {
  const { tickets, loading, error } = useTickets()
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [hoveredTicketId, setHoveredTicketId] = useState(null)
  const [activeInsight, setActiveInsight] = useState(0)
  const [pauseInsights, setPauseInsights] = useState(false)

  useEffect(() => {
    if (pauseInsights) return undefined
    const timer = setInterval(() => {
      setActiveInsight((current) => (current + 1) % insightSlides.length)
    }, 4800)
    return () => clearInterval(timer)
  }, [pauseInsights])

  const filteredTickets = useMemo(() => {
    if (statusFilter === 'ALL') return tickets
    return tickets.filter((ticket) => ticket.status === statusFilter)
  }, [statusFilter, tickets])

  const stats = useMemo(() => getTicketSummaryStats(tickets), [tickets])

  return (
    <div className="hub-page hub-ticket-flow space-y-8 rounded-[36px] bg-[linear-gradient(180deg,#181A2F_0%,#242E49_52%,#37415C_100%)] p-6 text-white sm:p-8">
      <Reveal delay={30}>
        <section className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FDA481]">
            Support Dashboard
          </p>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Browse and track submitted tickets
            </h1>
            <p className="max-w-3xl text-base leading-7 text-white">
              Review ticket history, filter the queue by status, and open each ticket to read progress,
              comments, and support updates.
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
                  Each row links to a full ticket thread with comments, progress, and status history.
                </p>
              </div>

              <label className="block min-w-[220px]">
                <span className="flex items-center gap-2 text-sm font-medium text-[#181A2F]">
                  <span>Filter by status</span>
                  <Tooltip text="Use this to isolate one workflow stage without leaving the page." tone="ticket">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#B4182D] bg-white text-[11px] font-semibold text-[#B4182D]">
                      i
                    </span>
                  </Tooltip>
                </span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="hub-button-pop mt-2 w-full rounded-2xl border border-[#37415C] bg-white px-4 py-3 text-sm text-[#181A2F] outline-none transition focus:border-[#B4182D]"
                >
                  {TICKET_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {formatFilterLabel(status)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="hub-ticket-filter-chips" role="toolbar" aria-label="Quick status filters">
              {TICKET_STATUS_OPTIONS.map((status) => {
                const active = statusFilter === status
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`hub-ticket-filter-chip ${active ? 'hub-ticket-filter-chip--active' : ''}`}
                  >
                    {formatFilterLabel(status)}
                  </button>
                )
              })}
            </div>

            {loading && <LoadingSpinner label="Loading tickets..." tone="ticket" />}

            {error && !loading && (
              <EmptyState
                title="Ticket list is unavailable"
                description={error.message || 'The ticket service did not respond successfully.'}
                tone="ticket"
              />
            )}

            {!loading && !error && filteredTickets.length === 0 && (
              <EmptyState
                title="No tickets match this filter"
                description="Try another status or submit a new ticket from the student intake page."
                tone="ticket"
                action={
                  <Link to="/tickets" className="text-sm font-semibold text-[#FDA481]">
                    Open ticket page
                  </Link>
                }
              />
            )}

            {!loading && !error && filteredTickets.length > 0 && (
              <div className="overflow-x-auto rounded-[24px] border border-[#37415C] bg-[#242E49] p-2">
                <table className="min-w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-left text-sm text-[#FDA481]">
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
                    {filteredTickets.map((ticket, index) => {
                      const student = ticket.createdBy || 'Student'
                      const technician = ticket.assignedTechnician || 'Unassigned'
                      const hovered = hoveredTicketId === ticket.id

                      return (
                        <tr
                          key={ticket.id}
                          onMouseEnter={() => setHoveredTicketId(ticket.id)}
                          onMouseLeave={() => setHoveredTicketId(null)}
                          className={`hub-ticket-list-row align-top transition ${hovered ? 'hub-ticket-list-row--active' : ''}`}
                          style={{ animationDelay: `${index * 55}ms` }}
                        >
                          <td className="rounded-l-[18px] bg-white px-4 py-4">
                            <Link
                              to={`/ticket-details/${ticket.id}`}
                              className="inline-flex items-center gap-2 text-sm font-semibold text-[#181A2F] hover:text-[#B4182D]"
                            >
                              <span>{ticket.title}</span>
                              <span
                                className={`text-sm text-[#B4182D] transition ${hovered ? 'translate-x-1' : ''}`}
                                aria-hidden="true"
                              >
                                {'->'}
                              </span>
                            </Link>
                            <p className="mt-1 max-w-[28ch] text-xs leading-5 text-[#37415C]">
                              {ticket.description?.slice(0, 90)}
                              {ticket.description?.length > 90 ? '...' : ''}
                            </p>
                          </td>
                          <td className="bg-white px-4 py-4 text-sm text-[#181A2F]">{student}</td>
                          <td className="bg-white px-4 py-4 text-sm text-[#181A2F]">{technician}</td>
                          <td className="bg-white px-4 py-4 text-sm text-[#181A2F]">
                            {ticket.category || 'General'}
                          </td>
                          <td className="bg-white px-4 py-4">
                            <StatusBadge status={ticket.status} />
                          </td>
                          <td
                            className={`bg-white px-4 py-4 text-sm font-semibold ${getTicketPriorityTone(
                              ticket.priority
                            )}`}
                          >
                            {ticket.priority || 'LOW'}
                          </td>
                          <td className="rounded-r-[18px] bg-white px-4 py-4 text-sm text-[#37415C]">
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
        </Reveal>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Reveal delay={200}>
            <ParallaxPanel strength={10}>
              <SurfaceCard
                className="space-y-4 !border-[#54162B] !bg-[#54162B] !text-white shadow-none"
                onMouseEnter={() => setPauseInsights(true)}
                onMouseLeave={() => setPauseInsights(false)}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FDA481]">
                  Queue Insights
                </p>
                <div key={activeInsight} className="hub-ticket-insight hub-fade-slide">
                  <h3 className="text-base font-semibold text-white">{insightSlides[activeInsight].title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white">{insightSlides[activeInsight].body}</p>
                </div>

                <div className="hub-ticket-insight__controls">
                  <div className="hub-ticket-insight__dots" role="tablist" aria-label="Insight slides">
                    {insightSlides.map((slide, index) => (
                      <button
                        key={slide.title}
                        type="button"
                        className={`hub-ticket-insight__dot ${
                          index === activeInsight ? 'hub-ticket-insight__dot--active' : ''
                        }`}
                        onClick={() => setActiveInsight(index)}
                        aria-label={`Show insight ${index + 1}`}
                        aria-selected={index === activeInsight}
                        role="tab"
                      />
                    ))}
                  </div>
                  <div className="hub-ticket-insight__buttons">
                    <button
                      type="button"
                      className="hub-ticket-insight__control"
                      onClick={() =>
                        setActiveInsight((current) =>
                          current === 0 ? insightSlides.length - 1 : current - 1
                        )
                      }
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      className="hub-ticket-insight__control"
                      onClick={() => setActiveInsight((current) => (current + 1) % insightSlides.length)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </SurfaceCard>
            </ParallaxPanel>
          </Reveal>

          <Reveal delay={260}>
            <ParallaxPanel strength={9}>
              <ChatBot />
            </ParallaxPanel>
          </Reveal>
        </aside>
      </section>
    </div>
  )
}
