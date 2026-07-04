import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import { logger } from '../config/logger.js';
import cacheService from '../services/cacheService.js';

export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const cacheKey = `comments:${postId}:${page}:${limit}`;
    
    const comments = await cacheService.getOrSet(cacheKey, async () => {
      const [items, total] = await Promise.all([
        Comment.find({ postId, isApproved: true, parentId: null })
          .populate('author', 'username profileImage')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Comment.countDocuments({ postId, isApproved: true, parentId: null }),
      ]);
      
      // Get replies for each comment
      const commentsWithReplies = await Promise.all(items.map(async (comment) => {
        const replies = await Comment.find({ 
          parentId: comment._id, 
          isApproved: true 
        })
        .populate('author', 'username profileImage')
        .sort({ createdAt: 1 });
        
        return {
          ...comment.toObject(),
          replies,
        };
      }));
      
      return { items: commentsWithReplies, total };
    }, 60);
    
    res.json({
      comments: comments.items,
      total: comments.total,
      page: parseInt(page),
      totalPages: Math.ceil(comments.total / parseInt(limit)),
    });
  } catch (error) {
    logger.error(`Get comments error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentId, authorName } = req.body;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if authenticated, otherwise create anonymous comment
    const author = req.user ? req.user._id : null;
    const finalAuthorName = req.user ? req.user.username : (authorName || 'Guest');
    
    const comment = new Comment({
      postId,
      author,
      authorName: finalAuthorName,
      content,
      parentId: parentId || null,
    });
    
    await comment.save();
    cacheService.flush();
    
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username profileImage');
    
    res.status(201).json(populatedComment);
  } catch (error) {
    logger.error(`Create comment error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is author or admin
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    await comment.deleteOne();
    cacheService.flush();
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    logger.error(`Delete comment error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

export const toggleCommentLike = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Get client IP address
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    // Use an anonymousId from body if provided, otherwise fallback to IP
    const trackingId = req.body.anonymousId || clientIp;
    
    const likeIndex = comment.likes.indexOf(trackingId);
    
    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push(trackingId);
    }
    
    await comment.save();
    res.json({ likes: comment.likes.length, isLiked: likeIndex === -1 });
  } catch (error) {
    logger.error(`Toggle comment like error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};