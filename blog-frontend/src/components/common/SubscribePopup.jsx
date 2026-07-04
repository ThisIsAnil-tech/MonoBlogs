import React, { useState } from 'react';
import { X, Bell } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const SubscribePopup = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!username || !email) return;

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/subscribers/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email })
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Subscribed successfully!', 'success');
        onClose();
      } else {
        showToast(data.message || 'Failed to subscribe', 'error');
      }
    } catch (error) {
      showToast('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
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
            <Bell size={20} color="var(--color-primary)" />
            Subscribe
          </h3>
          <button onClick={onClose} style={{ color: 'var(--color-text-secondary)' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubscribe} style={{ padding: '20px' }}>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
            Get notified whenever a new post is published.
          </p>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Username</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="Your name"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Email</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '12px' }}
            disabled={loading || !username || !email}
          >
            {loading ? 'Subscribing...' : 'Subscribe Now'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubscribePopup;
