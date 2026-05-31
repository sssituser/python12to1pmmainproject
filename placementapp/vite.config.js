import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: '0.0.0.0', 
    strictPort: true,
    proxy: {
      '/yt-search': {
        target: 'https://www.youtube.com/results',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/yt-search/, '')
      },
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  build: {
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'framer-vendor': ['framer-motion'],
          'vendor': ['react', 'react-dom', 'react-router-dom', 'axios'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  }
})
