import { createContext, useState, useEffect, useCallback } from 'react'
import { clearSessionRole, setSessionRole } from '../utils/session'
import { clearStudentIdentity, persistStudentIdentity } from '../utils/studentIdentity'
import { ADMIN_EMAILS, SUPER_ADMIN_EMAILS } from '../constants/auth'

const AuthContext = createContext()

export { AuthContext }

function isUsableToken(value) {
  return Boolean(
    value &&
      value !== 'undefined' &&
      value !== 'null' &&
      value !== 'false' &&
      String(value).trim() !== ''
  )
}

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

  const syncUserToStorage = useCallback((nextUser, nextToken = null) => {
    setUser(nextUser)
    setToken(nextToken)

    localStorage.setItem('user', JSON.stringify(nextUser))
    localStorage.setItem('userRole', nextUser.role)
    localStorage.setItem('userEmail', nextUser.email)
    localStorage.setItem('userName', nextUser.name)
    setSessionRole(nextUser.role)

    if (isUsableToken(nextToken)) {
      localStorage.setItem('token', nextToken)
    } else {
      localStorage.removeItem('token')
    }

    if (nextUser.role === 'ADMIN' || nextUser.role === 'SUPER_ADMIN') {
      localStorage.setItem('adminRedirect', 'true')
    } else {
      localStorage.removeItem('adminRedirect')
    }
  }, [])

  const hydrateUser = useCallback(
    async (baseUser, userToken = null) => {
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

      const safeToken = isUsableToken(userToken) ? userToken : null

      syncUserToStorage(nextUser, safeToken)

      if (nextUser.role === 'ADMIN' || nextUser.role === 'SUPER_ADMIN') {
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
    [resolveUserRole, syncUserToStorage]
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

      const safeToken = isUsableToken(userToken) ? userToken : null

      if (resolvedRole === 'ADMIN' || resolvedRole === 'SUPER_ADMIN') {
        console.log(`${resolvedRole} access granted on login for:`, email)
      } else {
        console.log('User role set to USER for:', email)
      }

      syncUserToStorage(nextUser, safeToken)

      console.log('Login complete - Role:', nextUser.role, 'Email:', nextUser.email)

      if (nextUser.role !== 'ADMIN' && nextUser.role !== 'SUPER_ADMIN') {
        persistStudentIdentity({
          studentId: nextUser.studentId,
          name: nextUser.name,
          email: nextUser.email,
        })
      }
    },
    [resolveUserRole, syncUserToStorage]
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
      const safeStoredToken = isUsableToken(storedToken) ? storedToken : null

      console.log(
        'checkAuth: storedUser:',
        storedUser,
        'storedToken:',
        safeStoredToken ? 'exists' : 'missing'
      )

      if (storedUser) {
        const userData = JSON.parse(storedUser)
        const email = userData.email?.toLowerCase?.() || ''
        const resolvedRole = resolveUserRole(email, userData.role)

        clearSessionRole()
        clearStudentIdentity()

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

        syncUserToStorage(nextUser, safeStoredToken)

        if (nextUser.role === 'ADMIN' || nextUser.role === 'SUPER_ADMIN') {
          console.log(`${nextUser.role} access restored for:`, nextUser.email)
        } else {
          console.log('User role restored for:', nextUser.email)

          persistStudentIdentity({
            studentId: nextUser.studentId,
            name: nextUser.name,
            email: nextUser.email,
          })
        }

        console.log('checkAuth: setUser and setToken called')
      } else {
        console.log('checkAuth: No stored user found')
        logout()
      }
    } catch (error) {
      console.error('Error checking authentication:', error)
      logout()
    } finally {
      setLoading(false)
      console.log('checkAuth: setLoading(false) called')
    }
  }, [resolveUserRole, logout, syncUserToStorage])

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