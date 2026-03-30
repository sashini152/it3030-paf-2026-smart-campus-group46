import { api, getJson, postJson, putJson, deleteJson, patchJson } from '../api/client'

export function fetchTickets() {
  return getJson('/api/tickets')
}

export function fetchTicket(ticketId) {
  return getJson(`/api/tickets/${ticketId}`)
}

export function createTicket(data) {
  return postJson('/api/tickets', data)
}

export function updateTicket(ticketId, data) {
  return putJson(`/api/tickets/${ticketId}`, data)
}

export function deleteTicket(ticketId) {
  return deleteJson(`/api/tickets/${ticketId}`)
}

export function assignTechnician(ticketId, technicianId) {
  return postJson(`/api/tickets/${ticketId}/assign`, { technicianId })
}

export function updateStatus(ticketId, status) {
  return patchJson(`/api/tickets/${ticketId}/status`, { status })
}

export async function uploadTicketImages(ticketId, files) {
  if (!files?.length) return []

  const formData = new FormData()
  for (const file of files) {
    formData.append('images', file)
  }

  const { data } = await api.post(`/api/tickets/${ticketId}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}
