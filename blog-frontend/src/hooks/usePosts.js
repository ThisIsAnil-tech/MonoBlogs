
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import postService from '../services/postService';

export const usePosts = (initialFilters = {}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState(initialFilters);
  const { showToast } = useToast();

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    const setLoadingState = append ? setLoadingMore : setLoading;
    setLoadingState(true);

    try {
      const params = { page: pageNum, limit: 10, ...filters };
      const data = await postService.getPosts(params);
      
      if (append) {
        setPosts(prev => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }
      
      setTotal(data.total || 0);
      setHasMore(pageNum < data.totalPages);
      setPage(pageNum);
    } catch (error) {
      showToast('Failed to fetch posts', 'error');
    } finally {
      setLoadingState(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts(1, false);
  }, [filters, fetchPosts]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchPosts(page + 1, true);
    }
  }, [loadingMore, hasMore, page, fetchPosts]);

  const refresh = useCallback(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts(1, false);
  }, [fetchPosts]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const addPost = useCallback((post) => {
    setPosts(prev => [post, ...prev]);
    setTotal(prev => prev + 1);
  }, []);

  const updatePost = useCallback((id, updatedPost) => {
    setPosts(prev => prev.map(p => p._id === id ? { ...p, ...updatedPost } : p));
  }, []);

  const removePost = useCallback((id) => {
    setPosts(prev => prev.filter(p => p._id !== id));
    setTotal(prev => prev - 1);
  }, []);

  return {
    posts,
    loading,
    loadingMore,
    hasMore,
    page,
    total,
    filters,
    fetchPosts,
    loadMore,
    refresh,
    updateFilters,
    addPost,
    updatePost,
    removePost,
    setLoading,
  };
};

export default usePosts;