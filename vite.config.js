import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    sourcemap: false, // Prevents exposing original source code in DevTools
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        compact: true,
        // Obfuscate chunk and asset filenames with hashes
        entryFileNames: 'assets/[hash].js',
        chunkFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]',
      },
    },
  },
  esbuild: {
    // Strip all debug output and assertions
    drop: ['console', 'debugger'],
    legalComments: 'none',
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/v1': {
        target: 'https://api.frenix.sh',
        changeOrigin: true,
        secure: true,
        headers: {
          Origin: 'https://frenix.sh'
        }
      },
      '/healthz': {
        target: 'https://api.frenix.sh',
        changeOrigin: true,
        secure: true,
        headers: {
          Origin: 'https://frenix.sh'
        }
      }
    }
  }
});