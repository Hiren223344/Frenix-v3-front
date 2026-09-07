import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// The gateway lives on a different domain than this app in production, so
// calls go straight to it (the gateway sends the CORS headers that make
// that allowed). In dev, relative paths already reach the gateway via the
// Vite proxy configured in vite.config.js, so no base URL is needed there.
const GATEWAY_BASE_URL = import.meta.env.DEV ? '' : 'https://api.frenix.sh';

export async function secureRelayRequest(endpoint, options = {}) {
  const res = await fetch(`${GATEWAY_BASE_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    // No JSON body (e.g. an empty 204 response).
  }

  return { ok: res.ok, status: res.status, data };
}

if (typeof window !== 'undefined') {
  window.secureRelayRequest = secureRelayRequest;
}

// Capture a referral code from a ?ref=<code> link and remember it for the
// signup flow (TelegramAuthModal reads this when starting a Telegram
// login) — the modal itself has no reason to know about URL query params,
// and the code needs to survive from this first page load through to
// whenever the visitor actually signs up, possibly several clicks later.
if (typeof window !== 'undefined') {
  try {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) {
      localStorage.setItem('frenix_referral_code', ref);
    }
  } catch (_) {
    // localStorage can throw in a locked-down browser context; a missed
    // referral code is not worth breaking page load over.
  }
}

// Deterrent only, not a real security boundary — a determined user can
// still open DevTools (browser menu, detached window, disabling JS
// briefly). Actual protection is server-side: auth on every request,
// secrets never sent to the client, no direct DB/Redis access from here.
const DEV_TOOLS_PROTECTION_ENABLED = true;

if (DEV_TOOLS_PROTECTION_ENABLED && typeof window !== 'undefined') {
  // 1. Prevent right click context menu inspection
  window.addEventListener('contextmenu', (e) => {
    // Elements holding a copyable secret (API keys, referral links) opt out
    // via data-copyable: on mobile, "long-press to select/copy" is the
    // native fallback when the Clipboard API's copy button fails (blocked
    // permission, no secure context, etc.), and it depends on this same
    // contextmenu/selection event. Blocking it there left users with no way
    // to copy their own key at all if the JS copy button didn't work.
    if (
      e.target.tagName !== 'INPUT' &&
      e.target.tagName !== 'TEXTAREA' &&
      !e.target.closest('[data-copyable]')
    ) {
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