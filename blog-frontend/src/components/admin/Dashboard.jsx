
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Image, Eye, TrendingUp, Clock, Users, Share2, Heart, Calendar, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import postService from '../../services/postService';

const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalShares: 0,
    totalComments: 0,
    recentPosts: [],
    topPosts: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await postService.getPosts({ limit: 100 });
      const allPosts = response.posts || [];
      
      
      const totalViews = allPosts.reduce((sum, p) => sum + (p.views || 0), 0);
      const totalLikes = allPosts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
      const totalShares = allPosts.reduce((sum, p) => sum + (p.shares || 0), 0);
      const totalComments = allPosts.reduce((sum, p) => sum + (p.commentCount || 0), 0);
      
      
      const sortedByEngagement = [...allPosts].sort((a, b) => 
        ((b.likes?.length || 0) + (b.shares || 0) + (b.commentCount || 0)) -
        ((a.likes?.length || 0) + (a.shares || 0) + (a.commentCount || 0))
      );

      setStats({
        totalPosts: allPosts.length,
        totalViews,
        totalLikes,
        totalShares,
        totalComments,
        recentPosts: allPosts.slice(0, 5),
        topPosts: sortedByEngagement.slice(0, 5),
      });
    } catch (error) {
      showToast('Failed to load stats', 'error');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { icon: Image, label: 'Total Posts', value: stats.totalPosts, color: '#44ff88' },
    { icon: Eye, label: 'Total Views', value: stats.totalViews, color: '#4488ff' },
    { icon: Heart, label: 'Total Likes', value: stats.totalLikes, color: '#ff4488' },
    { icon: Share2, label: 'Total Shares', value: stats.totalShares, color: '#ffaa44' },
  ];

  if (loading) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', letterSpacing: '-0.5px' }}>
          Welcome back, {user?.username || 'Admin'} 👋
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          Here's what's happening with your blog
        </p>
      </div>

      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}>
        {statCards.map((stat, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
            }}
          >
            <stat.icon size={22} color={stat.color} style={{ marginBottom: '6px' }} />
            <div style={{ fontSize: '22px', fontWeight: '700' }}>
              {stat.value.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      
      <div style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '16px 20px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} />
            Engagement Overview
          </h3>
          <div style={{ display: 'flex', gap: '4px', fontSize: '12px' }}>
            {['week', 'month', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  backgroundColor: timeRange === range ? 'var(--color-accent-dim)' : 'transparent',
                  color: timeRange === range ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  transition: 'all 0.2s',
                }}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#44ff88' }}>
              {stats.totalPosts > 0 ? Math.round((stats.totalLikes / stats.totalPosts) * 10) / 10 : 0}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Avg Likes</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#ffaa44' }}>
              {stats.totalPosts > 0 ? Math.round((stats.totalShares / stats.totalPosts) * 10) / 10 : 0}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Avg Shares</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#4488ff' }}>
              {stats.totalPosts > 0 ? Math.round((stats.totalComments / stats.totalPosts) * 10) / 10 : 0}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Avg Comments</div>
          </div>
        </div>
      </div>

      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <Link
          to="/create"
          className="btn-primary"
          style={{
            textAlign: 'center',
            padding: '12px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
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
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          View Blog
        </Link>
      </div>

      
      <div style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px',
      }}>
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
          <Clock size={18} />
          Recent Posts
        </h3>
        
        {stats.recentPosts.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '20px', fontSize: '14px' }}>
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
                  padding: '10px 0',
                  borderBottom: index < stats.recentPosts.length - 1 ? '1px solid var(--color-border)' : 'none',
                  transition: 'opacity 0.2s',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <img
                  src={post.imageUrl}
                  alt={post.caption || 'Post'}
                  style={{
                    width: '48px',
                    height: '48px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {post.caption || 'Untitled'}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: 'var(--color-text-secondary)',
                    display: 'flex',
                    gap: '12px',
                  }}>
                    <span>❤️ {post.likes?.length || 0}</span>
                    <span>🔄 {post.shares || 0}</span>
                    <span>💬 {post.commentCount || 0}</span>
                  </div>
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--color-text-secondary)',
                  whiteSpace: 'nowrap',
                }}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      
      {stats.topPosts.length > 0 && (
        <div style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '20px',
        }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
            <TrendingUp size={18} color="#44ff88" />
            Top Performing
          </h3>
          
          <div>
            {stats.topPosts.map((post, index) => {
              const engagement = (post.likes?.length || 0) + (post.shares || 0) + (post.commentCount || 0);
              const maxEngagement = stats.topPosts[0] ? 
                (stats.topPosts[0].likes?.length || 0) + (stats.topPosts[0].shares || 0) + (stats.topPosts[0].commentCount || 0) : 1;
              const percentage = Math.round((engagement / maxEngagement) * 100);
              
              return (
                <Link
                  key={post._id}
                  to={`/post/${post.slug || post._id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 0',
                    borderBottom: index < stats.topPosts.length - 1 ? '1px solid var(--color-border)' : 'none',
                    transition: 'opacity 0.2s',
                    textDecoration: 'none',
                  }}
                >
                  <div style={{
                    width: '24px',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : 'var(--color-text-secondary)',
                  }}>
                    #{index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '13px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {post.caption || 'Untitled'}
                    </div>
                    <div style={{
                      height: '4px',
                      backgroundColor: 'var(--color-border)',
                      borderRadius: '2px',
                      marginTop: '4px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${percentage}%`,
                        backgroundColor: '#44ff88',
                        borderRadius: '2px',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                    whiteSpace: 'nowrap',
                  }}>
                    {engagement} engagements
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;