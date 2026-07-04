import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react', 'date-fns'],
        },
      },
    },
  },
  server: {
    port: 3400,
    proxy: {
      '/api': {
        target: 'http://localhost:7800',
        changeOrigin: true,
      },
    },
  },
});