import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    // Proxy only needed for local non-Docker development
    // In Docker or Cloud Run, use VITE_API_BASE_URL instead
    proxy: {
      '/api': {
        target: 'http://localhost:8001/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})

