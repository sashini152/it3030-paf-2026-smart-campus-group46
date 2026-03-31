import { useState, useEffect } from 'react'
import { getIncidentTickets, deleteIncidentTicket } from '../api/incidentTickets.js'

export default function IncidentTicketList({ onEdit }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadTickets = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getIncidentTickets()
      setTickets(data)
    } catch (err) {
      setError(err.message || 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return
    
    try {
      await deleteIncidentTicket(id)
      setTickets(tickets.filter(ticket => ticket.id !== id))
    } catch (err) {
      setError(err.message || 'Failed to delete ticket')
    }
  }

  useEffect(() => {
    loadTickets()
  }, [])

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

  if (loading) return <div className="hub-loading">Loading tickets...</div>
  if (error) return <div className="hub-error">{error}</div>

  return (
    <div className="hub-ticket-list">
      <h2>Incident Tickets</h2>
      
      {tickets.length === 0 ? (
        <div className="hub-empty-state">
          <p>No incident tickets found.</p>
        </div>
      ) : (
        <div className="hub-tickets">
          {tickets.map(ticket => (
            <div key={ticket.id} className="hub-ticket-card">
              <div className="hub-ticket-header">
                <h3>{ticket.title}</h3>
                <span className={getStatusColor(ticket.status)}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="hub-ticket-body">
                <p className="hub-ticket-description">{ticket.description}</p>
                <div className="hub-ticket-meta">
                  <span className="hub-ticket-meta-item">
                    Created by: {ticket.createdBy}
                  </span>
                  <span className="hub-ticket-meta-item">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="hub-ticket-actions">
                <button 
                  onClick={() => onEdit?.(ticket)}
                  className="hub-button hub-button--small hub-button--primary"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(ticket.id)}
                  className="hub-button hub-button--small hub-button--danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
