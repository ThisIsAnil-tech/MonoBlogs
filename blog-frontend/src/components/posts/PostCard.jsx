
import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Eye, MoreVertical, Edit, Trash2, Share2, Send, Volume2, VolumeX, Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import postService from '../../services/postService';
import ConfirmDialog from '../common/ConfirmDialog';
import SharePopup from '../common/SharePopup';

const PostCard = ({ post, onDelete, onLike }) => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  
  const [likesCount, setLikesCount] = useState(post.engagement?.likes || post.likes?.length || 0);
  const [commentCount, setCommentCount] = useState(post.engagement?.comments || post.commentCount || 0);
  const [shareCount, setShareCount] = useState(post.engagement?.shares ?? (post.shares?.length || 0));
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  
  const audioRef = useRef(null);
  const postRef = useRef(null);
  
  useEffect(() => {
    if (!post.music || !audioRef.current || !postRef.current) return;
    
    const audio = audioRef.current;
    
    
    audio.addEventListener('loadedmetadata', () => {
      if (post.music.startTime) {
        audio.currentTime = post.music.startTime;
      }
    });

    
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
  }, [post.music]);

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
  
  const shareTimeout = useRef(null);

  const handleLike = async (e) => {
    e.stopPropagation();

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

    setIsLiking(true);
    try {
      const result = await postService.toggleLike(post._id);
      setLikesCount(result.likes);
      setIsLiked(result.isLiked);
      if (onLike) onLike(post._id, result);
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
    <>
      <article ref={postRef} className="fade-in" style={{
        backgroundColor: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        marginBottom: '24px',
        overflow: 'hidden',
      }}>
        
        <div style={{
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <Link to={`/post/${post.slug || post._id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '14px',
              overflow: 'hidden',
              border: '2px solid var(--color-border)',
            }}>
              {post.author?.profileImage ? (
                <img src={post.author.profileImage} alt={post.author.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                post.author?.username?.charAt(0).toUpperCase() || 'A'
              )}
            </div>
            <div>
              <span style={{ fontWeight: '600', fontSize: '14px' }}>
                {post.author?.username || 'ThisIsAnil-Tech'}
              </span>
              {post.author?.role === 'admin' && (
                <span style={{ 
                  fontSize: '10px', 
                  marginLeft: '6px',
                  padding: '2px 6px',
                  backgroundColor: 'var(--color-accent-dim)',
                  borderRadius: '4px',
                  color: 'var(--color-text-secondary)',
                }}>
                  ●
                </span>
              )}
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {(isAuthor || isAdmin) && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  style={{ padding: '4px', borderRadius: '4px', transition: 'background-color 0.2s' }}
                >
                  <MoreVertical size={20} />
                </button>
                {showMenu && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    padding: '4px 0',
                    minWidth: '150px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    zIndex: 10,
                  }}>
                    <Link
                      to={`/edit/${post._id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <Edit size={16} />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowConfirm(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        width: '100%',
                        transition: 'background-color 0.2s',
                        color: 'var(--color-error)',
                      }}
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', backgroundColor: 'var(--color-surface)' }}>
          <div 
            onScroll={handleScroll}
            style={{
              display: 'flex',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              width: '100%',
              height: '100%',
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',  
            }}
            
            
          >
            <style>{`div::-webkit-scrollbar { display: none; }`}</style>
            {(post.images && post.images.length > 0) ? (
              post.images.map((image, index) => (
                <div key={index} style={{ flexShrink: 0, width: '100%', height: '100%', scrollSnapAlign: 'start' }}>
                  <Link to={`/post/${post.slug || post._id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                    <img
                      src={image.url}
                      alt={`${post.caption || 'Post image'} ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </Link>
                </div>
              ))
            ) : (
              <div style={{ flexShrink: 0, width: '100%', height: '100%', scrollSnapAlign: 'start' }}>
                <Link to={`/post/${post.slug || post._id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                  <img
                    src={post.imageUrl}
                    alt={post.caption || 'Post image'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                </Link>
              </div>
            )}
          </div>
          
          
          {(post.images && post.images.length > 1) && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
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
          
          
          {post.music && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                width: '30px',
                height: '30px',
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
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          )}
        </div>

        
        {post.music && (
          <div style={{ padding: '12px 16px 4px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            <Music size={14} />
            <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <span style={{ fontWeight: '500' }}>{post.music.artist}</span> - {post.music.name}
            </div>
            <audio ref={audioRef} src={post.music.previewUrl} loop muted={isMuted} />
          </div>
        )}

        
        <div style={{
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <button
            onClick={handleLike}
            disabled={isLiking}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '20px',
              transition: 'all 0.2s ease',
              opacity: isLiking ? 0.6 : 1,
              color: isLiked ? 'var(--color-error)' : 'var(--color-text-primary)',
              transform: isLiked ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            <Heart 
              size={26} 
              fill={isLiked ? 'var(--color-error)' : 'none'} 
              style={{
                transition: 'all 0.2s ease',
                transform: isLiking ? 'scale(1.3)' : 'scale(1)',
              }}
            />
          </button>

          <Link
            to={`/post/${post.slug || post._id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '20px',
              color: 'var(--color-text-primary)',
              transition: 'opacity 0.2s',
            }}
          >
            <MessageCircle size={26} />
          </Link>

          <button
            onClick={handleShare}
            disabled={isSharing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '20px',
              color: 'var(--color-text-primary)',
              transition: 'opacity 0.2s',
              opacity: isSharing ? 0.6 : 1,
            }}
          >
            <Share2 size={24} />
          </button>
        </div>

        
        <div style={{ padding: '8px 16px 4px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '14px',
            fontWeight: '600',
          }}>
            <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
            <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
            <span>{shareCount} {shareCount === 1 ? 'share' : 'shares'}</span>
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            marginTop: '4px',
          }}>
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </div>
        </div>

        
        <div style={{ padding: '0 16px 12px' }}>
          {post.domain && (
            <Link 
              to={`/?domain=${post.domain}`}
              style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                fontWeight: '500',
                marginRight: '8px',
              }}
            >
              #{post.domain}
            </Link>
          )}
          <span style={{ fontSize: '14px' }}>
            {post.caption}
          </span>
        </div>

        
        {post.tags && post.tags.length > 0 && (
          <div style={{ padding: '0 16px 12px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {post.tags.map(tag => (
              <Link
                key={tag}
                to={`/?tag=${tag}`}
                style={{
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                  padding: '2px 8px',
                  backgroundColor: 'var(--color-accent-dim)',
                  borderRadius: '4px',
                }}
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        
        {showSharePopup && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              ✓ Shared with your followers
            </span>
            <button
              onClick={copyLink}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                color: 'var(--color-text-primary)',
                padding: '4px 12px',
                borderRadius: '4px',
                backgroundColor: 'var(--color-accent-dim)',
              }}
            >
              <Send size={14} />
              Copy Link
            </button>
          </div>
        )}
      </article>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        onConfirm={async () => {
          setShowConfirm(false);
          try {
            await postService.deletePost(post._id);
            showToast('Post deleted successfully', 'success');
            if (onDelete) onDelete(post._id);
          } catch (error) {
            showToast('Failed to delete post', 'error');
          }
        }}
        onCancel={() => setShowConfirm(false)}
      />
      <SharePopup
        isOpen={showSharePopup}
        onClose={() => setShowSharePopup(false)}
        postUrl={`${window.location.origin}/post/${post.slug || post._id}`}
        postTitle={post.caption}
      />
    </>
  );
};

export default PostCard;