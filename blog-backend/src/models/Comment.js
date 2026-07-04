
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  authorName: {
    type: String,
    default: 'Guest',
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isApproved: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});


commentSchema.post('save', async function() {
  const Post = mongoose.model('Post');
  const post = await Post.findById(this.postId);
  if (post) {
    await post.updateCommentCount();
  }
});


commentSchema.post('deleteOne', { document: true, query: false }, async function() {
  const Post = mongoose.model('Post');
  const post = await Post.findById(this.postId);
  if (post) {
    await post.updateCommentCount();
  }
});

commentSchema.index({ postId: 1, createdAt: -1 });

export default mongoose.model('Comment', commentSchema);