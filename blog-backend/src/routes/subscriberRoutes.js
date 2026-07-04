import express from 'express';
import rateLimit from 'express-rate-limit';
import { subscribe, unsubscribe, getSubscribers } from '../controllers/subscriberController.js';
import { protect, editorOrAdmin } from '../middleware/auth.js';

const router = express.Router();


const subscribeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 3, 
  message: { message: 'Too many subscription attempts from this IP, please try again after an hour' },
  standardHeaders: true, 
  legacyHeaders: false,
});

router.post('/subscribe', subscribeLimiter, subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/', protect, editorOrAdmin, getSubscribers);

export default router;
