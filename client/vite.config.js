import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Target proxy bisa diatur lewat env supaya jalan di host maupun di Docker
// (di dalam container, backend bukan 'localhost' tapi nama service 'server').
const apiTarget = process.env.VITE_API_PROXY_TARGET || 'http://localhost:5000'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
    // Bind mount di Windows kadang tidak memicu file watcher
    watch: {
      usePolling: process.env.VITE_USE_POLLING === 'true',
    },
  },
})
