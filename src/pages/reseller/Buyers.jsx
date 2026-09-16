import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Tag } from 'lucide-react';
import { sessionToken, authedRequest } from './shared';
import { NotATenantNotice, LoadingNotice, ErrorNotice } from './EmptyState';

// "Buyers" here means the price sheet a reseller shows to their own
// downstream customers — see types.ResellerPricingOverride's doc comment:
// this system has no concept of actual buyer/sub-customer accounts yet
// (no login, no billing of their own), only the presentation record a
// reseller reads back. Real buyer accounts would be a separate, bigger
// feature for later.
export default function ResellerBuyers() {
  const { user } = useAuth();
  const [tiers, setTiers] = useState(null);
  const [overrides, setOverrides] = useState(null);
  const [notTenant, setNotTenant] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [baseId, setBaseId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [retailPrice, setRetailPrice] = useState('');

  const token = sessionToken(user);

  const load = useCallback(async () => {
    try {
      const tiersRes = await window.secureRelayRequest('/reselling/tiers', { method: 'GET' });
      if (tiersRes.ok) {
        const t = tiersRes.data?.tiers || [];
        setTiers(t);
        if (!baseId && t.length > 0) setBaseId(String(t[0].id));
      }

      if (!token) return;
      const res = await authedRequest('/reselling/overrides', token, { method: 'GET' });
      if (res.status === 404) {
        setNotTenant(true);
        return;
      }
      if (!res.ok) {
        setError(res.data?.error?.message || `Failed to load price sheet (HTTP ${res.status})`);
        return;
      }
      setOverrides(res.data?.overrides || []);
    } catch (err) {
      setError(err.message || 'Failed to load price sheet');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('No active session found — please sign in again.');
      return;
    }
    if (!baseId || !displayName.trim() || !retailPrice) return;
    setSaving(true);
    setError('');
    try {
      const res = await authedRequest('/reselling/overrides', token, {
        method: 'POST',
        body: {
          base_pricing_group_id: Number(baseId),
          display_name: displayName.trim(),
          retail_price: Number(retailPrice),
        },
      });
      if (!res.ok) {
        setError(res.data?.error?.message || `Failed to save (HTTP ${res.status})`);
        return;
      }
      setDisplayName('');
      setRetailPrice('');
      await load();
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (notTenant) return <NotATenantNotice />;

  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 18px 0' }}>
        Rebrand a base plan's name and price for your own buyers — the limits you actually get
        always come from the base plan itself, unchanged. This is a presentation record only,
        not a second billing rail.
      </p>

      {error && <ErrorNotice message={error} />}

      <form
        onSubmit={submit}
        style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', backgroundColor: 'var(--card)', marginBottom: '28px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'flex-end' }}
      >
        <div style={{ flex: '1 1 160px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' }}>Base plan</label>
          <select
            value={baseId}
            onChange={(e) => setBaseId(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text)', fontSize: '13px', outline: 'none' }}
          >
            {(tiers || []).map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: '2 1 200px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' }}>Your display name</label>
          <input
            type="text"
            placeholder="e.g. Growth Plan"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text)', fontSize: '13px', outline: 'none' }}
          />
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' }}>Your retail price ($/mo)</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={retailPrice}
            onChange={(e) => setRetailPrice(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text)', fontSize: '13px', outline: 'none' }}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="button-press"
          style={{ padding: '9px 20px', borderRadius: '18px', border: 'none', backgroundColor: 'var(--text)', color: 'var(--bg)', fontSize: '13px', fontWeight: 500, cursor: saving ? 'default' : 'pointer' }}
        >
          Save
        </button>
      </form>

      {!overrides && !error && <LoadingNotice label="Loading your price sheet…" />}
      {overrides && overrides.length === 0 && (
        <div style={{ fontSize: '13px', color: 'var(--muted)' }}>You haven't rebranded any plans yet.</div>
      )}
      {overrides && overrides.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {overrides.map((o) => (
            <div
              key={o.id}
              style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
            >
              <Tag size={16} style={{ flexShrink: 0 }} />
              <div style={{ flex: '1 1 200px' }}>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{o.display_name}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>based on {o.base_plan.name}</div>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 500 }}>${o.retail_price.toFixed(2)}/mo</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
