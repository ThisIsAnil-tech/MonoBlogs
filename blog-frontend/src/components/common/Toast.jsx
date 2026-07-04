import React from 'react';
import { useToast } from '../../context/ToastContext';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = () => {
  const { toasts, removeToast } = useToast();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color="#44ff88" />;
      case 'error':
        return <AlertCircle size={20} color="#ff4444" />;
      default:
        return <Info size={20} color="#a3a3a3" />;
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxWidth: '400px',
      width: '100%',
    }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="slide-in"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          {getIcon(toast.type)}
          <span style={{ flex: 1, fontSize: '14px' }}>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.6'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;