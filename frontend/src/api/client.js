import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // Include cookies for OAuth2 session
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message =
      error.code === 'ECONNABORTED'
        ? 'The request timed out. Check that the backend is running and try again.'
        : status === 502
        ? 'The support service is temporarily unavailable. Please try again in a moment.'
        : status === 401
        ? 'Your session has expired. Sign in again and retry.'
        : status === 403
        ? 'You do not have permission to perform this action.'
        : error.response?.data?.message || error.message
    return Promise.reject(new Error(message))
  }
)

// Add authorization header with OAuth2 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Build query string from params
export function buildQuery(params) {
  const esc = encodeURIComponent
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${esc(k)}=${esc(v)}`)
    .join('&')
  return query ? `?${query}` : ''
}

export async function getJson(path) {
  const { data } = await api.get(path)
  return data
}

export async function postJson(path, payload) {
  const { data } = await api.post(path, payload)
  return data
}

export async function putJson(path, payload) {
  const { data } = await api.put(path, payload)
  return data
}

export async function deleteJson(path) {
  const { data } = await api.delete(path)
  return data
}

// Alias for DELETE request (for backward compatibility)
export const deleteRequest = deleteJson

export async function patchJson(path, payload) {
  const { data } = await api.patch(path, payload)
  return data
}

export { api }

