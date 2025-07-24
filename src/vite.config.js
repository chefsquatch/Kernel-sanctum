optimizeDeps: {
  exclude: ['@xenova/transformers', 'pdfjs-dist']
},
build: {
  rollupOptions: {
    external: ['@xenova/transformers', 'pdfjs-dist']
}
}
