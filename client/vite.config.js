import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      // Gli screenshot sono serviti dal server su /uploads: in dev
      // (client su 5173) vanno proxati al backend, altrimenti le immagini
      // della chat e della timeline non si caricano.
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
