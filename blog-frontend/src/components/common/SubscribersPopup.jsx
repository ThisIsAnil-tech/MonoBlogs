import React, { useState, useEffect } from 'react';
import { X, Users, Mail } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const SubscribersPopup = ({ onClose }) => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/subscribers`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setSubscribers(data);
        } else {
          showToast(data.message || 'Failed to load subscribers', 'error');
        }
      } catch (error) {
        showToast('Error connecting to server', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscribers();
  }, [showToast]);

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
    }} onClick={onClose}>
      <div className="fade-in" style={{
        backgroundColor: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
      }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} />
            Subscribers ({subscribers.length})
          </h3>
          <button onClick={onClose} style={{ color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading subscribers...</div>
          ) : subscribers.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              No subscribers yet. Keep posting!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {subscribers.map((sub) => (
                <div key={sub._id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                }}>
                  <div style={{
                    width: '40px', height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-surface-hover)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', fontWeight: 'bold'
                  }}>
                    {sub.username.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sub.username}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      <Mail size={12} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {sub.email}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscribersPopup;
