import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, UploadCloud } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import postService from '../services/postService';
import { compressImage } from '../utils/imageCompression';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [post, setPost] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [domain, setDomain] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await postService.getPostById(id);
        setPost(data);
        setCaption(data.caption || '');
        setDomain(data.domain || '');
        setTags(data.tags?.join(', ') || '');
        setPreview(data.imageUrl);
      } catch (error) {
        showToast('Failed to load post', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, navigate, showToast]);

  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    try {
      const compressedFile = await compressImage(selected);
      setFile(compressedFile);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      showToast('Failed to process image', 'error');
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreview(post?.imageUrl || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    if (file) {
      formData.append('image', file);
    }
    formData.append('caption', caption);
    formData.append('domain', domain);
    formData.append('tags', tags);
    formData.append('isPublished', true);

    try {
      await postService.updatePost(id, formData);
      showToast('Post updated successfully!', 'success');
      navigate(`/post/${post.slug || post._id}`);
    } catch (error) {
      showToast('Failed to update post', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  return (
    <div className="fade-in" style={{
      maxWidth: '470px',
      margin: '0 auto',
      backgroundColor: 'var(--color-bg)',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--color-border)',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: '16px',
      }}>
        Edit Post
      </div>

      <form onSubmit={handleSubmit}>
        
        {!preview ? (
          <div 
            style={{ 
              width: '100%', 
              aspectRatio: '1/1', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'var(--color-surface)',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
            }}
            onClick={() => fileInputRef.current?.click()}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface)'}
          >
            <UploadCloud size={48} style={{ marginBottom: '16px', color: 'var(--color-text-secondary)' }} />
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
              Click to upload new image
            </span>
          </div>
        ) : (
          <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1' }}>
            <img 
              src={preview} 
              alt="Preview" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <button 
              type="button"
              onClick={handleRemoveImage}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                borderRadius: '50%',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.9)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)'}
            >
              <X size={20} />
            </button>
          </div>
        )}
        
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
        />

        
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px', color: 'var(--color-text-secondary)' }}>
              Domain
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              style={{ backgroundColor: 'var(--color-bg)' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px', color: 'var(--color-text-secondary)' }}>
              Tags (comma separated)
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. photography, travel, food"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              style={{ backgroundColor: 'var(--color-bg)' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px', color: 'var(--color-text-secondary)' }}>
              Caption
            </label>
            <textarea
              className="input-field"
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              style={{ 
                minHeight: '80px', 
                resize: 'vertical',
                backgroundColor: 'var(--color-bg)',
              }}
              maxLength={2200}
            />
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', textAlign: 'right' }}>
              {caption.length}/2200
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(-1)}
              style={{ flex: 1, padding: '12px' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ flex: 2, padding: '12px' }}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditPost;