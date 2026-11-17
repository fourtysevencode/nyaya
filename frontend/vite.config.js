import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/fir_analysis': 'http://localhost:8000',
      '/timeline_analyze': 'http://localhost:8000',
    },
  },
})
