import { useEffect, useState } from 'react'
import { getJson, patchJson } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'
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

    async function loadUsers() {
      try {
        setLoading(true)
        setError('')
        const data = await getJson('/api/admin/users')
        setUsers(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
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
      alert(err.message)
    } finally {
      setSavingEmail('')
    }
  }

  if (!isSuperAdmin) {
    return <Navigate to="/admin" replace />
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl bg-white p-6 shadow-sm">
          <AdminSidebar currentPage="/super-admin-users" />
        </aside>

        <main className="rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="mt-2 text-sm text-slate-500">
            Super admin can view all users and change roles.
          </p>

          {loading && <p className="mt-6">Loading users...</p>}
          {error && <p className="mt-6 text-red-600">{error}</p>}

          {!loading && !error && (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full border border-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="border p-3 text-left">Name</th>
                    <th className="border p-3 text-left">Email</th>
                    <th className="border p-3 text-left">Role</th>
                    <th className="border p-3 text-left">Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item) => (
                    <tr key={item.id || item.email}>
                      <td className="border p-3">{item.name || '-'}</td>
                      <td className="border p-3">{item.email}</td>
                      <td className="border p-3">{item.role}</td>
                      <td className="border p-3">
                        <select
                          value={item.role}
                          onChange={(e) =>
                            handleRoleChange(item.email, e.target.value)
                          }
                          disabled={savingEmail === item.email}
                          className="rounded border px-3 py-2"
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}