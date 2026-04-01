import { api, getJson, postJson, putJson, deleteJson, patchJson } from '../api/client'

const TICKET_BASE_PATH = '/api/incident-tickets'
const STANDARD_TICKET_BASE_PATH = '/api/tickets'
const INCIDENT_SOURCE = 'incident'
const STANDARD_SOURCE = 'standard'
const REQUEST_TIMEOUT_MS = 2500

function withTimeout(request, label) {
  let timeoutId
  return Promise.race([
    request,
    new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`${label} timed out. Start the backend server and reload the page.`))
      }, REQUEST_TIMEOUT_MS)
    }),
  ]).finally(() => clearTimeout(timeoutId))
}

function normalizeTicket(ticket, source) {
  if (!ticket || typeof ticket !== 'object') return ticket
  return { ...ticket, ticketSource: source }
}

function normalizeTicketList(payload, source) {
  if (!Array.isArray(payload)) return []
  return payload.map((ticket) => normalizeTicket(ticket, source))
}

export function fetchTickets() {
  return getJson(TICKET_BASE_PATH)
}

export function fetchStandardTickets() {
  return getJson(STANDARD_TICKET_BASE_PATH)
}

export async function fetchAllTickets() {
  const [incidentResult, standardResult] = await Promise.allSettled([
    withTimeout(fetchTickets(), 'Incident ticket request'),
    withTimeout(fetchStandardTickets(), 'Standard ticket request'),
  ])

  const mergedTickets = [
    ...(incidentResult.status === 'fulfilled' ? normalizeTicketList(incidentResult.value, INCIDENT_SOURCE) : []),
    ...(standardResult.status === 'fulfilled' ? normalizeTicketList(standardResult.value, STANDARD_SOURCE) : []),
  ]

  if (mergedTickets.length > 0) {
    return mergedTickets
  }

  if (incidentResult.status === 'rejected') {
    if (standardResult.status === 'rejected') {
      throw new Error('Ticket services are unavailable. Start the backend on port 8081 and reload the admin dashboard.')
    }
    throw incidentResult.reason
  }

  if (standardResult.status === 'rejected') {
    throw standardResult.reason
  }

  return []
}

export function fetchTicket(ticketId) {
  return getJson(`${TICKET_BASE_PATH}/${ticketId}`)
}

export function fetchStandardTicket(ticketId) {
  return getJson(`${STANDARD_TICKET_BASE_PATH}/${ticketId}`)
}

export async function fetchAnyTicket(ticketId) {
  try {
    const ticket = await withTimeout(fetchTicket(ticketId), 'Incident ticket request')
    return normalizeTicket(ticket, INCIDENT_SOURCE)
  } catch (incidentError) {
    const ticket = await withTimeout(fetchStandardTicket(ticketId), 'Standard ticket request')
    return normalizeTicket(ticket, STANDARD_SOURCE)
  }
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

export async function updateAnyTicketStatus(ticket, status) {
  if (!ticket?.id) {
    throw new Error('Ticket id is required')
  }

  if (ticket.ticketSource === STANDARD_SOURCE) {
    const updated = await patchJson(`${STANDARD_TICKET_BASE_PATH}/${ticket.id}/status`, { status })
    return normalizeTicket(updated, STANDARD_SOURCE)
  }

  if (ticket.ticketSource === INCIDENT_SOURCE) {
    const updated = await putJson(`${TICKET_BASE_PATH}/${ticket.id}`, {
      id: ticket.id,
      title: ticket.title || 'Untitled',
      description: ticket.description || '',
      status,
      createdBy: ticket.createdBy || 'system',
    })
    return normalizeTicket(updated, INCIDENT_SOURCE)
  }

  try {
    const updated = await putJson(`${TICKET_BASE_PATH}/${ticket.id}`, {
      id: ticket.id,
      title: ticket.title || 'Untitled',
      description: ticket.description || '',
      status,
      createdBy: ticket.createdBy || 'system',
    })
    return normalizeTicket(updated, INCIDENT_SOURCE)
  } catch (incidentError) {
    const updated = await patchJson(`${STANDARD_TICKET_BASE_PATH}/${ticket.id}/status`, { status })
    return normalizeTicket(updated, STANDARD_SOURCE)
  }
}

export async function deleteAnyTicket(ticket) {
  if (!ticket?.id) {
    throw new Error('Ticket id is required')
  }

  if (ticket.ticketSource === STANDARD_SOURCE) {
    return deleteJson(`${STANDARD_TICKET_BASE_PATH}/${ticket.id}`)
  }

  if (ticket.ticketSource === INCIDENT_SOURCE) {
    return deleteJson(`${TICKET_BASE_PATH}/${ticket.id}`)
  }

  try {
    return await deleteJson(`${TICKET_BASE_PATH}/${ticket.id}`)
  } catch (incidentError) {
    return deleteJson(`${STANDARD_TICKET_BASE_PATH}/${ticket.id}`)
  }
}

export async function uploadTicketImages(ticketId, files) {
  if (!files?.length) return []
  // Image upload is not exposed by the current incident ticket controller yet.
  return []
}
