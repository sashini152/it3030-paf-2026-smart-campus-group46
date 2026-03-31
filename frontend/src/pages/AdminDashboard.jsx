import { useAuth } from '../contexts/AuthContext.jsx'

export default function AdminDashboard() {
  const { user } = useAuth()

  const handleUserManagement = () => {
    // TODO: Implement user management
    console.log('Opening user management...')
  }

  const handleSystemSettings = () => {
    // TODO: Implement system settings
    console.log('Opening system settings...')
  }

  const handleAnalytics = () => {
    // TODO: Implement analytics dashboard
    console.log('Opening analytics...')
  }

  return (
    <div className="hub-page">
      <div className="hub-page-header">
        <div className="hub-user-info">
          <h1>Admin Dashboard</h1>
          <div className="hub-user-details">
            <span className="hub-user-email">{user?.email}</span>
            <span className="hub-user-role">Role: {user?.role}</span>
          </div>
        </div>
      </div>

      <div className="hub-dashboard-grid">
        <div className="hub-dashboard-card">
          <h3>👥 User Management</h3>
          <p>Manage user accounts, roles, and permissions</p>
          <ul className="hub-feature-list">
            <li>Create and edit user accounts</li>
            <li>Assign roles (USER, ADMIN, TECHNICIAN, MANAGER)</li>
            <li>View user activity logs</li>
            <li>Manage user permissions</li>
          </ul>
          <button onClick={handleUserManagement} className="hub-button hub-button--primary">
            Manage Users
          </button>
        </div>

        <div className="hub-dashboard-card">
          <h3>⚙️ System Settings</h3>
          <p>Configure system-wide settings and preferences</p>
          <ul className="hub-feature-list">
            <li>OAuth2 client configuration</li>
            <li>JWT token settings</li>
            <li>Rate limiting configuration</li>
            <li>Security policies</li>
            <li>Database connection settings</li>
          </ul>
          <button onClick={handleSystemSettings} className="hub-button hub-button--primary">
            System Settings
          </button>
        </div>

        <div className="hub-dashboard-card">
          <h3>📊 Analytics & Reports</h3>
          <p>View system analytics and generate reports</p>
          <ul className="hub-feature-list">
            <li>User registration statistics</li>
            <li>Login activity tracking</li>
            <li>API usage metrics</li>
            <li>System performance monitoring</li>
            <li>Custom report generation</li>
          </ul>
          <button onClick={handleAnalytics} className="hub-button hub-button--primary">
            View Analytics
          </button>
        </div>

        <div className="hub-dashboard-card">
          <h3>🔧 System Maintenance</h3>
          <p>Perform system maintenance operations</p>
          <ul className="hub-feature-list">
            <li>Database backup and restore</li>
            <li>Log file management</li>
            <li>System health checks</li>
            <li>Cache management</li>
            <li>Security audit logs</li>
          </ul>
          <button className="hub-button hub-button--secondary">
            Maintenance Tools
          </button>
        </div>
      </div>
    </div>
  )
}
