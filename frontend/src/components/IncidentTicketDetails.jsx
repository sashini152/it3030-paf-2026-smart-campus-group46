import { useState, useEffect, useCallback } from 'react'
import { getIncidentTicket, updateIncidentTicket } from '../api/incidentTickets.js'

export default function IncidentTicketDetails({ ticketId, onBack, onEdit }) {
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadTicket = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getIncidentTicket(ticketId)
      setTicket(data)
    } catch (err) {
      setError(err.message || 'Failed to load ticket')
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  const handleStatusUpdate = async (newStatus) => {
    try {
      const updated = await updateIncidentTicket(ticketId, { ...ticket, status: newStatus })
      setTicket(updated)
    } catch (err) {
      setError(err.message || 'Failed to update status')
    }
  }

  useEffect(() => {
    if (ticketId) {
      loadTicket()
    }
  }, [ticketId, loadTicket])

  const getStatusColor = (status) => {
    const colors = {
      'OPEN': 'hub-status hub-status--open',
      'IN_PROGRESS': 'hub-status hub-status--progress',
      'RESOLVED': 'hub-status hub-status--resolved',
      'CLOSED': 'hub-status hub-status--closed',
      'REJECTED': 'hub-status hub-status--rejected'
    }
    return colors[status] || 'hub-status'
  }

  if (loading) return <div className="hub-loading">Loading ticket details...</div>
  if (error) return <div className="hub-error">{error}</div>
  if (!ticket) return <div className="hub-error">Ticket not found</div>

  return (
    <div className="hub-ticket-details">
      <div className="hub-ticket-details-header">
        <button onClick={onBack} className="hub-button hub-button--secondary">
          ← Back to List
        </button>
        <button onClick={() => onEdit?.(ticket)} className="hub-button hub-button--primary">
          Edit Ticket
        </button>
      </div>

      <div className="hub-ticket-card hub-ticket-card--full">
        <div className="hub-ticket-header">
          <h1>{ticket.title}</h1>
          <span className={getStatusColor(ticket.status)}>
            {ticket.status.replace('_', ' ')}
          </span>
        </div>
        
        <div className="hub-ticket-body">
          <div className="hub-ticket-section">
            <h3>Description</h3>
            <p>{ticket.description}</p>
          </div>
          
          <div className="hub-ticket-meta">
            <div className="hub-ticket-meta-item">
              <strong>Created by:</strong> {ticket.createdBy}
            </div>
            <div className="hub-ticket-meta-item">
              <strong>Created on:</strong> {new Date(ticket.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="hub-ticket-section">
            <h3>Update Status</h3>
            <div className="hub-status-actions">
              {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={ticket.status === status}
                  className={`hub-button hub-button--small ${
                    ticket.status === status ? 'hub-button--disabled' : 'hub-button--outline'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
