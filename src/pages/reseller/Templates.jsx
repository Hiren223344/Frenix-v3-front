import React, { useState, useEffect, useCallback } from 'react';
import { Check, Users, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { sessionToken, authedRequest } from './shared';
import { ErrorNotice, LoadingNotice } from './EmptyState';

// Curated accent pairs for the mockup previews below — deterministically
// picked per template (by name) so the same design always gets the same
// look, without needing any real screenshot asset (none exist in the
// backend yet: templates only carry name/description/price/capacity, no
// image). See MockupPreview's own comment.
const PALETTES = [
  ['#6366f1', '#a5b4fc'],
  ['#059669', '#6ee7b7'],
  ['#d97706', '#fcd34d'],
  ['#db2777', '#f9a8d4'],
  ['#0891b2', '#67e8f9'],
];

function paletteFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTES[hash % PALETTES.length];
}

// A stylized "browser window" mockup standing in for a real screenshot —
// nothing in this codebase stores actual design images yet, so this draws
// a generic representative layout (nav bar, hero block, content blocks)
// tinted per-template, clearly a placeholder rather than a real preview.
function MockupPreview({ name }) {
  const [accent, light] = paletteFor(name);
  return (
    <div
      style={{
        borderRadius: '10px',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        backgroundColor: 'var(--bg)',
        marginBottom: '16px',
      }}
    >
      <div style={{ display: 'flex', gap: '5px', padding: '8px 10px', backgroundColor: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
      </div>
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ width: '34%', height: '8px', borderRadius: '4px', backgroundColor: accent }} />
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: '18px', height: '6px', borderRadius: '3px', backgroundColor: 'var(--border)' }} />
            <div style={{ width: '18px', height: '6px', borderRadius: '3px', backgroundColor: 'var(--border)' }} />
            <div style={{ width: '18px', height: '6px', borderRadius: '3px', backgroundColor: 'var(--border)' }} />
          </div>
        </div>
        <div
          style={{
            height: '54px',
            borderRadius: '6px',
            marginTop: '4px',
            background: `linear-gradient(135deg, ${accent}, ${light})`,
          }}
        />
        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
          <div style={{ flex: 1, height: '26px', borderRadius: '5px', backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
          <div style={{ flex: 1, height: '26px', borderRadius: '5px', backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
          <div style={{ flex: 1, height: '26px', borderRadius: '5px', backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
        </div>
      </div>
    </div>
  );
}

// PriceTag renders whatever pricing shape a template has: free, a single
// lifetime or monthly price, or (currently only "White Label") both —
// in which case it's really a toggle, not just a label, letting the
// viewer pick which one they'd be choosing before they commit.
function PriceTag({ template, billingChoice, onChangeBillingChoice }) {
  const hasLifetime = template.price_usd != null;
  const hasMonthly = template.price_monthly != null;

  if (!hasLifetime && !hasMonthly) {
    return <div style={{ fontSize: '16px', fontWeight: 500 }}>Free</div>;
  }
  if (hasLifetime && hasMonthly) {
    return (
      <div style={{ display: 'flex', gap: '6px' }}>
        {[
          { key: 'monthly', label: `$${template.price_monthly.toFixed(0)}/mo` },
          { key: 'lifetime', label: `$${template.price_usd.toFixed(0)} lifetime` },
        ].map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChangeBillingChoice(opt.key)}
            className="button-press"
            style={{
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 500,
              cursor: 'pointer',
              border: billingChoice === opt.key ? 'none' : '1px solid var(--border)',
              backgroundColor: billingChoice === opt.key ? 'var(--text)' : 'transparent',
              color: billingChoice === opt.key ? 'var(--bg)' : 'var(--text)',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div style={{ fontSize: '16px', fontWeight: 500 }}>
      {hasLifetime ? `$${template.price_usd.toFixed(2)}` : `$${template.price_monthly.toFixed(2)}/mo`}
    </div>
  );
}

function TemplateCard({ template, isCurrent, currentBillingMode, billingChoice, onChangeBillingChoice, onChoose, pending, canChoose }) {
  const isDualPriced = template.price_usd != null && template.price_monthly != null;
  const matchesCurrentBilling = !isDualPriced || billingChoice === currentBillingMode;
  const disableChoose = pending || !canChoose || !template.has_room || (isCurrent && matchesCurrentBilling);

  let buttonLabel = 'Choose this template';
  if (isCurrent && matchesCurrentBilling) buttonLabel = 'Current template';
  else if (isCurrent) buttonLabel = `Switch to ${billingChoice === 'monthly' ? 'monthly' : 'lifetime'}`;

  return (
    <div
      className="hover-lift"
      style={{
        border: isCurrent ? '1.5px solid var(--text)' : '1px solid var(--border)',
        borderRadius: '18px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--card)',
      }}
    >
      <MockupPreview name={template.name} />
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '4px', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '17px', fontWeight: 500 }}>{template.name}</span>
          {isCurrent && (
            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', backgroundColor: 'var(--text)', color: 'var(--bg)' }}>
              Current
            </span>
          )}
        </div>
        <PriceTag template={template} billingChoice={billingChoice} onChangeBillingChoice={onChangeBillingChoice} />
      </div>
      {template.description && (
        <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '14px', lineHeight: 1.5 }}>{template.description}</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: template.has_room ? '#16a34a' : '#ef4444', marginBottom: '14px' }}>
        {template.has_room ? <Check size={13} /> : <Users size={13} />}
        <span>
          {template.has_room
            ? template.max_active_tenants
              ? `Available — ${template.active_tenants}/${template.max_active_tenants} in use`
              : 'Available — unlimited use'
            : `Full — ${template.active_tenants}/${template.max_active_tenants} in use`}
        </span>
      </div>
      <button
        onClick={onChoose}
        disabled={disableChoose}
        className="button-press"
        style={{
          marginTop: 'auto',
          padding: '9px 16px',
          borderRadius: '18px',
          border: 'none',
          backgroundColor: 'var(--text)',
          color: 'var(--bg)',
          fontSize: '13px',
          fontWeight: 500,
          cursor: disableChoose ? 'default' : 'pointer',
          opacity: disableChoose ? 0.5 : 1,
        }}
      >
        {pending ? 'Working…' : buttonLabel}
      </button>
    </div>
  );
}

function SignInToChooseNotice() {
  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
        padding: '14px 16px',
        borderRadius: '14px',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--card)',
        fontSize: '13px',
        color: 'var(--muted)',
        lineHeight: 1.6,
        marginBottom: '18px',
      }}
    >
      <Info size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
      <span>Sign in as a reseller tenant to actually pick a template — this gallery is browsable either way.</span>
    </div>
  );
}

// Browse and pick the white-label frontend design a reseller goes live
// with. GET /reselling/templates is public/unauthenticated (useful even
// before signing up), but choosing one calls the authenticated
// POST /reselling/upgrade — so this page works in two modes: a read-only
// gallery for anyone, and a live picker once a reseller tenant session is
// present (mirrors GET /reselling/me for "which one do I already have").
export default function ResellerTemplates() {
  const { user } = useAuth();
  const token = sessionToken(user);

  const [templates, setTemplates] = useState(null);
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pendingID, setPendingID] = useState(null);
  const [billingChoices, setBillingChoices] = useState({});

  const load = useCallback(async () => {
    try {
      const res = await window.secureRelayRequest('/reselling/templates', { method: 'GET' });
      if (!res.ok) {
        setError(res.data?.error?.message || `Failed to load templates (HTTP ${res.status})`);
        return;
      }
      setTemplates(res.data?.templates || []);

      if (!token) return;
      const meRes = await authedRequest('/reselling/me', token, { method: 'GET' });
      if (meRes.ok) setMe(meRes.data);
      // A 404 here just means this session isn't a reseller tenant yet —
      // the gallery still renders, picking is just unavailable (see
      // SignInToChooseNotice).
    } catch (err) {
      setError(err.message || 'Failed to load templates');
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const choose = async (template) => {
    if (!token) return;
    setPendingID(template.id);
    setError('');
    setNotice('');
    try {
      const body = { template_id: template.id };
      if (template.price_usd != null && template.price_monthly != null) {
        body.template_billing_mode = billingChoices[template.id] || 'monthly';
      }
      const res = await authedRequest('/reselling/upgrade', token, {
        method: 'POST',
        body,
      });
      if (!res.ok) {
        setError(res.data?.error?.message || `Failed (HTTP ${res.status})`);
        return;
      }
      setNotice(res.data?.message || 'Template updated.');
      await load();
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setPendingID(null);
    }
  };

  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 18px 0' }}>
        The white-label frontend design your resale customers see. The default design is free and
        carries the "Powered by Frenix" badge; White Label removes it, billed either monthly or as
        a one-time lifetime purchase. Previews below are generic placeholder mockups, not real
        screenshots.
      </p>

      {!token && <SignInToChooseNotice />}
      {error && <ErrorNotice message={error} />}
      {notice && !error && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid #16a34a',
            backgroundColor: 'rgba(22, 163, 74, 0.08)',
            color: '#16a34a',
            fontSize: '13px',
            marginBottom: '18px',
          }}
        >
          {notice}
        </div>
      )}
      {!templates && !error && <LoadingNotice label="Loading templates…" />}

      {templates && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isCurrent={me?.template?.id === template.id}
              currentBillingMode={me?.template_billing_mode}
              billingChoice={billingChoices[template.id] || 'monthly'}
              onChangeBillingChoice={(choice) => setBillingChoices((prev) => ({ ...prev, [template.id]: choice }))}
              onChoose={() => choose(template)}
              pending={pendingID === template.id}
              canChoose={Boolean(me)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
