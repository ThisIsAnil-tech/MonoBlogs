import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import commentService from '../../services/commentService';

const CommentForm = ({ postId, parentId = null, onCommentAdded, onCancel, placeholder }) => {
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      showToast('Please write something', 'error');
      return;
    }

    setLoading(true);
    try {
      const comment = await commentService.createComment(postId, content, parentId, authorName);
      setContent('');
      if (!isAuthenticated) setAuthorName('');
      if (onCommentAdded) onCommentAdded(comment);
      showToast('Comment added!', 'success');
    } catch (error) {
      showToast('Failed to add comment', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '16px' }}>
      {!isAuthenticated && (
        <input
          type="text"
          className="input-field"
          placeholder="Your Name (optional)"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          style={{ marginBottom: '8px' }}
          disabled={loading}
        />
      )}
      <textarea
        className="input-field"
        placeholder={placeholder || 'Write a comment...'}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{
          minHeight: '60px',
          resize: 'vertical',
          marginBottom: '8px',
        }}
        disabled={loading}
      />
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        {onCancel && (
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            style={{ padding: '6px 16px', fontSize: '13px' }}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn-primary"
          disabled={loading || !content.trim()}
          style={{ padding: '6px 16px', fontSize: '13px' }}
        >
          {loading ? 'Posting...' : parentId ? 'Reply' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;