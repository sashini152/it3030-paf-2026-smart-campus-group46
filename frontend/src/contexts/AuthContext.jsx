import { createContext, useState, useEffect, useCallback } from 'react'
import { clearSessionRole, setSessionRole } from '../utils/session'
import { clearStudentIdentity, persistStudentIdentity } from '../utils/studentIdentity'
import { ADMIN_EMAILS, SUPER_ADMIN_EMAILS } from '../constants/auth'

const AuthContext = createContext()

export { AuthContext }

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  const isAdminEmail = useCallback((email) => {
    if (!email) return false
    return ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email.toLowerCase())
  }, [])

  const isSuperAdminEmail = useCallback((email) => {
    if (!email) return false
    return SUPER_ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email.toLowerCase())
  }, [])

  const resolveUserRole = useCallback(
    (email, fallbackRole) => {
      if (!email) return fallbackRole || 'USER'

      if (isSuperAdminEmail(email)) return 'SUPER_ADMIN'
      if (isAdminEmail(email)) return 'ADMIN'

      return fallbackRole || 'USER'
    },
    [isAdminEmail, isSuperAdminEmail]
  )

  const hydrateUser = useCallback(
    async (baseUser) => {
      if (!baseUser) return null

      const email = baseUser.email?.toLowerCase?.() || ''
      const resolvedRole = resolveUserRole(email, baseUser.role)

      const nextUser = {
        ...baseUser,
        email,
        role: resolvedRole,
        studentId: baseUser.studentId || '',
        name:
          baseUser.name ||
          (resolvedRole === 'SUPER_ADMIN'
            ? 'Super Admin'
            : resolvedRole === 'ADMIN'
            ? 'Admin User'
            : 'User'),
      }

      setUser(nextUser)
      localStorage.setItem('user', JSON.stringify(nextUser))
      localStorage.setItem('userRole', nextUser.role)
      localStorage.setItem('userEmail', nextUser.email)
      localStorage.setItem('userName', nextUser.name)
      setSessionRole(nextUser.role)

      if (nextUser.role === 'ADMIN' || nextUser.role === 'SUPER_ADMIN') {
        localStorage.setItem('adminRedirect', 'true')
        console.log(`${nextUser.role} access granted for:`, nextUser.email)
      } else {
        console.log('User role set for:', nextUser.email)

        persistStudentIdentity({
          studentId: nextUser.studentId,
          name: nextUser.name,
          email: nextUser.email,
        })
      }

      return nextUser
    },
    [resolveUserRole]
  )

  const login = useCallback(
    (userData, userToken) => {
      const email = userData.email?.toLowerCase?.() || ''
      const resolvedRole = resolveUserRole(email, userData.role)

      const nextUser = {
        ...userData,
        email,
        role: resolvedRole,
        studentId: userData.studentId || '',
        name:
          userData.name ||
          (resolvedRole === 'SUPER_ADMIN'
            ? 'Super Admin'
            : resolvedRole === 'ADMIN'
            ? 'Admin User'
            : 'User'),
      }

      if (resolvedRole === 'ADMIN' || resolvedRole === 'SUPER_ADMIN') {
        localStorage.setItem('adminRedirect', 'true')
        console.log(`${resolvedRole} access granted on login for:`, email)
      } else {
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

      if (nextUser.role !== 'ADMIN' && nextUser.role !== 'SUPER_ADMIN') {
        persistStudentIdentity({
          studentId: nextUser.studentId,
          name: nextUser.name,
          email: nextUser.email,
        })
      }
    },
    [resolveUserRole]
  )

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
        const resolvedRole = resolveUserRole(email, userData.role)

        clearSessionRole()
        clearStudentIdentity()

        userData.email = email
        userData.role = resolvedRole
        userData.studentId = userData.studentId || ''
        userData.name =
          userData.name ||
          (resolvedRole === 'SUPER_ADMIN'
            ? 'Super Admin'
            : resolvedRole === 'ADMIN'
            ? 'Admin User'
            : 'User')

        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('userRole', userData.role)
        localStorage.setItem('userEmail', userData.email)
        localStorage.setItem('userName', userData.name)
        setSessionRole(userData.role)

        if (userData.role === 'ADMIN' || userData.role === 'SUPER_ADMIN') {
          localStorage.setItem('adminRedirect', 'true')
          console.log(`${userData.role} access restored for:`, userData.email)
        } else {
          console.log('User role restored for:', userData.email)

          persistStudentIdentity({
            studentId: userData.studentId,
            name: userData.name,
            email: userData.email,
          })
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
  }, [resolveUserRole, logout])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    hydrateUser,
    isAuthenticated: !!user,
    hasRole: (role) => user?.role === role,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}