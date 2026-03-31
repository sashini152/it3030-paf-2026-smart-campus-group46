import { getJson, postJson, deleteJson } from '../api/client'

const COMMENT_BASE_PATH = '/api/incident-tickets'

export function fetchComments(ticketId) {
  return getJson(`${COMMENT_BASE_PATH}/${ticketId}/comments`)
}

export function createComment(ticketId, comment) {
  return postJson(`${COMMENT_BASE_PATH}/${ticketId}/comments`, comment)
}

export function deleteComment(ticketId, commentId) {
  return deleteJson(`${COMMENT_BASE_PATH}/${ticketId}/comments/${commentId}`)
}
