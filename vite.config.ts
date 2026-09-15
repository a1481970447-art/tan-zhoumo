import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.GH_PAGES === '1' ? '/tan-zhoumo/' : '/',
  plugins: [react(), tailwindcss()],
})
