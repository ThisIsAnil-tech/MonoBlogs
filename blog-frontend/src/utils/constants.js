export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'MonoBlog';

export const POST_LIMITS = {
  MAX_CAPTION_LENGTH: 2200,
  MAX_DOMAIN_LENGTH: 100,
  MAX_TAGS: 10,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  CREATE: '/create',
  EDIT: '/edit/:id',
  POST: '/post/:slug',
  ADMIN: '/admin',
};

export const STORAGE_KEYS = {
  TOKEN: 'token',
  THEME: 'theme',
};

export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
};