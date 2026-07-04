
import api from './api';

const authService = {
  
  login: (password, email) => {
    return api.post('/auth/login', { password, email })
      .then(res => res.data);
  },

  
  getMe: () => {
    return api.get('/auth/me')
      .then(res => res.data);
  },

  
  updateProfile: (data) => {
    return api.put('/auth/profile', data)
      .then(res => res.data);
  },

  
  changePassword: (currentPassword, newPassword) => {
    return api.put('/auth/change-password', { currentPassword, newPassword })
      .then(res => res.data);
  },

  
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },

  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  
  getToken: () => {
    return localStorage.getItem('token');
  },

  
  setToken: (token) => {
    localStorage.setItem('token', token);
  },

  
  removeToken: () => {
    localStorage.removeItem('token');
  },
};

export default authService;