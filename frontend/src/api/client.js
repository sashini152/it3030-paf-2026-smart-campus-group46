import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message =
      error.code === 'ECONNABORTED'
        ? 'The request timed out. Check that the backend is running and try again.'
        : error.code === 'ERR_NETWORK'
        ? 'Cannot reach the backend server at localhost:8081. Start the Spring backend and try again.'
        : status === 401
        ? 'Your session has expired. Sign in again and retry.'
        : status === 403
        ? 'You do not have permission to perform this action.'
        : status === 502
        ? 'The support service is temporarily unavailable. Please try again in a moment.'
        : error.response?.data?.message || error.message
    return Promise.reject(new Error(message))
  }
)

export async function getJson(path) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
  return handleResponse(res)
}

export async function postJson(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
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
  const res = await fetch(`${API_BASE_URL}${path}`, {
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
  const res = await fetch(`${API_BASE_URL}${path}`, {
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

async function handleResponse(res) {
  if (!res.ok) {
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

export { api }
