import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['songs/*.json']
  },
  resolve: {
    alias: {
      '@mui/material': '@mui/material/esm/index.js',
      '@mui/icons-material': '@mui/icons-material/esm/index.js',
    },
  },
  build: {
    rollupOptions: {
      external: ['@mui/material', '@mui/icons-material'],
    },
  },
})
