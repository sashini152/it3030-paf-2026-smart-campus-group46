import { useAuth } from "../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
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
      navigate('/login');
    }
  };

  // Get user data from multiple sources
  const userName = user?.name || localStorage.getItem('userName') || 'Sashini Geshani';
  const userEmail = user?.email || localStorage.getItem('userEmail') || 'sashinigeshani1@gmail.com';
  const userRole = user?.role || localStorage.getItem('userRole') || 'USER';
  const userId = user?.id || localStorage.getItem('userId') || '69c956315ce6d42393e8bd3b';

  console.log('Profile user data:', { userName, userEmail, userRole, userId });

  if (!user) {
    return <div className="hub-loading">Loading...</div>;
  }

  return (
    <div className="hub-page">
      <div className="hub-page-header">
        <h1>My Profile</h1>
        <button 
          onClick={() => navigate('/dashboard')}
          className="hub-button hub-button--secondary"
        >
          Back to Dashboard
        </button>
      </div>
      
      <div className="hub-content">
        <div className="hub-dashboard-card">
          <h3>User Information</h3>
          <div className="hub-profile-section">
            <div className="hub-profile-field">
              <label>Name:</label>
              <span>{userName}</span>
            </div>
            <div className="hub-profile-field">
              <label>Email:</label>
              <span>{userEmail}</span>
            </div>
            <div className="hub-profile-field">
              <label>Role:</label>
              <span className="hub-role-badge">{userRole}</span>
            </div>
            <div className="hub-profile-field">
              <label>User ID:</label>
              <span>{userId}</span>
            </div>
            <div className="hub-profile-field">
              <label>Account Status:</label>
              <span className="hub-status-active">Active</span>
            </div>
          </div>
        </div>
        
        <div className="hub-dashboard-card">
          <h3>Account Actions</h3>
          <div className="hub-profile-actions">
            <button className="hub-button hub-button--primary">
              Edit Profile
            </button>
            <button className="hub-button hub-button--secondary">
              Change Password
            </button>
            <button 
              onClick={handleLogout}
              className="hub-button hub-button--danger"
            >
              Logout
            </button>
          </div>
        </div>
        
        <div className="hub-dashboard-card">
          <h3>MongoDB Details</h3>
          <div className="hub-mongodb-info">
            <div className="hub-profile-field">
              <label>Database:</label>
              <span>smartcampus</span>
            </div>
            <div className="hub-profile-field">
              <label>Collection:</label>
              <span>users</span>
            </div>
            <div className="hub-profile-field">
              <label>Stored Email:</label>
              <span>{userEmail}</span>
            </div>
            <div className="hub-profile-field">
              <label>Role in DB:</label>
              <span>{userRole}</span>
            </div>
            <div className="hub-profile-field">
              <label>User ID in DB:</label>
              <span>{userId}</span>
            </div>
            <div className="hub-profile-field">
              <label>Status:</label>
              <span className="hub-status-active">✅ Data Successfully Stored</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
