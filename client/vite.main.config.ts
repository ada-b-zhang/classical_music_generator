// client/vite.main.config.ts
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist/main',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/main/main.ts'),
      },
      output: {
        entryFileNames: 'main.js',
      },
      external: [
        'electron',
        'fs',
        'path',
        'url'
      ],
    },
    emptyOutDir: true,
    sourcemap: true,
    target: 'node16'
  },
  plugins: [
    {
      name: 'copy-config-after-build',
      closeBundle() {
        const { execSync } = require('child_process');
        execSync('node scripts/postbuild.js');
      }
    }
  ]
});
