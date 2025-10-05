import React, {useState, useEffect} from "react";
import { useAuth } from '../hooks/useAuth';
import { Button } from "../components/common/Button";

export const Profile = () => {
  const { user, updateProfile, error, clearError } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    profile: {
      location: {
        city: user?.profile?.location?.city || '',
        state: user?.profile?.location?.state || '',
        pincode: user?.profile?.location?.pincode || ''
      }
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        profile: {
          location: {
            city: user.profile?.location?.city || '',
            state: user.profile?.location?.state || '',
            pincode: user.profile?.location?.pincode || ''
          }
        }
      });
    }
  }, [user]);

  /* useEffect(() => {
    return () => clearError();
  }, [clearError]); */
  useEffect(() => {
    clearError();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child, grandchild] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: grandchild ? {
            ...prev[parent][child],
            [grandchild]: value
          } : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await updateProfile(formData);
    
    if (result.success) {
      setIsEditing(false);
    }
    
    setIsLoading(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      profile: {
        location: {
          city: user?.profile?.location?.city || '',
          state: user?.profile?.location?.state || '',
          pincode: user?.profile?.location?.pincode || ''
        }
      }
    });
    clearError();
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p className="profile-subtitle">Manage your account information</p>
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-info">
              <div className="profile-avatar">
                <div className="avatar-placeholder">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </div>
              <div className="profile-details">
                <h2>{user?.name}</h2>
                <p>{user?.email}</p>
                <span className={`role-badge ${user?.role}`}>
                  {user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1)}
                </span>
              </div>
              {!isEditing && (
                <button 
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="profile.location.city"
                    value={formData.profile.location.city}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <input
                    type="text"
                    id="state"
                    name="profile.location.state"
                    value={formData.profile.location.state}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="pincode">Pincode</label>
                  <input
                    type="text"
                    id="pincode"
                    name="profile.location.pincode"
                    value={formData.profile.location.pincode}
                    onChange={handleChange}
                    className="form-input"
                    pattern="[0-9]{6}"
                  />
                </div>

                <div className="form-actions">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isLoading}
                  >
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="profile-display">
                <div className="profile-section">
                  <h3>Contact Information</h3>
                  <div className="profile-field">
                    <span className="field-label">Phone:</span>
                    <span className="field-value">{user?.phone}</span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">Email Verified:</span>
                    <span className={`verification-status ${user?.emailVerified ? 'verified' : 'pending'}`}>
                      {user?.emailVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="profile-section">
                  <h3>Location</h3>
                  <div className="profile-field">
                    <span className="field-label">City:</span>
                    <span className="field-value">
                      {user?.profile?.location?.city || 'Not provided'}
                    </span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">State:</span>
                    <span className="field-value">
                      {user?.profile?.location?.state || 'Not provided'}
                    </span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">Pincode:</span>
                    <span className="field-value">
                      {user?.profile?.location?.pincode || 'Not provided'}
                    </span>
                  </div>
                </div>

                <div className="profile-section">
                  <h3>Account Status</h3>
                  <div className="profile-field">
                    <span className="field-label">KYC Status:</span>
                    <span className={`kyc-status ${user?.profile?.kycStatus || 'pending'}`}>
                      {user?.profile?.kycStatus?.charAt(0)?.toUpperCase() + user?.profile?.kycStatus?.slice(1) || 'Pending'}
                    </span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">Member Since:</span>
                    <span className="field-value">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;