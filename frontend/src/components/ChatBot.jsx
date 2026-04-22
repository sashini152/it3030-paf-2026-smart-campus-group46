import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTicketChat } from '../hooks/useTicketChat'
import * as ticketChatService from '../services/ticketChatService'
import { getSessionRole, isAdminRole } from '../utils/session'
import { getTicketDisplayId } from '../utils/ticketIdentity'
import { formatTicketDateTime } from '../utils/ticketPresentation'
import { getStudentIdentity, getTicketReporterLabel } from '../utils/studentIdentity'
import SurfaceCard from './SurfaceCard'

const studentQuickPrompts = [
  'The issue is still blocking me. Can someone update this ticket?',
  'I added more detail and a screenshot. Please check this again.',
  'Can you confirm whether this ticket is assigned to support yet?',
]

function isSupportAuthor(author) {
  return /admin|support/i.test(author || '')
}

function getTicketSortTime(ticket) {
  const value = ticket?.updatedAt || ticket?.createdAt || 0
  return new Date(value).getTime() || 0
}

function getTicketLabel(ticket) {
  if (!ticket) return ''
  const title = ticket.title || 'Untitled ticket'
  const status = (ticket.status || 'OPEN').replaceAll('_', ' ')
  return `${title} (${status})`
}

function getMessageLabel(message, isAdminView, fallbackStudentName) {
  const author = message.authorId || fallbackStudentName || 'Student'
  const authorName = message.authorName || fallbackStudentName || 'Student'
  const support = isSupportAuthor(author)

  if (support) {
    return isAdminView ? 'You' : 'Support'
  }

  if (isAdminView) {
    return `${authorName} (${author})`
  }

  return 'You'
}

export default function ChatBot({ tickets = [], hideTicketLink = false }) {
  const { user } = useAuth()
  const currentRole = getSessionRole()
  const isAdminView = isAdminRole(currentRole)
  const studentIdentity = getStudentIdentity(user)
  const availableTickets = useMemo(
    () => [...tickets].sort((a, b) => getTicketSortTime(b) - getTicketSortTime(a)),
    [tickets]
  )
  const [activeTicketId, setActiveTicketId] = useState(availableTickets[0]?.id || '')
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const bodyRef = useRef(null)

  useEffect(() => {
    if (!availableTickets.length) {
      setActiveTicketId('')
      return
    }

    const ticketStillVisible = availableTickets.some((ticket) => ticket.id === activeTicketId)
    if (!ticketStillVisible) {
      setActiveTicketId(availableTickets[0].id)
    }
  }, [activeTicketId, availableTickets])

  const activeTicket = useMemo(
    () => availableTickets.find((ticket) => ticket.id === activeTicketId) || null,
    [activeTicketId, availableTickets]
  )

  const {
    messages,
    loading,
    error,
    reload,
  } = useTicketChat(activeTicket?.id)

  useEffect(() => {
    if (!activeTicket?.id) return undefined

    const intervalId = window.setInterval(() => {
      reload().catch(() => {})
    }, 5000)

    return () => window.clearInterval(intervalId)
  }, [activeTicket?.id, reload])

  useEffect(() => {
    const node = bodyRef.current
    if (node) {
      node.scrollTop = node.scrollHeight
    }
  }, [messages, loading, submitting, activeTicketId])

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || !activeTicket?.id || submitting) return

    setSubmitting(true)
    try {
      await ticketChatService.createTicketChatMessage(activeTicket.id, {
        authorId: isAdminView ? 'Admin Support' : studentIdentity.studentId || studentIdentity.displayName,
        authorName: isAdminView ? 'Admin Support' : studentIdentity.displayName,
        content: trimmed,
      })
      setInput('')
      await reload()
    } catch (requestError) {
      window.alert('Failed to send the reply for this ticket.')
    } finally {
      setSubmitting(false)
    }
  }

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const applyPrompt = (prompt) => {
    setInput(prompt)
  }

  return (
    <SurfaceCard className="space-y-5 !border-[#FDA481] !bg-[#181A2F] !text-white shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FDA481]">
            {isAdminView ? 'Reply Desk' : 'Support Thread'}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            {isAdminView ? 'Reply to student messages' : 'Message support on your ticket'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/70">
            This chat board is separate from ticket comments and is only for live back-and-forth replies.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#FDA481] bg-[#242E49] px-3 py-1 text-xs font-semibold text-[#FDA481]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FDA481]" />
          Live thread
        </span>
      </div>

      {availableTickets.length > 1 ? (
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FDA481]">
            {isAdminView ? 'Active ticket' : 'Your ticket'}
          </span>
          <select
            value={activeTicketId}
            onChange={(event) => setActiveTicketId(event.target.value)}
            className="mt-2 w-full rounded-[18px] border border-[#37415C] bg-[#242E49] px-4 py-3 text-sm text-white outline-none transition focus:border-[#FDA481]"
          >
            {availableTickets.map((ticket) => (
              <option key={ticket.id} value={ticket.id}>
                {getTicketLabel(ticket)}
              </option>
            ))}
          </select>
        </label>
      ) : activeTicket ? (
        <div className="rounded-[22px] border border-[#37415C] bg-[#242E49] px-4 py-4 text-sm leading-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#FDA481]">
            {isAdminView ? 'Active ticket' : 'Ticket thread'}
          </p>
          <p className="mt-2 text-sm font-semibold text-white">{getTicketLabel(activeTicket)}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#FDA481]">
            Ticket ID: {getTicketDisplayId(activeTicket)}
          </p>
        </div>
      ) : (
        <div className="rounded-[22px] border border-[#37415C] bg-[#242E49] px-4 py-4 text-sm leading-6 text-white">
          {isAdminView
            ? 'No tickets are available in this view yet. Open or create a ticket first.'
            : 'Submit a ticket first. Once your ticket exists, you can continue the same conversation here and admin replies will appear in this thread.'}
        </div>
      )}

      {!isAdminView && availableTickets.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {studentQuickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => applyPrompt(prompt)}
              className="hub-button-pop whitespace-nowrap rounded-full border border-[#37415C] bg-[#242E49] px-3 py-2 text-xs font-semibold text-white"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div
        ref={bodyRef}
        className="mt-5 flex h-80 flex-col gap-3 overflow-y-auto rounded-[24px] border border-[#37415C] bg-[#242E49] p-4"
      >
        {!activeTicket && (
          <div className="rounded-[20px] bg-white p-4 text-sm leading-6 text-[#181A2F]">
            Pick a ticket to load its discussion thread.
          </div>
        )}

        {activeTicket && loading && (
          <div className="rounded-[20px] bg-white p-4 text-sm text-[#181A2F]">
            Loading conversation...
          </div>
        )}

        {activeTicket && error && (
          <div className="rounded-[20px] bg-white p-4 text-sm text-[#B4182D]">
            Failed to load the ticket conversation.
          </div>
        )}

        {activeTicket && !loading && !error && messages.length === 0 && (
          <div className="rounded-[20px] bg-white p-4 text-sm leading-6 text-[#181A2F]">
            No replies yet. {isAdminView ? 'Send the first response for this ticket.' : 'Send a follow-up and admin can reply here.'}
          </div>
        )}

        {activeTicket && !loading && !error && messages.map((message) => {
          const author = message.authorId || activeTicket.createdBy || studentIdentity.displayName
          const support = isSupportAuthor(author)
          return (
            <div
              key={message.id}
              className={`hub-message-enter ${support ? 'mr-8 rounded-[20px] bg-white p-3 shadow-none' : 'ml-8 rounded-[20px] bg-[#54162B] p-3 text-white shadow-none'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${support ? 'text-[#B4182D]' : 'text-[#FDA481]'}`}>
                  {getMessageLabel({ ...message, authorId: author }, isAdminView, getTicketReporterLabel(activeTicket))}
                </p>
                <p className={`text-[11px] ${support ? 'text-[#37415C]' : 'text-[#FDA481]'}`}>
                  {formatTicketDateTime(message.createdAt)}
                </p>
              </div>
              <p className={`mt-2 text-sm leading-6 ${support ? 'text-[#181A2F]' : 'text-white'}`}>
                {message.content}
              </p>
            </div>
          )
        })}
      </div>

      {activeTicket && !hideTicketLink && (
        <div className="flex items-center justify-between gap-3 text-xs text-[#FDA481]">
          <span>
            {getTicketDisplayId(activeTicket)} / {getTicketReporterLabel(activeTicket)} / {(activeTicket.status || 'OPEN').replaceAll('_', ' ')}
          </span>
          <Link to={`/ticket-details/${activeTicket.id}`} className="font-semibold text-[#FDA481] hover:text-white">
            Open full ticket
          </Link>
        </div>
      )}

      <div className="mt-4 rounded-[24px] border border-[#37415C] bg-white p-3">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          rows={3}
          disabled={!activeTicket || submitting}
          placeholder={
            isAdminView
              ? 'Reply to the student on this ticket.'
              : 'Send a follow-up on the same ticket so admin can reply here.'
          }
          className="w-full resize-none border-0 bg-transparent text-sm text-[#181A2F] outline-none placeholder:text-[#37415C] disabled:cursor-not-allowed disabled:opacity-60"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-[#37415C]">
            {activeTicket ? 'Press Enter to send' : 'Create or select a ticket first'}
          </p>
          <button
            type="button"
            onClick={sendMessage}
            disabled={!input.trim() || !activeTicket || submitting}
            className="hub-button-pop inline-flex items-center justify-center rounded-2xl border border-[#181A2F] bg-[#181A2F] px-4 py-2 text-sm font-semibold text-white shadow-none transition hover:bg-[#242E49] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Sending...' : isAdminView ? 'Send reply' : 'Send message'}
          </button>
        </div>
      </div>
    </SurfaceCard>
  )
}
