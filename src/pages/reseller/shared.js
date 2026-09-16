// Shared helpers for the /reseller/* portal pages — kept out of any one
// page so Dashboard/Plan/Addon/Buyers can't drift on how they read the
// session token or format a limit number.

export function sessionToken(user) {
  return user?.sessionToken || (typeof window !== 'undefined' ? localStorage.getItem('frenix_session_token') : null);
}

export function formatLimit(n) {
  if (n == null) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}k`;
  return `${n}`;
}

// authedRequest wraps window.secureRelayRequest with the Bearer session
// header every protected /reselling/* call needs — the same header shape
// Dashboard.jsx already uses for /v1/* calls.
export async function authedRequest(endpoint, token, options = {}) {
  return window.secureRelayRequest(endpoint, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
  });
}
