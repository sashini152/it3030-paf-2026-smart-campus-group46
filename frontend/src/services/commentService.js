import { getJson, postJson, deleteJson } from '../api/client'

const COMMENT_BASE_PATH = '/api/incident-tickets'
const STANDARD_COMMENT_BASE_PATH = '/api/tickets'

export function fetchComments(ticketId) {
  return getJson(`${COMMENT_BASE_PATH}/${ticketId}/comments`)
}

export function fetchStandardComments(ticketId) {
  return getJson(`${STANDARD_COMMENT_BASE_PATH}/${ticketId}/comments`)
}

export async function fetchAnyComments(ticketId) {
  try {
    return await fetchComments(ticketId)
  } catch (incidentError) {
    return fetchStandardComments(ticketId)
  }
}

export function createComment(ticketId, comment) {
  return postJson(`${COMMENT_BASE_PATH}/${ticketId}/comments`, comment)
}

export function createStandardComment(ticketId, comment) {
  return postJson(`${STANDARD_COMMENT_BASE_PATH}/${ticketId}/comments`, comment)
}

export async function createAnyComment(ticketId, comment) {
  try {
    return await createComment(ticketId, comment)
  } catch (incidentError) {
    return createStandardComment(ticketId, comment)
  }
}

export function deleteComment(ticketId, commentId) {
  return deleteJson(`${COMMENT_BASE_PATH}/${ticketId}/comments/${commentId}`)
}

export function deleteStandardComment(ticketId, commentId) {
  return deleteJson(`${STANDARD_COMMENT_BASE_PATH}/${ticketId}/comments/${commentId}`)
}

export async function deleteAnyComment(ticketId, commentId) {
  try {
    return await deleteComment(ticketId, commentId)
  } catch (incidentError) {
    return deleteStandardComment(ticketId, commentId)
  }
}
