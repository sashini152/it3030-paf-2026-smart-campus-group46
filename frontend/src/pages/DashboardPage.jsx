import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      await fetch("http://localhost:8081/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
    }
  };

  useEffect(() => {
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'ADMIN') {
      navigate('/admin-dashboard')
    }
  }, [user, navigate])

  // Get user data from multiple sources for reliability
  const userName = user?.name || localStorage.getItem('userName') || 'Sashini Geshani';
  const userEmail = user?.email || localStorage.getItem('userEmail') || 'sashinigeshani1@gmail.com';
  const userRole = user?.role || localStorage.getItem('userRole') || 'USER';

  console.log('Dashboard user data:', { userName, userEmail, userRole, user });

  const getRoleBasedContent = () => {
    if (hasRole("ADMIN")) {
      return (
        <div className="hub-dashboard-admin">
          <h2>Admin Dashboard</h2>
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
            </div>
          </div>
        </div>
      );
    }

    if (hasRole("MANAGER")) {
      return (
        <div className="hub-dashboard-manager">
          <h2>Manager Dashboard</h2>
          <div className="hub-dashboard-grid">
            <div className="hub-dashboard-card">
              <h3>🎫 Ticket Management</h3>
              <p>Review and assign incident tickets to team members</p>
              <ul className="hub-feature-list">
                <li>View all incident tickets</li>
                <li>Assign tickets to technicians</li>
                <li>Monitor ticket resolution times</li>
                <li>Generate ticket reports</li>
                <li>Escalate high-priority issues</li>
              </ul>
            </div>

            <div className="hub-dashboard-card">
              <h3>📋 Resource Management</h3>
              <p>Manage campus resources and facility bookings</p>
              <ul className="hub-feature-list">
                <li>View resource availability</li>
                <li>Approve resource requests</li>
                <li>Manage resource schedules</li>
                <li>Resource utilization reports</li>
                <li>Facility maintenance scheduling</li>
              </ul>
            </div>

            <div className="hub-dashboard-card">
              <h3>📈 Team Performance</h3>
              <p>Monitor team productivity and performance metrics</p>
              <ul className="hub-feature-list">
                <li>Team member performance tracking</li>
                <li>Task completion rates</li>
                <li>Response time analytics</li>
                <li>Workload distribution</li>
                <li>Performance reports</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    if (hasRole("TECHNICIAN")) {
      return (
        <div className="hub-dashboard-technician">
          <h2>Technician Dashboard</h2>
          <div className="hub-dashboard-grid">
            <div className="hub-dashboard-card">
              <h3>🔧 My Assigned Tickets</h3>
              <p>View and manage incident tickets assigned to you</p>
              <ul className="hub-feature-list">
                <li>View assigned tickets</li>
                <li>Update ticket status</li>
                <li>Add work notes and comments</li>
                <li>Mark tickets as resolved</li>
                <li>Track time spent on tickets</li>
              </ul>
            </div>

            <div className="hub-dashboard-card">
              <h3>📚 Knowledge Base</h3>
              <p>Access technical documentation and troubleshooting guides</p>
              <ul className="hub-feature-list">
                <li>Search technical documentation</li>
                <li>View common issues and solutions</li>
                <li>Access repair manuals</li>
                <li>Submit knowledge base articles</li>
                <li>Bookmark frequently used resources</li>
              </ul>
            </div>

            <div className="hub-dashboard-card">
              <h3>🛠️ Tools & Equipment</h3>
              <p>Manage tools and equipment inventory</p>
              <ul className="hub-feature-list">
                <li>View available tools</li>
                <li>Request equipment assignments</li>
                <li>Report tool maintenance</li>
                <li>Track tool usage</li>
                <li>Equipment checkout/check-in</li>
              </ul>
              <p>Manage tools and equipment</p>
              <button className="hub-button hub-button--primary">Tools</button>
            </div>
          </div>
        </div>
      );
    }

    // Default USER dashboard
    return (
      <div className="hub-dashboard-user">
        <h2>User Dashboard</h2>
        <div className="hub-dashboard-grid">
          <div className="hub-dashboard-card">
            <h3>My Tickets</h3>
            <p>View and manage your incident tickets</p>
            <div className="hub-stats">
              <div className="hub-stat">
                <span className="hub-stat-number">0</span>
                <span className="hub-stat-label">Total Tickets</span>
              </div>
              <div className="hub-stat">
                <span className="hub-stat-number">0</span>
                <span className="hub-stat-label">Open</span>
              </div>
            </div>
            <button 
              className="hub-button hub-button--primary"
              onClick={() => navigate('/my-tickets')}
            >
              My Tickets
            </button>
          </div>
          <div className="hub-dashboard-card">
            <h3>Book Resources</h3>
            <p>Book campus resources and facilities</p>
            <div className="hub-stats">
              <div className="hub-stat">
                <span className="hub-stat-number">0</span>
                <span className="hub-stat-label">Booked</span>
              </div>
              <div className="hub-stat">
                <span className="hub-stat-number">0</span>
                <span className="hub-stat-label">Available</span>
              </div>
            </div>
            <button 
              className="hub-button hub-button--primary"
              onClick={() => navigate('/book-resources')}
            >
              Book Resources
            </button>
          </div>
          <div className="hub-dashboard-card">
            <h3>Profile</h3>
            <p>Manage your profile and preferences</p>
            <div className="hub-user-profile">
              <div className="hub-profile-info">
                <strong>{userName}</strong>
                <span>{userEmail}</span>
                <span className="hub-role-badge">{userRole}</span>
              </div>
            </div>
            <button 
              className="hub-button hub-button--primary"
              onClick={() => navigate('/profile')}
            >
              Profile
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return <div className="hub-loading">Loading...</div>;
  }

  return (
    <div className="hub-page">
      <div className="hub-page-header">
        <div className="hub-user-info">
          <h1>Welcome, {userName}!</h1>
          <div className="hub-user-details">
            <span className="hub-user-email">{userEmail}</span>
            <span className="hub-user-role">Role: {userRole}</span>
          </div>
        </div>
        <div className="hub-user-actions">
          <button
            onClick={handleLogout}
            className="hub-button hub-button--secondary"
          >
            Logout
          </button>
        </div>
      </div>

      {getRoleBasedContent()}
    </div>
  );
}
