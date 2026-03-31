import { useEffect, useState } from 'react'
import * as ticketService from '../services/ticketService'

export function useTickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadTickets = () => {
    setLoading(true)
    setError(null)
    return ticketService
      .fetchTickets()
      .then((data) => setTickets(data))
      .catch((err) => {
        setTickets([])
        setError(err)
        throw err
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadTickets().catch(() => {})
  }, [])

  return { tickets, loading, error, setTickets, reload: loadTickets }
}
