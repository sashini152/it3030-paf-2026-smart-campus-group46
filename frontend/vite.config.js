import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
<<<<<<< HEAD
      '/api': 'http://localhost:8081',
      '/oauth2': 'http://localhost:8081',
      '/login/oauth2': 'http://localhost:8081',
=======
      '/api/incident-tickets': 'http://localhost:8081',
      '/api/tickets': 'http://localhost:8081',
      '/api': 'http://localhost:8081',
>>>>>>> 277136eee2e5728305516bcf0bc8384f1c4a6ba3
    },
  },
})
