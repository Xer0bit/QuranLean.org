import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:8000',
      '/api': 'http://localhost:8000',
      '/admin': { target: 'http://localhost:8000', bypass: (req) => req.url === '/admin' ? null : undefined },
    },
  },
})
