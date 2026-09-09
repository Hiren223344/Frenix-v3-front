import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Puzzle, Check, X } from 'lucide-react';

export default function Plugins() {
  const { user } = useAuth();

  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState('');
  const [keyInputs, setKeyInputs] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState({});

  const sessionToken = () => user?.sessionToken || localStorage.getItem('frenix_session_token');

  const fetchPlugins = async () => {
    setLoading(true);
    setSyncError('');
    try {
      const token = sessionToken();
      if (!token || !window.secureRelayRequest) {
        throw new Error('No active Telegram session found. Please log in first.');
      }
      const res = await window.secureRelayRequest('/v1/plugins', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok || !res.data?.plugins) {
        // A 404 here means the gateway operator hasn't enabled plugins
        // (FRENIX_PLUGIN_ENCRYPTION_KEY unset) — don't show fabricated
        // plugin cards, show that the feature isn't available.
        if (res.status === 404) {
          setPlugins([]);
          return;
        }
        throw new Error(res?.data?.error?.message || `Failed to load plugins (HTTP ${res.status})`);
      }
      setPlugins(res.data.plugins);
    } catch (err) {
      setSyncError(err.message || 'Failed to sync with the Frenix gateway');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlugins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleEnable = async (id) => {
    const apiKey = (keyInputs[id] || '').trim();
    if (!apiKey) return;
    setBusyId(id);
    setActionError((prev) => ({ ...prev, [id]: '' }));
    try {
      const token = sessionToken();
      const res = await window.secureRelayRequest(`/v1/plugins/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: { api_key: apiKey },
      });
      if (!res.ok) {
        throw new Error(res?.data?.error?.message || `Failed to enable plugin (HTTP ${res.status})`);
      }
      setKeyInputs((prev) => ({ ...prev, [id]: '' }));
      await fetchPlugins();
    } catch (err) {
      setActionError((prev) => ({ ...prev, [id]: err.message || 'Failed to enable plugin' }));
    } finally {
      setBusyId(null);
    }
  };

  const handleDisable = async (id) => {
    setBusyId(id);
    setActionError((prev) => ({ ...prev, [id]: '' }));
    try {
      const token = sessionToken();
      const res = await window.secureRelayRequest(`/v1/plugins/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(res?.data?.error?.message || `Failed to disable plugin (HTTP ${res.status})`);
      }
      await fetchPlugins();
    } catch (err) {
      setActionError((prev) => ({ ...prev, [id]: err.message || 'Failed to disable plugin' }));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="animate-fadeInUp" style={{ padding: '64px 0 96px 0' }}>
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 300, margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
          Plugins
        </h1>
        <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--muted)', margin: 0, maxWidth: '640px' }}>
          Add your own key for a third-party tool, then name it in a chat completion's{' '}
          <code className="code-font">plugins</code> field to make it available to the model for that request.
        </p>
      </div>

      {syncError && (
        <div style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', fontSize: '13px', marginBottom: '20px' }}>
          {syncError}
        </div>
      )}

      {loading ? (
        <div style={{ color: 'var(--muted)', fontSize: '13px' }}>Loading plugins…</div>
      ) : plugins.length === 0 && !syncError ? (
        <div style={{ border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', backgroundColor: 'var(--card)', color: 'var(--muted)', fontSize: '13px' }}>
          Plugins aren't enabled on this gateway yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {plugins.map((p) => (
            <div
              key={p.id}
              className="hover-lift"
              style={{ border: '1px solid var(--border)', borderRadius: '16px', padding: '20px 24px', backgroundColor: 'var(--card)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Puzzle size={16} />
                  <span style={{ fontSize: '15px', fontWeight: 500 }}>{p.name}</span>
                  <code className="code-font" style={{ fontSize: '11px', color: 'var(--muted)' }}>{p.id}</code>
                </div>
                <span
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 500,
                    padding: '2px 8px', borderRadius: '8px', border: '1px solid var(--border)',
                    color: p.enabled ? '#16a34a' : 'var(--muted)',
                  }}
                >
                  {p.enabled ? <Check size={12} /> : <X size={12} />}
                  {p.enabled ? 'Enabled' : 'Not enabled'}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 14px 0' }}>{p.description}</p>

              {actionError[p.id] && (
                <div style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', fontSize: '12px', marginBottom: '10px' }}>
                  {actionError[p.id]}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="password"
                  placeholder={p.enabled ? 'Replace stored key…' : `Your ${p.name} API key`}
                  value={keyInputs[p.id] || ''}
                  onChange={(e) => setKeyInputs((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  style={{
                    flex: '1 1 220px', padding: '9px 14px', borderRadius: '10px', border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg)', color: 'var(--text)', fontSize: '13px', outline: 'none',
                  }}
                />
                <button
                  onClick={() => handleEnable(p.id)}
                  disabled={busyId === p.id || !(keyInputs[p.id] || '').trim()}
                  style={{
                    padding: '9px 18px', borderRadius: '10px', border: 'none',
                    backgroundColor: 'var(--text)', color: 'var(--bg)', fontSize: '13px', fontWeight: 500,
                    cursor: busyId === p.id ? 'default' : 'pointer',
                    opacity: !(keyInputs[p.id] || '').trim() ? 0.5 : 1,
                  }}
                >
                  {p.enabled ? 'Update key' : 'Enable'}
                </button>
                {p.enabled && (
                  <button
                    onClick={() => handleDisable(p.id)}
                    disabled={busyId === p.id}
                    style={{
                      padding: '9px 18px', borderRadius: '10px', border: '1px solid var(--border)',
                      backgroundColor: 'transparent', color: 'var(--muted)', fontSize: '13px', cursor: 'pointer',
                    }}
                  >
                    Disable
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
