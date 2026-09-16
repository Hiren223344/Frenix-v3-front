import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Check, User, Layers, Zap, ExternalLink } from 'lucide-react';
import { sessionToken, authedRequest } from './reseller/shared';

function formatLimit(n) {
  if (n == null) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}k`;
  return `${n}`;
}

function PlanCard({ icon: Icon, badge, name, blurb, priceNode, ctaTo, ctaLabel, external, onAction, actionPending, actionMessage, actionOk, features, highlighted }) {
  const { accentDisplay } = useTheme();
  const ctaStyle = {
    width: '100%', padding: '11px 0',
    border: highlighted ? 'none' : '1px solid var(--text)',
    borderRadius: '22px', textAlign: 'center',
    backgroundColor: highlighted ? 'var(--text)' : 'transparent',
    color: highlighted ? 'var(--bg)' : 'var(--text)',
    fontSize: '14px', fontWeight: 500,
  };
  return (
    <div
      className="hover-lift"
      style={{
        border: highlighted ? '1.5px solid var(--text)' : '1px solid var(--border)',
        borderRadius: '18px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--card)',
        position: 'relative',
      }}
    >
      {highlighted && (
        <div style={{ position: 'absolute', top: '-11px', right: '24px', background: 'var(--text)', color: 'var(--bg)', fontSize: '11px', padding: '2px 12px', borderRadius: '12px', fontWeight: 500 }}>
          Most Popular
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} />
        </div>
        {badge && (
          <div style={{ fontSize: '11px', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '999px', padding: '3px 10px' }}>
            {badge}
          </div>
        )}
      </div>
      <div style={{ fontSize: '20px', fontWeight: 500, marginBottom: '4px' }}>{name}</div>
      <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '22px' }}>{blurb}</div>
      <div style={{ marginBottom: '22px' }}>{priceNode}</div>
      {external ? (
        <a
          href={ctaTo}
          target="_blank"
          rel="noopener noreferrer"
          className="button-press"
          style={{
            width: '100%', padding: '11px 0', border: '1px solid var(--text)', borderRadius: '22px',
            textAlign: 'center', backgroundColor: 'transparent', color: 'var(--text)', fontSize: '14px',
            fontWeight: 500, marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
        >
          <span>{ctaLabel}</span>
          <ExternalLink size={14} />
        </a>
      ) : onAction ? (
        <button
          onClick={onAction}
          disabled={actionPending}
          className="button-press"
          style={{ ...ctaStyle, marginBottom: '10px', cursor: actionPending ? 'default' : 'pointer', opacity: actionPending ? 0.6 : 1 }}
        >
          {actionPending ? 'Switching…' : ctaLabel}
        </button>
      ) : (
        <Link to={ctaTo} className="button-press" style={{ ...ctaStyle, marginBottom: '10px' }}>
          {ctaLabel}
        </Link>
      )}
      {actionMessage && (
        <div style={{ fontSize: '11px', color: actionOk ? '#16a34a' : '#ef4444', marginBottom: '14px' }}>{actionMessage}</div>
      )}
      <div style={{ borderTop: '1px solid var(--border)', marginBottom: '18px', marginTop: actionMessage ? 0 : '14px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Check size={16} color={accentDisplay} /> {f}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Pricing() {
  const { accentDisplay } = useTheme();
  const { isAuthenticated, user, openAuthModal } = useAuth();
  const [tiers, setTiers] = useState(null);
  const [error, setError] = useState('');
  const [pendingId, setPendingId] = useState(null);
  const [results, setResults] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await window.secureRelayRequest('/reselling/tiers', { method: 'GET' });
        if (cancelled) return;
        if (!res.ok) {
          setError(res.data?.error?.message || `Failed to load plans (HTTP ${res.status})`);
          return;
        }
        setTiers(res.data?.tiers || []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load plans');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectPlan = useCallback(
    async (tier) => {
      if (!isAuthenticated) {
        openAuthModal();
        return;
      }
      const token = sessionToken(user);
      if (!token) {
        setResults((r) => ({ ...r, [tier.id]: { ok: false, message: 'No active session found — please sign in again.' } }));
        return;
      }
      setPendingId(tier.id);
      try {
        const res = await authedRequest('/reselling/plan', token, {
          method: 'POST',
          body: { pricing_group_id: tier.id },
        });
        if (!res.ok) {
          setResults((r) => ({ ...r, [tier.id]: { ok: false, message: res.data?.error?.message || `Failed (HTTP ${res.status})` } }));
          return;
        }
        setResults((r) => ({ ...r, [tier.id]: { ok: true, message: res.data?.message || 'Plan changed.' } }));
      } catch (err) {
        setResults((r) => ({ ...r, [tier.id]: { ok: false, message: err.message || 'Request failed' } }));
      } finally {
        setPendingId(null);
      }
    },
    [isAuthenticated, user, openAuthModal]
  );

  return (
    <div className="animate-fadeInUp" style={{ padding: '64px 0 96px 0' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 300, margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
          Pricing Plans
        </h1>
        <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--muted)', margin: 0, maxWidth: '600px' }}>
          Simple pricing with predictable concurrency and throughput. No surprise bills or token markups.
          These are the same plans a reseller company resells under their own brand.
        </p>
        <p style={{ fontSize: '12px', color: '#f59e0b', margin: '10px 0 0 0' }}>
          Testing only — these plans aren't purchasable in production yet. Prices shown are informational.
        </p>
      </div>

      {error && <div style={{ fontSize: '13px', color: '#ef4444', marginBottom: '24px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '64px' }}>
        <PlanCard
          icon={User}
          badge="500 RPD"
          name="Free"
          blurb="For experimenting & testing Frenix"
          priceNode={<div style={{ fontSize: '32px', fontWeight: 300 }}>$0</div>}
          ctaTo="/dashboard"
          ctaLabel="Start Free"
          features={[
            'Access to free models tier',
            '500 requests per day (RPD)',
            '5 requests per minute burst',
            '1 active API key',
            'Telegram community support',
          ]}
        />

        {tiers === null && !error && (
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--muted)', fontSize: '13px' }}>Loading plans…</div>
        )}

        {tiers && tiers.map((tier, i) => {
          const isTokenMode = tier.billing_mode === 'token';
          const features = isTokenMode
            ? [`${formatLimit(tier.monthly_token_limit)} tokens included / month`, 'Unlimited access to all 150+ models', 'Automatic provider failover']
            : [`${formatLimit(tier.daily_request_limit)} requests / day`, `${formatLimit(tier.tpm_limit)} tokens / minute`, 'Unlimited access to all 150+ models', 'Automatic provider failover'];
          return (
            <PlanCard
              key={tier.id}
              icon={isTokenMode ? Layers : Zap}
              badge={isTokenMode ? 'Token metered' : 'Request metered'}
              name={tier.name}
              blurb={tier.description || (isTokenMode ? 'Token-metered plan' : 'Request-metered plan')}
              priceNode={
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 300 }}>${tier.price_monthly?.toFixed(2)}</span>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>/ month</span>
                </div>
              }
              ctaLabel={isAuthenticated ? `Choose ${tier.name}` : 'Sign in to choose'}
              onAction={() => selectPlan(tier)}
              actionPending={pendingId === tier.id}
              actionMessage={results[tier.id]?.message}
              actionOk={results[tier.id]?.ok}
              highlighted={i === 0}
              features={features}
            />
          );
        })}

        <PlanCard
          icon={ExternalLink}
          badge="Custom Limits"
          name="Enterprise"
          blurb="For high-scale production systems"
          priceNode={<div style={{ fontSize: '32px', fontWeight: 300 }}>Custom</div>}
          ctaTo="https://t.me/frenix_bot"
          ctaLabel="Contact on Telegram"
          external
          features={[
            'Dedicated throughput guarantees',
            'Custom SLA & uptime monitor',
            'Bring-your-own-keys (BYOK)',
            'SSO, team roles & audit logs',
            '24/7 dedicated Telegram engineer',
          ]}
        />
      </div>

      {/* Feature Comparison */}
      <div className="hover-lift" style={{ border: '1px solid var(--border)', borderRadius: '18px', padding: '32px', backgroundColor: 'var(--card)' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 400, margin: '0 0 16px 0' }}>Frequently Asked Pricing Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: '15px', marginBottom: '4px' }}>Can I switch plans anytime?</div>
            <div style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6 }}>Yes — plan changes take effect immediately right from this page.</div>
          </div>
          <div>
            <div style={{ fontWeight: 500, fontSize: '15px', marginBottom: '4px' }}>What's the difference between token-metered and request-metered plans?</div>
            <div style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6 }}>Token-metered plans (Pro/Max) cap total tokens used per month. Request-metered plans (Pro+/Max+) instead cap requests per day and tokens per minute, independently — useful if your traffic is bursty rather than steady.</div>
          </div>
          <div>
            <div style={{ fontWeight: 500, fontSize: '15px', marginBottom: '4px' }}>Need help picking a tier?</div>
            <div style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6 }}>Chat with our team directly via Telegram at <a href="https://t.me/frenix_bot" target="_blank" rel="noopener noreferrer" style={{ color: accentDisplay, textDecoration: 'underline' }}>@frenix_bot</a>.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
