import React, { useState, useEffect } from 'react';
import { LayoutTemplate, Check, Users } from 'lucide-react';

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

function TemplateCard({ template }) {
  return (
    <div
      className="hover-lift"
      style={{
        border: '1px solid var(--border)',
        borderRadius: '18px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--card)',
      }}
    >
      <MockupPreview name={template.name} />
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div style={{ fontSize: '17px', fontWeight: 500 }}>{template.name}</div>
        <div style={{ fontSize: '16px', fontWeight: 500 }}>
          {template.price_usd != null ? `$${template.price_usd.toFixed(2)}` : 'Free'}
        </div>
      </div>
      {template.description && (
        <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '14px', lineHeight: 1.5 }}>{template.description}</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: template.has_room ? '#16a34a' : '#ef4444', marginTop: 'auto' }}>
        {template.has_room ? <Check size={13} /> : <Users size={13} />}
        <span>
          {template.has_room
            ? template.max_active_tenants
              ? `Available — ${template.active_tenants}/${template.max_active_tenants} in use`
              : 'Available — unlimited use'
            : `Full — ${template.active_tenants}/${template.max_active_tenants} in use`}
        </span>
      </div>
    </div>
  );
}

export default function Templates() {
  const [templates, setTemplates] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await window.secureRelayRequest('/reselling/templates', { method: 'GET' });
        if (cancelled) return;
        if (!res.ok) {
          setError(res.data?.error?.message || `Failed to load templates (HTTP ${res.status})`);
          return;
        }
        setTemplates(res.data?.templates || []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load templates');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="animate-fadeInUp" style={{ padding: '64px 0 96px 0' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <LayoutTemplate size={26} />
          <h1 style={{ fontSize: '32px', fontWeight: 300, margin: 0, letterSpacing: '-0.01em' }}>Website Templates</h1>
        </div>
        <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--muted)', margin: 0, maxWidth: '640px' }}>
          The white-label frontend designs a reseller picks at upgrade time — a one-time design
          fee, separate from the API plan itself. Previews below are generic placeholder mockups,
          not real screenshots; no design images are stored in the system yet.
        </p>
        <p style={{ fontSize: '12px', color: '#f59e0b', margin: '10px 0 0 0' }}>
          Testing only — not purchasable in production yet. Prices shown are informational.
        </p>
      </div>

      {error && <div style={{ fontSize: '13px', color: '#ef4444', marginBottom: '24px' }}>{error}</div>}
      {!templates && !error && (
        <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Loading templates…</div>
      )}

      {templates && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}
