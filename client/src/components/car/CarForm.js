// client/src/components/car/CarForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { carService } from '../../services/carService';
import { Button } from '../common/Button';

export const CarForm = ({ initialData = null, isEdit = false }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImages, setUploadedImages] = useState(initialData?.images || []);

  const [formData, setFormData] = useState({
    basicInfo: {
      brand: initialData?.basicInfo?.brand || '',
      model: initialData?.basicInfo?.model || '',
      variant: initialData?.basicInfo?.variant || '',
      year: initialData?.basicInfo?.year || new Date().getFullYear(),
      fuelType: initialData?.basicInfo?.fuelType || 'Petrol',
      transmission: initialData?.basicInfo?.transmission || 'Manual',
      kmsDriven: initialData?.basicInfo?.kmsDriven || 0,
      owners: initialData?.basicInfo?.owners || 1,
      color: initialData?.basicInfo?.color || ''
    },
    pricing: {
      askingPrice: initialData?.pricing?.askingPrice || 0,
      negotiable: initialData?.pricing?.negotiable ?? true
    },
    location: {
      city: initialData?.location?.city || '',
      state: initialData?.location?.state || '',
      pincode: initialData?.location?.pincode || '',
      address: initialData?.location?.address || ''
    },
    condition: {
      overall: initialData?.condition?.overall || 'Good',
      exterior: initialData?.condition?.exterior || 'Good',
      interior: initialData?.condition?.interior || 'Good',
      engine: initialData?.condition?.engine || 'Good',
      tyres: initialData?.condition?.tyres || 'Good'
    },
    description: initialData?.description || '',
    images: uploadedImages
  });

  const brands = ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Honda', 'Toyota',
    'Kia', 'Renault', 'Nissan', 'Ford', 'Volkswagen', 'Skoda',
    'BMW', 'Mercedes-Benz', 'Audi', 'Jaguar', 'Other'];

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (uploadedImages.length + files.length > 10) {
      setError('Maximum 10 images allowed');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await carService.uploadCarImages(files);
      const newImages = [...uploadedImages, ...result.data.images];
      setUploadedImages(newImages);
      setFormData(prev => ({ ...prev, images: newImages }));
    } catch (err) {
      setError('Failed to upload images');
    } finally {
      setLoading(false);
    }
  };

  const handleImageDelete = async (publicId, index) => {
    try {
      if (publicId) {
        await carService.deleteCarImage(publicId);
      }
      const newImages = uploadedImages.filter((_, i) => i !== index);
      setUploadedImages(newImages);
      setFormData(prev => ({ ...prev, images: newImages }));
    } catch (err) {
      setError('Failed to delete image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEdit) {
        await carService.updateCar(initialData._id, formData);
      } else {
        await carService.createCar(formData);
      }
      navigate('/my-listings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save car listing');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="car-form-container">
      <div className="form-progress">
        <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>1. Basic Info</div>
        <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>2. Pricing</div>
        <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>3. Images</div>
        <div className={`progress-step ${currentStep >= 4 ? 'active' : ''}`}>4. Details</div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="car-form">
        {currentStep === 1 && (
          <div className="form-step">
            <h2>Basic Information</h2>

            <div className="form-grid">
              <div className="form-group">
                <label>Brand *</label>
                <select
                  value={formData.basicInfo.brand}
                  onChange={(e) => handleInputChange('basicInfo', 'brand', e.target.value)}
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
                  value={formData.basicInfo.model}
                  onChange={(e) => handleInputChange('basicInfo', 'model', e.target.value)}
                  required
                  className="form-input"
                  placeholder="e.g., Swift, Creta"
                />
              </div>

              <div className="form-group">
                <label>Variant *</label>
                <input
                  type="text"
                  value={formData.basicInfo.variant}
                  onChange={(e) => handleInputChange('basicInfo', 'variant', e.target.value)}
                  required
                  className="form-input"
                  placeholder="e.g., VXi, SX"
                />
              </div>

              <div className="form-group">
                <label>Year *</label>
                <input
                  type="number"
                  value={formData.basicInfo.year}
                  onChange={(e) => handleInputChange('basicInfo', 'year', parseInt(e.target.value))}
                  required
                  min="1990"
                  max={new Date().getFullYear()}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Fuel Type *</label>
                <select
                  value={formData.basicInfo.fuelType}
                  onChange={(e) => handleInputChange('basicInfo', 'fuelType', e.target.value)}
                  required
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
                <label>Transmission *</label>
                <select
                  value={formData.basicInfo.transmission}
                  onChange={(e) => handleInputChange('basicInfo', 'transmission', e.target.value)}
                  required
                  className="form-select"
                >
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                  <option value="AMT">AMT</option>
                  <option value="CVT">CVT</option>
                </select>
              </div>

              <div className="form-group">
                <label>Kilometers Driven *</label>
                <input
                  type="number"
                  //value={formData.basicInfo.kmsDriven}
                  //onChange={(e) => handleInputChange('basicInfo', 'kmsDriven', parseInt(e.target.value))}
                  value={formData.basicInfo.kmsDriven ?? ''}   // show '' if undefined or NaN
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInputChange('basicInfo', 'kmsDriven', value === '' ? '' : parseInt(value));
                  }}
                  required
                  min="0"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Number of Owners *</label>
                <select
                  value={formData.basicInfo.owners}
                  onChange={(e) => handleInputChange('basicInfo', 'owners', parseInt(e.target.value))}
                  required
                  className="form-select"
                >
                  <option value="1">1st Owner</option>
                  <option value="2">2nd Owner</option>
                  <option value="3">3rd Owner</option>
                  <option value="4">4th Owner</option>
                  <option value="5">5+ Owners</option>
                </select>
              </div>

              <div className="form-group">
                <label>Color *</label>
                <input
                  type="text"
                  value={formData.basicInfo.color}
                  onChange={(e) => handleInputChange('basicInfo', 'color', e.target.value)}
                  required
                  className="form-input"
                  placeholder="e.g., White, Black"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="form-step">
            <h2>Pricing & Location</h2>

            <div className="form-grid">
              <div className="form-group full-width">
                <label>Asking Price (₹) *</label>
                <input
                  type="number"
                  //value={formData.pricing.askingPrice}
                  // onChange={(e) => handleInputChange('pricing', 'askingPrice', parseInt(e.target.value))}
                  value={formData.pricing.askingPrice ?? ''}  // fallback to empty string
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInputChange(
                      'pricing',
                      'askingPrice',
                      value === '' ? '' : parseInt(value)
                    );
                  }}
                  required
                  min="10000"
                  className="form-input"
                />
              </div>

              <div className="form-group full-width">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.pricing.negotiable}
                    onChange={(e) => handleInputChange('pricing', 'negotiable', e.target.checked)}
                  />
                  Price is negotiable
                </label>
              </div>

              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  value={formData.location.city}
                  onChange={(e) => handleInputChange('location', 'city', e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  value={formData.location.state}
                  onChange={(e) => handleInputChange('location', 'state', e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Pincode *</label>
                <input
                  type="text"
                  value={formData.location.pincode}
                  onChange={(e) => handleInputChange('location', 'pincode', e.target.value)}
                  required
                  pattern="[0-9]{6}"
                  className="form-input"
                />
              </div>

              <div className="form-group full-width">
                <label>Address</label>
                <textarea
                  value={formData.location.address}
                  onChange={(e) => handleInputChange('location', 'address', e.target.value)}
                  className="form-textarea"
                  rows="3"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="form-step">
            <h2>Upload Images</h2>
            <p className="form-help">Upload up to 10 images of your car</p>

            <div className="image-upload-section">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                id="image-upload"
                className="file-input"
                disabled={uploadedImages.length >= 10}
              />
              <label htmlFor="image-upload" className="upload-label">
                {uploadedImages.length < 10 ? '+ Add Images' : 'Maximum images reached'}
              </label>

              <div className="image-preview-grid">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={image.url} alt={`Car ${index + 1}`} />
                    <button
                      type="button"
                      className="delete-image-btn"
                      onClick={() => handleImageDelete(image.publicId, index)}
                    >
                      ×
                    </button>
                    {index === 0 && <span className="primary-badge">Primary</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="form-step">
            <h2>Condition & Description</h2>

            <div className="form-grid">
              <div className="form-group">
                <label>Overall Condition *</label>
                <select
                  value={formData.condition.overall}
                  onChange={(e) => handleInputChange('condition', 'overall', e.target.value)}
                  required
                  className="form-select"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div className="form-group">
                <label>Exterior Condition</label>
                <select
                  value={formData.condition.exterior}
                  onChange={(e) => handleInputChange('condition', 'exterior', e.target.value)}
                  className="form-select"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div className="form-group">
                <label>Interior Condition</label>
                <select
                  value={formData.condition.interior}
                  onChange={(e) => handleInputChange('condition', 'interior', e.target.value)}
                  className="form-select"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div className="form-group">
                <label>Engine Condition</label>
                <select
                  value={formData.condition.engine}
                  onChange={(e) => handleInputChange('condition', 'engine', e.target.value)}
                  className="form-select"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div className="form-group">
                <label>Tyres Condition</label>
                <select
                  value={formData.condition.tyres}
                  onChange={(e) => handleInputChange('condition', 'tyres', e.target.value)}
                  className="form-select"
                >
                  <option value="New">New</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Needs Replacement">Needs Replacement</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="form-textarea"
                  rows="6"
                  placeholder="Describe your car, any special features, service history, etc."
                  maxLength="2000"
                />
                <span className="char-count">{formData.description.length}/2000</span>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={prevStep}>
              Previous
            </Button>
          )}

          {currentStep < 4 ? (
            <Button type="button" variant="primary" onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button type="submit" variant="primary" loading={loading}>
              {isEdit ? 'Update Listing' : 'Create Listing'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CarForm;