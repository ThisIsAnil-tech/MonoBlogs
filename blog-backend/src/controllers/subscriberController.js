import Subscriber from '../models/Subscriber.js';
import { logger } from '../config/logger.js';

export const subscribe = async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({ message: 'Username and email are required' });
    }

    // Check if email already exists
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      if (!existingSubscriber.isActive) {
        existingSubscriber.isActive = true;
        existingSubscriber.username = username;
        await existingSubscriber.save();
        return res.status(200).json({ message: 'Subscription reactivated successfully' });
      }
      return res.status(400).json({ message: 'Email is already subscribed' });
    }

    const subscriber = new Subscriber({
      username,
      email
    });

    await subscriber.save();
    
    logger.info(`New subscriber added: ${email}`);
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    logger.error('Subscribe error:', error);
    res.status(500).json({ message: 'Server error during subscription' });
  }
};

export const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const subscriber = await Subscriber.findOne({ email });
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    subscriber.isActive = false;
    await subscriber.save();

    res.status(200).json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    logger.error('Unsubscribe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find({ isActive: true })
      .select('username email createdAt')
      .sort({ createdAt: -1 });
      
    res.status(200).json(subscribers);
  } catch (error) {
    logger.error('Get subscribers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
