import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ChatBot from '../components/ChatBot'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import SurfaceCard from '../components/SurfaceCard'
import TicketProgress from '../components/TicketProgress'
import { useComments } from '../hooks/useComments'
import { useAuth } from '../hooks/useAuth'
import * as ticketService from '../services/ticketService'
import * as commentService from '../services/commentService'
import { getSessionRole, isAdminRole } from '../utils/session'
import {
  formatTicketDateTime,
  formatTicketStatus,
  getAllowedTicketStatusTransitions,
  normalizeTicketWorkflowStatus,
  TICKET_STATUSES,
} from '../utils/ticketPresentation'
import { getTicketDisplayId } from '../utils/ticketIdentity'
import { getCommentAuthorLabel, getStudentIdentity, getTicketReporterLabel } from '../utils/studentIdentity'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

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

function detailValue(value, fallback = 'Not provided') {
  return value ? String(value) : fallback
}

function resolveTicketImageUrl(imageUrl) {
  if (!imageUrl) return ''
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl
  return `${API_BASE_URL}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`
}

export default function TicketDetails({ ticketId: ticketIdProp }) {
  const { user } = useAuth()
  const { id: routeTicketId } = useParams()
  const ticketId = ticketIdProp || routeTicketId
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [assignmentDraft, setAssignmentDraft] = useState('')
  const [resolutionNotesDraft, setResolutionNotesDraft] = useState('')
  const [adminSaving, setAdminSaving] = useState('')
  const [uploadingImages, setUploadingImages] = useState(false)
  const { comments, loading: commentsLoading, error: commentsError, reload: reloadComments } = useComments(ticketId)
  const currentRole = getSessionRole()
  const isAdmin = isAdminRole(currentRole)
  const studentIdentity = getStudentIdentity(user)

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

  useEffect(() => {
    if (!ticket) return
    setAssignmentDraft(ticket.assignedTechnician || '')
    setResolutionNotesDraft(ticket.resolutionNotes || '')
  }, [ticket])

  const handleAddComment = async (event) => {
    event.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      await commentService.createAnyComment(ticketId, {
        author: isAdmin ? 'Admin Support' : studentIdentity.studentId || studentIdentity.displayName,
        authorName: isAdmin ? 'Admin Support' : studentIdentity.displayName,
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

  const handleStatusChange = async (newStatus, rejectionReason = '') => {
    setStatusUpdating(true)
    try {
      const updated = await ticketService.updateAnyTicketStatus(ticket, newStatus, rejectionReason)
      setTicket(updated)
    } catch (err) {
      alert(err.message || 'Failed to update status')
    } finally {
      setStatusUpdating(false)
    }
  }

  const handleAssignmentSave = async () => {
    setAdminSaving('assignment')
    try {
      const updated = await ticketService.updateAnyTicketAssignment(ticket, assignmentDraft.trim())
      setTicket(updated)
    } catch (err) {
      alert(err.message || 'Failed to save assignment')
    } finally {
      setAdminSaving('')
    }
  }

  const handleResolutionNotesSave = async () => {
    setAdminSaving('resolutionNotes')
    try {
      const updated = await ticketService.updateAnyTicketResolutionNotes(ticket, resolutionNotesDraft.trim())
      setTicket(updated)
    } catch (err) {
      alert(err.message || 'Failed to save resolution notes')
    } finally {
      setAdminSaving('')
    }
  }

  const handleImageUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files || [])
    if (!selectedFiles.length) return

    setUploadingImages(true)
    try {
      await ticketService.uploadTicketImages(ticket.id, selectedFiles)
      const refreshed = await ticketService.fetchAnyTicket(ticket.id)
      setTicket(refreshed)
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to upload images')
    } finally {
      event.target.value = ''
      setUploadingImages(false)
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

  const resolutionMinutes = minutesBetween(ticket.createdAt, ticket.resolvedAt)
  const responseMinutes = minutesBetween(ticket.createdAt, ticket.firstResponseAt)
  const reporterLabel = getTicketReporterLabel(ticket)
  const currentStatus = normalizeTicketWorkflowStatus(ticket.status)
  const allowedTransitions = getAllowedTicketStatusTransitions(ticket.status)

  return (
    <div className="hub-page hub-ticket-flow space-y-6 rounded-[36px] bg-[linear-gradient(180deg,#181A2F_0%,#242E49_58%,#37415C_100%)] p-6 text-white sm:p-8">
      <SurfaceCard className="space-y-6 !border-[#FDA481] !bg-white !text-[#181A2F] shadow-none">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#B4182D]">Ticket Tracker</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#181A2F]">{ticket.title}</h1>
          </div>
          <StatusBadge status={ticket.status} className="px-4 py-2 text-xs" />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-[#181A2F] bg-[#181A2F] p-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FDA481]">Submitted By</p>
            <p className="mt-2 text-lg font-semibold text-white">{reporterLabel}</p>
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

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[24px] border border-[#FDA481] bg-[#fff8f5] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B4182D]">Incident description</p>
            <div className="mt-4 rounded-[20px] border border-[#F3D4C7] bg-white px-4 py-4 text-sm leading-7 text-[#37415C]">
              {detailValue(ticket.description)}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#FDA481] bg-[#fff8f5] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B4182D]">Submitted details</p>
            <dl className="mt-4 space-y-3 text-sm text-[#37415C]">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7C2D12]">Ticket ID</dt>
                <dd className="mt-1 font-semibold text-[#181A2F]">{getTicketDisplayId(ticket)}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7C2D12]">Student ID</dt>
                <dd className="mt-1 text-[#181A2F]">{detailValue(ticket.createdBy, 'Unknown student')}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7C2D12]">Student name</dt>
                <dd className="mt-1 text-[#181A2F]">{detailValue(reporterLabel)}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7C2D12]">Email</dt>
                <dd className="mt-1 text-[#181A2F]">{detailValue(ticket.userEmail)}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7C2D12]">Resource or location</dt>
                <dd className="mt-1 text-[#181A2F]">{detailValue(ticket.resource)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#FDA481] bg-[#fff8f5] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B4182D]">Student uploads</p>
              <p className="mt-1 text-sm text-[#37415C]">Evidence images attached by the student appear here.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-[#F3D4C7] bg-white px-3 py-1 text-xs font-semibold text-[#B4182D]">
                {Array.isArray(ticket.imageUrls) ? ticket.imageUrls.length : 0} files
              </span>
              <label className="inline-flex cursor-pointer items-center rounded-full border border-[#FDA481] bg-white px-4 py-2 text-xs font-semibold text-[#B4182D] transition hover:bg-[#FDA481] hover:text-[#181A2F]">
                {uploadingImages ? 'Uploading...' : 'Add images'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif"
                  multiple
                  className="hidden"
                  disabled={uploadingImages}
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>

          {Array.isArray(ticket.imageUrls) && ticket.imageUrls.length > 0 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {ticket.imageUrls.map((imageUrl, index) => (
                <a
                  key={`${imageUrl}-${index}`}
                  href={resolveTicketImageUrl(imageUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="overflow-hidden rounded-[20px] border border-[#F3D4C7] bg-white transition hover:border-[#FDA481] hover:no-underline"
                >
                  <img
                    src={resolveTicketImageUrl(imageUrl)}
                    alt={`Student upload ${index + 1}`}
                    className="h-44 w-full object-cover"
                  />
                  <div className="space-y-1 px-4 py-3 text-sm text-[#181A2F]">
                    <p className="font-semibold">Upload {index + 1}</p>
                    <p className="break-all text-xs text-[#37415C]">{imageUrl.split('/').pop() || imageUrl}</p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[20px] border border-dashed border-[#F3D4C7] bg-white px-4 py-5 text-sm text-[#37415C]">
              No uploaded images were attached to this ticket.
            </div>
          )}
        </div>

        <div className="mt-6 rounded-[24px] border border-[#242E49] bg-[#242E49] p-5">
          <p className="text-sm font-semibold text-white">Progress</p>
          <TicketProgress status={ticket.status} className="mt-4" />
        </div>

        {isAdmin && (
          <div className="mt-6 rounded-[24px] border border-[#B4182D] bg-[#B4182D] p-5">
            <p className="text-sm font-semibold text-white">Admin controls</p>
            <div className="mt-4 grid gap-5 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold text-white">Status update</label>
                <select
                  onChange={async (event) => {
                    const nextStatus = event.target.value
                    if (!nextStatus || nextStatus === currentStatus) return

                    let rejectionReason = ''
                    if (nextStatus === 'REJECTED') {
                      rejectionReason = window.prompt('Enter the rejection reason for this ticket:')
                      if (rejectionReason === null) {
                        event.target.value = currentStatus || 'OPEN'
                        return
                      }
                      if (!rejectionReason.trim()) {
                        alert('Rejection reason is required.')
                        event.target.value = currentStatus || 'OPEN'
                        return
                      }
                    }

                    await handleStatusChange(nextStatus, rejectionReason.trim())
                  }}
                  value={currentStatus}
                  disabled={statusUpdating}
                  className="mt-3 w-full rounded-2xl border border-white bg-white px-4 py-3 text-sm text-[#181A2F] outline-none"
                >
                  {TICKET_STATUSES.map((status) => (
                    <option
                      key={status}
                      value={status}
                      disabled={status !== currentStatus && !allowedTransitions.includes(status)}
                    >
                      {formatTicketStatus(status)}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-white/85">
                  Workflow: OPEN to IN PROGRESS to RESOLVED to CLOSED. Admin can also set REJECTED with a reason.
                </p>
                <p className="mt-1 text-xs text-white/75">
                  All statuses are shown here, but only the valid next workflow steps are selectable.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white">Assigned technician or staff</label>
                <input
                  type="text"
                  value={assignmentDraft}
                  onChange={(event) => setAssignmentDraft(event.target.value)}
                  className="mt-3 w-full rounded-2xl border border-white bg-white px-4 py-3 text-sm text-[#181A2F] outline-none"
                  placeholder="Enter staff name or ID"
                />
                <button
                  type="button"
                  onClick={handleAssignmentSave}
                  disabled={adminSaving === 'assignment'}
                  className="mt-3 inline-flex items-center rounded-2xl border border-white bg-white px-4 py-2 text-sm font-semibold text-[#B4182D] disabled:opacity-50"
                >
                  {adminSaving === 'assignment' ? 'Saving...' : 'Save assignment'}
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white">Resolution notes</label>
                <textarea
                  value={resolutionNotesDraft}
                  onChange={(event) => setResolutionNotesDraft(event.target.value)}
                  rows={5}
                  className="mt-3 w-full rounded-2xl border border-white bg-white px-4 py-3 text-sm text-[#181A2F] outline-none"
                  placeholder="Add staff notes, actions taken, and final fix details"
                />
                <button
                  type="button"
                  onClick={handleResolutionNotesSave}
                  disabled={adminSaving === 'resolutionNotes'}
                  className="mt-3 inline-flex items-center rounded-2xl border border-white bg-white px-4 py-2 text-sm font-semibold text-[#B4182D] disabled:opacity-50"
                >
                  {adminSaving === 'resolutionNotes' ? 'Saving...' : 'Save notes'}
                </button>
              </div>
            </div>
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
                  <span>{getCommentAuthorLabel(comment)} / {formatTicketDateTime(comment.createdAt)}</span>
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

      <ChatBot tickets={[ticket]} hideTicketLink />
    </div>
  )
}

