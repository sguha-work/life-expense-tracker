import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/life-expense-tracker/',
  plugins: [react(), tailwindcss()],
  envPrefix: ['VITE_', 'FIREBASE_'],
  build: {
    target: 'esnext', // Modern browsers allow for smaller syntax
    minify: 'terser', // Terser often yields smaller results than esbuild for complex code
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Move large node_modules into separate chunks to improve caching and prevent duplicates
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
  }
})
