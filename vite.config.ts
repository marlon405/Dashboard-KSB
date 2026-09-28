import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// Für GitHub Pages muss der Basis-Pfad dem Repository-Namen entsprechen.
// Lokal (dev/preview) wird unter "/" ausgeliefert.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Dashboard-KSB/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    host: true,
  },
}));
