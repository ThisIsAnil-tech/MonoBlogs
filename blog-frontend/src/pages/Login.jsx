import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowLeft } from 'lucide-react';

const Login = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(password);
    
    if (result.success) {
      showToast('Welcome back!', 'success');
      navigate('/');
    } else {
      showToast(result.error || 'Invalid credentials', 'error');
    }
    
    setLoading(false);
  };

  return (
    <div className="fade-in" style={{
      maxWidth: '380px',
      margin: '80px auto',
      padding: '40px',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      backgroundColor: 'var(--color-bg)',
      position: 'relative'
    }}>
      <Link 
        to="/" 
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
          textDecoration: 'none'
        }}
      >
        <ArrowLeft size={16} /> Home
      </Link>
      <div style={{ textAlign: 'center', marginBottom: '32px', marginTop: '16px' }}>
        <h1 style={{ fontSize: '28px', letterSpacing: '-0.5px', marginBottom: '8px' }}>
          MonoBlog
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          Admin access only
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label htmlFor="password" style={{ 
            display: 'block', 
            fontSize: '13px', 
            fontWeight: '500', 
            marginBottom: '6px',
            color: 'var(--color-text-secondary)',
          }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter admin password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
            disabled={loading}
            autoFocus
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading || !password.trim()}
          style={{ width: '100%', padding: '12px', fontSize: '16px' }}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
};

export default Login;