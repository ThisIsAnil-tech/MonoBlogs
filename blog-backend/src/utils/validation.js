
import { body, param, query } from 'express-validator';


export const validateId = param('id')
  .isMongoId()
  .withMessage('Invalid ID format');

export const validatePage = query('page')
  .optional()
  .isInt({ min: 1 })
  .withMessage('Page must be a positive integer')
  .toInt();

export const validateLimit = query('limit')
  .optional()
  .isInt({ min: 1, max: 100 })
  .withMessage('Limit must be between 1 and 100')
  .toInt();


export const validateUsername = (username) => {
  return username && username.length >= 3 && username.length <= 30;
};

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};


export const validateCaption = (caption) => {
  return caption.length <= 2200;
};

export const validateDomain = (domain) => {
  return domain.length <= 100;
};

export const validateTags = (tags) => {
  if (!tags) return true;
  const tagsArray = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
  return tagsArray.every(tag => tag.length > 0 && tag.length <= 30);
};


export const validateComment = (comment) => {
  return comment && comment.length >= 1 && comment.length <= 1000;
};


export const postValidationRules = () => [
  body('caption')
    .optional()
    .isString()
    .isLength({ max: 2200 })
    .withMessage('Caption must be less than 2200 characters'),
  body('domain')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Domain must be less than 100 characters'),
  body('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a string'),
  body('scheduledFor')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
];

export const commentValidationRules = () => [
  body('content')
    .isString()
    .notEmpty()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
];

export const loginValidationRules = () => [
  body('password')
    .isString()
    .notEmpty()
    .withMessage('Password is required'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
];


export const isValidMongoId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

export const isValidImageType = (mimetype) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  return allowedTypes.includes(mimetype);
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/[<>]/g, '') 
    .replace(/\s+/g, ' '); 
};

export const sanitizeSlug = (slug) => {
  if (!slug) return '';
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};


export const containsProfanity = (text, profanityList = []) => {
  if (!text || profanityList.length === 0) return false;
  const lowerText = text.toLowerCase();
  return profanityList.some(word => lowerText.includes(word.toLowerCase()));
};