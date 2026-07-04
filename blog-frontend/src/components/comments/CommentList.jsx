
import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, Reply, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import CommentForm from './CommentForm';
import commentService from '../../services/commentService';

const CommentList = ({ postId, onCommentCountUpdate }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const { isAuthenticated, user, isAdmin } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await commentService.getComments(postId);
      setComments(data.comments || []);
      if (onCommentCountUpdate) {
        onCommentCountUpdate(data.total || 0);
      }
    } catch (error) {
      showToast('Failed to load comments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAdded = (newComment) => {
    setComments(prev => [newComment, ...prev]);
    if (onCommentCountUpdate) {
      onCommentCountUpdate(prev => prev + 1);
    }
  };

  const handleReplyAdded = (reply, parentId) => {
    setComments(prev => prev.map(comment => {
      if (comment._id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply],
        };
      }
      return comment;
    }));
    setReplyTo(null);
    if (onCommentCountUpdate) {
      onCommentCountUpdate(prev => prev + 1);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c._id !== commentId));
      if (onCommentCountUpdate) {
        onCommentCountUpdate(prev => prev - 1);
      }
      showToast('Comment deleted', 'success');
    } catch (error) {
      showToast('Failed to delete comment', 'error');
    }
  };

  const handleLike = async (commentId) => {
    try {
      const result = await commentService.toggleLike(commentId);
      setComments(prev => prev.map(comment => {
        if (comment._id === commentId) {
          return { ...comment, likes: result.likes, isLiked: result.isLiked };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply => 
              reply._id === commentId 
                ? { ...reply, likes: result.likes, isLiked: result.isLiked }
                : reply
            ),
          };
        }
        return comment;
      }));
    } catch (error) {
      showToast('Failed to like comment', 'error');
    }
  };

  const renderComment = (comment, isReply = false) => {
    const isAuthor = user?._id === comment.author?._id;
    const canDelete = isAuthor || isAdmin;

    return (
      <div
        key={comment._id}
        style={{
          padding: '12px 0',
          borderBottom: '1px solid var(--color-border)',
          marginLeft: isReply ? '40px' : '0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-surface-hover)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '12px',
            flexShrink: 0,
            overflow: 'hidden',
          }}>
            {comment.author?.profileImage ? (
              <img src={comment.author.profileImage} alt={comment.author.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (comment.authorName || comment.author?.username || 'G').charAt(0).toUpperCase()
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: '600', fontSize: '14px' }}>
                {comment.authorName || comment.author?.username || 'Guest'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p style={{ fontSize: '14px', marginTop: '4px', wordBreak: 'break-word' }}>
              {comment.content}
            </p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              <button
                onClick={() => handleLike(comment._id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: comment.isLiked ? 'var(--color-error)' : 'var(--color-text-secondary)',
                  transition: 'color 0.2s',
                }}
              >
                <Heart size={14} fill={comment.isLiked ? 'var(--color-error)' : 'none'} />
                <span>{comment.likes?.length || 0}</span>
              </button>
              {!isReply && (
                <button
                  onClick={() => setReplyTo(comment._id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                    transition: 'color 0.2s',
                  }}
                >
                  <Reply size={14} />
                  Reply
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    color: 'var(--color-error)',
                    opacity: 0.6,
                    transition: 'opacity 0.2s',
                  }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}

        {replyTo === comment._id && (
          <div style={{ marginTop: '12px', marginLeft: '40px' }}>
            <CommentForm
              postId={postId}
              parentId={comment._id}
              onCommentAdded={(reply) => handleReplyAdded(reply, comment._id)}
              onCancel={() => setReplyTo(null)}
              placeholder="Write a reply..."
            />
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)' }}>
        Loading comments...
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--color-bg)',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      padding: '20px',
    }}>
      <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        Comments ({comments.length})
      </h4>

      <CommentForm
        postId={postId}
        onCommentAdded={handleCommentAdded}
      />

      {comments.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: 'var(--color-text-secondary)',
          fontSize: '14px',
        }}>
          No comments yet. Be the first!
        </div>
      ) : (
        <div style={{ marginTop: '16px' }}>
          {comments.map(comment => renderComment(comment))}
        </div>
      )}
    </div>
  );
};

export default CommentList;