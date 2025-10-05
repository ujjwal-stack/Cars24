import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import carService from "../services/carService";
import Loader from "../components/common/Loader";

export const CarDetails = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      const result = await carService.getCarById(id);
      setCar(result.data.car);
      setIsFavorite(result.data.car.favorites?.some(f => f.userId === user?._id) || false);
    } catch (error) {
      console.error('Failed to fetch car details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await carService.removeFromFavorites(id);
      } else {
        await carService.addToFavorites(id);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Favorite toggle error:', error);
    }
  };

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Open chat or contact modal
    alert('Contact feature will be implemented in Phase 3');
  };

  if (loading) return <Loader text="Loading car details..." />;
  if (!car) return <div className="container"><p>Car not found</p></div>;

  return (
    <div className="car-details-page">
      <div className="container">
        <div className="car-details-content">
          {/* Image Gallery */}
          <div className="car-gallery">
            <div className="main-image">
              <img 
                src={car.images[selectedImage]?.url || '/placeholder-car.jpg'} 
                alt={`${car.basicInfo.brand} ${car.basicInfo.model}`}
              />
            </div>
            <div className="thumbnail-strip">
              {car.images.map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={`View ${index + 1}`}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          </div>

          {/* Car Info */}
          <div className="car-info-section">
            <div className="car-header">
              <div>
                <h1>{car.basicInfo.brand} {car.basicInfo.model}</h1>
                <p className="car-variant">{car.basicInfo.variant}</p>
              </div>
              <button 
                className={`favorite-icon-btn ${isFavorite ? 'active' : ''}`}
                onClick={handleFavoriteToggle}
              >
                {isFavorite ? '❤️' : '🤍'}
              </button>
            </div>

            <div className="car-price-section">
              <div className="price-main">
                {carService.formatPrice(car.pricing.askingPrice)}
              </div>
              {car.pricing.negotiable && (
                <span className="negotiable-badge">Negotiable</span>
              )}
              {car.pricing.estimatedPrice && (
                <div className="estimated-price">
                  Market Value: {carService.formatPrice(car.pricing.estimatedPrice)}
                </div>
              )}
            </div>

            <div className="car-highlights">
              <div className="highlight-item">
                <span className="highlight-icon">📅</span>
                <div>
                  <div className="highlight-label">Year</div>
                  <div className="highlight-value">{car.basicInfo.year}</div>
                </div>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">🚗</span>
                <div>
                  <div className="highlight-label">KMs Driven</div>
                  <div className="highlight-value">{carService.formatKilometers(car.basicInfo.kmsDriven)}</div>
                </div>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">⛽</span>
                <div>
                  <div className="highlight-label">Fuel</div>
                  <div className="highlight-value">{car.basicInfo.fuelType}</div>
                </div>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">⚙️</span>
                <div>
                  <div className="highlight-label">Transmission</div>
                  <div className="highlight-value">{car.basicInfo.transmission}</div>
                </div>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">👥</span>
                <div>
                  <div className="highlight-label">Owners</div>
                  <div className="highlight-value">{car.basicInfo.owners}</div>
                </div>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">🎨</span>
                <div>
                  <div className="highlight-label">Color</div>
                  <div className="highlight-value">{car.basicInfo.color}</div>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn btn-primary btn-large" onClick={handleContactSeller}>
                Contact Seller
              </button>
              <button className="btn btn-secondary btn-large">
                Schedule Test Drive
              </button>
            </div>

            {/* Seller Info */}
            <div className="seller-info">
              <h3>Seller Information</h3>
              <div className="seller-details">
                <div className="seller-name">{car.seller?.name || 'Private Seller'}</div>
                <div className="seller-location">
                  📍 {car.location.city}, {car.location.state}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Specifications */}
        <div className="car-specifications">
          <h2>Specifications</h2>
          <div className="specs-grid">
            <div className="spec-item">
              <span className="spec-label">Brand</span>
              <span className="spec-value">{car.basicInfo.brand}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Model</span>
              <span className="spec-value">{car.basicInfo.model}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Variant</span>
              <span className="spec-value">{car.basicInfo.variant}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Year</span>
              <span className="spec-value">{car.basicInfo.year}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Fuel Type</span>
              <span className="spec-value">{car.basicInfo.fuelType}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Transmission</span>
              <span className="spec-value">{car.basicInfo.transmission}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Kilometers Driven</span>
              <span className="spec-value">{carService.formatKilometers(car.basicInfo.kmsDriven)}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Owners</span>
              <span className="spec-value">{car.basicInfo.owners}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Color</span>
              <span className="spec-value">{car.basicInfo.color}</span>
            </div>
          </div>
        </div>

        {/* Condition */}
        <div className="car-condition">
          <h2>Condition</h2>
          <div className="condition-grid">
            <div className="condition-item">
              <span className="condition-label">Overall</span>
              <span className={`condition-badge ${car.condition.overall.toLowerCase()}`}>
                {car.condition.overall}
              </span>
            </div>
            <div className="condition-item">
              <span className="condition-label">Exterior</span>
              <span className={`condition-badge ${car.condition.exterior?.toLowerCase()}`}>
                {car.condition.exterior || 'N/A'}
              </span>
            </div>
            <div className="condition-item">
              <span className="condition-label">Interior</span>
              <span className={`condition-badge ${car.condition.interior?.toLowerCase()}`}>
                {car.condition.interior || 'N/A'}
              </span>
            </div>
            <div className="condition-item">
              <span className="condition-label">Engine</span>
              <span className={`condition-badge ${car.condition.engine?.toLowerCase()}`}>
                {car.condition.engine || 'N/A'}
              </span>
            </div>
            <div className="condition-item">
              <span className="condition-label">Tyres</span>
              <span className={`condition-badge ${car.condition.tyres?.toLowerCase().replace(/\s/g, '-')}`}>
                {car.condition.tyres || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {car.description && (
          <div className="car-description">
            <h2>Description</h2>
            <p>{car.description}</p>
          </div>
        )}

        {/* Location */}
        <div className="car-location-section">
          <h2>Location</h2>
          <div className="location-details">
            <p>{car.location.address}</p>
            <p>{car.location.city}, {car.location.state} - {car.location.pincode}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;