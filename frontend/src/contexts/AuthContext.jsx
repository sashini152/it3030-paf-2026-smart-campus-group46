import { createContext, useState, useEffect, useCallback } from 'react'
import { clearSessionRole, setSessionRole } from '../utils/session'
import { clearStudentIdentity, persistStudentIdentity } from '../utils/studentIdentity'
import { ADMIN_EMAILS } from '../constants/auth'

const AuthContext = createContext()

export { AuthContext }

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  const isAdminEmail = useCallback((email) => {
    if (!email) return false
    return ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase())
  }, [])

  const hydrateUser = useCallback(async (baseUser) => {
    if (!baseUser) return null

    const email = baseUser.email?.toLowerCase?.() || ''
    const admin = isAdminEmail(email)

    if (admin) {
      const adminUser = {
        ...baseUser,
        email,
        role: 'ADMIN',
        studentId: baseUser.studentId || '',
        name: baseUser.name || 'Admin User'
      }

      setUser(adminUser)
      localStorage.setItem('user', JSON.stringify(adminUser))
      localStorage.setItem('userRole', 'ADMIN')
      localStorage.setItem('userEmail', adminUser.email)
      localStorage.setItem('userName', adminUser.name)
      setSessionRole('ADMIN')

      console.log('FORCED Admin access granted for:', adminUser.email)
      return adminUser
    }

    const regularUser = {
      ...baseUser,
      email,
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

    console.log('FORCED User role set for:', regularUser.email)

    persistStudentIdentity({
      studentId: regularUser.studentId,
      name: regularUser.name,
      email: regularUser.email,
    })

    return regularUser
  }, [isAdminEmail])

  const login = useCallback((userData, userToken) => {
    const email = userData.email?.toLowerCase?.() || ''

    let nextUser = {
      ...userData,
      email,
      studentId: userData.studentId || '',
    }

    if (isAdminEmail(email)) {
      nextUser.role = 'ADMIN'
      nextUser.name = userData.name || 'Admin User'
      localStorage.setItem('adminRedirect', 'true')
      console.log('FORCED Admin access granted on login for:', email)
    } else {
      nextUser.role = 'USER'
      nextUser.name = userData.name || 'User'
      console.log('User role set to USER for:', email)
    }

    setUser(nextUser)
    setToken(userToken)

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
    }
  }, [isAdminEmail])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)

    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    localStorage.removeItem('adminRedirect')

    clearSessionRole()
    clearStudentIdentity()
  }, [])

  const checkAuth = useCallback(() => {
    try {
      const storedUser = localStorage.getItem('user')
      const storedToken = localStorage.getItem('token')

      console.log(
        'checkAuth: storedUser:',
        storedUser,
        'storedToken:',
        storedToken ? 'exists' : 'missing'
      )

      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser)
        const email = userData.email?.toLowerCase?.() || ''

        clearSessionRole()
        clearStudentIdentity()

        if (isAdminEmail(email)) {
          userData.email = email
          userData.role = 'ADMIN'
          userData.name = userData.name || 'Admin User'

          localStorage.setItem('user', JSON.stringify(userData))
          localStorage.setItem('userRole', 'ADMIN')
          localStorage.setItem('userEmail', userData.email)
          localStorage.setItem('userName', userData.name)
          setSessionRole('ADMIN')

          console.log('Admin access restored for:', userData.email)
        } else {
          userData.email = email
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
        console.log('checkAuth: setUser and setToken called')
      } else {
        console.log('checkAuth: No stored user or token found')
      }
    } catch (error) {
      console.error('Error checking authentication:', error)
      logout()
    } finally {
      setLoading(false)
      console.log('checkAuth: setLoading(false) called')
    }
  }, [isAdminEmail, logout])

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