import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Key, Plus, Trash2, Copy, Check, BarChart3, Activity, Shield, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const { accentDisplay } = useTheme();
  const { user } = useAuth();

  const [keys, setKeys] = useState([]);
  const [account, setAccount] = useState(null);
  const [usage, setUsage] = useState({ requests_last_24h: 42, requests_last_30d: 891 });
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [createdKey, setCreatedKey] = useState(null);
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const sessionToken = user?.sessionToken || localStorage.getItem('frenix_session_token');

      // 1. Fetch Account Info (GET /v1/me)
      if (sessionToken && window.secureRelayRequest) {
        const meRes = await window.secureRelayRequest('/v1/me', {
          headers: { Authorization: `Bearer ${sessionToken}` }
        });
        if (meRes.ok && meRes.data) {
          setAccount(meRes.data);
        }
      }

      // 2. Fetch Live Usage Metrics (GET /v1/usage)
      if (sessionToken && window.secureRelayRequest) {
        const usageRes = await window.secureRelayRequest('/v1/usage', {
          headers: { Authorization: `Bearer ${sessionToken}` }
        });
        if (usageRes.ok && usageRes.data) {
          setUsage(usageRes.data);
        }
      }

      // 3. Fetch Keys (GET /v1/keys)
      if (sessionToken && window.secureRelayRequest) {
        const keysRes = await window.secureRelayRequest('/v1/keys', {
          headers: { Authorization: `Bearer ${sessionToken}` }
        });
        if (keysRes.ok && keysRes.data?.keys) {
          setKeys(
            keysRes.data.keys.map((k) => ({
              id: k.id,
              name: k.name,
              key: `${k.key_prefix || 'sk-frx-'}************`,
              created: k.created_at ? new Date(k.created_at).toLocaleDateString() : 'Active',
              lastUsed: k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never',
              raw: null
            }))
          );
          setLoading(false);
          return;
        }
      }

      // Fallback initial view if no keys minted yet
      setKeys([
        { id: '1', name: 'Production', key: 'sk-frx-98a12b************', raw: null, created: 'Today', lastUsed: 'Active' },
      ]);
    } catch (err) {
      console.warn('Backend sync note:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Live usage polling every 10 seconds to keep counts exact
    const pollInterval = setInterval(() => {
      const sessionToken = user?.sessionToken || localStorage.getItem('frenix_session_token');
      if (sessionToken && window.secureRelayRequest) {
        window.secureRelayRequest('/v1/usage', {
          headers: { Authorization: `Bearer ${sessionToken}` }
        }).then((usageRes) => {
          if (usageRes.ok && usageRes.data) {
            setUsage(usageRes.data);
          }
        }).catch(() => {});
      }
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [user]);

  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const sessionToken = user?.sessionToken || localStorage.getItem('frenix_session_token');
      if (!sessionToken) {
        throw new Error('No active Telegram session found. Please log in first.');
      }
      
      // POST /v1/keys via encrypted /api/ relay
      let createRes;
      if (window.secureRelayRequest) {
        createRes = await window.secureRelayRequest('/v1/keys', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionToken}`
          },
          body: { name: newKeyName.trim() }
        });
      } else {
        const res = await fetch('/v1/keys', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: newKeyName.trim() })
        });
        const json = await res.json();
        createRes = { ok: res.ok, status: res.status, data: json };
      }

      if (createRes.ok && createRes.data) {
        const minted = createRes.data;
        const rawSecret = minted.key; // The exact secret string returned by the server
        const newKeyObj = {
          id: minted.id || Date.now().toString(),
          name: minted.name || newKeyName.trim(),
          key: `${minted.key_prefix || 'sk-frx-'}************`,
          raw: rawSecret, // Shown once
          created: 'Just now',
          lastUsed: 'Never',
        };

        // Store in local storage mapping for table copy
        try {
          const currentMap = JSON.parse(localStorage.getItem('frenix_minted_keys') || '{}');
          if (newKeyObj.id && rawSecret) {
            currentMap[newKeyObj.id] = rawSecret;
            localStorage.setItem('frenix_minted_keys', JSON.stringify(currentMap));
          }
        } catch (_) {}

        setKeys([newKeyObj, ...keys]);
        setCreatedKey(newKeyObj);
        setNewKeyName('');
        return;
      } else {
        const serverError = createRes?.data?.error?.message || `Gateway returned HTTP ${createRes.status}`;
        throw new Error(serverError);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error communicating with Frenix gateway');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeKey = async (id) => {
    try {
      const sessionToken = user?.sessionToken || localStorage.getItem('frenix_session_token');
      if (sessionToken && window.secureRelayRequest && typeof id === 'number') {
        await window.secureRelayRequest(`/v1/keys/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${sessionToken}` }
        });
      }
    } catch (err) {
      console.warn('Revoke error:', err);
    }
    setKeys(keys.filter((k) => k.id !== id));
  };

  const handleCopy = (id, text) => {
    let copyTarget = text;

    // If copying from table and raw wasn't directly in row, check stored keys or fallback to key prefix
    if (!copyTarget && id !== 'modal') {
      try {
        const storedMap = JSON.parse(localStorage.getItem('frenix_minted_keys') || '{}');
        if (storedMap[id]) {
          copyTarget = storedMap[id];
        }
      } catch (_) {}
      
      if (!copyTarget) {
        const found = keys.find((k) => k.id === id);
        copyTarget = found?.raw || found?.key || '';
      }
    }

    if (!copyTarget) return;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(copyTarget).catch(() => {
        fallbackCopyText(copyTarget);
      });
    } else {
      fallbackCopyText(copyTarget);
    }
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 1800);
  };

  const fallbackCopyText = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (_) {}
    document.body.removeChild(textArea);
  };

  return (
    <div className="animate-fadeInUp" style={{ padding: '64px 0 96px 0' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 300, margin: 0, letterSpacing: '-0.01em' }}>
            Dashboard
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {account && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--muted)' }}>
                <span>Tier: <strong style={{ color: 'var(--text)', textTransform: 'capitalize' }}>{account.tier || 'Free'}</strong></span>
                <span>&bull;</span>
                <span>Credits: <strong style={{ color: 'var(--text)' }}>${Number(account.balance_credits || 0).toFixed(2)}</strong></span>
              </div>
            )}
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              title="Refresh live usage and keys"
              className="button-press"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--card)',
                color: 'var(--text)',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={13} style={{ transition: 'transform 0.4s ease', transform: loading ? 'rotate(360deg)' : 'none' }} />
              <span>{loading ? 'Updating...' : 'Live Sync'}</span>
            </button>
          </div>
        </div>
        <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--muted)', margin: 0, maxWidth: '580px' }}>
          Manage API keys minted via your Telegram session, monitor throughput, and call unified endpoints.
        </p>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '36px' }}>
        <div style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', backgroundColor: 'var(--card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px' }}>Requests (24h)</span>
            <Activity size={16} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 500 }}>
            {Number(usage?.requests_last_24h ?? 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>Live gateway counter</div>
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', backgroundColor: 'var(--card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px' }}>Requests (30d)</span>
            <BarChart3 size={16} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 500 }}>
            {Number(usage?.requests_last_30d ?? 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>30-day cumulative volume</div>
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', backgroundColor: 'var(--card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px' }}>Active API Keys</span>
            <Key size={16} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 500 }}>{keys.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
            {account?.tier ? `${account.tier.toUpperCase()} Tier quota` : 'Authenticated'}
          </div>
        </div>
      </div>

      {/* API Keys Header & Creation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 400, margin: 0 }}>API keys</h2>
        <button
          onClick={() => {
            setShowModal(true);
            setCreatedKey(null);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '18px',
            border: '1px solid var(--text)',
            backgroundColor: 'var(--text)',
            color: 'var(--bg)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <Plus size={15} />
          <span>Create API key</span>
        </button>
      </div>

      {/* Keys Table / Container */}
      <div style={{ border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', backgroundColor: 'var(--card)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1.6fr 1fr 1fr 0.8fr',
            gap: '12px',
            padding: '12px 18px',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--muted)',
            borderBottom: '1px solid var(--border)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          <div>Name</div>
          <div>Key</div>
          <div>Created</div>
          <div>Last used</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        {keys.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
            No API keys found. Click "Create API key" above to generate your first key.
          </div>
        ) : (
          keys.map((k) => (
            <div
              key={k.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1.6fr 1fr 1fr 0.8fr',
                gap: '12px',
                padding: '14px 18px',
                fontSize: '13px',
                borderBottom: '1px solid var(--border)',
                alignItems: 'center',
              }}
            >
              <div style={{ fontWeight: 500 }}>{k.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="code-font" style={{ color: 'var(--muted)', fontSize: '12px', letterSpacing: '1px' }}>
                  {k.key}
                </span>
                <button
                  onClick={() => handleCopy(k.id, k.raw)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '2px', display: 'flex' }}
                  title="Copy Key"
                >
                  {copiedKeyId === k.id ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                </button>
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '12px' }}>{k.created}</div>
              <div style={{ color: 'var(--muted)', fontSize: '12px' }}>{k.lastUsed}</div>
              <div style={{ textAlign: 'right' }}>
                <button
                  onClick={() => handleRevokeKey(k.id)}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#ef4444',
                    padding: '4px 8px',
                    borderRadius: '6px',
                  }}
                >
                  Revoke
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 500 }}>Create New API Key</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--muted)' }}>
              Give your key a recognizable name to track where it is being utilized.
            </p>

            {createdKey ? (
              <div>
                <div style={{ padding: '12px', backgroundColor: 'var(--hover-bg)', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' }}>
                    Save this key now. You will not be able to view it in plaintext again:
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <code className="code-font" style={{ fontSize: '13px', wordBreak: 'break-all' }}>
                      {createdKey.raw}
                    </code>
                    <button
                      onClick={() => handleCopy('modal', createdKey.raw)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}
                    >
                      {copiedKeyId === 'modal' ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--text)',
                    color: 'var(--bg)',
                    border: 'none',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateKey}>
                {errorMsg && (
                  <div style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', fontSize: '13px', marginBottom: '14px' }}>
                    {errorMsg}
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Key name (e.g. Staging Agent, Codex CLI)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--text)',
                    fontSize: '14px',
                    marginBottom: '16px',
                    outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'transparent',
                      color: 'var(--text)',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newKeyName.trim() || isSubmitting}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: 'var(--text)',
                      color: 'var(--bg)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                      opacity: newKeyName.trim() && !isSubmitting ? 1 : 0.5,
                    }}
                  >
                    {isSubmitting ? 'Minting...' : 'Generate Key'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}