import React from 'react';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';

// Shown on every /reseller/* page when the signed-in account isn't a
// reseller tenant yet (every /reselling/* protected endpoint 404s with
// "this account is not a reseller tenant" in that case — see the
// backend's Handlers.tenants.GetByUserID checks). Points at the
// onboarding wizard (see Onboarding.jsx) rather than the old advice to
// call POST /reselling/trial by hand.
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
        This account isn't a reseller tenant yet.{' '}
        <Link to="/reseller/onboarding" style={{ color: 'var(--text)', fontWeight: 500 }}>
          Start onboarding
        </Link>{' '}
        to create your reseller account, claim a domain, and get an API key.
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
