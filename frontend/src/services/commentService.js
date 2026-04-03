import { getJson, postJson, deleteJson } from '../api/client'

const COMMENT_BASE_PATH = '/api/incident-tickets'
const STANDARD_COMMENT_BASE_PATH = '/api/tickets'

function normalizeComment(comment) {
  if (!comment || typeof comment !== 'object') return comment
  return {
    ...comment,
    author: comment.author || comment.createdBy || 'Student',
    authorName:
      comment.authorName ||
      comment.createdByName ||
      comment.author ||
      comment.createdBy ||
      'Student',
  }
}

function normalizeComments(payload) {
  return Array.isArray(payload) ? payload.map(normalizeComment) : []
}

export function fetchComments(ticketId) {
  return getJson(`${COMMENT_BASE_PATH}/${ticketId}/comments`).then(normalizeComments)
}

export function fetchStandardComments(ticketId) {
  return getJson(`${STANDARD_COMMENT_BASE_PATH}/${ticketId}/comments`).then(normalizeComments)
}

export async function fetchAnyComments(ticketId) {
  try {
    return await fetchComments(ticketId)
  } catch (incidentError) {
    return fetchStandardComments(ticketId)
  }
}

export function createComment(ticketId, comment) {
  return postJson(`${COMMENT_BASE_PATH}/${ticketId}/comments`, comment).then(normalizeComment)
}

export function createStandardComment(ticketId, comment) {
  return postJson(`${STANDARD_COMMENT_BASE_PATH}/${ticketId}/comments`, comment).then(normalizeComment)
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
