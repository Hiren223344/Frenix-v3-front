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
        // Keep rarely-changing vendor code in its own chunk, separate
        // from per-route lazy chunks, so a returning visitor's cached
        // vendor chunk survives an app-code deploy. Function form (not
        // the object form) because this project's Vite build is backed
        // by rolldown, which only accepts a function here.
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor';
          }
        },
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
      },
      '/reselling': {
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
