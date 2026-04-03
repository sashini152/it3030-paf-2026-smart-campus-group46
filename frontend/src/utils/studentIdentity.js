const STUDENT_ID_KEY = 'ticket.studentId'
const STUDENT_NAME_KEY = 'ticket.userName'
const STUDENT_EMAIL_KEY = 'ticket.userEmail'

function readStorage(key) {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(key) || ''
}

function writeStorage(key, value) {
  if (typeof window === 'undefined') return
  if (value) {
    localStorage.setItem(key, value)
  } else {
    localStorage.removeItem(key)
  }
}

function normalize(value) {
  return String(value || '').trim().toLowerCase()
}

export function getStoredStudentId() {
  return readStorage(STUDENT_ID_KEY)
}

export function getStoredStudentName() {
  return readStorage(STUDENT_NAME_KEY)
}

export function getStoredStudentEmail() {
  return readStorage(STUDENT_EMAIL_KEY)
}

export function persistStudentIdentity({ studentId, name, email } = {}) {
  writeStorage(STUDENT_ID_KEY, studentId?.trim())
  writeStorage(STUDENT_NAME_KEY, name?.trim())
  writeStorage(STUDENT_EMAIL_KEY, email?.trim())
}

export function clearStudentIdentity() {
  writeStorage(STUDENT_ID_KEY, '')
  writeStorage(STUDENT_NAME_KEY, '')
  writeStorage(STUDENT_EMAIL_KEY, '')
}

export function getStudentIdentity(user) {
  const studentId =
    user?.studentId ||
    getStoredStudentId() ||
    user?.email ||
    getStoredStudentEmail() ||
    user?.name ||
    getStoredStudentName() ||
    ''

  const displayName =
    user?.name ||
    getStoredStudentName() ||
    user?.studentId ||
    getStoredStudentId() ||
    'Student'

  const email = user?.email || getStoredStudentEmail() || ''

  return { studentId, displayName, email }
}

export function getUserLookupKeys(user) {
  const identity = getStudentIdentity(user)
  return [...new Set([identity.studentId, identity.email, identity.displayName, user?.name, user?.studentId].filter(Boolean))]
}

export function ticketMatchesStudent(ticket, user) {
  const keys = new Set(getUserLookupKeys(user).map(normalize))
  return [ticket?.createdBy, ticket?.createdByName].some((value) => keys.has(normalize(value)))
}

export function getTicketReporterLabel(ticket) {
  return ticket?.createdByName || ticket?.createdBy || 'Student'
}

export function getCommentAuthorLabel(comment) {
  return comment?.authorName || comment?.createdByName || comment?.author || comment?.createdBy || 'Student'
}
