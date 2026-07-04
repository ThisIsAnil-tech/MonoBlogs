import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostDetail from '../components/posts/PostDetail';
import { useToast } from '../context/ToastContext';
import postService from '../services/postService';

const PostDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const data = await postService.getPostBySlug(slug);
        setPost(data);
      } catch (error) {
        showToast('Post not found', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug, navigate, showToast]);

  if (loading) {
    return (
      <div style={{ maxWidth: '470px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
          Loading post...
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ maxWidth: '470px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
          Post not found
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '470px', margin: '0 auto' }}>
      <PostDetail post={post} onBack={() => navigate('/')} />
    </div>
  );
};

export default PostDetailPage;