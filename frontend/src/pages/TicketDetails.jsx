import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useComments } from '../hooks/useComments'
import * as ticketService from '../services/ticketService'
import * as commentService from '../services/commentService'

const statusColors = {
  OPEN: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-blue-100 text-blue-800',
  CLOSED: 'bg-gray-100 text-gray-800',
}

const priorityColors = {
  LOW: 'text-green-600',
  MEDIUM: 'text-yellow-600',
  HIGH: 'text-red-600',
}

export default function TicketDetails() {
  const { id } = useParams()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { comments, loading: commentsLoading, error: commentsError, reload: reloadComments } = useComments(id)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useState(() => {
    ticketService
      .fetchTicket(id)
      .then(setTicket)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [id])

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      await commentService.createComment(id, { content: newComment })
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

  if (loading) return <div className="hub-page hub-page--narrow"><p>Loading ticket...</p></div>
  if (error) return <div className="hub-page hub-page--narrow"><p className="text-red-500">Error: {error.message}</p></div>
  if (!ticket) return <div className="hub-page hub-page--narrow"><p>Ticket not found</p></div>

  return (
    <div className="hub-page">
      <h1>Ticket Details</h1>

      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-6">
        <h2 className="text-xl font-semibold mb-4">{ticket.title}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p><strong>Status:</strong> <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status] || 'bg-gray-100 text-gray-800'}`}>{ticket.status}</span></p>
            <p><strong>Priority:</strong> <span className={priorityColors[ticket.priority] || 'text-gray-600'}>{ticket.priority}</span></p>
            <p><strong>Category:</strong> {ticket.category}</p>
          </div>
          <div>
            <p><strong>Created:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
            <p><strong>Updated:</strong> {new Date(ticket.updatedAt).toLocaleString()}</p>
            <p><strong>Assigned Technician:</strong> {ticket.assignedTechnician || 'Unassigned'}</p>
          </div>
        </div>

        <div className="mb-4">
          <strong>Description:</strong>
          <p className="mt-2 text-slate-300">{ticket.description}</p>
        </div>

        {ticket.imageUrls && ticket.imageUrls.length > 0 && (
          <div>
            <strong>Uploaded Images:</strong>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              {ticket.imageUrls.map((url, index) => (
                <img key={index} src={url} alt={`Uploaded ${index + 1}`} className="rounded-lg border border-slate-600" />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-semibold mb-4">Comments</h3>

        {commentsError && <p className="text-red-500 mb-4">Error loading comments: {commentsError.message}</p>}

        <div className="space-y-4 mb-6">
          {commentsLoading ? (
            <p>Loading comments...</p>
          ) : comments.length === 0 ? (
            <p>No comments yet.</p>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="bg-slate-700 p-4 rounded border border-slate-600">
                <p className="text-slate-300">{comment.content}</p>
                <div className="flex justify-between items-center mt-2 text-sm text-slate-400">
                  <span>{comment.author} - {new Date(comment.createdAt).toLocaleString()}</span>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddComment} className="space-y-4">
          <label className="block">
            <span className="text-sm">Add Comment</span>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2"
              placeholder="Write your comment..."
            />
          </label>
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {submitting ? 'Adding...' : 'Add Comment'}
          </button>
        </form>
      </div>
    </div>
  )
}