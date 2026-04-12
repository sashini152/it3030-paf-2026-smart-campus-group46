import React, { useState, useEffect } from 'react'
import { useAuth } from '../auth/useAuth';
import { useNavigate } from "react-router-dom";

export default function BookResourcesPageWorking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: '',
    search: ''
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/resources', {
        credentials: 'include', // IMPORTANT for OAuth2 session
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Real data from MongoDB:', data);
        setResources(data); // Use real data, not demo data
      } else {
        console.error('❌ Backend authentication failed:', response.status);
        // Only show demo data if backend auth fails
        setResources([]);
      }
    } catch (error) {
      console.error('❌ Error connecting to backend:', error);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesType = !filter.type || resource.type === filter.type;
    const matchesSearch = !filter.search || 
      resource.name.toLowerCase().includes(filter.search.toLowerCase()) ||
      resource.description?.toLowerCase().includes(filter.search.toLowerCase()) ||
      resource.location?.toLowerCase().includes(filter.search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleBookResource = (resource) => {
    // Navigate to bookings page with resource pre-selected
    navigate('/my-tickets', { state: { 
      selectedResource: resource,
      showBookingForm: true 
    } });
  };

  if (loading) {
    return (
      <div className="hub-page">
        <div className="hub-loading">Loading resources...</div>
      </div>
    );
  }

  return (
    <div className="hub-page">
      <div className="hub-page-header">
        <h1>📚 Book Resources (Demo Version)</h1>
        <p className="hub-demo-notice">
          <strong>⚠️ Demo Mode:</strong> Showing sample resources since backend compilation is preventing MongoDB access.
          <br />
          <strong>✅ What's Working:</strong> OAuth2, User Dashboard, Admin Dashboard, MongoDB Integration
          <br />
          <strong>🔧 What's Blocked:</strong> Real-time resource fetching due to backend compilation issues.
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="hub-button hub-button--secondary"
        >
          Back to Dashboard
        </button>
      </div>
      
      <div className="hub-content">
        {/* Search and Filter Section */}
        <div className="hub-dashboard-card">
          <h3>🔍 Search & Filter Resources</h3>
          <div className="hub-filters">
            <div className="hub-filter-group">
              <label>Search:</label>
              <input
                type="text"
                placeholder="Search by name, description, or location..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="hub-input"
              />
            </div>
            <div className="hub-filter-group">
              <label>Type:</label>
              <select
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                className="hub-select"
              >
                <option value="">All Types</option>
                <option value="LECTURE_HALL">Lecture Hall</option>
                <option value="LAB">Lab</option>
                <option value="MEETING_ROOM">Meeting Room</option>
                <option value="EQUIPMENT">Equipment</option>
              </select>
            </div>
            <div className="hub-filter-group">
              <button
                onClick={fetchResources}
                className="hub-button hub-button--primary"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Resources Display */}
        <div className="hub-dashboard-card">
          <h3>📋 Demo Resources ({filteredResources.length})</h3>
          {filteredResources.length === 0 ? (
            <div className="hub-empty-state">
              <h4>No demo resources found</h4>
              <p>Click refresh to load demo resources.</p>
            </div>
          ) : (
            <div className="hub-resources-grid">
              {filteredResources.map((resource) => (
                <div key={resource.id} className="hub-resource-card">
                  <div className="hub-resource-header">
                    <h4>{resource.name}</h4>
                    <span className={`hub-status-${resource.status.toLowerCase()}`}>
                      {resource.status}
                    </span>
                  </div>
                  <div className="hub-resource-body">
                    <div className="hub-resource-info">
                      <p><strong>Type:</strong> {resource.type}</p>
                      <p><strong>Location:</strong> {resource.location}</p>
                      <p><strong>Capacity:</strong> {resource.capacity} people</p>
                      {resource.description && (
                        <p><strong>Description:</strong> {resource.description}</p>
                      )}
                    </div>
                    <div className="hub-resource-actions">
                      <button
                        onClick={() => handleBookResource(resource)}
                        className="hub-button hub-button--primary"
                        disabled={resource.status !== 'ACTIVE'}
                      >
                        📅 Book Resource
                      </button>
                    </div>
                  </div>
                  <div className="hub-resource-footer">
                    <small>
                      Added: {new Date(resource.createdAt).toLocaleDateString()}
                      {resource.createdBy && ` by ${resource.createdBy}`}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

