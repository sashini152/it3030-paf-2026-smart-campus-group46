import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function OAuthSuccessPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('http://localhost:8081/api/auth/me', {
          credentials: 'include',
        })

        if (!res.ok) {
          throw new Error('Failed to load Google user')
        }

        const data = await res.json()

        if (!data.email) {
          throw new Error('No user session found')
        }

        login(data)
        navigate('/')
      } catch (err) {
        setError('Google login failed')
      }
    }

    loadUser()
  }, [login, navigate])

  return (
    <div className="page-wrap">
      <h1 className="page-title">Signing you in...</h1>
      {error && <p className="auth-error">{error}</p>}
    </div>
  )
}

