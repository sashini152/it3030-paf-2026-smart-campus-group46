import { useState, useEffect } from 'react'
import { createIncidentTicket, updateIncidentTicket } from '../api/incidentTickets.js'

export default function IncidentTicketForm({ ticket, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'OPEN',
    createdBy: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (ticket) {
      setFormData({
        title: ticket.title || '',
        description: ticket.description || '',
        status: ticket.status || 'OPEN',
        createdBy: ticket.createdBy || ''
      })
    }
  }, [ticket])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (ticket) {
        await updateIncidentTicket(ticket.id, formData)
      } else {
        await createIncidentTicket(formData)
      }
      onSuccess?.()
    } catch (err) {
      setError(err.message || 'Failed to save ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="hub-form">
      <h2>{ticket ? 'Edit Incident Ticket' : 'Create New Incident Ticket'}</h2>
      
      {error && <div className="hub-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="hub-form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength="200"
            className="hub-form-control"
          />
        </div>

        <div className="hub-form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            maxLength="1000"
            rows="4"
            className="hub-form-control"
          />
        </div>

        <div className="hub-form-group">
          <label htmlFor="status">Status *</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="hub-form-control"
          >
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="hub-form-group">
          <label htmlFor="createdBy">Created By *</label>
          <input
            type="text"
            id="createdBy"
            name="createdBy"
            value={formData.createdBy}
            onChange={handleChange}
            required
            className="hub-form-control"
          />
        </div>

        <div className="hub-form-actions">
          <button type="button" onClick={onCancel} className="hub-button hub-button--secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="hub-button hub-button--primary">
            {loading ? 'Saving...' : (ticket ? 'Update Ticket' : 'Create Ticket')}
          </button>
        </div>
      </form>
    </div>
  )
}
