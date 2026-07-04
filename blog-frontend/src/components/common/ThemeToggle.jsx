import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { STORAGE_KEYS, THEMES } from '../../utils/constants';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME) || THEMES.DARK;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK);
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '4px',
        borderRadius: '4px',
        transition: 'opacity 0.2s',
      }}
      aria-label="Toggle theme"
    >
      {theme === THEMES.DARK ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default ThemeToggle;