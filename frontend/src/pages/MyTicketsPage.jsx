import { useAuth } from "../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function MyTicketsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="hub-page">
      <div className="hub-page-header">
        <h1>My Tickets</h1>
        <button 
          onClick={() => navigate('/dashboard')}
          className="hub-button hub-button--secondary"
        >
          Back to Dashboard
        </button>
      </div>
      
      <div className="hub-content">
        <div className="hub-dashboard-card">
          <h3>Your Incident Tickets</h3>
          <p>Manage your incident tickets and track their status</p>
          
          <div className="hub-tickets-list">
            <div className="hub-empty-state">
              <h4>No tickets found</h4>
              <p>You haven't created any incident tickets yet.</p>
              <button className="hub-button hub-button--primary">
                Create New Ticket
              </button>
            </div>
          </div>
        </div>
        
        <div className="hub-dashboard-card">
          <h3>Ticket Statistics</h3>
          <div className="hub-stats">
            <div className="hub-stat">
              <span className="hub-stat-number">0</span>
              <span className="hub-stat-label">Total Tickets</span>
            </div>
            <div className="hub-stat">
              <span className="hub-stat-number">0</span>
              <span className="hub-stat-label">Open</span>
            </div>
            <div className="hub-stat">
              <span className="hub-stat-number">0</span>
              <span className="hub-stat-label">Resolved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
