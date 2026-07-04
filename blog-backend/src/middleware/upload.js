// FILE: blog-backend/src/middleware/upload.js
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';

// ✅ FIX: Import CloudinaryStorage correctly for CommonJS module
import pkg from 'multer-storage-cloudinary';
const { CloudinaryStorage } = pkg;

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'personal_blog_posts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      { width: 1200, crop: 'limit', quality: 'auto:good' }
    ],
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

export default upload;