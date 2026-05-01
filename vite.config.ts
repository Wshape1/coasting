import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig({
  base: process.env.VITE_BASE ?? '/coasting/',
  plugins: [
    react(),
    tailwindcss(),
    ...(process.env.ANALYZE
      ? [
          visualizer({
            filename: 'dist/stats.html',
            open: false,
            gzipSize: true,
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('/three/') || id.includes('\\three\\')) {
            return 'three';
          }
          if (id.includes('@react-three/fiber')) {
            return 'r3f';
          }
          if (id.includes('@tanstack/react-query')) {
            return 'query';
          }
          if (id.includes('zustand')) {
            return 'state';
          }
        },
      },
    },
  },
});
