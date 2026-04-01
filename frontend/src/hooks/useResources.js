import { useEffect, useState } from 'react'
import { getJson } from '../api/client'

export function useResources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadResources = () => {
    setLoading(true)
    setError(null)
    return getJson('/api/resources')
      .then((data) => setResources(data))
      .catch((err) => {
        setResources([])
        setError(err)
        throw err
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadResources().catch(() => {})
  }, [])

  return { resources, loading, error, setResources, reload: loadResources }
}
