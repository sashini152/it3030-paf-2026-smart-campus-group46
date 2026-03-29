import { useState } from 'react'
import IncidentTicketList from '../components/IncidentTicketList.jsx'
import IncidentTicketForm from '../components/IncidentTicketForm.jsx'
import IncidentTicketDetails from '../components/IncidentTicketDetails.jsx'
import { updateIncidentTicket } from '../api/incidentTickets.js'

export default function TicketsPage() {
  const [view, setView] = useState('list') // 'list', 'form', 'details', 'edit'
  const [selectedTicket, setSelectedTicket] = useState(null)

  const handleCreateSuccess = () => {
    setView('list')
    setSelectedTicket(null)
  }

  const handleEdit = (ticket) => {
    setSelectedTicket(ticket)
    setView('edit')
  }

  const handleBack = () => {
    setView('list')
    setSelectedTicket(null)
  }

  const handleUpdate = async (updatedTicket) => {
    try {
      await updateIncidentTicket(updatedTicket.id, updatedTicket)
      setView('list')
      setSelectedTicket(null)
    } catch (error) {
      console.error('Failed to update ticket:', error)
    }
  }

  return (
    <div className="hub-page hub-page--narrow">
      <div className="hub-page-header">
        <h1>Incident Tickets</h1>
        {view === 'list' && (
          <button 
            onClick={() => setView('form')} 
            className="hub-button hub-button--primary"
          >
            Create New Ticket
          </button>
        )}
      </div>

      {view === 'list' && (
        <IncidentTicketList 
          onEdit={handleEdit}
        />
      )}

      {view === 'form' && (
        <IncidentTicketForm 
          onSuccess={handleCreateSuccess}
          onCancel={handleBack}
        />
      )}

      {view === 'details' && selectedTicket && (
        <IncidentTicketDetails 
          ticketId={selectedTicket.id}
          onBack={handleBack}
          onEdit={handleEdit}
        />
      )}

      {view === 'edit' && selectedTicket && (
        <IncidentTicketForm 
          ticket={selectedTicket}
          onSuccess={() => handleUpdate(selectedTicket)}
          onCancel={handleBack}
        />
      )}
    </div>
  )
}
