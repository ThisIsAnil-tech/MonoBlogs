// FILE: blog-backend/src/controllers/postController.js
import Post from '../models/Post.js';
import { logger } from '../config/logger.js';
import cacheService from '../services/cacheService.js';
import { Resend } from 'resend';
import Subscriber from '../models/Subscriber.js';

export const notifySubscribers = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey || resendApiKey === 'your_resend_api_key_here') {
      return res.status(500).json({ message: 'Resend API key is not configured' });
    }

    const resend = new Resend(resendApiKey);
    const subscribers = await Subscriber.find({ isActive: true });

    if (subscribers.length === 0) {
      return res.status(200).json({ message: 'No active subscribers to notify' });
    }

    const postUrl = `${process.env.FRONTEND_URL || 'http://localhost:3400'}/post/${post.slug || post._id}`;
    const subject = `New Post: ${post.caption ? post.caption.substring(0, 50) + '...' : 'Check out my new post!'}`;
    
    const emails = subscribers.map(sub => ({
      from: 'MonoBlog <onboarding@resend.dev>',
      to: sub.email,
      subject: subject,
      html: `
        <h2>Hi ${sub.username},</h2>
        <p>I just published a new post on MonoBlog.</p>
        <p><strong>Caption:</strong> ${post.caption || 'New post'}</p>
        <br/>
        <a href="${postUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Read the Post</a>
        <br/><br/>
        <p>Thanks for subscribing!</p>
      `
    }));

    await resend.batch.send(emails);

    post.isNotificationSent = true;
    post.notificationsSentCount = subscribers.length;
    await post.save();

    res.status(200).json({ 
      message: `Successfully notified ${subscribers.length} subscribers`,
      notificationsSentCount: subscribers.length
    });
  } catch (error) {
    logger.error('Failed to notify subscribers: ' + error.message);
    res.status(500).json({ message: 'Failed to send emails' });
  }
};

export const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, domain, tag, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const filter = { isPublished: true };
    
    if (domain && domain !== 'all') {
      filter.domain = domain;
    }
    
    if (tag) {
      filter.tags = tag;
    }
    
    if (search) {
      filter.caption = { $regex: search, $options: 'i' };
    }
    
    const cacheKey = `posts:${JSON.stringify({ ...filter, page, limit })}`;
    
    const posts = await cacheService.getOrSet(cacheKey, async () => {
      const [items, total] = await Promise.all([
        Post.find(filter)
          .populate('author', 'username profileImage')
          .select('imageUrl images music caption domain createdAt likes shares commentCount views tags slug')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Post.countDocuments(filter),
      ]);
      
      // Add engagement data
      const enrichedItems = items.map(post => ({
        ...post.toObject(),
        engagement: {
          likes: post.likes?.length || 0,
          shares: post.shares?.length || 0,
          comments: post.commentCount || 0,
          views: post.views?.length || 0,
        }
      }));
      
      return { items: enrichedItems, total };
    }, 60);
    
    res.json({
      posts: posts.items,
      total: posts.total,
      page: parseInt(page),
      totalPages: Math.ceil(posts.total / parseInt(limit)),
    });
  } catch (error) {
    logger.error(`Get posts error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const post = await Post.findOne({ slug, isPublished: true })
      .populate('author', 'username profileImage');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const trackingId = req.query.anonymousId || clientIp;
    
    if (!post.views.includes(trackingId)) {
      post.views.push(trackingId);
      await post.save();
    }
    
    const postObj = post.toObject();
    postObj.viewsCount = post.views.length;
    postObj.sharesCount = post.shares?.length || 0;
    
    res.json(postObj);
  } catch (error) {
    logger.error(`Get post error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findById(id)
      .populate('author', 'username profileImage');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const postObj = post.toObject();
    postObj.viewsCount = post.views.length;
    postObj.sharesCount = post.shares?.length || 0;
    
    res.json(postObj);
  } catch (error) {
    logger.error(`Get post by ID error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createPost = async (req, res) => {
  try {
    if ((!req.files || req.files.length === 0) && !req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    
    const { caption, domain, tags, scheduledFor, music } = req.body;
    
    let parsedMusic = null;
    if (music) {
      try {
        parsedMusic = typeof music === 'string' ? JSON.parse(music) : music;
      } catch (e) {
        logger.warn('Failed to parse music data', e);
      }
    }
    
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push({ url: file.path, publicId: file.filename });
      });
    } else if (req.file) {
      images.push({ url: req.file.path, publicId: req.file.filename });
    }
    
    const post = new Post({
      images,
      imageUrl: images[0]?.url,
      imagePublicId: images[0]?.publicId,
      music: parsedMusic,
      caption: caption || '',
      domain: domain || '',
      author: req.user._id,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      scheduledFor: scheduledFor || null,
      isPublished: !scheduledFor,
    });
    
    const createdPost = await post.save();
    cacheService.flush();
    
    res.status(201).json(createdPost);
  } catch (error) {
    logger.error(`Create post error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { caption, domain, tags, isPublished, music } = req.body;
    
    let parsedMusic = null;
    if (music) {
      try {
        parsedMusic = typeof music === 'string' ? JSON.parse(music) : music;
      } catch (e) {
        logger.warn('Failed to parse music data', e);
      }
    }
    
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }
    
    if (caption) post.caption = caption;
    if (domain) post.domain = domain;
    if (tags) post.tags = tags.split(',').map(t => t.trim());
    if (isPublished !== undefined) post.isPublished = isPublished;
    if (parsedMusic) post.music = parsedMusic;
    
    if (req.files && req.files.length > 0) {
      const images = [];
      req.files.forEach(file => {
        images.push({ url: file.path, publicId: file.filename });
      });
      post.images = images;
      post.imageUrl = images[0]?.url;
      post.imagePublicId = images[0]?.publicId;
    } else if (req.file) {
      post.imageUrl = req.file.path;
      post.imagePublicId = req.file.filename;
      post.images = [{ url: req.file.path, publicId: req.file.filename }];
    }
    
    await post.save();
    cacheService.flush();
    
    res.json(post);
  } catch (error) {
    logger.error(`Update post error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    
    await post.deleteOne();
    cacheService.flush();
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    logger.error(`Delete post error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDomains = async (req, res) => {
  try {
    const domains = await Post.distinct('domain');
    res.json(domains.filter(d => d && d.trim() !== ''));
  } catch (error) {
    logger.error(`Get domains error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTags = async (req, res) => {
  try {
    const posts = await Post.find({}, 'tags');
    const tagSet = new Set();
    posts.forEach(post => {
      post.tags.forEach(tag => tagSet.add(tag));
    });
    res.json(Array.from(tagSet));
  } catch (error) {
    logger.error(`Get tags error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Get client IP address
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    // Use an anonymousId from body if provided, otherwise fallback to IP
    const trackingId = req.body.anonymousId || clientIp;
    
    const likeIndex = post.likes.indexOf(trackingId);
    
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(trackingId);
    }
    
    await post.save();
    res.json({ likes: post.likes.length, isLiked: likeIndex === -1 });
  } catch (error) {
    logger.error(`Toggle like error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ NEW: Share a post
export const sharePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const trackingId = req.body.anonymousId || clientIp;
    
    if (!post.shares.includes(trackingId)) {
      post.shares.push(trackingId);
      await post.save();
    }
    
    cacheService.flush();
    
    res.json({ 
      message: 'Post shared successfully',
      shares: post.shares.length 
    });
  } catch (error) {
    logger.error(`Share post error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ NEW: Get post engagement stats (Instagram-style)
export const getPostEngagement = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id)
      .select('likes shares commentCount views createdAt');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const engagementRate = ((post.likes?.length + (post.shares?.length || 0) + (post.commentCount || 0)) / (post.views?.length || 1)) * 100;
    
    res.json({
      likes: post.likes?.length || 0,
      shares: post.shares?.length || 0,
      comments: post.commentCount || 0,
      views: post.views?.length || 0,
      engagementRate: engagementRate.toFixed(2),
      createdAt: post.createdAt,
    });
  } catch (error) {
    logger.error(`Get engagement error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};