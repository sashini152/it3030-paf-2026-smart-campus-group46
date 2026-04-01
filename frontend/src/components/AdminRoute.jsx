import { Navigate } from 'react-router-dom'
import { isAdminRole } from '../utils/session'

export default function AdminRoute({ children }) {
  return isAdminRole() ? children : <Navigate to="/login" replace />
}
