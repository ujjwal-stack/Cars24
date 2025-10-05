
// client/src/pages/MyListings.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import carService from '../services/carService';
import Loader from '../components/common/Loader';

export const MyListings = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMyListings();
  }, [filter]);

  const fetchMyListings = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const result = await carService.getMyListings(params);
      setCars(result.data.cars);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      await carService.deleteCar(carId);
      fetchMyListings();
    } catch (error) {
      console.error('Failed to delete car:', error);
      alert('Failed to delete listing');
    }
  };

  return (
    <div className="my-listings-page">
      <div className="container">
        <div className="page-header">
          <h1>My Listings</h1>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/sell-car')}
          >
            + Add New Listing
          </button>
        </div>

        <div className="listings-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button 
            className={`filter-btn ${filter === 'sold' ? 'active' : ''}`}
            onClick={() => setFilter('sold')}
          >
            Sold
          </button>
          <button 
            className={`filter-btn ${filter === 'draft' ? 'active' : ''}`}
            onClick={() => setFilter('draft')}
          >
            Draft
          </button>
        </div>

        {loading ? (
          <Loader text="Loading your listings..." />
        ) : cars.length === 0 ? (
          <div className="no-listings">
            <h3>No listings yet</h3>
            <p>Start by listing your first car</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/sell-car')}
            >
              List Your Car
            </button>
          </div>
        ) : (
          <div className="listings-grid">
            {cars.map(car => (
              <div key={car._id} className="listing-card">
                <img 
                  src={car.images?.[0]?.url || '/placeholder-car.jpg'} 
                  alt={`${car.basicInfo.brand} ${car.basicInfo.model}`}
                  className="listing-image"
                />
                <div className="listing-content">
                  <h3>{car.basicInfo.brand} {car.basicInfo.model}</h3>
                  <p className="listing-variant">{car.basicInfo.variant}</p>
                  <div className="listing-price">
                    {carService.formatPrice(car.pricing.askingPrice)}
                  </div>
                  <div className="listing-stats">
                    <span>👁 {car.views || 0} views</span>
                    <span>❤️ {car.favorites?.length || 0} favorites</span>
                  </div>
                  <div className="listing-status">
                    <span className={`status-badge ${car.status}`}>
                      {car.status}
                    </span>
                  </div>
                  <div className="listing-actions">
                    <button 
                      className="btn btn-secondary btn-small"
                      onClick={() => navigate(`/cars/${car._id}`)}
                    >
                      View
                    </button>
                    <button 
                      className="btn btn-outline btn-small"
                      onClick={() => navigate(`/edit-car/${car._id}`)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-outline btn-small delete-btn"
                      onClick={() => handleDelete(car._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;