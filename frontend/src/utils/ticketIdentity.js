function normalizeStudentId(value) {
  return String(value || '')
    .replace(/[^A-Za-z0-9_]/g, '')
    .toUpperCase()
}

export function isStudentThreadTicket(ticket) {
  return ticket?.ticketSource === 'standard'
}

export function getTicketDisplayId(ticket) {
  if (!ticket) return 'Unknown ticket'

  if (ticket.ticketSource === 'standard') {
    return ticket.id || 'Unknown ticket'
  }

  const studentId = normalizeStudentId(ticket.createdBy)
  if (!studentId) {
    return ticket.id || 'Unknown ticket'
  }

  return `${studentId}_TIDLEGACY`
}
