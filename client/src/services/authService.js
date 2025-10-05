// client/src/services/authService.js
import api from './api';

class AuthService {
  // Register new user
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }

  // Login user
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }

  // Logout user
  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  }

  // Get current user profile
  async getProfile() {
    const response = await api.get('/auth/me');
    return response.data;
  }

  // Update user profile
  async updateProfile(userData) {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  }

  // Verify email
  async verifyEmail(data) {
    const response = await api.post('/auth/verify-email', data);
    return response.data;
  }

  // Forgot password
  async forgotPassword(data) {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  }

  // Reset password
  async resetPassword(data) {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  }

  // Refresh token
  async refreshToken(data) {
    const response = await api.post('/auth/refresh', data);
    return response.data;
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // Get stored token
  getToken() {
    return localStorage.getItem('token');
  }

  // Get stored refresh token
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  // Set token in localStorage
  setToken(token) {
    localStorage.setItem('token', token);
  }

  // Set refresh token in localStorage
  setRefreshToken(refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }

  // Remove tokens from localStorage
  removeTokens() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
}

export const authService = new AuthService();
export default authService;