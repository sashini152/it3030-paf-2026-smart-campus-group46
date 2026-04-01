import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import SurfaceCard from '../components/SurfaceCard'
import TicketProgress from '../components/TicketProgress'
import { useComments } from '../hooks/useComments'
import * as ticketService from '../services/ticketService'
import * as commentService from '../services/commentService'
import { getSessionRole, isAdminRole } from '../utils/session'
import { formatTicketDateTime } from '../utils/ticketPresentation'

const statusWorkflow = {
  OPEN: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED', 'OPEN'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: ['OPEN', 'RESOLVED'],
}

function minutesBetween(start, end) {
  if (!start || !end) return null
  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()
  if (Number.isNaN(startTime) || Number.isNaN(endTime)) return null
  return Math.max(0, Math.round((endTime - startTime) / 60000))
}

function durationLabel(minutes) {
  if (minutes === null) return 'Pending'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`
}

export default function TicketDetails({ ticketId: ticketIdProp }) {
  const { id: routeTicketId } = useParams()
  const ticketId = ticketIdProp || routeTicketId
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const { comments, loading: commentsLoading, error: commentsError, reload: reloadComments } = useComments(ticketId)
  const currentRole = getSessionRole()
  const isAdmin = isAdminRole(currentRole)
  const commentAuthor = isAdmin ? 'Admin Support' : (localStorage.getItem('ticket.userName') || 'Student')

  useEffect(() => {
    if (!ticketId) return

    setLoading(true)
    setError(null)
    ticketService
      .fetchAnyTicket(ticketId)
      .then(setTicket)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [ticketId])

  const handleAddComment = async (event) => {
    event.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      await commentService.createAnyComment(ticketId, {
        author: commentAuthor,
        content: newComment,
      })
      setNewComment('')
      reloadComments()
    } catch (err) {
      alert('Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return

    try {
      await commentService.deleteAnyComment(ticketId, commentId)
      reloadComments()
    } catch (err) {
      alert('Failed to delete comment')
    }
  }

  const handleStatusChange = async (newStatus) => {
    setStatusUpdating(true)
    try {
      const updated = await ticketService.updateAnyTicketStatus(ticket, newStatus)
      setTicket(updated)
    } catch (err) {
      alert('Failed to update status')
    } finally {
      setStatusUpdating(false)
    }
  }

  if (!ticketId) {
    return (
      <div className="hub-page hub-page--narrow hub-ticket-flow rounded-[36px] bg-[linear-gradient(180deg,#181A2F_0%,#242E49_58%,#37415C_100%)] p-6 text-white sm:p-8">
        <EmptyState title="Ticket not found" description="The requested ticket id is missing." tone="ticket" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="hub-page hub-page--narrow hub-ticket-flow rounded-[36px] bg-[linear-gradient(180deg,#181A2F_0%,#242E49_58%,#37415C_100%)] p-6 text-white sm:p-8">
        <LoadingSpinner label="Loading ticket..." tone="ticket" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="hub-page hub-page--narrow hub-ticket-flow rounded-[36px] bg-[linear-gradient(180deg,#181A2F_0%,#242E49_58%,#37415C_100%)] p-6 text-white sm:p-8">
        <EmptyState
          title="Ticket details are unavailable"
          description={error.message || 'The ticket service did not respond successfully.'}
          tone="ticket"
        />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="hub-page hub-page--narrow hub-ticket-flow rounded-[36px] bg-[linear-gradient(180deg,#181A2F_0%,#242E49_58%,#37415C_100%)] p-6 text-white sm:p-8">
        <EmptyState title="Ticket not found" description="The requested ticket could not be loaded." tone="ticket" />
      </div>
    )
  }

  const responseMinutes = minutesBetween(ticket.createdAt, ticket.firstResponseAt)
  const resolutionMinutes = minutesBetween(ticket.createdAt, ticket.resolvedAt)

  return (
    <div className="hub-page hub-ticket-flow space-y-6 rounded-[36px] bg-[linear-gradient(180deg,#181A2F_0%,#242E49_58%,#37415C_100%)] p-6 text-white sm:p-8">
      <SurfaceCard className="space-y-6 !border-[#FDA481] !bg-white !text-[#181A2F] shadow-none">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#B4182D]">Ticket Tracker</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#181A2F]">{ticket.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#37415C]">{ticket.description}</p>
          </div>
          <StatusBadge status={ticket.status} className="px-4 py-2 text-xs" />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-[#181A2F] bg-[#181A2F] p-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FDA481]">Submitted By</p>
            <p className="mt-2 text-lg font-semibold text-white">{ticket.createdBy || 'Unknown'}</p>
            <p className="mt-1 text-sm text-white">{formatTicketDateTime(ticket.createdAt)}</p>
          </div>
          <div className="rounded-[24px] border border-[#37415C] bg-[#37415C] p-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FDA481]">Category</p>
            <p className="mt-2 text-lg font-semibold text-white">{ticket.category || 'General'}</p>
            <p className="mt-1 text-sm text-white">Priority: {ticket.priority || 'Not set'}</p>
          </div>
          <div className="rounded-[24px] border border-[#FDA481] bg-[#FDA481] p-4 text-[#181A2F]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#54162B]">First Response</p>
            <p className="mt-2 text-lg font-semibold text-[#181A2F]">{durationLabel(responseMinutes)}</p>
            <p className="mt-1 text-sm text-[#181A2F]">{ticket.firstResponseAt ? formatTicketDateTime(ticket.firstResponseAt) : 'Support has not picked it up yet.'}</p>
          </div>
          <div className="rounded-[24px] border border-[#54162B] bg-[#54162B] p-4 text-white md:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FDA481]">Resolution</p>
            <p className="mt-2 text-lg font-semibold text-white">{durationLabel(resolutionMinutes)}</p>
            <p className="mt-1 text-sm text-white">{ticket.resolvedAt ? formatTicketDateTime(ticket.resolvedAt) : 'Still being worked on.'}</p>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-[#242E49] bg-[#242E49] p-5">
          <p className="text-sm font-semibold text-white">Progress</p>
          <TicketProgress status={ticket.status} className="mt-4" />
        </div>

        {isAdmin && statusWorkflow[ticket.status]?.length > 0 && (
          <div className="mt-6 rounded-[24px] border border-[#B4182D] bg-[#B4182D] p-5">
            <label className="block text-sm font-semibold text-white">Admin Status Update</label>
            <select
              onChange={(event) => event.target.value && handleStatusChange(event.target.value)}
              defaultValue=""
              disabled={statusUpdating}
              className="mt-3 w-full rounded-2xl border border-white bg-white px-4 py-3 text-sm text-[#181A2F] outline-none"
            >
              <option value="">Change to...</option>
              {statusWorkflow[ticket.status].map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        )}
      </SurfaceCard>

      <SurfaceCard className="space-y-5 !border-[#54162B] !bg-[#242E49] !text-white shadow-none">
        <h2 className="text-xl font-semibold text-white">Comments</h2>
        <p className="mt-2 text-sm text-white">
          Admin replies and ticket follow-ups should appear here. Students can use this thread to continue the same issue instead of creating duplicate tickets.
        </p>

        {commentsError && (
          <div className="rounded-[22px] border border-[#B4182D] bg-white px-4 py-4 text-sm text-[#B4182D]">
            Error loading comments: {commentsError.message}
          </div>
        )}

        <div className="space-y-4">
          {commentsLoading ? (
            <LoadingSpinner label="Loading comments..." tone="ticket" className="min-h-[100px]" />
          ) : comments.length === 0 ? (
            <EmptyState title="No comments yet" description="Replies and follow-up discussion will appear here." tone="ticket" />
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="rounded-[22px] border border-[#37415C] bg-white p-4">
                <p className="text-sm leading-6 text-[#181A2F]">{comment.content}</p>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[#37415C]">
                  <span>{comment.author} / {formatTicketDateTime(comment.createdAt)}</span>
                  {isAdmin && (
                    <button onClick={() => handleDeleteComment(comment.id)} className="text-[#B4182D]">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddComment} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-white">
              {isAdmin ? 'Reply to student' : 'Add Comment'}
            </span>
            <textarea
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              rows={3}
              className="mt-2 block w-full rounded-2xl border border-[#FDA481] bg-white px-4 py-3 text-sm text-[#181A2F] outline-none"
              placeholder={isAdmin ? 'Write an admin reply...' : 'Write your comment...'}
            />
          </label>
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="inline-flex items-center rounded-2xl border border-[#FDA481] bg-[#FDA481] px-4 py-2 text-sm font-semibold text-[#181A2F] disabled:opacity-50"
          >
            {submitting ? 'Adding...' : 'Add Comment'}
          </button>
        </form>
      </SurfaceCard>
    </div>
  )
}
