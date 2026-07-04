// FILE: blog-frontend/src/components/posts/PostDetail.jsx
import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Heart, MessageCircle, Eye, ArrowLeft, Calendar, Hash, Share2, Send, Volume2, VolumeX, Music } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import CommentList from '../comments/CommentList';
import postService from '../../services/postService';
import SharePopup from '../common/SharePopup';

const PostDetail = ({ post, onBack }) => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [shareCount, setShareCount] = useState(post.sharesCount ?? (post.shares?.length || 0));
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isLiking, setIsLiking] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  
  const audioRef = useRef(null);
  const postRef = useRef(null);
  
  useEffect(() => {
    if (!post?.music || !audioRef.current || !postRef.current) return;
    
    const audio = audioRef.current;
    
    // Set initial start time when loaded
    audio.addEventListener('loadedmetadata', () => {
      if (post.music.startTime) {
        audio.currentTime = post.music.startTime;
      }
    });

    // Handle end time
    const handleTimeUpdate = () => {
      if (post.music.endTime && audio.currentTime >= post.music.endTime) {
        audio.pause();
        audio.currentTime = post.music.startTime || 0;
      }
    };
    audio.addEventListener('timeupdate', handleTimeUpdate);

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        if (post.music.startTime && audio.currentTime === 0) {
          audio.currentTime = post.music.startTime;
        }
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    }, { threshold: 0.5 });
    
    observer.observe(postRef.current);
    return () => {
      if (postRef.current) observer.unobserve(postRef.current);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [post?.music]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);
  
  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.offsetWidth;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== activeImageIndex) setActiveImageIndex(newIndex);
  };
  const [isSharing, setIsSharing] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const shareTimeout = useRef(null);

  const handleLike = async () => {
    setIsLiking(true);
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

    try {
      const result = await postService.toggleLike(post._id);
      setLikesCount(result.likes);
      setIsLiked(result.isLiked);
    } catch (error) {
      setIsLiked(!newLikedState);
      setLikesCount(prev => newLikedState ? prev - 1 : prev + 1);
      showToast('Failed to like post', 'error');
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    setShareCount(prev => prev + 1);
    
    try {
      await postService.sharePost(post._id);
      setShowSharePopup(true);
    } catch (error) {
      setShareCount(prev => prev - 1);
      showToast('Failed to share', 'error');
    } finally {
      setIsSharing(false);
    }
  };

  useEffect(() => {
    return () => clearTimeout(shareTimeout.current);
  }, []);

  const isAuthor = user?._id === post.author?._id;

  return (
    <div className="fade-in">
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
          color: 'var(--color-text-secondary)',
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
      >
        <ArrowLeft size={20} />
        Back to feed
      </button>

      <article ref={postRef} style={{
        backgroundColor: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '24px',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '14px',
              overflow: 'hidden',
            }}>
              {post.author?.profileImage ? (
                <img src={post.author.profileImage} alt={post.author.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                post.author?.username?.charAt(0).toUpperCase() || 'A'
              )}
            </div>
            <div>
              <div style={{ fontWeight: '600' }}>
                {post.author?.username || 'ThisIsAnil-Tech'}
                {post.author?.role === 'admin' && (
                  <span style={{ 
                    fontSize: '10px', 
                    marginLeft: '8px',
                    padding: '2px 8px',
                    backgroundColor: 'var(--color-accent-dim)',
                    borderRadius: '4px',
                    color: 'var(--color-text-secondary)',
                  }}>
                    Admin
                  </span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Eye size={14} />
                  {post.viewsCount ?? (post.views?.length || 0)} views
                </span>
              </div>
            </div>
          </div>

          {post.domain && (
            <Link 
              to={`/?domain=${post.domain}`}
              style={{
                display: 'inline-block',
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                padding: '4px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                marginTop: '4px',
                transition: 'all 0.2s ease',
              }}
            >
              <Hash size={12} style={{ display: 'inline', marginRight: '4px' }} />
              {post.domain}
            </Link>
          )}
        </div>

        {/* Images Carousel */}
        <div style={{ position: 'relative', width: '100%', backgroundColor: 'var(--color-surface)' }}>
          <div 
            onScroll={handleScroll}
            style={{
              display: 'flex',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              width: '100%',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <style>{`div::-webkit-scrollbar { display: none; }`}</style>
            {(post.images && post.images.length > 0) ? (
              post.images.map((image, index) => (
                <div key={index} style={{ flexShrink: 0, width: '100%', scrollSnapAlign: 'start', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={image.url}
                    alt={`${post.caption || 'Post image'} ${index + 1}`}
                    style={{ width: '100%', height: 'auto', maxHeight: '600px', objectFit: 'contain' }}
                    loading="lazy"
                  />
                </div>
              ))
            ) : (
              <div style={{ flexShrink: 0, width: '100%', scrollSnapAlign: 'start', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={post.imageUrl}
                  alt={post.caption || 'Post image'}
                  style={{ width: '100%', height: 'auto', maxHeight: '600px', objectFit: 'contain' }}
                  loading="lazy"
                />
              </div>
            )}
          </div>
          
          {/* Page Indicators */}
          {(post.images && post.images.length > 1) && (
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: '6px',
              pointerEvents: 'none',
            }}>
              {post.images.map((_, idx) => (
                <div key={idx} style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  backgroundColor: idx === activeImageIndex ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  transition: 'background-color 0.2s ease'
                }} />
              ))}
            </div>
          )}
          
          {/* Mute/Unmute Logo */}
          {post.music && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                zIndex: 10
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.8)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)'}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          )}
        </div>
        
        {/* Music Ticker & Audio */}
        {post.music && (
          <div style={{ padding: '16px 20px 4px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            <Music size={16} />
            <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <span style={{ fontWeight: '500' }}>{post.music.artist}</span> - {post.music.name}
            </div>
            <audio ref={audioRef} src={post.music.previewUrl} loop muted={isMuted} />
          </div>
        )}

        {/* Caption and tags */}
        {post.caption && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
            <p style={{ fontSize: '15px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
              {post.caption}
            </p>
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {post.tags.map(tag => (
                <Link
                  key={tag}
                  to={`/?tag=${tag}`}
                  style={{
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                    padding: '4px 12px',
                    backgroundColor: 'var(--color-accent-dim)',
                    borderRadius: '12px',
                    transition: 'background-color 0.2s',
                  }}
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <button
            onClick={handleLike}
            disabled={isLiking}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              opacity: isLiking ? 0.6 : 1,
              color: isLiked ? 'var(--color-error)' : 'var(--color-text-secondary)',
            }}
          >
            <Heart size={22} fill={isLiked ? 'var(--color-error)' : 'none'} />
            <span>{likesCount}</span>
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--color-text-secondary)',
            fontSize: '14px',
          }}>
            <MessageCircle size={20} />
            <span>{commentCount}</span>
          </div>

          <button 
            onClick={handleShare}
            disabled={isSharing}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: 'var(--color-text-primary)'
            }}
          >
            <Send size={24} style={{ transform: 'rotate(-45deg) translateY(-2px)' }} />
            <span style={{ fontWeight: '600' }}>{shareCount}</span>
          </button>

          <div style={{
            marginLeft: 'auto',
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <Calendar size={14} />
            <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
          </div>
        </div>

        {/* Edit/Delete actions for author */}
        {(isAuthor || isAdmin) && (
          <div style={{
            padding: '12px 20px',
            display: 'flex',
            gap: '12px',
          }}>
            <Link
              to={`/edit/${post._id}`}
              className="btn-secondary"
              style={{ padding: '6px 16px', fontSize: '13px' }}
            >
              Edit Post
            </Link>
          </div>
        )}
      </article>

      <SharePopup
        isOpen={showSharePopup}
        onClose={() => setShowSharePopup(false)}
        postUrl={`${window.location.origin}/post/${post.slug || post._id}`}
        postTitle={post.caption}
      />

      {/* Comments section */}
      <CommentList postId={post._id} onCommentCountUpdate={setCommentCount} />
    </div>
  );
};

export default PostDetail;