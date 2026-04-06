const API_BASE = 'http://localhost:8081'

async function handleResponse(res) {
  if (res.ok) {
    if (res.status === 204) return null
    return res.json()
  }

  const text = await res.text()
  let message = text || res.statusText

  try {
    const j = JSON.parse(text)
    if (j.error) message = j.error
  } catch {
    // keep original message
  }

  throw new Error(message)
}

export async function getJson(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
  return handleResponse(res)
}

export async function postJson(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  return handleResponse(res)
}

export async function putJson(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return handleResponse(res)
}

export async function deleteRequest(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  })
  return handleResponse(res)
}

export function buildQuery(params) {
  const q = new URLSearchParams()

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      q.set(k, String(v).trim())
    }
  })

  const s = q.toString()
  return s ? `?${s}` : ''
}