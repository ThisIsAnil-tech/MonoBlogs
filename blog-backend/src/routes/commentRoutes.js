import express from 'express';
import {
  getComments,
  createComment,
  deleteComment,
  toggleCommentLike,
} from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';
import { validate, commentValidation } from '../middleware/validation.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router({ mergeParams: true });

router.get('/', apiLimiter, getComments);
router.post('/', apiLimiter, validate(commentValidation), createComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', apiLimiter, toggleCommentLike);

export default router;