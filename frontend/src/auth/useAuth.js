import { useContext } from 'react'
import { AuthContext } from './AuthContext'

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  const isAuthenticated = !!context.user
  const hasRole = (role) => context.user?.role === role

  return {
    ...context,
    isAuthenticated,
    hasRole,
    loading: false // Add loading state if needed
  }
}
