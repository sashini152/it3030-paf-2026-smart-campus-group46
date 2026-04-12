import { createContext, useContext, useState, useEffect, useCallback } from 'react'
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

    // FORCE admin access for specific emails - IMMEDIATELY, no API calls needed
    const adminEmails = ['it23220492@my.sliit.lk']
    
    if (adminEmails.includes(baseUser.email)) {
      const adminUser = {
        ...baseUser,
        role: 'ADMIN',
        studentId: baseUser.studentId || '',
        name: baseUser.name || (baseUser.email === 'it23220492@my.sliit.lk' ? 'it23220492 GESHANI H D S' : 'Sashini')
      }
      setUser(adminUser)
      localStorage.setItem('user', JSON.stringify(adminUser))
      localStorage.setItem('userRole', 'ADMIN')
      localStorage.setItem('userEmail', adminUser.email)
      localStorage.setItem('userName', adminUser.name)
      setSessionRole('ADMIN')
      console.log('FORCED Admin access granted for:', adminUser.email)
      return adminUser // Return immediately, skip API calls
    }
    
    // Ensure non-admin users don't get admin role - NO API CALLS
    const regularUser = {
      ...baseUser,
      role: 'USER',
      studentId: baseUser.studentId || '',
      name: baseUser.name || 'User'
    }
    setUser(regularUser)
    localStorage.setItem('user', JSON.stringify(regularUser))
    localStorage.setItem('userRole', 'USER')
    localStorage.setItem('userEmail', regularUser.email)
    localStorage.setItem('userName', regularUser.name)
    setSessionRole('USER')
    console.log('FORCED User role set for:', regularUser.email, '- NO API CALLS')
    
    persistStudentIdentity({
      studentId: regularUser.studentId,
      name: regularUser.name,
      email: regularUser.email,
    })
    
    // Return immediately without any API calls for regular users
    return regularUser
  }, [])

  const login = useCallback((userData, userToken) => {
    // Immediate admin access for specific emails - FORCE IT
    const adminEmails = ['it23220492@my.sliit.lk']
    let nextUser = {
      ...userData,
      studentId: userData.studentId || '',
    }
    
    // FORCE admin role for specific emails regardless of what comes from backend
    if (adminEmails.includes(userData.email)) {
      nextUser.role = 'ADMIN'
      nextUser.name = userData.name || (userData.email === 'it23220492@my.sliit.lk' ? 'it23220492 GESHANI H D S' : 'Sashini')
      console.log('FORCED Admin access granted on login for:', userData.email)
      
      // Store admin redirect flag
      localStorage.setItem('adminRedirect', 'true')
    } else {
      // Ensure non-admin users don't get admin role
      nextUser.role = userData.role || 'USER'
      console.log('User role set to:', nextUser.role, 'for:', userData.email)
    }
    
    setUser(nextUser)
    setToken(userToken)
    
    // Update localStorage with correct role
    localStorage.setItem('user', JSON.stringify(nextUser))
    localStorage.setItem('token', userToken)
    localStorage.setItem('userRole', nextUser.role)
    localStorage.setItem('userEmail', nextUser.email)
    localStorage.setItem('userName', nextUser.name)
    setSessionRole(nextUser.role)
    
    console.log('Login complete - Role:', nextUser.role, 'Email:', nextUser.email)
    
    if (nextUser.role !== 'ADMIN') {
      persistStudentIdentity({
        studentId: nextUser.studentId,
        name: nextUser.name,
        email: nextUser.email,
      })
      // No more hydrateUser calls to prevent API errors
    }
  }, [])

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
        
        // Clear any existing session data to prevent cross-user confusion
        clearSessionRole()
        clearStudentIdentity()
        
        // Auto-grant admin access for specific emails during session restore - FORCE IT
        const adminEmails = ['it23220492@my.sliit.lk']
        if (adminEmails.includes(userData.email)) {
          userData.role = 'ADMIN' // Force admin role regardless of current role
          userData.name = userData.name || (userData.email === 'it23220492@my.sliit.lk' ? 'it23220492 GESHANI H D S' : 'Sashini')
          localStorage.setItem('user', JSON.stringify(userData))
          localStorage.setItem('userRole', 'ADMIN')
          localStorage.setItem('userEmail', userData.email)
          localStorage.setItem('userName', userData.name)
          setSessionRole('ADMIN')
          console.log('Admin access restored for:', userData.email)
        } else {
          // Force USER role for non-admin emails
          userData.role = 'USER'
          userData.name = userData.name || 'User'
          localStorage.setItem('user', JSON.stringify(userData))
          localStorage.setItem('userRole', 'USER')
          localStorage.setItem('userEmail', userData.email)
          localStorage.setItem('userName', userData.name)
          setSessionRole('USER')
          console.log('User role restored for:', userData.email)
        }
        
        setUser(userData)
        setToken(storedToken)
        
        // No more hydrateUser calls to prevent API errors
      }
    } catch (error) {
      console.error('Error checking authentication:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }, [logout])

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
