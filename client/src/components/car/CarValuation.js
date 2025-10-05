// client/src/components/car/CarValuation.js
import React, { useState } from 'react';
import { Button } from "../common/Button";
import carService from "../../services/carService";

export const CarValuation = () => {
  const [loading, setLoading] = useState(false);
  const [valuation, setValuation] = useState(null);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    kmsDriven: 0,
    fuelType: 'Petrol',
    transmission: 'Manual',
    owners: 1
  });

  const brands = ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Honda', 'Toyota',
    'Kia', 'Renault', 'Nissan', 'Ford', 'Volkswagen', 'Skoda',
    'BMW', 'Mercedes-Benz', 'Audi', 'Jaguar', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await carService.getValuation(formData);
      setValuation(result.data);
    } catch (error) {
      console.error('Valuation error:', error);
      alert('Failed to get valuation');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="valuation-container">
      <h2>Get Instant Car Valuation</h2>
      <p className="valuation-subtitle">Find out how much your car is worth in the market</p>

      <form onSubmit={handleSubmit} className="valuation-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Brand *</label>
            <select
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              required
              className="form-select"
            >
              <option value="">Select Brand</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Model *</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              required
              className="form-input"
              placeholder="e.g., Swift"
            />
          </div>

          <div className="form-group">
            <label>Year *</label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
              required
              min="1990"
              max={new Date().getFullYear()}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Kilometers Driven *</label>
            <input
              type="number"
              // value={formData.kmsDriven ?? ''}
              // onChange={(e) => handleInputChange('kmsDriven', parseInt(e.target.value))}
              value={formData.kmsDriven ?? ''}   // show '' if undefined or NaN
              onChange={(e) => {
                const value = e.target.value;
                handleInputChange('kmsDriven', value === '' ? '' : parseInt(value));
              }}
              required
              min="0"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Fuel Type</label>
            <select
              value={formData.fuelType}
              onChange={(e) => handleInputChange('fuelType', e.target.value)}
              className="form-select"
            >
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="CNG">CNG</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div className="form-group">
            <label>Transmission</label>
            <select
              value={formData.transmission}
              onChange={(e) => handleInputChange('transmission', e.target.value)}
              className="form-select"
            >
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
              <option value="AMT">AMT</option>
              <option value="CVT">CVT</option>
            </select>
          </div>

          <div className="form-group">
            <label>Number of Owners</label>
            <select
              value={formData.owners}
              onChange={(e) => handleInputChange('owners', parseInt(e.target.value))}
              className="form-select"
            >
              <option value="1">1st Owner</option>
              <option value="2">2nd Owner</option>
              <option value="3">3rd Owner</option>
              <option value="4">4th Owner</option>
              <option value="5">5+ Owners</option>
            </select>
          </div>
        </div>

        <Button type="submit" variant="primary" size="large" loading={loading}>
          Get Valuation
        </Button>
      </form>

      {valuation && (
        <div className="valuation-result">
          <h3>Estimated Value</h3>
          <div className="estimated-price">
            {carService.formatPrice(valuation.estimatedPrice)}
          </div>
          <div className="price-range">
            Range: {carService.formatPrice(valuation.priceRange.min)} - {carService.formatPrice(valuation.priceRange.max)}
          </div>

          <div className="pricing-factors">
            <h4>Pricing Factors</h4>
            <div className="factors-grid">
              {Object.entries(valuation.factors).map(([key, value]) => (
                <div key={key} className="factor-item">
                  <span className="factor-label">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span className="factor-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarValuation;