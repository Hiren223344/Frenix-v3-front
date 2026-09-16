import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, Wallet, Clock, Package, Puzzle } from 'lucide-react';
import { sessionToken, authedRequest } from './shared';
import { NotATenantNotice, LoadingNotice, ErrorNotice } from './EmptyState';

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '20px',
        backgroundColor: 'var(--card)',
        flex: '1 1 200px',
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', fontSize: '12px', marginBottom: '10px' }}>
        <Icon size={14} />
        <span>{label}</span>
      </div>
      <div style={{ fontSize: '22px', fontWeight: 500 }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}

export default function ResellerDashboard() {
  const { user } = useAuth();
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');
  const [notTenant, setNotTenant] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = sessionToken(user);
      if (!token) {
        setError('No active session found — please sign in again.');
        return;
      }
      try {
        const res = await authedRequest('/reselling/me', token, { method: 'GET' });
        if (cancelled) return;
        if (res.status === 404) {
          setNotTenant(true);
          return;
        }
        if (!res.ok) {
          setError(res.data?.error?.message || `Failed to load dashboard (HTTP ${res.status})`);
          return;
        }
        setMe(res.data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load dashboard');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (notTenant) return <NotATenantNotice />;
  if (error) return <ErrorNotice message={error} />;
  if (!me) return <LoadingNotice label="Loading your dashboard…" />;

  const isTokenMode = me.plan.billing_mode === 'token';

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Building2 size={20} />
        </div>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 500 }}>{me.business_name}</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
            {me.domain || 'no domain claimed'} · status: <strong>{me.status}</strong>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '28px' }}>
        <StatCard
          icon={Wallet}
          label="Credit balance"
          value={`$${(me.credit_balance / 1_000_000).toFixed(2)}`}
          sub={`started with $${(me.trial_credits_granted / 1_000_000).toFixed(2)} trial credit`}
        />
        <StatCard
          icon={Package}
          label="Current plan"
          value={me.plan.name}
          sub={me.plan.price_monthly != null ? `$${me.plan.price_monthly.toFixed(2)}/mo · ${isTokenMode ? 'token' : 'request'} mode` : 'no monthly price set'}
        />
        <StatCard icon={Puzzle} label="Active addons" value={me.active_addon_count} />
        {me.status === 'trial' && me.trial_expires_at && (
          <StatCard
            icon={Clock}
            label="Trial expires"
            value={new Date(me.trial_expires_at).toLocaleDateString()}
          />
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <Link
          to="/reseller/plan"
          style={{ padding: '9px 18px', borderRadius: '18px', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '13px', fontWeight: 500 }}
        >
          Change plan
        </Link>
        <Link
          to="/reseller/addon"
          style={{ padding: '9px 18px', borderRadius: '18px', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '13px', fontWeight: 500 }}
        >
          Manage addons
        </Link>
        <Link
          to="/reseller/buyers"
          style={{ padding: '9px 18px', borderRadius: '18px', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '13px', fontWeight: 500 }}
        >
          Buyer price sheet
        </Link>
      </div>
    </div>
  );
}
