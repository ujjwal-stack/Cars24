import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name}!</h1>
          <p className="dashboard-subtitle">
            Manage your cars, track your listings, and explore new opportunities.
          </p>
        </div>

        <div className="dashboard-grid">
          {/* Quick Actions */}
          <div className="dashboard-card">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              <Link to="/sell-car" className="action-card">
                <div className="action-icon">🚗</div>
                <h3>Sell Your Car</h3>
                <p>Get instant valuation</p>
              </Link>
              <Link to="/buy-cars" className="action-card">
                <div className="action-icon">🔍</div>
                <h3>Browse Cars</h3>
                <p>Find your perfect car</p>
              </Link>
              <Link to="/profile" className="action-card">
                <div className="action-icon">👤</div>
                <h3>Update Profile</h3>
                <p>Manage your account</p>
              </Link>
            </div>
          </div>

          {/* User Stats */}
          <div className="dashboard-card">
            <h2>Your Activity</h2>
            <div className="user-stats">
              <div className="stat-card">
                <h3>0</h3>
                <p>Cars Listed</p>
              </div>
              <div className="stat-card">
                <h3>0</h3>
                <p>Cars Sold</p>
              </div>
              <div className="stat-card">
                <h3>0</h3>
                <p>Favorites</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card full-width">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              <div className="activity-item empty">
                <p>No recent activity. Start by listing your first car!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;