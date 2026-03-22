import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcsss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcsss(),
  ],
  base:'/encountr/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    css: true,
  },
})
