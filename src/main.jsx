import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// Client-side payload encryption & obfuscation relay helper
const CLIENT_SECRET_SALT = 'frx_edge_sec_99481a';

function clientCipher(text) {
  let res = '';
  for (let i = 0; i < text.length; i++) {
    res += String.fromCharCode(text.charCodeAt(i) ^ CLIENT_SECRET_SALT.charCodeAt(i % CLIENT_SECRET_SALT.length));
  }
  return res;
}

export async function secureRelayRequest(endpoint, options = {}) {
  // Obfuscate outgoing payload
  const packet = {
    endpoint,
    method: options.method || 'GET',
    headers: options.headers || {},
    body: options.body || null,
    ts: Date.now(),
    nonce: Math.random().toString(36).substring(2, 12),
  };

  const ciphered = clientCipher(JSON.stringify(packet));
  const encoded = btoa(unescape(encodeURIComponent(ciphered)));

  // Send encrypted envelope to local /api/relay proxy instead of public gateway
  const res = await fetch('/api/relay', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Frenix-Shield': 'v1-enc',
    },
    body: JSON.stringify({ payload: encoded }),
  });

  const body = await res.json();
  if (body && body.enc) {
    // Decrypt obfuscated response
    const rawCipher = decodeURIComponent(escape(atob(body.enc)));
    const decrypted = clientCipher(rawCipher);
    const parsed = JSON.parse(decrypted);
    return {
      ok: res.ok,
      status: parsed.status,
      data: parsed.data,
    };
  }

  return {
    ok: res.ok,
    status: res.status,
    data: body,
  };
}

if (typeof window !== 'undefined') {
  window.secureRelayRequest = secureRelayRequest;
}

// DevTools protection temporarily unlocked for debugging
const DEV_TOOLS_PROTECTION_ENABLED = false;

if (DEV_TOOLS_PROTECTION_ENABLED && typeof window !== 'undefined') {
  // 1. Prevent right click context menu inspection
  window.addEventListener('contextmenu', (e) => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      return false;
    }
  });

  // 2. Prevent DevTools shortcuts
  window.addEventListener('keydown', (e) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c', 'K', 'k'].includes(e.key)) ||
      (e.metaKey && e.altKey && ['I', 'i', 'J', 'j', 'C', 'c', 'K', 'k'].includes(e.key)) ||
      (e.ctrlKey && ['u', 'U', 's', 'S', 'p', 'P'].includes(e.key))
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);