import React from 'react';

const PostSkeleton = () => {
  return (
    <div style={{
      backgroundColor: 'var(--color-bg)',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      marginBottom: '24px',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div className="skeleton" style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          marginRight: '12px',
        }} />
        <div className="skeleton" style={{
          width: '100px',
          height: '16px',
          borderRadius: '4px',
        }} />
      </div>
      
      <div className="skeleton" style={{
        width: '100%',
        aspectRatio: '1/1',
      }} />

      <div style={{ padding: '16px' }}>
        <div className="skeleton" style={{
          width: '80%',
          height: '14px',
          borderRadius: '4px',
          marginBottom: '12px',
        }} />
        <div className="skeleton" style={{
          width: '60%',
          height: '14px',
          borderRadius: '4px',
          marginBottom: '12px',
        }} />
        <div style={{
          display: 'flex',
          gap: '20px',
          paddingTop: '12px',
          borderTop: '1px solid var(--color-border)',
        }}>
          <div className="skeleton" style={{ width: '60px', height: '20px', borderRadius: '4px' }} />
          <div className="skeleton" style={{ width: '60px', height: '20px', borderRadius: '4px' }} />
          <div className="skeleton" style={{ width: '60px', height: '20px', borderRadius: '4px', marginLeft: 'auto' }} />
        </div>
      </div>
    </div>
  );
};

export default PostSkeleton;