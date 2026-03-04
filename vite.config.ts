import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Only use repo path for production build (GitHub Pages). Local dev uses /
  base: process.env.NODE_ENV === "production" ? "/Interview-Cheatsheet-Pro/" : "/",
})
