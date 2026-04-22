import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { fetchUserData } from '../services/userService'

export function useUserData() {
  const { user } = useAuth()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadUserData = useCallback(async () => {
    if (!user?.email) {
      setError('User email not available')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await fetchUserData(user.email)
      setUserData(data)
    } catch (err) {
      setError(err.message || 'Failed to load user data')
      setUserData(null)
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  return {
    userDetails: userData?.userDetails || null,
    bookings: userData?.bookings || [],
    tickets: userData?.tickets || [],
    loading,
    error,
    reload: loadUserData
  }
}
