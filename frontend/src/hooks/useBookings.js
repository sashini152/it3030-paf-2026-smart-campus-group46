import { useEffect, useState } from 'react'
import { getJson } from '../api/client'

export function useBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadBookings = () => {
    setLoading(true)
    setError(null)
    return getJson('/api/bookings')
      .then((data) => setBookings(data))
      .catch((err) => {
        setBookings([])
        setError(err)
        throw err
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadBookings().catch(() => {})
  }, [])

  return { bookings, loading, error, setBookings, reload: loadBookings }
}
