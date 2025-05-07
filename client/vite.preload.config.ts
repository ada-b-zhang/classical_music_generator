import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist/preload', // ✅ Typically relative to project root, adjust if needed
    lib: {
      entry: path.resolve(__dirname, 'src/preload/preload.ts'),
      formats: ['cjs'], // ✅ CommonJS for Electron preload
    },
    rollupOptions: {
      output: {
        entryFileNames: 'preload.js',
      },
      external: [
        'electron',
        'fs',
        'path',
        'url',
      ],
    },
    emptyOutDir: true,
    sourcemap: true,
    target: 'node16', // ✅ Good for Electron 20+
  },
});
