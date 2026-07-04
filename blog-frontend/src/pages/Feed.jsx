import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import PostCard from '../components/posts/PostCard';
import PostSkeleton from '../components/posts/PostSkeleton';
import { useToast } from '../context/ToastContext';
import postService from '../services/postService';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const domain = searchParams.get('domain');
  const tag = searchParams.get('tag');

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    const setLoadingState = append ? setLoadingMore : setLoading;
    setLoadingState(true);

    try {
      const params = { page: pageNum, limit: 10 };
      if (domain && domain !== 'all') params.domain = domain;
      if (tag) params.tag = tag;

      const data = await postService.getPosts(params);
      
      if (append) {
        setPosts(prev => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }
      
      setHasMore(pageNum < data.totalPages);
      setPage(pageNum);
    } catch (error) {
      showToast('Failed to fetch posts', 'error');
    } finally {
      setLoadingState(false);
    }
  }, [domain, tag, showToast]);

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts(1, false);
  }, [domain, tag, fetchPosts]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchPosts(page + 1, true);
    }
  };

  const handleDelete = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '470px', margin: '0 auto' }}>
        {[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '470px', margin: '0 auto' }}>
      
      {(domain || tag) && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '16px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            {domain ? `Domain: #${domain}` : `Tag: #${tag}`}
          </span>
          <a 
            href="/" 
            style={{ 
              fontSize: '13px', 
              color: 'var(--color-text-secondary)',
              textDecoration: 'underline',
            }}
          >
            Clear filter
          </a>
        </div>
      )}

      {posts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--color-text-secondary)',
        }}>
          <p style={{ fontSize: '18px', marginBottom: '8px' }}>📸 No posts yet</p>
          <p style={{ fontSize: '14px' }}>Check back later for new content!</p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard 
              key={post._id} 
              post={post} 
              onDelete={handleDelete}
            />
          ))}
          
          {hasMore && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <button
                onClick={loadMore}
                className="btn-secondary"
                disabled={loadingMore}
                style={{ padding: '8px 24px' }}
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Feed;