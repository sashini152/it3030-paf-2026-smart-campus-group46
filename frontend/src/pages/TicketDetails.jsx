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
      const updated = await ticketService.updateStatus(ticketId, newStatus)
      setTicket(updated)
    } catch (err) {
      alert('Failed to update status')
    } finally {
      setStatusUpdating(false)
    }
  }

  if (!ticketId) {
    return (
      <div className="hub-page hub-page--narrow">
        <EmptyState title="Ticket not found" description="The requested ticket id is missing." />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="hub-page hub-page--narrow">
        <LoadingSpinner label="Loading ticket..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="hub-page hub-page--narrow">
        <EmptyState
          title="Ticket details are unavailable"
          description={error.message || 'The ticket service did not respond successfully.'}
        />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="hub-page hub-page--narrow">
        <EmptyState title="Ticket not found" description="The requested ticket could not be loaded." />
      </div>
    )
  }

  const responseMinutes = minutesBetween(ticket.createdAt, ticket.firstResponseAt)
  const resolutionMinutes = minutesBetween(ticket.createdAt, ticket.resolvedAt)

  return (
    <div className="hub-page space-y-6">
      <SurfaceCard className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#327f7d]">Ticket Tracker</p>
            <h1 className="mt-2 text-3xl font-semibold">{ticket.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#475569]">{ticket.description}</p>
          </div>
          <StatusBadge status={ticket.status} className="px-4 py-2 text-xs" />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-[#dde5ef] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">Submitted By</p>
            <p className="mt-2 text-lg font-semibold text-[#0f172a]">{ticket.createdBy || 'Unknown'}</p>
            <p className="mt-1 text-sm text-[#64748b]">{formatTicketDateTime(ticket.createdAt)}</p>
          </div>
          <div className="rounded-[24px] border border-[#dde5ef] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">Category</p>
            <p className="mt-2 text-lg font-semibold text-[#0f172a]">{ticket.category || 'General'}</p>
            <p className="mt-1 text-sm text-[#64748b]">Priority: {ticket.priority || 'Not set'}</p>
          </div>
          <div className="rounded-[24px] border border-[#dde5ef] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">First Response</p>
            <p className="mt-2 text-lg font-semibold text-[#0f172a]">{durationLabel(responseMinutes)}</p>
            <p className="mt-1 text-sm text-[#64748b]">{ticket.firstResponseAt ? formatTicketDateTime(ticket.firstResponseAt) : 'Support has not picked it up yet.'}</p>
          </div>
          <div className="rounded-[24px] border border-[#dde5ef] bg-white p-4 md:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">Resolution</p>
            <p className="mt-2 text-lg font-semibold text-[#0f172a]">{durationLabel(resolutionMinutes)}</p>
            <p className="mt-1 text-sm text-[#64748b]">{ticket.resolvedAt ? formatTicketDateTime(ticket.resolvedAt) : 'Still being worked on.'}</p>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-[#dde5ef] bg-white p-5">
          <p className="text-sm font-semibold text-[#0f172a]">Progress</p>
          <TicketProgress status={ticket.status} className="mt-4" />
        </div>

        {isAdmin && statusWorkflow[ticket.status]?.length > 0 && (
          <div className="mt-6 rounded-[24px] border border-[#dde5ef] bg-white p-5">
            <label className="block text-sm font-semibold text-[#0f172a]">Admin Status Update</label>
            <select
              onChange={(event) => event.target.value && handleStatusChange(event.target.value)}
              defaultValue=""
              disabled={statusUpdating}
              className="mt-3 w-full rounded-2xl border border-[#d9e2ec] bg-[#fbfdff] px-4 py-3 text-sm text-[#0f172a] outline-none"
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

      <SurfaceCard className="space-y-5">
        <h2 className="text-xl font-semibold">Comments</h2>
        <p className="mt-2 text-sm text-[#64748b]">
          Admin replies and ticket follow-ups should appear here. Students can use this thread to continue the same issue instead of creating duplicate tickets.
        </p>

        {commentsError && (
          <div className="rounded-[22px] border border-[#e8c8c0] bg-[#fff7f5] px-4 py-4 text-sm text-[#8a3f32]">
            Error loading comments: {commentsError.message}
          </div>
        )}

        <div className="space-y-4">
          {commentsLoading ? (
            <LoadingSpinner label="Loading comments..." className="min-h-[100px]" />
          ) : comments.length === 0 ? (
            <EmptyState title="No comments yet" description="Replies and follow-up discussion will appear here." />
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="rounded-[22px] border border-[#dde5ef] bg-white p-4">
                <p className="text-sm leading-6 text-[#334155]">{comment.content}</p>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[#64748b]">
                  <span>{comment.author} / {formatTicketDateTime(comment.createdAt)}</span>
                  {isAdmin && (
                    <button onClick={() => handleDeleteComment(comment.id)} className="text-[#8a3f32]">
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
            <span className="text-sm font-semibold text-[#0f172a]">
              {isAdmin ? 'Reply to student' : 'Add Comment'}
            </span>
            <textarea
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              rows={3}
              className="mt-2 block w-full rounded-2xl border border-[#d9e2ec] bg-[#fbfdff] px-4 py-3 text-sm text-[#0f172a] outline-none"
              placeholder={isAdmin ? 'Write an admin reply...' : 'Write your comment...'}
            />
          </label>
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="inline-flex items-center rounded-2xl border border-[#327f7d] bg-[linear-gradient(180deg,#274c77_0%,#163455_100%)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting ? 'Adding...' : 'Add Comment'}
          </button>
        </form>
      </SurfaceCard>
    </div>
  )
}
