import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useComments } from '../hooks/useComments'
import * as ticketService from '../services/ticketService'
import * as commentService from '../services/commentService'
import { getSessionRole, isAdminRole } from '../utils/session'

const statusStyles = {
  OPEN: 'border-[#dbe4ef] bg-white text-[#334155]',
  IN_PROGRESS: 'border-[#d7e6f7] bg-[#eef6ff] text-[#1d4f91]',
  RESOLVED: 'border-[#b9d7d6] bg-[#f7fbfb] text-[#327f7d]',
  CLOSED: 'border-[#d8e0ea] bg-[#eef2f7] text-[#334155]',
}

const statusWorkflow = {
  OPEN: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED', 'OPEN'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: ['OPEN', 'RESOLVED'],
}

const trackingSteps = ['Submitted', 'In progress', 'Resolved', 'Closed']

function statusLabel(status) {
  return (status || 'OPEN').replaceAll('_', ' ')
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

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString()
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

export default function TicketDetails() {
  const { id } = useParams()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const { comments, loading: commentsLoading, error: commentsError, reload: reloadComments } = useComments(id)
  const currentRole = getSessionRole()
  const isAdmin = isAdminRole(currentRole)
  const commentAuthor = isAdmin ? 'Admin Support' : (localStorage.getItem('ticket.userName') || 'Student')

  useEffect(() => {
    ticketService
      .fetchTicket(id)
      .then(setTicket)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [id])

  const handleAddComment = async (event) => {
    event.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      await commentService.createComment(id, {
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
      await commentService.deleteComment(id, commentId)
      reloadComments()
    } catch (err) {
      alert('Failed to delete comment')
    }
  }

  const handleStatusChange = async (newStatus) => {
    setStatusUpdating(true)
    try {
      const updated = await ticketService.updateStatus(id, newStatus)
      setTicket(updated)
    } catch (err) {
      alert('Failed to update status')
    } finally {
      setStatusUpdating(false)
    }
  }

  if (loading) return <div className="hub-page hub-page--narrow"><p>Loading ticket...</p></div>
  if (error) return <div className="hub-page hub-page--narrow"><p className="text-red-500">Error: {error.message}</p></div>
  if (!ticket) return <div className="hub-page hub-page--narrow"><p>Ticket not found.</p></div>

  const currentStep = getStatusIndex(ticket.status)
  const responseMinutes = minutesBetween(ticket.createdAt, ticket.firstResponseAt)
  const resolutionMinutes = minutesBetween(ticket.createdAt, ticket.resolvedAt)

  return (
    <div className="hub-page space-y-6">
      <section className="rounded-[32px] border border-[#d8e0ea] bg-[linear-gradient(180deg,#ffffff_0%,#f3f7fb_100%)] p-6 text-[#0f172a] shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#327f7d]">Ticket Tracker</p>
            <h1 className="mt-2 text-3xl font-semibold">{ticket.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#475569]">{ticket.description}</p>
          </div>
          <span className={`inline-flex rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${statusStyles[ticket.status] || 'border-[#dbe4ef] bg-white text-[#334155]'}`}>
            {statusLabel(ticket.status)}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-[#dde5ef] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">Submitted By</p>
            <p className="mt-2 text-lg font-semibold text-[#0f172a]">{ticket.createdBy || 'Unknown'}</p>
            <p className="mt-1 text-sm text-[#64748b]">{formatDateTime(ticket.createdAt)}</p>
          </div>
          <div className="rounded-[24px] border border-[#dde5ef] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">First Response</p>
            <p className="mt-2 text-lg font-semibold text-[#0f172a]">{durationLabel(responseMinutes)}</p>
            <p className="mt-1 text-sm text-[#64748b]">{ticket.firstResponseAt ? formatDateTime(ticket.firstResponseAt) : 'Support has not picked it up yet.'}</p>
          </div>
          <div className="rounded-[24px] border border-[#dde5ef] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">Resolution</p>
            <p className="mt-2 text-lg font-semibold text-[#0f172a]">{durationLabel(resolutionMinutes)}</p>
            <p className="mt-1 text-sm text-[#64748b]">{ticket.resolvedAt ? formatDateTime(ticket.resolvedAt) : 'Still being worked on.'}</p>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-[#dde5ef] bg-white p-5">
          <p className="text-sm font-semibold text-[#0f172a]">Progress</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {trackingSteps.map((step, index) => {
              const complete = index <= currentStep
              return (
                <div key={step} className="space-y-2">
                  <div className={`h-2 rounded-full ${complete ? 'bg-[#327f7d]' : 'bg-[#d9e2ec]'}`} />
                  <p className={`text-sm font-medium ${complete ? 'text-[#0f172a]' : 'text-[#94a3b8]'}`}>{step}</p>
                </div>
              )
            })}
          </div>
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
                <option key={status} value={status}>{statusLabel(status)}</option>
              ))}
            </select>
          </div>
        )}
      </section>

      <section className="rounded-[32px] border border-[#d8e0ea] bg-[linear-gradient(180deg,#ffffff_0%,#f2f6fb_100%)] p-6 text-[#0f172a] shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <h2 className="text-xl font-semibold">Comments</h2>
        <p className="mt-2 text-sm text-[#64748b]">
          Admin replies and ticket follow-ups should appear here. Students can use this thread to continue the same issue instead of creating duplicate tickets.
        </p>

        {commentsError && <p className="mt-4 text-sm text-red-500">Error loading comments: {commentsError.message}</p>}

        <div className="mt-5 space-y-4">
          {commentsLoading ? (
            <p className="text-sm text-[#64748b]">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-[#64748b]">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="rounded-[22px] border border-[#dde5ef] bg-white p-4">
                <p className="text-sm leading-6 text-[#334155]">{comment.content}</p>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[#64748b]">
                  <span>{comment.author} / {formatDateTime(comment.createdAt)}</span>
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
      </section>
    </div>
  )
}
