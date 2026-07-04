import express from 'express';
import rateLimit from 'express-rate-limit';
import { subscribe, unsubscribe, getSubscribers } from '../controllers/subscriberController.js';
import { protect, editorOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Strict rate limiting for subscription to prevent DDoS and spam
const subscribeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 subscribe requests per `window` (here, per hour)
  message: { message: 'Too many subscription attempts from this IP, please try again after an hour' },
  standardHeaders: true, 
  legacyHeaders: false,
});

router.post('/subscribe', subscribeLimiter, subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/', protect, editorOrAdmin, getSubscribers);

export default router;
