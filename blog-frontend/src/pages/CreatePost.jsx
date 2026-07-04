import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import postService from '../services/postService';
import { compressImage } from '../utils/imageCompression';
import MusicSearchPopup from '../components/posts/MusicSearchPopup';
import { Music as MusicIcon } from 'lucide-react';

const CreatePost = () => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [music, setMusic] = useState(null);
  const [showMusicPopup, setShowMusicPopup] = useState(false);
  const [caption, setCaption] = useState('');
  const [domain, setDomain] = useState('');
  const [domainsList, setDomainsList] = useState([]);
  const [tags, setTags] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const domains = await postService.getDomains();
        setDomainsList(domains);
      } catch (error) {
        console.error('Failed to fetch domains', error);
      }
    };
    fetchDomains();
  }, []);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    if (files.length + selectedFiles.length > 10) {
      showToast('Maximum 10 images allowed', 'error');
      return;
    }

    setLoading(true);
    try {
      const compressedFiles = [];
      const newPreviews = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const selected = selectedFiles[i];
        const compressedFile = await compressImage(selected);
        compressedFiles.push(compressedFile);
        
        const previewUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(compressedFile);
        });
        newPreviews.push(previewUrl);
      }
      
      setFiles(prev => [...prev, ...compressedFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      showToast('Failed to process images', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setPreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      showToast('Please select at least one image', 'error');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    formData.append('caption', caption);
    formData.append('domain', domain);
    formData.append('tags', tags);
    if (music) {
      formData.append('music', JSON.stringify(music));
    }
    if (scheduledFor) {
      formData.append('scheduledFor', scheduledFor);
    }

    try {
      await postService.createPost(formData);
      showToast('Post created successfully!', 'success');
      navigate('/');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to create post', 'error');
    } finally {
      setLoading(false);
    }
  };

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
        Create New Post
      </div>

      <form onSubmit={handleSubmit}>
        {/* Image upload area */}
        <div style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          gap: '12px', 
          padding: '16px', 
          backgroundColor: 'var(--color-bg)',
          borderBottom: '1px solid var(--color-border)'
        }}>
          {previews.map((preview, index) => (
            <div key={index} style={{ position: 'relative', flexShrink: 0, width: '200px', aspectRatio: '1/1' }}>
              <img 
                src={preview} 
                alt={`Preview ${index}`} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} 
              />
              <button 
                type="button"
                onClick={() => handleRemoveImage(index)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.9)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)'}
              >
                <X size={16} />
              </button>
            </div>
          ))}
          {previews.length < 10 && (
            <div 
              style={{
                flexShrink: 0, 
                width: previews.length > 0 ? '200px' : '100%', 
                aspectRatio: '1/1', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center', 
                backgroundColor: 'var(--color-surface)',
                cursor: 'pointer', 
                border: '2px dashed var(--color-border)', 
                borderRadius: '8px',
                transition: 'background-color 0.3s ease',
              }}
              onClick={() => fileInputRef.current?.click()}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface)'}
            >
              <UploadCloud size={48} style={{ marginBottom: '16px', color: 'var(--color-text-secondary)' }} />
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                Click to upload images
              </span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px', marginTop: '4px' }}>
                Max 10 images (5MB each)
              </span>
            </div>
          )}
        </div>
        
        <input 
          type="file" 
          accept="image/*" 
          multiple
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
        />

        {/* Music Section */}
        <div style={{ padding: '0 20px', marginTop: '16px' }}>
          {music ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px', backgroundColor: 'var(--color-surface)', borderRadius: '8px',
              border: '1px solid var(--color-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MusicIcon size={20} color="var(--color-primary)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{music.name}</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{music.artist}</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setMusic(null)}
                style={{ padding: '4px', color: 'var(--color-text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowMusicPopup(true)}
              style={{
                width: '100%', padding: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                backgroundColor: 'var(--color-surface)', border: '1px dashed var(--color-border)',
                borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: '14px'
              }}
            >
              <MusicIcon size={18} />
              Add Music (Optional)
            </button>
          )}
        </div>

        {showMusicPopup && (
          <MusicSearchPopup 
            onClose={() => setShowMusicPopup(false)}
            onSelect={(selectedMusic) => setMusic(selectedMusic)}
          />
        )}

        {/* Form fields */}
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px', color: 'var(--color-text-secondary)' }}>
              Domain
            </label>
            <input
              type="text"
              list="domains-list"
              className="input-field"
              placeholder="Select or type a domain..."
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              style={{ backgroundColor: 'var(--color-bg)' }}
            />
            <datalist id="domains-list">
              {domainsList.map((d, index) => (
                <option key={index} value={d} />
              ))}
            </datalist>
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

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px', color: 'var(--color-text-secondary)' }}>
              Schedule for (optional)
            </label>
            <input
              type="datetime-local"
              className="input-field"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              style={{ backgroundColor: 'var(--color-bg)' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', padding: '12px' }}
            disabled={files.length === 0 || loading}
          >
            {loading ? 'Posting...' : 'Publish Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;