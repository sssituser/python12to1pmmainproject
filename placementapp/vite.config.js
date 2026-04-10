import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    host: 'localhost', 
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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'framer-vendor': ['framer-motion'],
          'vendor': ['react', 'react-dom', 'react-router-dom', 'axios'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  }
})
