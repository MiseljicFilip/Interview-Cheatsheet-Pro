import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // MUST match your GitHub repo name exactly (case-sensitive)
  base: "/Interview-Cheatsheet-Pro/",
})
