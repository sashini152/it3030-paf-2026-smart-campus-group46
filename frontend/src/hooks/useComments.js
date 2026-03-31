import { useEffect, useState } from 'react'
import * as commentService from '../services/commentService'

export function useComments(ticketId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!ticketId) return

    setLoading(true)
    commentService
      .fetchComments(ticketId)
      .then((data) => setComments(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false))
  }, [ticketId])

  return { comments, loading, error, setComments, reload: () => ticketId && commentService.fetchComments(ticketId).then(setComments) }
}
