// client/src/pages/Wishlist.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import carService from '../services/carService';
import CarCard from '../components/car/CarCard';
import Loader from '../components/common/Loader';

export const Wishlist = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const result = await carService.getFavorites();
      setFavorites(result.data.cars);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (carId) => {
    try {
      await carService.removeFromFavorites(carId);
      fetchFavorites();
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  return (
    <div className="wishlist-page">
      <div className="container">
        <div className="page-header">
          <h1>My Wishlist</h1>
          <p>Your saved cars</p>
        </div>

        {loading ? (
          <Loader text="Loading your wishlist..." />
        ) : favorites.length === 0 ? (
          <div className="no-favorites">
            <h3>No favorites yet</h3>
            <p>Start browsing and save cars you like</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/buy-cars')}
            >
              Browse Cars
            </button>
          </div>
        ) : (
          <div className="cars-grid">
            {favorites.map(car => (
              <div key={car._id} className="wishlist-card">
                <CarCard car={car} onFavoriteChange={fetchFavorites} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;