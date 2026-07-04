import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logger } from '../config/logger.js';
import { config } from '../config/env.js';

export const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret);
      
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user || !req.user.isActive) {
        return res.status(401).json({ message: 'User not found or inactive' });
      }
      
      next();
    } catch (error) {
      logger.error(`Auth Error: ${error.message}`);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

export const editorOrAdmin = (req, res, next) => {
  if (req.user && ['admin', 'editor'].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ message: 'Editor or admin access required' });
  }
};