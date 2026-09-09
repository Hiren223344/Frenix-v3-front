import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle, XCircle, HelpCircle, RefreshCw } from 'lucide-react';

const STATUS_URL = typeof window !== 'undefined' && window.location.hostname === 'frenix.sh'
  ? 'https://api.frenix.sh/v1/status'
  : (import.meta.env.DEV ? '/v1/status' : 'https://api.frenix.sh/v1/status');

// Every field this page renders comes straight from GET /v1/status, which
// the gateway derives from the same live registry + circuit breaker state
// it uses to route requests. There is no synthetic uptime percentage,
// fabricated incident log, or historical chart here — if the gateway
// doesn't track a number, this page doesn't display one.
const STATUS_META = {
  operational: { label: 'Operational', color: '#16a34a', Icon: CheckCircle2 },
  degraded: { label: 'Degraded', color: '#eab308', Icon: AlertCircle },
  down: { label: 'Down', color: '#dc2626', Icon: XCircle },
  disabled: { label: 'Disabled', color: 'var(--muted)', Icon: HelpCircle },
  unknown: { label: 'Unknown', color: 'var(--muted)', Icon: HelpCircle },
};

function overallStatus(models) {
  const active = models.filter((m) => m.status !== 'disabled');
  if (active.length === 0) return 'operational';
  if (active.some((m) => m.status === 'down')) return 'down';
  if (active.some((m) => m.status === 'degraded' || m.status === 'unknown')) return 'degraded';
  return 'operational';
}

const OVERALL_LABEL = {
  operational: 'All Systems Operational',
  degraded: 'Degraded Performance',
  down: 'Service Disruption',
};

export default function Status() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchStatus = useCallback(async () => {
    setIsRefreshing(true);
    try {
      let payload;
      if (typeof window !== 'undefined' && window.secureRelayRequest) {
        const res = await window.secureRelayRequest('/v1/status', { method: 'GET' });
        if (!res.ok) throw new Error(`status ${res.status}`);
        payload = res.data;
      } else {
        const res = await fetch(STATUS_URL, { method: 'GET', cache: 'no-store' });
        if (!res.ok) throw new Error(`status ${res.status}`);
        payload = await res.json();
      }
      setData(payload);
      setError(null);
    } catch (err) {
      console.warn('Status fetch failed:', err);
      setError('Unable to reach the status service.');
    } finally {
      setLastChecked(new Date());
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 30000);
    return () => clearInterval(timer);
  }, [fetchStatus]);

  const models = data?.models || [];
  const overall = data ? overallStatus(models) : null;
  const dotColor = error ? '#dc2626' : overall ? STATUS_META[overall].color : 'var(--muted)';

  return (
    <div className="animate-fadeInUp" style={{ padding: '64px 0 96px 0' }}>
      {/* Top Banner */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 300, margin: 0, letterSpacing: '-0.01em' }}>
            System Status
          </h1>
          <button
            onClick={fetchStatus}
            className="button-press"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--card)',
              color: 'var(--text)',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} style={{ transition: 'transform 0.5s ease', transform: isRefreshing ? 'rotate(360deg)' : 'none' }} />
            <span>{lastChecked ? `Checked ${lastChecked.toLocaleTimeString()}` : 'Checking…'}</span>
          </button>
        </div>
        <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--muted)', margin: 0, maxWidth: '640px' }}>
          Live model and backend health, read directly from the gateway's own routing state.
        </p>
      </div>

      {/* Global Status Pill Header */}
      <div
        className="hover-lift"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 24px',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--card)',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            className="pulse-dot"
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: dotColor,
              display: 'inline-block',
            }}
          />
          <span style={{ fontSize: '16px', fontWeight: 500 }}>
            {error ? 'Status Unavailable' : overall ? OVERALL_LABEL[overall] : 'Checking…'}
          </span>
        </div>
        {!error && data && (
          <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--muted)' }}>
            <div>Models tracked: <strong style={{ color: 'var(--text)' }}>{models.length}</strong></div>
            {data.checked_at && (
              <div>Snapshot at: <strong style={{ color: 'var(--text)' }}>{new Date(data.checked_at).toLocaleTimeString()}</strong></div>
            )}
          </div>
        )}
      </div>

      {error ? (
        <div style={{ border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', backgroundColor: 'var(--card)', color: 'var(--muted)', fontSize: '13px' }}>
          {error} This page only shows live data from the gateway — it won't display placeholder health information while the status service is unreachable.
        </div>
      ) : (
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 400, margin: '0 0 16px 0' }}>Model &amp; Backend Health</h2>
          <div style={{ border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', backgroundColor: 'var(--card)' }}>
            <div
              className="frenix-status-header"
              style={{
                padding: '12px 18px',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--muted)',
                borderBottom: '1px solid var(--border)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <div>Model</div>
              <div>Provider</div>
              <div>Status</div>
              <div>Backends Healthy</div>
            </div>

            {models.length === 0 ? (
              <div style={{ padding: '24px 18px', fontSize: '13px', color: 'var(--muted)' }}>
                {data ? 'No models configured yet.' : 'Loading…'}
              </div>
            ) : (
              models.map((m, idx) => {
                const meta = STATUS_META[m.status] || STATUS_META.unknown;
                const Icon = meta.Icon;
                return (
                  <div
                    key={m.id}
                    className="frenix-status-row"
                    style={{
                      padding: '16px 18px',
                      fontSize: '13px',
                      borderBottom: idx === models.length - 1 ? 'none' : '1px solid var(--border)',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div className="code-font" style={{ fontWeight: 500 }}>{m.id}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '12px', textTransform: 'capitalize' }}>
                      <span className="frenix-mobile-label">Provider: </span>{m.provider}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: meta.color, fontWeight: 500, fontSize: '12px' }}>
                      <Icon size={14} />
                      <span>{meta.label}</span>
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: '12px' }}>
                      <span className="frenix-mobile-label">Backends: </span>
                      {m.status === 'disabled' ? '—' : `${m.backends_healthy} / ${m.backends_total}`}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
