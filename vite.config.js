import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false, // Disable sourcemaps for production
    minify: 'terser', // Enable minification
    chunkSizeWarningLimit: 1000, // Increase chunk size warning limit
  },
  base: './', // Use relative paths for better compatibility
  preview: {
    port: 3000,
    open: true,
  }
});