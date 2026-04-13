import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function AdminRedirect() {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    // Only redirect if admin redirect flag is set (for fresh login)
    const shouldRedirect = localStorage.getItem('adminRedirect')
    const isAdmin = user?.role === 'ADMIN'
    
    // Only redirect if flag is set and user is admin
    if (shouldRedirect === 'true' && isAdmin) {
      // Clear the redirect flag
      localStorage.removeItem('adminRedirect')
      
      // Redirect to admin dashboard
      console.log('Redirecting admin user to dashboard...')
      navigate('/admin', { replace: true })
    }
  }, [user, navigate])

  return null // This component doesn't render anything
}
