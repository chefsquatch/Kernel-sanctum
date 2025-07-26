import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['@xenova/transformers', 'pdfjs-dist']
  },
  build: {
    rollupOptions: {
      external: ['@xenova/transformers', 'pdfjs-dist']
    }
  }
});