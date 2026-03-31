import axios from 'axios'

const API_BASE = 'http://localhost:8081'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message
    return Promise.reject(new Error(message))
  }
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

