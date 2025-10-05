// client/src/services/carService.js
import api from './api';

class CarService {
  // Get all cars with filters
  async getCars(filters = {}) {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    const response = await api.get(`/cars?${params.toString()}`);
    return response.data;
  }

  // Get single car by ID
  async getCarById(id) {
    const response = await api.get(`/cars/${id}`);
    return response.data;
  }

  // Create new car listing
  async createCar(carData) {
    const response = await api.post('/cars', carData);
    return response.data;
  }

  // Update car listing
  async updateCar(id, carData) {
    const response = await api.put(`/cars/${id}`, carData);
    return response.data;
  }

  // Delete car listing
  async deleteCar(id) {
    const response = await api.delete(`/cars/${id}`);
    return response.data;
  }

  // Get my listings
  async getMyListings(params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/cars/my-listings?${queryParams.toString()}`);
    return response.data;
  }

  // Get favorites
  async getFavorites() {
    const response = await api.get('/cars/user/favorites');
    return response.data;
  }

  // Add to favorites
  async addToFavorites(carId) {
    const response = await api.post(`/cars/${carId}/favorite`);
    return response.data;
  }

  // Remove from favorites
  async removeFromFavorites(carId) {
    const response = await api.delete(`/cars/${carId}/favorite`);
    return response.data;
  }

  // Get car valuation
  async getValuation(carInfo) {
    const response = await api.post('/cars/valuation', carInfo);
    return response.data;
  }

  // Get filter options
  async getFilterOptions() {
    const response = await api.get('/cars/filters');
    return response.data;
  }

  // Upload car images
  async uploadCarImages(files) {
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    const response = await api.post('/uploads/car-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  }

  // Delete car image
  async deleteCarImage(publicId) {
    const response = await api.delete(`/uploads/car-images/${publicId}`);
    return response.data;
  }

  // Format price for display
  formatPrice(price) {
    if (!price) return '₹0';
    return `₹${price.toLocaleString('en-IN')}`;
  }

  // Format kilometers for display
  formatKilometers(kms) {
    if (!kms) return '0 km';
    return `${kms.toLocaleString('en-IN')} km`;
  }

  // Get car age
  getCarAge(year) {
    const currentYear = new Date().getFullYear();
    return currentYear - year;
  }

  // Calculate estimated EMI
  calculateEMI(principal, ratePerAnnum, tenureMonths) {
    const monthlyRate = ratePerAnnum / (12 * 100);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    return Math.round(emi);
  }
}

export const carService = new CarService();
export default carService;