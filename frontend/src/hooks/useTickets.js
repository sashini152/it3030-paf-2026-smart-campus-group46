import { useEffect, useState } from 'react'
import * as ticketService from '../services/ticketService'

export function useTickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    ticketService
      .fetchTickets()
      .then((data) => setTickets(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false))
  }, [])

  return { tickets, loading, error, setTickets, reload: () => ticketService.fetchTickets().then(setTickets) }
}
