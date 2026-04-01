import axios from 'axios'

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
    const status = error.response?.status
    const message =
      status === 502
        ? 'The support service is temporarily unavailable. Please try again in a moment.'
        : error.response?.data?.message || error.message
    return Promise.reject(new Error(message))
  }
)

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

export async function patchJson(path, payload) {
  const { data } = await api.patch(path, payload)
  return data
}

export { api }

