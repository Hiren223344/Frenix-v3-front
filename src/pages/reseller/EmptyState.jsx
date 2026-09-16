import React from 'react';
import { Info } from 'lucide-react';

// Shown on every /reseller/* page when the signed-in account isn't a
// reseller tenant yet (every /reselling/* protected endpoint 404s with
// "this account is not a reseller tenant" in that case — see the
// backend's Handlers.tenants.GetByUserID checks). There's no trial-signup
// form wired into this portal yet, so this just explains the gap rather
// than pretending it's one click away.
export function NotATenantNotice() {
  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
        padding: '16px 18px',
        borderRadius: '14px',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--card)',
        fontSize: '13px',
        color: 'var(--muted)',
        lineHeight: 1.6,
      }}
    >
      <Info size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
      <span>
        This account isn't a reseller tenant yet (no trial-signup form is wired into this portal
        yet — the backend's <code>POST /reselling/trial</code> endpoint exists, but this UI
        doesn't call it). Sign up via that endpoint directly to get a tenant, then reload this
        page.
      </span>
    </div>
  );
}

export function LoadingNotice({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', fontSize: '13px' }}>
      {label || 'Loading…'}
    </div>
  );
}

export function ErrorNotice({ message }) {
  return <div style={{ fontSize: '13px', color: '#ef4444' }}>{message}</div>;
}
