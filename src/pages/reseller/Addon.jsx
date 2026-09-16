import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { sessionToken, authedRequest } from './shared';
import { NotATenantNotice, LoadingNotice, ErrorNotice } from './EmptyState';

function AddonRow({ addon, mine, onSubscribe, onCancel, pendingSlug }) {
  const isPending = pendingSlug === addon.slug;
  const isActive = mine?.status === 'active';
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 18px',
        borderRadius: '14px',
        border: isActive ? '1.5px solid var(--text)' : '1px solid var(--border)',
        backgroundColor: 'var(--card)',
      }}
    >
      <div style={{ flex: '1 1 220px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{addon.name}</span>
          {isActive && (
            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', backgroundColor: 'var(--text)', color: 'var(--bg)' }}>
              Active
            </span>
          )}
          {mine?.status === 'cancelled' && (
            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', border: '1px solid var(--border)', color: 'var(--muted)' }}>
              Cancelled
            </span>
          )}
        </div>
        {addon.description && (
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{addon.description}</div>
        )}
        {isActive && mine?.current_period_end && (
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
            renews/expires {new Date(mine.current_period_end).toLocaleDateString()}
          </div>
        )}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--muted)', flexShrink: 0 }}>${addon.price_monthly.toFixed(2)}/mo</div>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={() => onSubscribe(addon.slug)}
          disabled={isPending || isActive}
          className="button-press"
          style={{
            padding: '7px 14px',
            borderRadius: '18px',
            border: 'none',
            backgroundColor: 'var(--text)',
            color: 'var(--bg)',
            fontSize: '12px',
            fontWeight: 500,
            cursor: isPending || isActive ? 'default' : 'pointer',
            opacity: isPending || isActive ? 0.5 : 1,
          }}
        >
          {isActive ? 'Subscribed' : 'Subscribe'}
        </button>
        <button
          onClick={() => onCancel(addon.slug)}
          disabled={isPending || !isActive}
          className="button-press"
          style={{
            padding: '7px 14px',
            borderRadius: '18px',
            border: '1px solid var(--border)',
            backgroundColor: 'transparent',
            color: 'var(--text)',
            fontSize: '12px',
            fontWeight: 500,
            cursor: isPending || !isActive ? 'default' : 'pointer',
            opacity: isPending || !isActive ? 0.5 : 1,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function ResellerAddon() {
  const { user } = useAuth();
  const [addons, setAddons] = useState(null);
  const [mine, setMine] = useState({});
  const [notTenant, setNotTenant] = useState(false);
  const [error, setError] = useState('');
  const [pendingSlug, setPendingSlug] = useState(null);

  const token = sessionToken(user);

  const load = useCallback(async () => {
    try {
      const res = await window.secureRelayRequest('/reselling/addons', { method: 'GET' });
      if (!res.ok) {
        setError(res.data?.error?.message || `Failed to load addons (HTTP ${res.status})`);
        return;
      }
      setAddons(res.data?.addons || []);

      if (!token) return;
      const mineRes = await authedRequest('/reselling/addons/mine', token, { method: 'GET' });
      if (mineRes.status === 404) {
        setNotTenant(true);
        return;
      }
      if (mineRes.ok) {
        const bySlug = {};
        for (const a of mineRes.data?.addons || []) bySlug[a.slug] = a;
        setMine(bySlug);
      }
    } catch (err) {
      setError(err.message || 'Failed to load addons');
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (slug, action) => {
    if (!token) {
      setError('No active session found — please sign in again.');
      return;
    }
    setPendingSlug(slug);
    try {
      const res = await authedRequest(`/reselling/addons/${encodeURIComponent(slug)}/${action}`, token, { method: 'POST' });
      if (!res.ok) {
        setError(res.data?.error?.message || `Failed (HTTP ${res.status})`);
        return;
      }
      await load();
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setPendingSlug(null);
    }
  };

  if (notTenant) return <NotATenantNotice />;

  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 18px 0' }}>
        Sold directly to reseller companies, not resold further. Subscribing grants a 30-day
        period — there's no recurring billing job yet, so re-subscribe after it lapses.
      </p>
      {error && <ErrorNotice message={error} />}
      {!addons && !error && <LoadingNotice label="Loading addons…" />}
      {addons && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {addons.map((addon) => (
            <AddonRow
              key={addon.slug}
              addon={addon}
              mine={mine[addon.slug]}
              onSubscribe={(slug) => act(slug, 'subscribe')}
              onCancel={(slug) => act(slug, 'cancel')}
              pendingSlug={pendingSlug}
            />
          ))}
        </div>
      )}
    </div>
  );
}
