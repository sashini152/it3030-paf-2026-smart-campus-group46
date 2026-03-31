import { getJson, postJson, putJson, deleteRequest } from './client.js'

export async function getIncidentTickets() {
  return getJson('/api/incident-tickets')
}

export async function getIncidentTicket(id) {
  return getJson(`/api/incident-tickets/${id}`)
}

export async function createIncidentTicket(ticket) {
  return postJson('/api/incident-tickets', ticket)
}

export async function updateIncidentTicket(id, ticket) {
  return putJson(`/api/incident-tickets/${id}`, ticket)
}

export async function deleteIncidentTicket(id) {
  return deleteRequest(`/api/incident-tickets/${id}`)
}
