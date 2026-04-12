import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export default function AdminDashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  const [newResource, setNewResource] = useState({
    name: '',
    type: 'LECTURE_HALL',
    description: '',
    capacity: '',
    location: '',
    status: 'ACTIVE'
  })

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8081/api/resources/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setResources(data.resources || [])
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddResource = async (e) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      const resourceData = {
        ...newResource,
        capacity: parseInt(newResource.capacity),
        createdBy: user?.email || 'admin@smartcampus.com'
      }

      const response = await fetch('http://localhost:8081/api/resources/admin/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(resourceData)
      })

      if (response.ok) {
        alert('Resource added successfully!')
        setShowAddForm(false)
        setNewResource({
          name: '',
          type: 'LECTURE_HALL',
          description: '',
          capacity: '',
          location: '',
          status: 'ACTIVE'
        })
        fetchResources()
      } else {
        alert('Failed to add resource')
      }
    } catch (error) {
      console.error('Error adding resource:', error)
      alert('Error adding resource')
    }
  }

  const handleDeleteResource = async (resourceId) => {
    if (!confirm('Are you sure you want to delete this resource?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:8081/api/resources/admin/delete/${resourceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        alert('Resource deleted successfully!')
        fetchResources()
      } else {
        alert('Failed to delete resource')
      }
    } catch (error) {
      console.error('Error deleting resource:', error)
      alert('Error deleting resource')
    }
  }

  const userName = user?.name || localStorage.getItem('userName') || 'Admin User'

  if (loading) {
    return <div className="hub-loading">Loading admin dashboard...</div>
  }

  return (
    <div className="hub-page">
      <div className="hub-page-header">
        <div className="hub-user-info">
          <h1>Admin Dashboard - Welcome, {userName}!</h1>
          <div className="hub-user-details">
            <span className="hub-user-role">Role: ADMIN</span>
          </div>
        </div>
        <div className="hub-user-actions">
          <button
            onClick={() => navigate('/dashboard')}
            className="hub-button hub-button--secondary"
          >
            User Dashboard
          </button>
          <button
            onClick={logout}
            className="hub-button hub-button--danger"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="hub-content">
        <div className="hub-dashboard-grid">
          <div className="hub-dashboard-card">
            <h3>📊 System Overview</h3>
            <div className="hub-stats">
              <div className="hub-stat">
                <span className="hub-stat-number">{resources.length}</span>
                <span className="hub-stat-label">Total Resources</span>
              </div>
              <div className="hub-stat">
                <span className="hub-stat-number">{resources.filter(r => r.status === 'ACTIVE').length}</span>
                <span className="hub-stat-label">Active Resources</span>
              </div>
            </div>
          </div>

          <div className="hub-dashboard-card">
            <h3>🔧 Resource Management</h3>
            <div className="hub-admin-actions">
              <button
                onClick={() => setShowAddForm(true)}
                className="hub-button hub-button--primary"
              >
                ➕ Add New Resource
              </button>
              <button
                onClick={fetchResources}
                className="hub-button hub-button--secondary"
              >
                🔄 Refresh Resources
              </button>
            </div>
          </div>
        </div>

        {showAddForm && (
          <div className="hub-dashboard-card">
            <h3>➕ Add New Resource</h3>
            <form onSubmit={handleAddResource} className="hub-form">
              <div className="hub-form-group">
                <label>Resource Name:</label>
                <input
                  type="text"
                  value={newResource.name}
                  onChange={(e) => setNewResource({...newResource, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="hub-form-group">
                <label>Type:</label>
                <select
                  value={newResource.type}
                  onChange={(e) => setNewResource({...newResource, type: e.target.value})}
                >
                  <option value="LECTURE_HALL">Lecture Hall</option>
                  <option value="LAB">Lab</option>
                  <option value="MEETING_ROOM">Meeting Room</option>
                  <option value="EQUIPMENT">Equipment</option>
                </select>
              </div>
              
              <div className="hub-form-group">
                <label>Description:</label>
                <textarea
                  value={newResource.description}
                  onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                  rows="3"
                />
              </div>
              
              <div className="hub-form-group">
                <label>Capacity:</label>
                <input
                  type="number"
                  value={newResource.capacity}
                  onChange={(e) => setNewResource({...newResource, capacity: e.target.value})}
                  required
                />
              </div>
              
              <div className="hub-form-group">
                <label>Location:</label>
                <input
                  type="text"
                  value={newResource.location}
                  onChange={(e) => setNewResource({...newResource, location: e.target.value})}
                  required
                />
              </div>
              
              <div className="hub-form-actions">
                <button type="submit" className="hub-button hub-button--primary">
                  ✅ Add Resource
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="hub-button hub-button--secondary"
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="hub-dashboard-card">
          <h3>📋 All Resources</h3>
          {resources.length === 0 ? (
            <p>No resources found. Add your first resource above!</p>
          ) : (
            <div className="hub-resource-list">
              {resources.map((resource) => (
                <div key={resource.id} className="hub-resource-item">
                  <div className="hub-resource-info">
                    <h4>{resource.name}</h4>
                    <p><strong>Type:</strong> {resource.type}</p>
                    <p><strong>Location:</strong> {resource.location}</p>
                    <p><strong>Capacity:</strong> {resource.capacity}</p>
                    <p><strong>Status:</strong> <span className={`hub-status-${resource.status.toLowerCase()}`}>{resource.status}</span></p>
                    {resource.description && <p><strong>Description:</strong> {resource.description}</p>}
                  </div>
                  <div className="hub-resource-actions">
                    <button
                      onClick={() => handleDeleteResource(resource.id)}
                      className="hub-button hub-button--danger hub-button--small"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

