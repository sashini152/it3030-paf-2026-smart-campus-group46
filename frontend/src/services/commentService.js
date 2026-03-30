import { getJson, postJson, deleteJson } from '../api/client'

export function fetchComments(ticketId) {
  return getJson(`/api/tickets/${ticketId}/comments`)
}

export function createComment(ticketId, comment) {
  return postJson(`/api/tickets/${ticketId}/comments`, comment)
}

export function deleteComment(ticketId, commentId) {
  return deleteJson(`/api/tickets/${ticketId}/comments/${commentId}`)
}
