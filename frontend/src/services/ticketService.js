import { api, getJson, postJson, putJson, deleteJson, patchJson } from '../api/client'

const TICKET_BASE_PATH = '/api/incident-tickets'
const STANDARD_TICKET_BASE_PATH = '/api/tickets'

export function fetchTickets() {
  return getJson(TICKET_BASE_PATH)
}

export function fetchTicket(ticketId) {
  return getJson(`${TICKET_BASE_PATH}/${ticketId}`)
}

export function createTicket(data) {
  return postJson(TICKET_BASE_PATH, {
    title: data.title,
    description: data.description,
    createdBy: data.createdBy,
    status: data.status || 'OPEN',
  })
}

export function createStandardTicket(data) {
  return postJson(STANDARD_TICKET_BASE_PATH, {
    title: data.title,
    description: data.description,
    category: data.category,
    priority: data.priority,
    createdBy: data.createdBy,
    status: data.status || 'OPEN',
    imageUrls: data.imageUrls || [],
  })
}

export function updateTicket(ticketId, data) {
  return putJson(`${TICKET_BASE_PATH}/${ticketId}`, data)
}

export function deleteTicket(ticketId) {
  return deleteJson(`${TICKET_BASE_PATH}/${ticketId}`)
}

export function assignTechnician(ticketId, technicianId) {
  return postJson(`${TICKET_BASE_PATH}/${ticketId}/assign`, { technicianId })
}

export function updateStatus(ticketId, status) {
  return patchJson(`${TICKET_BASE_PATH}/${ticketId}/status`, { status })
}

export async function uploadTicketImages(ticketId, files) {
  if (!files?.length) return []
  // Image upload is not exposed by the current incident ticket controller yet.
  return []
}
