import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Frenix Edge Gateway Proxy & Payload Obfuscation Relay
const FRENIX_GATEWAY = 'https://api.frenix.sh';
const SECRET_SALT = 'frx_edge_sec_99481a';

function xorCipher(text) {
  let res = '';
  for (let i = 0; i < text.length; i++) {
    res += String.fromCharCode(text.charCodeAt(i) ^ SECRET_SALT.charCodeAt(i % SECRET_SALT.length));
  }
  return res;
}

function decodeFrontendPayload(b64) {
  try {
    const raw = Buffer.from(b64, 'base64').toString('utf-8');
    const decrypted = xorCipher(raw);
    return JSON.parse(decrypted);
  } catch (err) {
    return null;
  }
}

function encodeFrontendPayload(data) {
  const json = JSON.stringify(data);
  const ciphered = xorCipher(json);
  return Buffer.from(ciphered, 'utf-8').toString('base64');
}

function secureApiPlugin() {
  return {
    name: 'frenix-secure-api-relay',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/relay')) {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            return res.end('Method Not Allowed');
          }

          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              let parsedBody;
              try {
                parsedBody = JSON.parse(body);
              } catch (_) {
                res.statusCode = 400;
                return res.end('Invalid request');
              }

              const encryptedEnvelope = parsedBody.payload;
              if (!encryptedEnvelope) {
                res.statusCode = 400;
                return res.end('Malformed encrypted payload');
              }

              const decrypted = decodeFrontendPayload(encryptedEnvelope);
              if (!decrypted || !decrypted.endpoint) {
                res.statusCode = 400;
                return res.end('Security verification failed');
              }

              const targetUrl = `${FRENIX_GATEWAY}${decrypted.endpoint}`;
              const upstreamRes = await fetch(targetUrl, {
                method: decrypted.method || 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Origin': 'https://frenix.sh',
                  ...(decrypted.headers || {})
                },
                body: decrypted.body ? JSON.stringify(decrypted.body) : undefined
              });

              const contentType = upstreamRes.headers.get('content-type') || '';
              let responseData;
              if (contentType.includes('application/json')) {
                responseData = await upstreamRes.json();
              } else {
                responseData = await upstreamRes.text();
              }

              const obfuscatedResponse = encodeFrontendPayload({
                status: upstreamRes.status,
                data: responseData
              });

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = upstreamRes.status;
              res.end(JSON.stringify({ enc: obfuscatedResponse }));
            } catch (proxyErr) {
              res.statusCode = 502;
              res.end(JSON.stringify({ error: 'Gateway relay error' }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), secureApiPlugin()],
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