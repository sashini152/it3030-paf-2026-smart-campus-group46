import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getJson } from '../api/client'
import { clearSessionRole, setSessionRole } from '../utils/session'
import { clearStudentIdentity, persistStudentIdentity } from '../utils/studentIdentity'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  const hydrateUser = useCallback(async (baseUser) => {
    if (!baseUser) return null

    const fallbackUser = {
      ...baseUser,
      studentId: baseUser.studentId || '',
    }

    if (fallbackUser.role !== 'ADMIN') {
      persistStudentIdentity({
        studentId: fallbackUser.studentId,
        name: fallbackUser.name,
        email: fallbackUser.email,
      })
    }

    if (!fallbackUser.email || fallbackUser.role === 'ADMIN' || fallbackUser.studentId) {
      return fallbackUser
    }

    try {
      const profile = await getJson(`/api/users/email/${encodeURIComponent(fallbackUser.email)}`)
      const nextUser = {
        ...fallbackUser,
        name: profile?.name || fallbackUser.name,
        studentId: profile?.studentId || fallbackUser.studentId || '',
      }
      setUser(nextUser)
      localStorage.setItem('user', JSON.stringify(nextUser))
      persistStudentIdentity({
        studentId: nextUser.studentId,
        name: nextUser.name,
        email: nextUser.email,
      })
      return nextUser
    } catch {
      return fallbackUser
    }
  }, [])

  const login = useCallback((userData, userToken) => {
    const nextUser = {
      ...userData,
      studentId: userData.studentId || '',
    }
    setUser(nextUser)
    setToken(userToken)
    localStorage.setItem('user', JSON.stringify(nextUser))
    localStorage.setItem('token', userToken)
    setSessionRole(nextUser.role)
    if (nextUser.role !== 'ADMIN') {
      persistStudentIdentity({
        studentId: nextUser.studentId,
        name: nextUser.name,
        email: nextUser.email,
      })
      hydrateUser(nextUser).catch(() => {})
    }
  }, [hydrateUser])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    clearSessionRole()
    clearStudentIdentity()
  }, [])

  const checkAuth = useCallback(() => {
    try {
      const storedUser = localStorage.getItem('user')
      const storedToken = localStorage.getItem('token')
      
      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        setToken(storedToken)
        setSessionRole(userData.role)
        if (userData.role !== 'ADMIN') {
          persistStudentIdentity({
            studentId: userData.studentId,
            name: userData.name,
            email: userData.email,
          })
          hydrateUser(userData).catch(() => {})
        }
      }
    } catch (error) {
      console.error('Error checking authentication:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }, [hydrateUser, logout])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole: (role) => user?.role === role
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
