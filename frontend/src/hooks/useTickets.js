import { useCallback, useEffect, useState } from 'react'
import * as ticketService from '../services/ticketService'

const TICKET_REQUEST_TIMEOUT_MS = 4000

function withTimeout(request) {
  let timeoutId
  return Promise.race([
    request,
    new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Ticket loading timed out. Reload the page and make sure the backend is running.'))
      }, TICKET_REQUEST_TIMEOUT_MS)
    }),
  ]).finally(() => clearTimeout(timeoutId))
}

export function useTickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadTickets = useCallback(() => {
    setLoading(true)
    setError(null)
    return withTimeout(ticketService.fetchAllTickets())
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .catch((err) => {
        setTickets([])
        setError(err)
        throw err
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadTickets().catch(() => {})
  }, [loadTickets])

  return { tickets, loading, error, setTickets, reload: loadTickets }
}
