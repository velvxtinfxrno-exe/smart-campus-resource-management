import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,   // listens on 0.0.0.0 — reachable from any device on your WiFi
  }
})
