import { useEffect, useState } from 'react'
import * as ticketChatService from '../services/ticketChatService'

export function useTicketChat(ticketId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!ticketId) return

    setLoading(true)
    setError(null)
    ticketChatService
      .fetchTicketChatMessages(ticketId)
      .then((data) => setMessages(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false))
  }, [ticketId])

  return {
    messages,
    loading,
    error,
    setMessages,
    reload: () =>
      ticketId &&
      ticketChatService
        .fetchTicketChatMessages(ticketId)
        .then((data) => {
          setMessages(data)
          setError(null)
          return data
        })
        .catch((err) => {
          setError(err)
          throw err
        }),
  }
}
