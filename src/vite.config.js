import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  optimizeDeps: {
    exclude: ['@xenova/transformers', 'pdfjs-dist']
  },
  build: {
    rollupOptions: {
      external: ['@xenova/transformers', 'pdfjs-dist']
    }
  }
});
