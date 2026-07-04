import React, { useState, useEffect } from 'react';
import { X, Filter } from 'lucide-react';
import postService from '../../services/postService';

const AdminFilterPopup = ({ onClose, onApply, currentFilters }) => {
  const [domain, setDomain] = useState(currentFilters?.domain || '');
  const [sortBy, setSortBy] = useState(currentFilters?.sortBy || 'newest');
  const [notificationStatus, setNotificationStatus] = useState(currentFilters?.notificationStatus || 'all');
  const [availableDomains, setAvailableDomains] = useState([]);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const domains = await postService.getDomains();
        setAvailableDomains(domains);
      } catch (e) {
        console.error('Failed to fetch domains', e);
      }
    };
    fetchDomains();
  }, []);

  const handleApply = (e) => {
    e.preventDefault();
    onApply({ domain, sortBy, notificationStatus });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 350, left: 0, right: 0, bottom: 200,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
    }}>
      <div className="fade-in" style={{
        backgroundColor: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={20} color="var(--color-primary)" />
            Filter Analytics
          </h3>
          <button type="button" onClick={onClose} style={{ color: 'var(--color-text-secondary)' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleApply} style={{ padding: '20px' }}>

          {/* Domain Filter */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Filter by Domain (Optional)</label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="input-field"
            >
              <option value="">All Domains</option>
              {availableDomains.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Notification Filter */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Filter by Notification Sent</label>
            <select
              className="input-field"
              value={notificationStatus}
              onChange={(e) => setNotificationStatus(e.target.value)}
              style={{ width: '100%', cursor: 'pointer' }}
            >
              <option value="all">All Posts</option>
              <option value="sent">Notification Sent</option>
              <option value="notsent">Notification Not Sent</option>
            </select>
          </div>

          {/* Sort By */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Sort Analytics & Posts By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="newest">Newest (Default)</option>
              <option value="likes">Most Likes</option>
              <option value="views">Most Views</option>
              <option value="shares">Most Shares</option>
              <option value="comments">Most Comments</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '12px' }}
          >
            Apply Filters
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminFilterPopup;
