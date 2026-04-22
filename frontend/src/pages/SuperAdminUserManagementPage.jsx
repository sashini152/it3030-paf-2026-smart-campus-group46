import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getJson, patchJson } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import AdminSidebar from '../components/AdminSidebar'

const ROLE_OPTIONS = ['USER', 'ADMIN', 'SUPER_ADMIN', 'TECHNICIAN', 'MANAGER']

export default function SuperAdminUserManagementPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingEmail, setSavingEmail] = useState('')

  const isSuperAdmin =
    (user?.role || localStorage.getItem('userRole')) === 'SUPER_ADMIN'

  useEffect(() => {
    if (!isSuperAdmin) return

    let isMounted = true

    async function loadUsers() {
      try {
        setLoading(true)
        setError('')

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out while loading users.')), 8000)
        )

        const data = await Promise.race([
          getJson('/api/admin/users'),
          timeoutPromise,
        ])

        if (!isMounted) return

        setUsers(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!isMounted) return
        setError(err.message || 'Failed to load users')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadUsers()

    return () => {
      isMounted = false
    }
  }, [isSuperAdmin])

  async function handleRoleChange(email, newRole) {
    try {
      setSavingEmail(email)

      await patchJson(`/api/admin/users/${encodeURIComponent(email)}/role`, {
        role: newRole,
      })

      setUsers((prev) =>
        prev.map((item) =>
          item.email === email ? { ...item, role: newRole } : item
        )
      )
    } catch (err) {
      alert(err.message || 'Failed to update role')
    } finally {
      setSavingEmail('')
    }
  }

  if (!isSuperAdmin) {
    return <Navigate to="/admin" replace />
  }

  return (
    <div className="min-h-screen bg-[#edf3f0] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/70 bg-white/85 px-6 py-8 xl:block">
          <AdminSidebar currentPage="/super-admin-users" />
        </aside>

        <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto max-w-[1480px] rounded-[36px] border border-white/70 bg-white/70 p-4 shadow-[0_30px_80px_rgba(148,163,184,0.28)] md:p-6 lg:p-8">
            <h1 className="text-3xl font-semibold text-slate-900">User Management</h1>
            <p className="mt-2 text-sm text-slate-500">
              Super admin can view all users and change roles.
            </p>

            {loading && <p className="mt-8 text-slate-400">Loading users...</p>}

            {error && (
              <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {!loading && !error && (
              <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-500">
                        Name
                      </th>
                      <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-500">
                        Email
                      </th>
                      <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-500">
                        Role
                      </th>
                      <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-500">
                        Change Role
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-4 py-10 text-center text-slate-500"
                        >
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      users.map((item) => (
                        <tr key={item.id || item.email} className="border-b border-slate-100">
                          <td className="px-4 py-3">{item.name || '-'}</td>
                          <td className="px-4 py-3">{item.email || '-'}</td>
                          <td className="px-4 py-3">{item.role || '-'}</td>
                          <td className="px-4 py-3">
                            <select
                              value={item.role || 'USER'}
                              onChange={(e) =>
                                handleRoleChange(item.email, e.target.value)
                              }
                              disabled={savingEmail === item.email}
                              className="rounded-lg border border-slate-300 px-3 py-2"
                            >
                              {ROLE_OPTIONS.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}