import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Package, Puzzle, Wrench, Check, X, Loader2 } from 'lucide-react';

// Test-only surface for the reseller pricing tiers / addons / custom tier
// builder work — none of this is wired into checkout or billing yet (see
// the banner below), it exists so the new backend endpoints can be
// exercised from a real browser session while that work is verified.

function sessionToken(user) {
  return user?.sessionToken || (typeof window !== 'undefined' ? localStorage.getItem('frenix_session_token') : null);
}

function formatLimit(n) {
  if (n == null) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}k`;
  return `${n}`;
}

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
        marginBottom: '32px',
      }}
    >
      <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '1px' }} />
      <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
        <strong>Testing only — none of this is live in production.</strong> Pricing tiers, addon
        subscriptions, and the custom tier builder below are newly built and still being verified.
        No payment is actually collected by any action on this page yet; prices shown are
        informational only.
      </div>
    </div>
  );
}

function SectionHeading({ icon, title, subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
      {icon}
      <h2 style={{ fontSize: '20px', fontWeight: 500, margin: 0 }}>{title}</h2>
    </div>
  );
}

function TierCard({ tier, accentDisplay }) {
  const isTokenMode = tier.billing_mode === 'token';
  return (
    <div
      className="hover-lift"
      style={{
        border: '1px solid var(--border)',
        borderRadius: '18px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--card)',
      }}
    >
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
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
        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
          Billing mode: {tier.billing_mode}
        </div>
      </div>
    </div>
  );
}

function TiersSection({ accentDisplay }) {
  const [tiers, setTiers] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await window.secureRelayRequest('/reselling/tiers', { method: 'GET' });
        if (cancelled) return;
        if (!res.ok) {
          setError(res.data?.error?.message || `Failed to load tiers (HTTP ${res.status})`);
          return;
        }
        setTiers(res.data?.tiers || []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load tiers');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section style={{ marginBottom: '48px' }}>
      <SectionHeading icon={<Package size={20} />} title="Pricing tiers" />
      <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '4px 0 18px 0' }}>
        The base reseller tiers, each capped by token quota or by daily requests + tokens/minute
        (never both) — see GET /reselling/tiers.
      </p>
      {error && <div style={{ fontSize: '13px', color: '#ef4444' }}>{error}</div>}
      {!error && !tiers && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', fontSize: '13px' }}>
          <Loader2 size={14} className="animate-spin" /> Loading tiers…
        </div>
      )}
      {tiers && tiers.length === 0 && (
        <div style={{ fontSize: '13px', color: 'var(--muted)' }}>No sellable tiers are configured yet.</div>
      )}
      {tiers && tiers.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {tiers.map((tier) => (
            <TierCard key={tier.id} tier={tier} accentDisplay={accentDisplay} />
          ))}
        </div>
      )}
    </section>
  );
}

function AddonRow({ addon, onSubscribe, onCancel, pendingSlug, lastResult }) {
  const isPending = pendingSlug === addon.slug;
  const result = lastResult?.slug === addon.slug ? lastResult : null;
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 18px',
        borderRadius: '14px',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--card)',
      }}
    >
      <div style={{ flex: '1 1 220px', minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 500 }}>{addon.name}</div>
        {addon.description && (
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{addon.description}</div>
        )}
        {result && (
          <div style={{ fontSize: '11px', color: result.ok ? '#16a34a' : '#ef4444', marginTop: '6px' }}>
            {result.message}
          </div>
        )}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--muted)', flexShrink: 0 }}>
        ${addon.price_monthly.toFixed(2)}/mo
      </div>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={() => onSubscribe(addon.slug)}
          disabled={isPending}
          className="button-press"
          style={{
            padding: '7px 14px',
            borderRadius: '18px',
            border: 'none',
            backgroundColor: 'var(--text)',
            color: 'var(--bg)',
            fontSize: '12px',
            fontWeight: 500,
            cursor: isPending ? 'default' : 'pointer',
            opacity: isPending ? 0.6 : 1,
          }}
        >
          Subscribe
        </button>
        <button
          onClick={() => onCancel(addon.slug)}
          disabled={isPending}
          className="button-press"
          style={{
            padding: '7px 14px',
            borderRadius: '18px',
            border: '1px solid var(--border)',
            backgroundColor: 'transparent',
            color: 'var(--text)',
            fontSize: '12px',
            fontWeight: 500,
            cursor: isPending ? 'default' : 'pointer',
            opacity: isPending ? 0.6 : 1,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function AddonsSection({ isAuthenticated, user, openAuthModal }) {
  const [addons, setAddons] = useState(null);
  const [error, setError] = useState('');
  const [pendingSlug, setPendingSlug] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await window.secureRelayRequest('/reselling/addons', { method: 'GET' });
        if (cancelled) return;
        if (!res.ok) {
          setError(res.data?.error?.message || `Failed to load addons (HTTP ${res.status})`);
          return;
        }
        setAddons(res.data?.addons || []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load addons');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const act = useCallback(
    async (slug, action) => {
      if (!isAuthenticated) {
        openAuthModal();
        return;
      }
      const token = sessionToken(user);
      if (!token) {
        setLastResult({ slug, ok: false, message: 'No active session found — please sign in again.' });
        return;
      }
      setPendingSlug(slug);
      try {
        const res = await window.secureRelayRequest(`/reselling/addons/${encodeURIComponent(slug)}/${action}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setLastResult({ slug, ok: false, message: res.data?.error?.message || `Failed (HTTP ${res.status})` });
          return;
        }
        const status = res.data?.status || (action === 'cancel' ? 'cancelled' : 'active');
        setLastResult({
          slug,
          ok: true,
          message: res.data?.message || `Status: ${status}`,
        });
      } catch (err) {
        setLastResult({ slug, ok: false, message: err.message || 'Request failed' });
      } finally {
        setPendingSlug(null);
      }
    },
    [isAuthenticated, user, openAuthModal]
  );

  return (
    <section style={{ marginBottom: '48px' }}>
      <SectionHeading icon={<Puzzle size={20} />} title="Addons" />
      <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '4px 0 18px 0' }}>
        Sold directly to reseller companies, not resold further. Subscribing grants a 30-day
        period — there's no recurring billing job yet, so re-subscribe after it lapses.
        {!isAuthenticated && ' Sign in to subscribe or cancel.'}
      </p>
      {error && <div style={{ fontSize: '13px', color: '#ef4444' }}>{error}</div>}
      {!error && !addons && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', fontSize: '13px' }}>
          <Loader2 size={14} className="animate-spin" /> Loading addons…
        </div>
      )}
      {addons && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {addons.map((addon) => (
            <AddonRow
              key={addon.slug}
              addon={addon}
              onSubscribe={(slug) => act(slug, 'subscribe')}
              onCancel={(slug) => act(slug, 'cancel')}
              pendingSlug={pendingSlug}
              lastResult={lastResult}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CustomTierBuilderSection({ isAuthenticated, user, openAuthModal }) {
  const [tokenLimit, setTokenLimit] = useState('50000000');
  const [preview, setPreview] = useState(null);
  const [createResult, setCreateResult] = useState(null);
  const [error, setError] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const requireAuth = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return null;
    }
    const token = sessionToken(user);
    if (!token) {
      setError('No active session found — please sign in again.');
      return null;
    }
    return token;
  };

  const runPreview = async () => {
    const token = requireAuth();
    if (!token) return;
    setError('');
    setCreateResult(null);
    setLoading(true);
    try {
      const res = await window.secureRelayRequest('/reselling/tiers/custom/preview', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
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
    const token = requireAuth();
    if (!token) return;
    setError('');
    setLoading(true);
    try {
      const res = await window.secureRelayRequest('/reselling/tiers/custom', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
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
    <section style={{ marginBottom: '32px' }}>
      <SectionHeading icon={<Wrench size={20} />} title="Custom tier builder" />
      <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '4px 0 18px 0' }}>
        Feature-flagged and test-only — disabled by default in every environment
        (ENABLE_CUSTOM_TIER_BUILDER). Builds a tenant-owned token-mode tier priced off an
        admin-set $/million-token rate, capped at the Max tier's limits. Creating one charges an
        informational $7 one-time fee — nothing is actually collected yet.
      </p>

      {disabled ? (
        <div
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            padding: '14px 16px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--card)',
            fontSize: '13px',
            color: 'var(--muted)',
          }}
        >
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
            style={{
              width: '100%',
              maxWidth: '280px',
              padding: '9px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
              fontSize: '13px',
              outline: 'none',
              marginBottom: '16px',
            }}
          />
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <button
              onClick={runPreview}
              disabled={loading}
              className="button-press"
              style={{
                padding: '9px 18px',
                borderRadius: '18px',
                border: '1px solid var(--border)',
                backgroundColor: 'transparent',
                color: 'var(--text)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: loading ? 'default' : 'pointer',
              }}
            >
              Preview price
            </button>
            <button
              onClick={runCreate}
              disabled={loading}
              className="button-press"
              style={{
                padding: '9px 18px',
                borderRadius: '18px',
                border: 'none',
                backgroundColor: 'var(--text)',
                color: 'var(--bg)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: loading ? 'default' : 'pointer',
              }}
            >
              Create tier
            </button>
          </div>

          {error && <div style={{ fontSize: '13px', color: '#ef4444', marginBottom: '10px' }}>{error}</div>}

          {preview && !createResult && (
            <div style={{ fontSize: '13px', lineHeight: 1.8 }}>
              <div>Rate: ${preview.token_rate_per_million.toFixed(4)} / million tokens</div>
              <div>
                Computed price: <strong>${preview.monthly_price.toFixed(2)}/mo</strong>
              </div>
            </div>
          )}

          {createResult && (
            <div style={{ fontSize: '13px', lineHeight: 1.8, color: '#16a34a' }}>
              <div>Tier created (pricing_group_id {createResult.pricing_group_id})</div>
              <div>Monthly price: ${createResult.monthly_price.toFixed(2)}</div>
              <div>One-time creation fee: ${createResult.creation_fee.toFixed(2)} (informational only)</div>
              {createResult.message && <div style={{ color: 'var(--muted)' }}>{createResult.message}</div>}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default function Reselling() {
  const { accentDisplay } = useTheme();
  const { isAuthenticated, user, openAuthModal } = useAuth();

  return (
    <div className="animate-fadeInUp" style={{ padding: '64px 0 96px 0' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 300, margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
          Reseller Program (Test)
        </h1>
        <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--muted)', margin: 0, maxWidth: '620px' }}>
          Pricing tiers, addons, and the custom tier builder for reseller tenants — a live test
          surface against the backend, not a finished checkout flow.
        </p>
      </div>

      <TestOnlyBanner />

      <TiersSection accentDisplay={accentDisplay} />
      <AddonsSection isAuthenticated={isAuthenticated} user={user} openAuthModal={openAuthModal} />
      <CustomTierBuilderSection isAuthenticated={isAuthenticated} user={user} openAuthModal={openAuthModal} />
    </div>
  );
}
