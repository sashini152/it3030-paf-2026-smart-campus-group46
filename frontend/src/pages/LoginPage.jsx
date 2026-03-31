import { Link, useNavigate } from 'react-router-dom'
import { getSessionRole, setSessionRole } from '../utils/session'

export default function LoginPage() {
  const navigate = useNavigate()
  const currentRole = getSessionRole()

  const handleRoleLogin = (role) => {
    setSessionRole(role)
    navigate(role === 'ADMIN' ? '/admin' : '/')
  }

  return (
    <div className="hub-page hub-page--narrow">
      <h1>Sign in</h1>
      <p className="hub-lead">
        OAuth and backend role checks are not wired yet, so this page currently
        uses a temporary front-end role switch for testing.
      </p>
      <div className="hub-placeholder">
        <p>
          Current role: <code>{currentRole}</code>
        </p>
        <p>
          Students do not see the admin dashboard link and cannot open
          <code> /admin </code>
          directly. Admins can.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="hub-btn hub-btn--primary"
            onClick={() => handleRoleLogin('STUDENT')}
          >
            Continue as Student
          </button>
          <button
            type="button"
            className="hub-btn hub-btn--primary"
            onClick={() => handleRoleLogin('ADMIN')}
          >
            Continue as Admin
          </button>
        </div>
        <p className="mt-4">
          Replace this with your real OAuth or JWT flow later, but the route
          gate is already in place.
        </p>
        <p className="mt-4">
          <Link to="/">Return home</Link>
        </p>
      </div>
    </div>
  )
}
