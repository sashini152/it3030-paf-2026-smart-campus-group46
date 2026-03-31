import { Link, useNavigate } from 'react-router-dom'
import PageIntro from '../components/PageIntro'
import SurfaceCard from '../components/SurfaceCard'
import { getSessionRole, setSessionRole } from '../utils/session'

export default function LoginPage() {
  const navigate = useNavigate()
  const currentRole = getSessionRole()

  const handleRoleLogin = (role) => {
    setSessionRole(role)
    navigate(role === 'ADMIN' ? '/admin' : '/')
  }

  return (
    <div className="hub-page hub-page--narrow space-y-8">
      <PageIntro
        eyebrow="Access"
        title="Sign in"
        description="Real authentication is not wired yet. This temporary page switches the frontend role so you can test student and admin views without changing the rest of the app."
      />

      <SurfaceCard className="space-y-5">
        <div className="rounded-[24px] border border-[#dde5ef] bg-[#f8fbff] px-4 py-4 text-sm text-[#475569]">
          Current role: <code>{currentRole}</code>
        </div>

        <p className="text-sm leading-6 text-[#64748b]">
          Students do not see the dashboard link and cannot open <code>/admin</code> directly.
          Admins can.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex items-center rounded-full border border-[#327f7d] bg-white px-4 py-2 text-sm font-semibold text-[#327f7d] shadow-sm"
            onClick={() => handleRoleLogin('STUDENT')}
          >
            Continue as Student
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-full border border-[#163455] bg-[linear-gradient(180deg,#274c77_0%,#163455_100%)] px-4 py-2 text-sm font-semibold text-white shadow-sm"
            onClick={() => handleRoleLogin('ADMIN')}
          >
            Continue as Admin
          </button>
        </div>

        <p className="text-sm leading-6 text-[#64748b]">
          Replace this with your real OAuth or JWT flow later. The route guard is already in
          place, so this page is only a temporary access switch.
        </p>

        <p className="text-sm font-semibold">
          <Link to="/">Return home</Link>
        </p>
      </SurfaceCard>
    </div>
  )
}
