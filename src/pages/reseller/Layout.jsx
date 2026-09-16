import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { AlertTriangle, LayoutDashboard, Puzzle, Users } from 'lucide-react';

// Plan browsing/switching lives on the main Pricing page (see
// src/pages/Pricing.jsx) — it applies to every account, reseller or not,
// so it isn't duplicated here. A reseller's own rebrand of a plan for
// their buyers still lives on the Buyers tab below.
const TABS = [
  { to: '/reseller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/reseller/addon', label: 'Addons', icon: Puzzle },
  { to: '/reseller/buyers', label: 'Buyers', icon: Users },
];

function TestOnlyBanner() {
  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        padding: '14px 18px',
        borderRadius: '14px',
        border: '1px solid #f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.08)',
        marginBottom: '28px',
      }}
    >
      <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '1px' }} />
      <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
        <strong>Testing only — none of this is live in production.</strong> This whole reseller
        portal is newly built and still being verified end to end. No payment is actually
        collected by any action here yet; prices shown are informational only.
      </div>
    </div>
  );
}

const tabStyle = ({ isActive }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '7px',
  padding: '8px 16px',
  borderRadius: '18px',
  fontSize: '13px',
  fontWeight: isActive ? 500 : 400,
  color: isActive ? 'var(--bg)' : 'var(--text)',
  backgroundColor: isActive ? 'var(--text)' : 'transparent',
  border: isActive ? 'none' : '1px solid var(--border)',
  whiteSpace: 'nowrap',
});

// Shared shell for the whole reseller self-service portal: the test-only
// banner and the Dashboard/Addons/Buyers tab strip, with each tab's
// page rendered through the Outlet. Mounted at /reseller/* behind
// ProtectedRoute (see App.jsx) — every page under it assumes an
// authenticated session, and each page handles for itself the case where
// that session isn't a reseller tenant yet (GET /reselling/me 404s).
export default function ResellerLayout() {
  return (
    <div className="animate-fadeInUp" style={{ padding: '64px 0 96px 0' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 300, margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
          Reseller Portal (Test)
        </h1>
        <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--muted)', margin: 0, maxWidth: '620px' }}>
          Manage your addons and buyer price sheet — a live test surface against the backend, not
          a finished self-serve product yet.
        </p>
      </div>

      <TestOnlyBanner />

      <nav style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} style={tabStyle}>
            <Icon size={14} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}
