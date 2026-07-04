import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';

export const login = async (req, res) => {
  try {
    const { password, email } = req.body;
    
    // Find user by email or create admin if first login
    let user = await User.findOne({ email: email || config.adminEmail });
    
    if (!user) {
      // First time setup - create admin user
      user = new User({
        username: 'ThisIsAnil-Tech',
        email: config.adminEmail,
        password: config.adminPassword,
        role: 'admin',
      });
      await user.save();
    }

    // Check password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    logger.error(`Get user error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, bio, profileImage } = req.body;
    const user = await User.findById(req.user._id);
    
    if (username) user.username = username;
    if (bio) user.bio = bio;
    if (profileImage) user.profileImage = profileImage;
    
    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    logger.error(`Update profile error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error(`Change password error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};