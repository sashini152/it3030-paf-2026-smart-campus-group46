const ROLE_KEY = 'smart-campus.role'

export function getSessionRole() {
  return localStorage.getItem(ROLE_KEY) || 'STUDENT'
}

export function setSessionRole(role) {
  localStorage.setItem(ROLE_KEY, role)
  window.dispatchEvent(new Event('smart-campus-session-change'))
}

export function clearSessionRole() {
  localStorage.removeItem(ROLE_KEY)
  window.dispatchEvent(new Event('smart-campus-session-change'))
}

export function isAdminRole(role = getSessionRole()) {
  return role === 'ADMIN' || role === 'SUPER_ADMIN'
}

export function isSuperAdminRole(role = getSessionRole()) {
  return role === 'SUPER_ADMIN'
}