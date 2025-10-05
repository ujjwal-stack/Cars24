// client/src/components/car/CarCard.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { carService } from '../../services/carService';
import { useAuth } from '../../hooks/useAuth';

const CarCard = ({ car, onFavoriteChange }) => {
  const { isAuthenticated, user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(
    car.favorites?.some(f => f.userId === user?._id) || false
  );
  const [loading, setLoading] = useState(false);

  const handleFavoriteToggle = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to add favorites');
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await carService.removeFromFavorites(car._id);
      } else {
        await carService.addToFavorites(car._id);
      }
      setIsFavorite(!isFavorite);
      if (onFavoriteChange) onFavoriteChange();
    } catch (error) {
      console.error('Favorite toggle error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="car-card">
      <Link to={`/cars/${car._id}`} className="car-card-link">
        <div className="car-image-container">
          <img 
            src={car.images?.[0]?.url || car.primaryImage || '/placeholder-car.jpg'} 
            alt={`${car.basicInfo.brand} ${car.basicInfo.model}`}
            className="car-image"
          />
          {car.isVerified && (
            <span className="verified-badge">✓ Verified</span>
          )}
        </div>
        
        <div className="car-card-content">
          <h3 className="car-title">
            {car.basicInfo.brand} {car.basicInfo.model}
          </h3>
          <p className="car-variant">{car.basicInfo.variant}</p>
          
          <div className="car-details">
            <span className="detail-item">
              <span className="detail-icon">📅</span>
              {car.basicInfo.year}
            </span>
            <span className="detail-item">
              <span className="detail-icon">⛽</span>
              {car.basicInfo.fuelType}
            </span>
            <span className="detail-item">
              <span className="detail-icon">🚗</span>
              {car.basicInfo.kmsDriven.toLocaleString()} km
            </span>
            <span className="detail-item">
              <span className="detail-icon">⚙️</span>
              {car.basicInfo.transmission}
            </span>
          </div>

          <div className="car-location">
            <span className="location-icon">📍</span>
            {car.location.city}, {car.location.state}
          </div>

          <div className="car-footer">
            <div className="car-price">
              {carService.formatPrice(car.pricing.askingPrice)}
            </div>
            <button 
              className={`favorite-btn ${isFavorite ? 'active' : ''}`}
              onClick={handleFavoriteToggle}
              disabled={loading}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CarCard;