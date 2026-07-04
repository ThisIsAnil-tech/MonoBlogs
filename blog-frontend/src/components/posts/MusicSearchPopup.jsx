import React, { useState, useRef, useEffect } from 'react';
import { Search, Play, Pause, X, Music } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const MusicSearchPopup = ({ onClose, onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(30);
  const audioRef = useRef(new Audio());
  const { showToast } = useToast();

  useEffect(() => {
    const audio = audioRef.current;
    audio.onended = () => setPlayingId(null);
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const clientId = import.meta.env.VITE_JAMENDO_CLIENT_ID || 'b6747d04';
      const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=13&namesearch=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.results) {
        setResults(data.results);
      } else {
        showToast('No results found', 'error');
      }
    } catch (error) {
      showToast('Failed to search music', 'error');
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = (track) => {
    const audio = audioRef.current;
    
    if (playingId === track.id) {
      audio.pause();
      setPlayingId(null);
    } else {
      audio.src = track.audio;
      audio.play().catch(e => {
        showToast('Error playing audio', 'error');
      });
      setPlayingId(track.id);
    }
  };

  const handleSelect = (track) => {
    const audio = audioRef.current;
    audio.pause();
    onSelect({
      name: track.name,
      artist: track.artist_name,
      previewUrl: track.audio,
      jamendoId: track.id,
      startTime: Number(startTime) || 0,
      endTime: Number(endTime) || 30
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '80vh',
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
            <Music size={20} />
            Add Music
          </h3>
          <button onClick={onClose} style={{ color: 'var(--color-text-secondary)' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search songs or artists..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="input-field"
                style={{ width: '100%', paddingLeft: '36px' }}
                autoFocus
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              Search
            </button>
          </form>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>Searching...</div>
          ) : results.length > 0 ? (
            results.map(track => (
              <div key={track.id} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: '1px solid var(--color-border)',
                gap: '12px'
              }}>
                <button
                  onClick={() => togglePlay(track)}
                  style={{
                    width: '40px', height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-surface-hover)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: playingId === track.id ? 'var(--color-primary)' : 'var(--color-text-primary)'
                  }}
                >
                  {playingId === track.id ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '4px' }} />}
                </button>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {track.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {track.artist_name}
                  </div>
                </div>

                {playingId === track.id && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>Start (s)</label>
                      <input 
                        type="number" 
                        min="0" 
                        value={startTime} 
                        onChange={e => setStartTime(e.target.value)}
                        style={{ width: '40px', padding: '2px 4px', fontSize: '12px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>End (s)</label>
                      <input 
                        type="number" 
                        min="1" 
                        value={endTime} 
                        onChange={e => setEndTime(e.target.value)}
                        style={{ width: '40px', padding: '2px 4px', fontSize: '12px' }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleSelect(track)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--color-surface-hover)',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  Select
                </button>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
              Search for a song to add to your post.
            </div>
          )}
        </div>
        
        <div style={{ padding: '12px', textAlign: 'center', fontSize: '11px', color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border)' }}>
          Powered by Jamendo API
        </div>
      </div>
    </div>
  );
};

export default MusicSearchPopup;
