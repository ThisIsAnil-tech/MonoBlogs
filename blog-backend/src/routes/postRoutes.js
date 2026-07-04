
import express from 'express';
import {
  getPosts,
  getPostBySlug,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getDomains,
  getTags,
  toggleLike,
  sharePost,
  getPostEngagement,
  notifySubscribers,
} from '../controllers/postController.js';
import { protect, editorOrAdmin } from '../middleware/auth.js';
import { validate, postValidation } from '../middleware/validation.js';
import { postLimiter, apiLimiter } from '../middleware/rateLimiter.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post(
  '/:id/notify-subscribers',
  protect,
  editorOrAdmin,
  notifySubscribers
);


router.get('/', apiLimiter, getPosts);
router.get('/domains', getDomains);
router.get('/tags', getTags);
router.get('/slug/:slug', getPostBySlug);
router.get('/:id', getPostById);
router.get('/:id/engagement', getPostEngagement);
router.post('/:id/share', sharePost);
router.post('/:id/like', apiLimiter, toggleLike);


router.post(
  '/',
  protect,
  editorOrAdmin,
  postLimiter,
  upload.array('images', 10),
  validate(postValidation),
  createPost
);

router.put(
  '/:id',
  protect,
  editorOrAdmin,
  upload.array('images', 10),
  validate(postValidation),
  updatePost
);

router.delete('/:id', protect, editorOrAdmin, deletePost);

export default router;