import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getJson, putJson } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import ParallaxPanel from '../components/ParallaxPanel'
import Reveal from '../components/Reveal'
import Tooltip from '../components/Tooltip'

const ADMIN_REQUEST_TIMEOUT_MS = 4000

function withTimeout(request, labelText) {
  let timeoutId
  return Promise.race([
    request,
    new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(`${labelText} request timed out. Reload the page and make sure backend is still running.`)), ADMIN_REQUEST_TIMEOUT_MS)
    }),
  ]).finally(() => clearTimeout(timeoutId))
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [adminUsers, setAdminUsers] = useState([])
  const [adminUsersLoading, setAdminUsersLoading] = useState(true)
  const [adminUsersError, setAdminUsersError] = useState(null)
  const [allUsers, setAllUsers] = useState([])
  const [allUsersLoading, setAllUsersLoading] = useState(true)
  const [allUsersError, setAllUsersError] = useState(null)
  const [newAdminEmail, setNewAdminEmail] = useState('')

  const loadAdminUsers = useCallback(async () => {
    setAdminUsersLoading(true)
    setAdminUsersError(null)
    try { 
      const data = await withTimeout(getJson('/api/admin/users'), 'Admin users list') 
      const admins = Array.isArray(data.users) ? data.users.filter(u => u.role && (u.role === 'ADMIN' || u.role === 'SUPER_ADMIN' || u.role === 'ROLE_ADMIN' || u.role === 'ROLE_SUPER_ADMIN')) : []
      setAdminUsers(admins) 
    }
    catch (error) { 
      console.error('API Error:', error)
      // Fallback: Try to load from localStorage if API fails
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]')
      const fallbackAdmins = Array.isArray(storedUsers) ? storedUsers.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN' || u.role === 'ROLE_ADMIN' || u.role === 'ROLE_SUPER_ADMIN') : []
      setAdminUsers(fallbackAdmins)
      setAdminUsersError('API unavailable. Showing cached data.')
    } 
    finally { 
      setAdminUsersLoading(false) 
    }
  }, [])

  const loadAllUsers = useCallback(async () => {
    setAllUsersLoading(true)
    setAllUsersError(null)
    try { 
      const data = await withTimeout(getJson('/api/admin/all-users'), 'All users list') 
      const users = Array.isArray(data.users) ? data.users : []
      setAllUsers(users) 
    }
    catch (error) { 
      console.error('API Error:', error)
      setAllUsersError('Failed to load all users: ' + error.message)
    } 
    finally { 
      setAllUsersLoading(false) 
    }
  }, [])

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      alert('Please enter a valid email address')
      return
    }

    try {
      const userResponse = await withTimeout(getJson(`/api/admin/users/email/${newAdminEmail.trim()}`), 'User lookup')
      if (!userResponse || userResponse.status === 'error') {
        alert('User with this email does not exist')
        return
      }

      await withTimeout(putJson(`/api/admin/users/${userResponse.id}/role`, { role: 'ADMIN' }), 'Grant admin access')
      
      alert(`Admin access granted to ${newAdminEmail}`)
      setNewAdminEmail('')
      await loadAdminUsers()
    } catch (err) {
      console.error('Failed to add admin:', err)
      alert('Failed to grant admin access. Please try again.')
    }
  }

  const handleRemoveAdmin = async (userId, userEmail) => {
    if (!confirm(`Are you sure you want to remove admin access from ${userEmail}?`)) {
      return
    }

    try {
      await withTimeout(putJson(`/api/admin/users/${userId}/role`, { role: 'USER' }), 'Remove admin access')
      alert(`Admin access removed from ${userEmail}`)
      await loadAdminUsers()
    } catch (err) {
      console.error('Failed to remove admin:', err)
      alert('Failed to remove admin access. Please try again.')
    }
  }

  useEffect(() => {
    loadAdminUsers()
    loadAllUsers()
  }, [loadAdminUsers, loadAllUsers])

  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-[#edf3f0] text-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Restricted</h1>
          <p className="text-gray-600 mb-6">This page is only accessible to Super Administrators.</p>
          <button
            onClick={() => navigate('/admin')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Admin Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#edf3f0] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/70 bg-white/85 px-6 py-8 xl:block">
          <div className="flex h-full flex-col">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-600 text-sm font-bold text-white">SA</div>
              <div>
                <p className="text-lg font-semibold text-slate-900">Smart Campus</p>
                <p className="text-xs uppercase tracking-[0.28em] text-purple-600">Super Admin Desk</p>
              </div>
            </div>
            
            <nav className="space-y-1.5">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                ← Back to Admin Dashboard
              </button>
            </nav>
            
            <button
              type="button"
              onClick={() => { logout(); navigate('/login', { replace: true }) }}
              className="mt-6 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-600"
            >
              Logout
            </button>
            
            <div className="mt-auto rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
              Manage admin user accounts and permissions from one workspace.
            </div>
          </div>
        </aside>

        <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto max-w-[1480px] rounded-[36px] border border-white/70 bg-white/70 p-4 shadow-[0_30px_80px_rgba(148,163,184,0.28)] md:p-6 lg:p-8">
            <header className="mb-8 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-600">Super Admin</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Admin Management Dashboard</h1>
                  <p className="mt-2 max-w-2xl text-sm text-slate-500">Manage admin user accounts, grant permissions, and oversee system administration.</p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right text-sm">
                <p className="font-semibold text-slate-900">{user?.name || 'Super Admin'}</p>
                <p className="text-slate-500">{user?.email || 'superadmin@smartcampus.local'}</p>
              </div>
            </header>

            {/* Navigation Bar */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-medium text-purple-900 mb-3">Quick Navigation</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigate('/admin')}
                  className="px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-md hover:bg-purple-50 transition-colors"
                >
                  ← Admin Dashboard
                </button>
                <button
                  onClick={() => navigate('/admin-bookings-dashboard')}
                  className="px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-md hover:bg-purple-50 transition-colors"
                >
                  Bookings Dashboard
                </button>
                <button
                  onClick={() => navigate('/admin-tickets')}
                  className="px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-md hover:bg-purple-50 transition-colors"
                >
                  Tickets Dashboard
                </button>
                <button
                  onClick={() => navigate('/admin-resources')}
                  className="px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-md hover:bg-purple-50 transition-colors"
                >
                  Resources Management
                </button>
                <button
                  onClick={() => navigate('/notifications')}
                  className="px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-md hover:bg-purple-50 transition-colors"
                >
                  Notifications
                </button>
              </div>
            </div>

            <div className="space-y-5">
              <Reveal delay={50}>
                <ParallaxPanel as="section" className="hub-quarter-fade rounded-[24px] border border-slate-200 bg-white p-5" strength={8}>
                  <h2 className="text-xl font-semibold mb-4">Admin User Management</h2>
                  
                  {/* Add New Admin */}
                  <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h3 className="font-medium text-purple-900 mb-3">Grant Admin Access</h3>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="Enter user email"
                        className="flex-1 px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={handleAddAdmin}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                      >
                        Add Admin
                      </button>
                    </div>
                  </div>
                  
                  {/* Current Admins */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-3">
                      Current Admin Users ({adminUsers.length})
                    </h3>
                    {adminUsersLoading ? (
                      <LoadingSpinner label="Loading admin users..." />
                    ) : adminUsersError ? (
                      <EmptyState 
                        title="Error loading admin users" 
                        description={adminUsersError} 
                        tone="error"
                      />
                    ) : adminUsers.length === 0 ? (
                      <EmptyState 
                        title="No admin users found" 
                        description="There are currently no admin users in the system." 
                        tone="empty"
                      />
                    ) : (
                      <div className="space-y-2">
                        {adminUsers.map((adminUser) => (
                          <div key={adminUser.id} className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200">
                            <div>
                              <div className="font-medium text-gray-900">
                                {adminUser.name || adminUser.email}
                              </div>
                              <div className="text-sm text-gray-500">{adminUser.email}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  adminUser.role === 'SUPER_ADMIN' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {adminUser.role}
                                </span>
                              </div>
                            </div>
                            {adminUser.role !== 'SUPER_ADMIN' && (
                              <button
                                onClick={() => handleRemoveAdmin(adminUser.id, adminUser.email)}
                                className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-sm"
                              >
                                Remove Admin
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ParallaxPanel>
              </Reveal>

              {/* All Users Section */}
              <Reveal delay={100}>
                <ParallaxPanel as="section" className="hub-quarter-fade rounded-[24px] border border-slate-200 bg-white p-5" strength={8}>
                  <h2 className="text-xl font-semibold mb-4">All Users from Database</h2>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-medium text-blue-900 mb-3">
                      All Registered Users ({allUsers.length})
                    </h3>
                    {allUsersLoading ? (
                      <LoadingSpinner label="Loading all users..." />
                    ) : allUsersError ? (
                      <EmptyState 
                        title="Error loading all users" 
                        description={allUsersError} 
                        tone="error"
                      />
                    ) : allUsers.length === 0 ? (
                      <EmptyState 
                        title="No users found" 
                        description="There are currently no users in the database." 
                        tone="empty"
                      />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User ID
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {allUsers.map((user) => (
                              <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {user.name || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    user.role === 'ADMIN' 
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {user.role}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <span className="text-xs font-mono">
                                    {user.id ? user.id.substring(0, 8) + '...' : 'N/A'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </ParallaxPanel>
              </Reveal>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
