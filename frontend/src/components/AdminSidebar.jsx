import { Link, useLocation } from 'react-router-dom'

function cls(...values) {
  return values.filter(Boolean).join(' ')
}

export default function AdminSidebar({ currentPage }) {
  const location = useLocation()
  const role = localStorage.getItem('userRole')

  const navItems = [
    { label: 'Overview', to: '/admin' },
    { label: 'Resources', to: '/admin-resources' },
    { label: 'Bookings', to: '/admin-bookings-dashboard' },
    { label: 'Tickets', to: '/admin-tickets' },
    { label: 'Notifications', to: '/notifications' },
    ...(role === 'SUPER_ADMIN'
      ? [{ label: 'User Management', to: '/super-admin-users' }]
      : []),
    { label: 'Profile', to: '/profile' },
  ]

  const resolveCurrentPath = () => {
    if (currentPage) return currentPage
    return location.pathname
  }

  const activePath = resolveCurrentPath()

  const isItemActive = (itemTo) => {
    if (activePath === itemTo) return true

    if (itemTo === '/admin' && activePath === '/admin/') return true
    if (itemTo === '/admin-bookings-dashboard' && activePath === '/admin-bookings') return true

    return false
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-sm font-bold text-white shadow-lg shadow-emerald-500/20">
          SC
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900">Smart Campus</p>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
            Admin Desk
          </p>
        </div>
      </div>

      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const active = isItemActive(item.to)

          return (
            <Link
              key={item.label}
              to={item.to}
              className={cls(
                'block rounded-2xl px-4 py-3 text-sm font-medium transition',
                active
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
        {role === 'SUPER_ADMIN'
          ? 'Super admin mode is active. You can manage users, assign admin roles, and access all admin modules.'
          : 'Campus operations are live. All modules are integrated for seamless admin management.'}
      </div>
    </div>
  )
}