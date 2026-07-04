import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, LogOut, PlusSquare, Sun, Moon, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SubscribePopup from './SubscribePopup';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const { isAuthenticated, logout, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      backgroundColor: 'rgba(10, 10, 10, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-border)',
      zIndex: 1000,
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '60px',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Camera size={24} />
          <span style={{ fontSize: '1.2rem', fontWeight: '700', letterSpacing: '-0.5px' }}>
            MonoBlog
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              transition: 'opacity 0.2s',
              padding: '4px',
            }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={() => setShowSubscribe(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              transition: 'opacity 0.2s',
              padding: '4px',
              color: 'var(--color-primary)'
            }}
            aria-label="Subscribe"
          >
            <Bell size={20} />
          </button>

          {isAuthenticated ? (
            <>
              <Link 
                to="/create" 
                style={{ display: 'flex', alignItems: 'center', transition: 'opacity 0.2s' }}
                aria-label="Create post"
              >
                <PlusSquare size={24} />
              </Link>
              {isAdmin && (
                <Link 
                  to="/admin" 
                  style={{ fontSize: '0.9rem', fontWeight: '600' }}
                >
                  ThisIsAnil-Tech
                </Link>
              )}
              <button
                onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', transition: 'opacity 0.2s' }}
                aria-label="Logout"
              >
                <LogOut size={24} />
              </button>
            </>
          ) : (
            <Link to="/login" style={{ fontSize: '0.9rem', fontWeight: '600' }}>
              Login
            </Link>
          )}
        </div>
      </div>
      
      {showSubscribe && <SubscribePopup onClose={() => setShowSubscribe(false)} />}
    </nav>
  );
};

export default Navbar;