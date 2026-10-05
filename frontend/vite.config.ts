import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react-swc"
import {defineConfig} from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split the bundle so no single chunk is huge and the question generators cache separately
        manualChunks(id) {
          if (id.includes('/src/curriculum/')) return 'curriculum'
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion') || id.includes('/motion')) return 'motion'
            return 'vendor'
          }
        },
      },
    },
  },
  server: {
    host: '::',
    port: 5173,
    allowedHosts: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true
      },
    },
  },
})
