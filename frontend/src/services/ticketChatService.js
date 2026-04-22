import { getJson, postJson } from '../api/client'

const CHAT_BASE_PATH = '/api/tickets'

function normalizeMessage(message) {
  if (!message || typeof message !== 'object') return message
  return {
    ...message,
    authorId: message.authorId || message.createdBy || 'student',
    authorName: message.authorName || message.createdByName || message.author || 'Student',
  }
}

function normalizeMessages(payload) {
  return Array.isArray(payload) ? payload.map(normalizeMessage) : []
}

export function fetchTicketChatMessages(ticketId) {
  return getJson(`${CHAT_BASE_PATH}/${ticketId}/chat-messages`).then(normalizeMessages)
}

export function createTicketChatMessage(ticketId, message) {
  return postJson(`${CHAT_BASE_PATH}/${ticketId}/chat-messages`, message).then(normalizeMessage)
}
