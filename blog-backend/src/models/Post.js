// FILE: blog-backend/src/models/Post.js
import mongoose from 'mongoose';
import slugify from 'slugify';

const postSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: false,
  },
  imagePublicId: {
    type: String,
    required: false,
  },
  images: [{
    url: String,
    publicId: String
  }],
  music: {
    name: String,
    artist: String,
    previewUrl: String,
    jamendoId: String,
    startTime: { type: Number, default: 0 },
    endTime: { type: Number, default: 0 },
  },
  caption: {
    type: String,
    default: '',
    maxlength: 2200,
  },
  domain: {
    type: String,
    default: '',
    trim: true,
    maxlength: 100,
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  views: [{
    type: String, // Store IP addresses or generated IDs
  }],
  likes: [{
    type: String, // Store IP addresses instead of User ObjectIds
  }],
  shares: [{
    type: String, // Store IP addresses
  }],
  commentCount: {
    type: Number,
    default: 0,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  isNotificationSent: {
    type: Boolean,
    default: false,
  },
  notificationsSentCount: {
    type: Number,
    default: 0,
  },
  scheduledFor: {
    type: Date,
    default: null,
  },
  tags: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

// Update comment count
postSchema.methods.updateCommentCount = async function() {
  const Comment = mongoose.model('Comment');
  const count = await Comment.countDocuments({ 
    postId: this._id, 
    isApproved: true 
  });
  this.commentCount = count;
  await this.save();
  return count;
};

postSchema.pre('save', function() {
  if (this.caption) {
    this.slug = slugify(this.caption.substring(0, 50), { 
      lower: true, 
      strict: true,
      remove: /[*+~.()'"!:@]/g 
    });
  }
});

postSchema.index({ slug: 1 });
postSchema.index({ domain: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1 });

export default mongoose.model('Post', postSchema);