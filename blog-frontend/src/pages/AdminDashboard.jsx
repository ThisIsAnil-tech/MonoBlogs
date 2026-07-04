import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Users, Image, Eye, TrendingUp, Clock, Mail, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import postService from '../services/postService';
import ConfirmDialog from '../components/common/ConfirmDialog';
import AdminFilterPopup from '../components/common/AdminFilterPopup';
import SubscribersPopup from '../components/common/SubscribersPopup';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [allPosts, setAllPosts] = useState([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    recentPosts: [],
  });
  const [loading, setLoading] = useState(true);
  const [notifying, setNotifying] = useState(null);
  
  // Filter state
  const [showFilter, setShowFilter] = useState(false);
  const [showSubscribers, setShowSubscribers] = useState(false);
  const [filters, setFilters] = useState({ domain: '', sortBy: 'newest', notificationStatus: 'all' });
  const [confirmState, setConfirmState] = useState({ isOpen: false, postId: null });

  // 1. Fetch data once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const postsRes = await postService.getPosts({ limit: 100 });
        setAllPosts(postsRes.posts || []);
      } catch (error) {
        showToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showToast]);

  // 2. Apply filters and sorting whenever allPosts or filters change
  useEffect(() => {
    if (allPosts.length === 0) return;

    let processed = [...allPosts];

    // Filter by Domain
    if (filters.domain) {
      processed = processed.filter(p => p.domain === filters.domain);
    }

    // Filter by Notification
    if (filters.notificationStatus === 'sent') {
      processed = processed.filter(p => p.isNotificationSent);
    } else if (filters.notificationStatus === 'notsent') {
      processed = processed.filter(p => !p.isNotificationSent);
    }

    // Sort
    processed.sort((a, b) => {
      switch (filters.sortBy) {
        case 'likes':
          return (b.likes?.length || 0) - (a.likes?.length || 0);
        case 'views':
          return (b.views?.length || 0) - (a.views?.length || 0);
        case 'shares':
          return (b.shares?.length || 0) - (a.shares?.length || 0);
        case 'comments':
          return (b.commentCount || 0) - (a.commentCount || 0);
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    const totalViews = processed.reduce((sum, p) => sum + (p.views?.length || 0), 0);
    const totalLikes = processed.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
    
    setStats({
      totalPosts: processed.length,
      totalViews,
      totalLikes,
      recentPosts: processed.slice(0, 5),
    });
  }, [allPosts, filters]);

  const statCards = [
    { icon: Image, label: 'Total Posts', value: stats.totalPosts, color: '#44ff88' },
    { icon: Eye, label: 'Total Views', value: stats.totalViews, color: '#4488ff' },
    { icon: TrendingUp, label: 'Total Likes', value: stats.totalLikes, color: '#ff4488' },
  ];

  const handleNotifyRequest = (e, postId) => {
    e.preventDefault();
    setConfirmState({ isOpen: true, postId });
  };

  const confirmNotify = async () => {
    const postId = confirmState.postId;
    setConfirmState({ isOpen: false, postId: null });
    setNotifying(postId);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/posts/${postId}/notify-subscribers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Subscribers notified successfully!', 'success');
        // Update local state to reflect sent notification
        setAllPosts(prev => prev.map(p => 
          p._id === postId ? { ...p, isNotificationSent: true, notificationsSentCount: data.notificationsSentCount } : p
        ));
      } else {
        showToast(data.message || 'Failed to notify subscribers', 'error');
      }
    } catch (error) {
      showToast('Error connecting to server', 'error');
    } finally {
      setNotifying(null);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading dashboard...</div>;
  }

  return (
    <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '28px', letterSpacing: '-0.5px' }}>
            Welcome back, {user?.username || 'ThisIsAnil-Tech'} 👋
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Here's what's happening with your blog
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setShowSubscribers(true)}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Users size={16} /> Subscribers
          </button>
          <button 
            onClick={() => setShowFilter(true)}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Filter size={16} /> Filter
          </button>
        </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {statCards.map((stat, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <stat.icon size={24} color={stat.color} style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '24px', fontWeight: '700' }}>
              {stat.value.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '32px',
      }}>
        <Link
          to="/create"
          className="btn-primary"
          style={{
            textAlign: 'center',
            padding: '12px',
            textDecoration: 'none',
          }}
        >
          + New Post
        </Link>
        <Link
          to="/"
          className="btn-secondary"
          style={{
            textAlign: 'center',
            padding: '12px',
            textDecoration: 'none',
          }}
        >
          View Blog
        </Link>
      </div>

      {/* Recent posts */}
      <div style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '20px',
      }}>
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} />
          {filters.sortBy === 'newest' ? 'Recent Posts' : 'Top Posts'}
          {filters.domain && <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 'normal' }}>({filters.domain})</span>}
        </h3>
        
        {stats.recentPosts.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '20px' }}>
            No posts yet. Create your first post!
          </p>
        ) : (
          <div>
            {stats.recentPosts.map((post, index) => (
              <Link
                key={post._id}
                to={`/post/${post.slug || post._id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 0',
                  borderBottom: index < stats.recentPosts.length - 1 ? '1px solid var(--color-border)' : 'none',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <img
                  src={post.imageUrl}
                  alt={post.caption}
                  style={{
                    width: '50px',
                    height: '50px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {post.caption || 'Untitled'}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                  }}>
                    {post.views?.length || 0} views • {post.likes?.length || 0} likes
                  </div>
                  {post.isNotificationSent && (
                    <div style={{ fontSize: '11px', color: 'var(--color-primary)', marginTop: '2px' }}>
                      ✓ Notified {post.notificationsSentCount || 0} subscribers
                    </div>
                  )}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  {new Date(post.createdAt).toLocaleDateString()}
                  
                  <button
                    onClick={(e) => handleNotifyRequest(e, post._id)}
                    disabled={notifying === post._id}
                    title="Send Email to Subscribers"
                    style={{
                      padding: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-surface-hover)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: notifying === post._id ? 'var(--color-text-secondary)' : 'var(--color-primary)',
                      border: 'none',
                      cursor: notifying === post._id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Mail size={16} />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {showFilter && (
        <AdminFilterPopup 
          onClose={() => setShowFilter(false)} 
          onApply={(f) => setFilters(f)} 
          currentFilters={filters} 
        />
      )}

      {showSubscribers && (
        <SubscribersPopup onClose={() => setShowSubscribers(false)} />
      )}

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title="Notify Subscribers"
        message="Are you sure you want to email all active subscribers about this post?"
        onConfirm={confirmNotify}
        onCancel={() => setConfirmState({ isOpen: false, postId: null })}
        isLoading={notifying !== null}
      />
    </div>
  );
};

export default AdminDashboard;