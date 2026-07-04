// FILE: blog-frontend/src/services/authService.js
import api from './api';

const authService = {
  // Login user
  login: (password, email) => {
    return api.post('/auth/login', { password, email })
      .then(res => res.data);
  },

  // Get current user profile
  getMe: () => {
    return api.get('/auth/me')
      .then(res => res.data);
  },

  // Update user profile
  updateProfile: (data) => {
    return api.put('/auth/profile', data)
      .then(res => res.data);
  },

  // Change password
  changePassword: (currentPassword, newPassword) => {
    return api.put('/auth/change-password', { currentPassword, newPassword })
      .then(res => res.data);
  },

  // Logout (client-side only)
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Set token
  setToken: (token) => {
    localStorage.setItem('token', token);
  },

  // Remove token
  removeToken: () => {
    localStorage.removeItem('token');
  },
};

export default authService;