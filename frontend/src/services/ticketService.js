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
    createdByName: data.createdByName,
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
    createdByName: data.createdByName,
    userEmail: data.userEmail,
    resource: data.resource,
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

export function assignTechnician(ticketId, assignedTechnician) {
  return patchJson(`${STANDARD_TICKET_BASE_PATH}/${ticketId}/assign`, { assignedTechnician })
}

export function updateResolutionNotes(ticketId, resolutionNotes) {
  return patchJson(`${STANDARD_TICKET_BASE_PATH}/${ticketId}/resolution-notes`, { resolutionNotes })
}

export function updateStatus(ticketId, status, rejectionReason) {
  return patchJson(`${TICKET_BASE_PATH}/${ticketId}/status`, { status, rejectionReason })
}

export async function updateAnyTicketStatus(ticket, status, rejectionReason) {
  if (!ticket?.id) {
    throw new Error('Ticket id is required')
  }

  if (ticket.ticketSource === STANDARD_SOURCE) {
    const updated = await patchJson(`${STANDARD_TICKET_BASE_PATH}/${ticket.id}/status`, { status, rejectionReason })
    return normalizeTicket(updated, STANDARD_SOURCE)
  }

  if (ticket.ticketSource === INCIDENT_SOURCE) {
    const updated = await putJson(`${TICKET_BASE_PATH}/${ticket.id}`, {
      id: ticket.id,
      title: ticket.title || 'Untitled',
      description: ticket.description || '',
      status,
      createdBy: ticket.createdBy || 'system',
      createdByName: ticket.createdByName || ticket.createdBy || 'Student',
      rejectionReason,
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
      createdByName: ticket.createdByName || ticket.createdBy || 'Student',
      rejectionReason,
    })
    return normalizeTicket(updated, INCIDENT_SOURCE)
  } catch (incidentError) {
    const updated = await patchJson(`${STANDARD_TICKET_BASE_PATH}/${ticket.id}/status`, { status, rejectionReason })
    return normalizeTicket(updated, STANDARD_SOURCE)
  }
}

export async function updateAnyTicketAssignment(ticket, assignedTechnician) {
  if (!ticket?.id) {
    throw new Error('Ticket id is required')
  }

  if (ticket.ticketSource === STANDARD_SOURCE) {
    const updated = await patchJson(`${STANDARD_TICKET_BASE_PATH}/${ticket.id}/assign`, { assignedTechnician })
    return normalizeTicket(updated, STANDARD_SOURCE)
  }

  if (ticket.ticketSource === INCIDENT_SOURCE) {
    const updated = await putJson(`${TICKET_BASE_PATH}/${ticket.id}`, {
      id: ticket.id,
      title: ticket.title || 'Untitled',
      description: ticket.description || '',
      status: ticket.status || 'OPEN',
      createdBy: ticket.createdBy || 'system',
      assignedTechnician,
      resolutionNotes: ticket.resolutionNotes || '',
      rejectionReason: ticket.rejectionReason || '',
    })
    return normalizeTicket(updated, INCIDENT_SOURCE)
  }

  try {
    const updated = await patchJson(`${STANDARD_TICKET_BASE_PATH}/${ticket.id}/assign`, { assignedTechnician })
    return normalizeTicket(updated, STANDARD_SOURCE)
  } catch (standardError) {
    const updated = await putJson(`${TICKET_BASE_PATH}/${ticket.id}`, {
      id: ticket.id,
      title: ticket.title || 'Untitled',
      description: ticket.description || '',
      status: ticket.status || 'OPEN',
      createdBy: ticket.createdBy || 'system',
      assignedTechnician,
      resolutionNotes: ticket.resolutionNotes || '',
      rejectionReason: ticket.rejectionReason || '',
    })
    return normalizeTicket(updated, INCIDENT_SOURCE)
  }
}

export async function updateAnyTicketResolutionNotes(ticket, resolutionNotes) {
  if (!ticket?.id) {
    throw new Error('Ticket id is required')
  }

  if (ticket.ticketSource === STANDARD_SOURCE) {
    const updated = await patchJson(`${STANDARD_TICKET_BASE_PATH}/${ticket.id}/resolution-notes`, { resolutionNotes })
    return normalizeTicket(updated, STANDARD_SOURCE)
  }

  if (ticket.ticketSource === INCIDENT_SOURCE) {
    const updated = await putJson(`${TICKET_BASE_PATH}/${ticket.id}`, {
      id: ticket.id,
      title: ticket.title || 'Untitled',
      description: ticket.description || '',
      status: ticket.status || 'OPEN',
      createdBy: ticket.createdBy || 'system',
      assignedTechnician: ticket.assignedTechnician || '',
      resolutionNotes,
      rejectionReason: ticket.rejectionReason || '',
    })
    return normalizeTicket(updated, INCIDENT_SOURCE)
  }

  try {
    const updated = await patchJson(`${STANDARD_TICKET_BASE_PATH}/${ticket.id}/resolution-notes`, { resolutionNotes })
    return normalizeTicket(updated, STANDARD_SOURCE)
  } catch (standardError) {
    const updated = await putJson(`${TICKET_BASE_PATH}/${ticket.id}`, {
      id: ticket.id,
      title: ticket.title || 'Untitled',
      description: ticket.description || '',
      status: ticket.status || 'OPEN',
      createdBy: ticket.createdBy || 'system',
      assignedTechnician: ticket.assignedTechnician || '',
      resolutionNotes,
      rejectionReason: ticket.rejectionReason || '',
    })
    return normalizeTicket(updated, INCIDENT_SOURCE)
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
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  const { data } = await api.post(`${STANDARD_TICKET_BASE_PATH}/${ticketId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return Array.isArray(data?.imageUrls) ? data.imageUrls : []
}
