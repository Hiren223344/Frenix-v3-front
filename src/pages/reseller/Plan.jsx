import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Check, Wrench, X } from 'lucide-react';
import { sessionToken, authedRequest, formatLimit } from './shared';
import { NotATenantNotice, LoadingNotice, ErrorNotice } from './EmptyState';

function TierCard({ tier, accentDisplay, isCurrent, onSelect, selecting }) {
  const isTokenMode = tier.billing_mode === 'token';
  return (
    <div
      className="hover-lift"
      style={{
        border: isCurrent ? '1.5px solid var(--text)' : '1px solid var(--border)',
        borderRadius: '18px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--card)',
        position: 'relative',
      }}
    >
      {isCurrent && (
        <div style={{ position: 'absolute', top: '-11px', right: '20px', background: 'var(--text)', color: 'var(--bg)', fontSize: '11px', padding: '2px 12px', borderRadius: '12px', fontWeight: 500 }}>
          Current plan
        </div>
      )}
      <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '4px' }}>{tier.name}</div>
      <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>
        {tier.description || (isTokenMode ? 'Token-metered plan' : 'Request-metered plan')}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '18px' }}>
        <span style={{ fontSize: '28px', fontWeight: 300 }}>
          {tier.price_monthly != null ? `$${tier.price_monthly.toFixed(2)}` : '—'}
        </span>
        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>/ month</span>
      </div>
      <div style={{ borderTop: '1px solid var(--border)', marginBottom: '14px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '18px', flex: 1 }}>
        {isTokenMode ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Check size={15} color={accentDisplay} />
            {formatLimit(tier.monthly_token_limit)} tokens / month
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Check size={15} color={accentDisplay} />
              {formatLimit(tier.daily_request_limit)} requests / day
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Check size={15} color={accentDisplay} />
              {formatLimit(tier.tpm_limit)} tokens / minute
            </div>
          </>
        )}
      </div>
      <button
        onClick={() => onSelect(tier.id)}
        disabled={isCurrent || selecting}
        className="button-press"
        style={{
          width: '100%',
          padding: '10px 0',
          borderRadius: '20px',
          border: isCurrent ? '1px solid var(--border)' : 'none',
          backgroundColor: isCurrent ? 'transparent' : 'var(--text)',
          color: isCurrent ? 'var(--muted)' : 'var(--bg)',
          fontSize: '13px',
          fontWeight: 500,
          cursor: isCurrent || selecting ? 'default' : 'pointer',
          opacity: selecting ? 0.6 : 1,
        }}
      >
        {isCurrent ? 'Current plan' : 'Switch to this plan'}
      </button>
    </div>
  );
}

function CustomTierBuilder({ token }) {
  const [tokenLimit, setTokenLimit] = useState('50000000');
  const [preview, setPreview] = useState(null);
  const [createResult, setCreateResult] = useState(null);
  const [error, setError] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const runPreview = async () => {
    setError('');
    setCreateResult(null);
    setLoading(true);
    try {
      const res = await authedRequest('/reselling/tiers/custom/preview', token, {
        method: 'POST',
        body: { monthly_token_limit: Number(tokenLimit) },
      });
      if (res.status === 404) {
        setDisabled(true);
        return;
      }
      if (!res.ok) {
        setError(res.data?.error?.message || `Preview failed (HTTP ${res.status})`);
        return;
      }
      setPreview(res.data);
    } catch (err) {
      setError(err.message || 'Preview failed');
    } finally {
      setLoading(false);
    }
  };

  const runCreate = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await authedRequest('/reselling/tiers/custom', token, {
        method: 'POST',
        body: { monthly_token_limit: Number(tokenLimit) },
      });
      if (res.status === 404) {
        setDisabled(true);
        return;
      }
      if (!res.ok) {
        setError(res.data?.error?.message || `Create failed (HTTP ${res.status})`);
        return;
      }
      setCreateResult(res.data);
    } catch (err) {
      setError(err.message || 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ marginTop: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <Wrench size={20} />
        <h2 style={{ fontSize: '20px', fontWeight: 500, margin: 0 }}>Custom tier builder</h2>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '4px 0 18px 0' }}>
        Feature-flagged and test-only — disabled by default in every environment. Builds a
        tenant-owned token-mode tier priced off an admin-set $/million-token rate, capped at the
        Max tier's limits. Creating one charges an informational $7 one-time fee — nothing is
        actually collected yet.
      </p>

      {disabled ? (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', fontSize: '13px', color: 'var(--muted)' }}>
          <X size={16} />
          Not available in this environment — the custom tier builder is disabled here.
        </div>
      ) : (
        <div style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', backgroundColor: 'var(--card)' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' }}>
            Monthly token limit
          </label>
          <input
            type="number"
            min="1"
            step="1000000"
            value={tokenLimit}
            onChange={(e) => setTokenLimit(e.target.value)}
            style={{ width: '100%', maxWidth: '280px', padding: '9px 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text)', fontSize: '13px', outline: 'none', marginBottom: '16px' }}
          />
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <button onClick={runPreview} disabled={loading} className="button-press" style={{ padding: '9px 18px', borderRadius: '18px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text)', fontSize: '13px', fontWeight: 500, cursor: loading ? 'default' : 'pointer' }}>
              Preview price
            </button>
            <button onClick={runCreate} disabled={loading} className="button-press" style={{ padding: '9px 18px', borderRadius: '18px', border: 'none', backgroundColor: 'var(--text)', color: 'var(--bg)', fontSize: '13px', fontWeight: 500, cursor: loading ? 'default' : 'pointer' }}>
              Create tier
            </button>
          </div>

          {error && <div style={{ fontSize: '13px', color: '#ef4444', marginBottom: '10px' }}>{error}</div>}

          {preview && !createResult && (
            <div style={{ fontSize: '13px', lineHeight: 1.8 }}>
              <div>Rate: ${preview.token_rate_per_million.toFixed(4)} / million tokens</div>
              <div>Computed price: <strong>${preview.monthly_price.toFixed(2)}/mo</strong></div>
            </div>
          )}

          {createResult && (
            <div style={{ fontSize: '13px', lineHeight: 1.8, color: '#16a34a' }}>
              <div>Tier created (pricing_group_id {createResult.pricing_group_id})</div>
              <div>Monthly price: ${createResult.monthly_price.toFixed(2)}</div>
              <div>One-time creation fee: ${createResult.creation_fee.toFixed(2)} (informational only)</div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default function ResellerPlan() {
  const { accentDisplay } = useTheme();
  const { user } = useAuth();
  const [tiers, setTiers] = useState(null);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [notTenant, setNotTenant] = useState(false);
  const [error, setError] = useState('');
  const [selecting, setSelecting] = useState(false);
  const [message, setMessage] = useState('');

  const token = sessionToken(user);

  const load = useCallback(async () => {
    try {
      const tiersRes = await window.secureRelayRequest('/reselling/tiers', { method: 'GET' });
      if (!tiersRes.ok) {
        setError(tiersRes.data?.error?.message || `Failed to load plans (HTTP ${tiersRes.status})`);
        return;
      }
      setTiers(tiersRes.data?.tiers || []);

      if (!token) return;
      const meRes = await authedRequest('/reselling/me', token, { method: 'GET' });
      if (meRes.status === 404) {
        setNotTenant(true);
        return;
      }
      if (meRes.ok) setCurrentPlanId(meRes.data?.plan?.id ?? null);
    } catch (err) {
      setError(err.message || 'Failed to load plans');
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const selectPlan = async (pricingGroupId) => {
    if (!token) {
      setError('No active session found — please sign in again.');
      return;
    }
    setSelecting(true);
    setMessage('');
    try {
      const res = await authedRequest('/reselling/plan', token, {
        method: 'POST',
        body: { pricing_group_id: pricingGroupId },
      });
      if (!res.ok) {
        setError(res.data?.error?.message || `Failed to switch plan (HTTP ${res.status})`);
        return;
      }
      setCurrentPlanId(pricingGroupId);
      setMessage(res.data?.message || 'Plan changed.');
    } catch (err) {
      setError(err.message || 'Failed to switch plan');
    } finally {
      setSelecting(false);
    }
  };

  if (notTenant) return <NotATenantNotice />;

  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 18px 0' }}>
        These are the same base tiers a normal (non-reseller) Frenix account buys into — a
        reseller can additionally rebrand one for their own buyers on the{' '}
        <a href="/reseller/buyers">Buyers</a> page.
      </p>

      {error && <ErrorNotice message={error} />}
      {message && <div style={{ fontSize: '13px', color: '#16a34a', marginBottom: '14px' }}>{message}</div>}
      {!tiers && !error && <LoadingNotice label="Loading plans…" />}

      {tiers && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {tiers.map((tier) => (
            <TierCard
              key={tier.id}
              tier={tier}
              accentDisplay={accentDisplay}
              isCurrent={tier.id === currentPlanId}
              onSelect={selectPlan}
              selecting={selecting}
            />
          ))}
        </div>
      )}

      {token && <CustomTierBuilder token={token} />}
    </div>
  );
}
