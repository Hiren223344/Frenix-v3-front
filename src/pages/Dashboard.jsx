import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Key, Plus, Trash2, Copy, Check, BarChart3, Activity, Shield, RefreshCw, Wallet, Hash, Gift, AlertTriangle, Bell, X } from 'lucide-react';

// One optional-limit number input, shared by every field in the "Add spend
// / rate limits" section of the create-key form — each is otherwise
// identical (same styling, same "blank = no limit" semantics) so this
// avoids repeating that markup five times over.
function LimitField({ label, value, onChange, min, step }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>{label}</label>
      <input
        type="number"
        min={min}
        step={step}
        placeholder="No limit"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 10px',
          borderRadius: '10px',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--bg)',
          color: 'var(--text)',
          fontSize: '13px',
          outline: 'none',
        }}
      />
    </div>
  );
}

// keyLimitSummary joins whichever of a key's limits are actually set into
// one "Limit: $2.00/$5.00 • 30 req/min • 10,000 tok/min" string, or ''
// when none are — so the row below its name only renders when there's
// something to show.
function keyLimitSummary(k) {
  const parts = [];
  if (k.spendLimit != null) {
    const spent = k.currentSpend != null ? k.currentSpend / 1_000_000 : 0;
    parts.push(`Limit: $${spent.toFixed(2)}/$${(k.spendLimit / 1_000_000).toFixed(2)}`);
  }
  if (k.rateLimitRpm != null) parts.push(`${k.rateLimitRpm} req/min`);
  if (k.tokenLimitPerMinute != null) parts.push(`${tokenUsageLabel(k.currentTokensPerMinute, k.tokenLimitPerMinute)}/min`);
  if (k.tokenLimitPerHour != null) parts.push(`${tokenUsageLabel(k.currentTokensPerHour, k.tokenLimitPerHour)}/hr`);
  if (k.tokenLimitPerDay != null) parts.push(`${tokenUsageLabel(k.currentTokensPerDay, k.tokenLimitPerDay)}/day`);
  return parts.join(' • ');
}

function tokenUsageLabel(current, limit) {
  const used = current != null ? current.toLocaleString() : '0';
  return `${used}/${limit.toLocaleString()} tok`;
}

export default function Dashboard() {
  const { accentDisplay } = useTheme();
  const { user } = useAuth();

  const [keys, setKeys] = useState([]);
  const [account, setAccount] = useState(null);
  const [usage, setUsage] = useState({ requests_last_24h: 0, requests_last_30d: 0, total_tokens: 0 });
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeySpendLimit, setNewKeySpendLimit] = useState('');
  const [newKeyRateLimit, setNewKeyRateLimit] = useState('');
  const [newKeyTokensPerMinute, setNewKeyTokensPerMinute] = useState('');
  const [newKeyTokensPerHour, setNewKeyTokensPerHour] = useState('');
  const [newKeyTokensPerDay, setNewKeyTokensPerDay] = useState('');
  const [showLimitFields, setShowLimitFields] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [createdKey, setCreatedKey] = useState(null);
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [syncError, setSyncError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);

  // Low-balance alert threshold (GET/PUT /v1/me, /v1/me/low-balance-threshold)
  const [showThresholdEditor, setShowThresholdEditor] = useState(false);
  const [thresholdInput, setThresholdInput] = useState('');
  const [savingThreshold, setSavingThreshold] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setSyncError('');
    try {
      const sessionToken = user?.sessionToken || localStorage.getItem('frenix_session_token');
      if (!sessionToken || !window.secureRelayRequest) {
        throw new Error('No active Telegram session found. Please log in first.');
      }

      // 1. Fetch Account Info (GET /v1/me)
      const meRes = await window.secureRelayRequest('/v1/me', {
        headers: { Authorization: `Bearer ${sessionToken}` }
      });
      if (meRes.ok && meRes.data) {
        setAccount(meRes.data);
      }

      // 2. Fetch Live Usage Metrics (GET /v1/usage)
      const usageRes = await window.secureRelayRequest('/v1/usage', {
        headers: { Authorization: `Bearer ${sessionToken}` }
      });
      if (usageRes.ok && usageRes.data) {
        setUsage(usageRes.data);
      }

      // 3. Fetch Keys (GET /v1/keys)
      const keysRes = await window.secureRelayRequest('/v1/keys', {
        headers: { Authorization: `Bearer ${sessionToken}` }
      });
      if (!keysRes.ok || !keysRes.data?.keys) {
        throw new Error(keysRes?.data?.error?.message || `Failed to load API keys (HTTP ${keysRes.status})`);
      }
      // Preserve the raw secret for any key minted earlier this session
      // (the server never returns it again after creation).
      const rawById = JSON.parse(localStorage.getItem('frenix_minted_keys') || '{}');
      setKeys(
        keysRes.data.keys
          // The server returns full key history, revoked keys included
          // (with revoked_at set), so the admin/audit trail isn't lossy.
          // The dashboard only ever wants to show currently-active keys —
          // without this filter, a key you'd already revoked reappeared
          // looking active again (with a working Revoke button) on every
          // reload or Live Sync.
          .filter((k) => !k.revoked_at)
          .map((k) => ({
          id: k.id,
          name: k.name,
          key: `${k.key_prefix || 'sk-frx-'}************`,
          created: k.created_at ? new Date(k.created_at).toLocaleDateString() : 'Active',
          lastUsed: k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never',
          raw: rawById[k.id] || null,
          spendLimit: k.spend_limit ?? null,
          rateLimitRpm: k.rate_limit_rpm ?? null,
          currentSpend: k.current_spend ?? null,
          tokenLimitPerMinute: k.token_limit_per_minute ?? null,
          tokenLimitPerHour: k.token_limit_per_hour ?? null,
          tokenLimitPerDay: k.token_limit_per_day ?? null,
          currentTokensPerMinute: k.current_tokens_per_minute ?? null,
          currentTokensPerHour: k.current_tokens_per_hour ?? null,
          currentTokensPerDay: k.current_tokens_per_day ?? null,
        }))
      );
    } catch (err) {
      // Never fall back to fabricated keys/usage on a failed fetch — that
      // would show the user keys they never created and can't use, and
      // silently discard whatever real keys were already loaded.
      setSyncError(err.message || 'Failed to sync with the Frenix gateway');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Live usage + balance polling every 10 seconds, so "Credits left" and
    // "Total tokens used" stay accurate as the user burns credits elsewhere
    // (another tab, a script using their API key), not just after a manual
    // "Live Sync" click.
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

        window.secureRelayRequest('/v1/me', {
          headers: { Authorization: `Bearer ${sessionToken}` }
        }).then((meRes) => {
          if (meRes.ok && meRes.data) {
            setAccount(meRes.data);
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
      
      // Every limit field is optional: an empty/blank input means no cap,
      // same as leaving the field out of the request body entirely.
      const spendLimitDollars = newKeySpendLimit.trim() ? Number(newKeySpendLimit) : null;
      const rateLimitRpm = newKeyRateLimit.trim() ? Number(newKeyRateLimit) : null;
      const tokensPerMinute = newKeyTokensPerMinute.trim() ? Number(newKeyTokensPerMinute) : null;
      const tokensPerHour = newKeyTokensPerHour.trim() ? Number(newKeyTokensPerHour) : null;
      const tokensPerDay = newKeyTokensPerDay.trim() ? Number(newKeyTokensPerDay) : null;
      if (spendLimitDollars !== null && (!Number.isFinite(spendLimitDollars) || spendLimitDollars < 0)) {
        throw new Error('Spend limit must be a non-negative number.');
      }
      const positiveIntFields = [
        ['Rate limit', rateLimitRpm],
        ['Token limit per minute', tokensPerMinute],
        ['Token limit per hour', tokensPerHour],
        ['Token limit per day', tokensPerDay],
      ];
      for (const [label, value] of positiveIntFields) {
        if (value !== null && (!Number.isFinite(value) || value <= 0)) {
          throw new Error(`${label} must be a positive number.`);
        }
      }
      const body = { name: newKeyName.trim() };
      // spend_limit is in micro-credits server-side (1,000,000 = $1), same
      // unit as account.balance elsewhere on this page.
      if (spendLimitDollars !== null) body.spend_limit = Math.round(spendLimitDollars * 1_000_000);
      if (rateLimitRpm !== null) body.rate_limit_rpm = Math.round(rateLimitRpm);
      if (tokensPerMinute !== null) body.token_limit_per_minute = Math.round(tokensPerMinute);
      if (tokensPerHour !== null) body.token_limit_per_hour = Math.round(tokensPerHour);
      if (tokensPerDay !== null) body.token_limit_per_day = Math.round(tokensPerDay);

      // POST /v1/keys via encrypted /api/ relay
      let createRes;
      if (window.secureRelayRequest) {
        createRes = await window.secureRelayRequest('/v1/keys', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionToken}`
          },
          body
        });
      } else {
        const res = await fetch('/v1/keys', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
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
          spendLimit: minted.spend_limit ?? null,
          rateLimitRpm: minted.rate_limit_rpm ?? null,
          tokenLimitPerMinute: minted.token_limit_per_minute ?? null,
          tokenLimitPerHour: minted.token_limit_per_hour ?? null,
          tokenLimitPerDay: minted.token_limit_per_day ?? null,
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
        setNewKeySpendLimit('');
        setNewKeyRateLimit('');
        setNewKeyTokensPerMinute('');
        setNewKeyTokensPerHour('');
        setNewKeyTokensPerDay('');
        setShowLimitFields(false);
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
    if (!window.confirm('Revoke this API key? Anything using it will stop working immediately.')) {
      return;
    }

    const sessionToken = user?.sessionToken || localStorage.getItem('frenix_session_token');
    if (!sessionToken || !window.secureRelayRequest) {
      setSyncError('No active Telegram session found. Please log in again and retry.');
      return;
    }

    // Only remove the key from the list once the server confirms it's
    // actually revoked — previously this always removed it locally even
    // when the DELETE failed or was silently skipped, so a key could look
    // revoked in the UI while staying fully active (and usable) server-side.
    try {
      const relayRes = await window.secureRelayRequest(`/v1/keys/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${sessionToken}` }
      });
      if (!relayRes.ok) {
        throw new Error(relayRes?.data?.error?.message || `Failed to revoke key (HTTP ${relayRes.status})`);
      }
    } catch (err) {
      setSyncError(err.message || 'Failed to revoke key — it is still active. Please try again.');
      return;
    }

    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const handleCopy = async (id, text) => {
    let copyTarget = text;

    // If copying from table and raw wasn't directly in row, check localStorage
    // for a secret minted earlier this browser session. Deliberately no
    // further fallback: the server never returns a key's raw secret again
    // after creation (zero-retention), so if it isn't in either place there
    // is no real secret left to copy — copying the masked display string
    // instead would silently hand the user a useless ****-filled string
    // while looking like it worked.
    if (!copyTarget && id !== 'modal') {
      try {
        const storedMap = JSON.parse(localStorage.getItem('frenix_minted_keys') || '{}');
        if (storedMap[id]) {
          copyTarget = storedMap[id];
        }
      } catch (_) {}
    }

    if (!copyTarget) return;

    // Only show the "Copied" confirmation once a copy method actually
    // reports success — previously this fired unconditionally, so if both
    // the Clipboard API and the execCommand fallback silently failed (as
    // they can in various mobile browser/permission contexts), the UI
    // still claimed success while nothing was on the clipboard.
    let succeeded = false;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(copyTarget);
        succeeded = true;
      } catch (_) {
        succeeded = fallbackCopyText(copyTarget);
      }
    } else {
      succeeded = fallbackCopyText(copyTarget);
    }

    if (succeeded) {
      setCopiedKeyId(id);
      setTimeout(() => setCopiedKeyId(null), 1800);
    } else {
      setSyncError('Could not copy automatically — long-press (or select) the key text to copy it manually.');
    }
  };

  const fallbackCopyText = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    let succeeded = false;
    try {
      succeeded = document.execCommand('copy');
    } catch (_) {}
    document.body.removeChild(textArea);
    return succeeded;
  };

  const handleSaveThreshold = async (clear) => {
    const sessionToken = user?.sessionToken || localStorage.getItem('frenix_session_token');
    if (!sessionToken || !window.secureRelayRequest) {
      setSyncError('No active Telegram session found. Please log in again and retry.');
      return;
    }
    let thresholdMicroCredits = null;
    if (!clear) {
      const dollars = Number(thresholdInput);
      if (!thresholdInput.trim() || !Number.isFinite(dollars) || dollars < 0) {
        setSyncError('Alert threshold must be a non-negative number.');
        return;
      }
      thresholdMicroCredits = Math.round(dollars * 1_000_000);
    }

    setSavingThreshold(true);
    try {
      const res = await window.secureRelayRequest('/v1/me/low-balance-threshold', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${sessionToken}` },
        body: { threshold: thresholdMicroCredits }
      });
      if (!res.ok) {
        throw new Error(res?.data?.error?.message || `Failed to update alert threshold (HTTP ${res.status})`);
      }
      // Re-fetch rather than compute low_balance locally — the server is
      // the source of truth for whether the new threshold is already
      // crossed by the current balance.
      const meRes = await window.secureRelayRequest('/v1/me', {
        headers: { Authorization: `Bearer ${sessionToken}` }
      });
      if (meRes.ok && meRes.data) setAccount(meRes.data);
      setShowThresholdEditor(false);
      setThresholdInput('');
    } catch (err) {
      setSyncError(err.message || 'Failed to update alert threshold');
    } finally {
      setSavingThreshold(false);
    }
  };

  const referralLink = account?.referral_code
    ? `${window.location.origin}/?ref=${account.referral_code}`
    : '';

  const handleCopyReferralLink = async () => {
    if (!referralLink) return;
    let succeeded = false;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(referralLink);
        succeeded = true;
      } catch (_) {
        succeeded = fallbackCopyText(referralLink);
      }
    } else {
      succeeded = fallbackCopyText(referralLink);
    }

    if (succeeded) {
      setReferralCopied(true);
      setTimeout(() => setReferralCopied(false), 1800);
    } else {
      setSyncError('Could not copy automatically — long-press (or select) the link text to copy it manually.');
    }
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

      {syncError && (
        <div style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', fontSize: '13px', marginBottom: '24px' }}>
          {syncError}
        </div>
      )}

      {account?.low_balance && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid #f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            color: '#f59e0b',
            fontSize: '13px',
            marginBottom: '24px',
          }}
        >
          <AlertTriangle size={15} style={{ flexShrink: 0 }} />
          <span>
            Your balance (${Number(account.balance_credits || 0).toFixed(2)}) is at or below your alert threshold. Top up to avoid an interruption.
          </span>
        </div>
      )}

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '36px' }}>
        <div style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', backgroundColor: 'var(--card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px' }}>Credits left</span>
            <Wallet size={16} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 500 }}>
            ${Number(account?.balance_credits ?? 0).toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
            {account?.tier ? `${account.tier.toUpperCase()} tier balance` : 'Available balance'}
          </div>

          <button
            onClick={() => {
              setThresholdInput(
                account?.low_balance_threshold != null ? String(account.low_balance_threshold / 1_000_000) : ''
              );
              setShowThresholdEditor((v) => !v);
            }}
            className="button-press"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              marginTop: '10px',
              padding: 0,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px',
              color: 'var(--muted)',
            }}
          >
            <Bell size={11} />
            <span>
              {account?.low_balance_threshold != null
                ? `Alert below $${(account.low_balance_threshold / 1_000_000).toFixed(2)}`
                : 'Set balance alert'}
            </span>
          </button>

          {showThresholdEditor && (
            <div style={{ marginTop: '8px', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="$ threshold"
                value={thresholdInput}
                onChange={(e) => setThresholdInput(e.target.value)}
                style={{
                  width: '90px',
                  padding: '6px 8px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--text)',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => handleSaveThreshold(false)}
                disabled={savingThreshold}
                title="Save"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', padding: '4px' }}
              >
                <Check size={13} />
              </button>
              {account?.low_balance_threshold != null && (
                <button
                  onClick={() => handleSaveThreshold(true)}
                  disabled={savingThreshold}
                  title="Clear alert"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', backgroundColor: 'var(--card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px' }}>Total tokens used</span>
            <Hash size={16} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 500 }}>
            {Number(usage?.total_tokens ?? 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Lifetime, prompt + completion</div>
        </div>

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

      {/* Referrals */}
      {account?.referral_code && (
        <div style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '20px 22px', backgroundColor: 'var(--card)', marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Gift size={16} />
            <h2 style={{ fontSize: '16px', fontWeight: 500, margin: 0 }}>Refer a friend, earn $100</h2>
          </div>
          <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--muted)', margin: '0 0 14px 0', maxWidth: '560px' }}>
            Share your link. The moment someone signs up through it, you get $100 in credits — no limit on how many times.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg)',
                flex: '1 1 280px',
                minWidth: 0,
              }}
            >
              <span data-copyable className="code-font selectable-text" style={{ fontSize: '12px', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {referralLink}
              </span>
            </div>
            <button
              onClick={handleCopyReferralLink}
              className="button-press"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid var(--text)',
                backgroundColor: 'var(--text)',
                color: 'var(--bg)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {referralCopied ? <Check size={14} /> : <Copy size={14} />}
              <span>{referralCopied ? 'Copied' : 'Copy link'}</span>
            </button>
            <span style={{ fontSize: '13px', color: 'var(--muted)', flexShrink: 0 }}>
              <strong style={{ color: 'var(--text)' }}>{account.referral_count ?? 0}</strong> referral{account.referral_count === 1 ? '' : 's'} so far
            </span>
          </div>
        </div>
      )}

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
          className="frenix-key-header"
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
          <div>Name</div>
          <div>Key</div>
          <div>Created</div>
          <div>Last used</div>
          <div className="frenix-key-actions">Actions</div>
        </div>

        {keys.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
            {syncError
              ? 'Could not load your API keys. Try "Live Sync" above.'
              : 'No API keys found. Click "Create API key" above to generate your first key.'}
          </div>
        ) : (
          keys.map((k) => (
            <div
              key={k.id}
              className="frenix-key-row"
              style={{
                padding: '14px 18px',
                fontSize: '13px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div>
                <div style={{ fontWeight: 500 }}>{k.name}</div>
                {keyLimitSummary(k) && (
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{keyLimitSummary(k)}</div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="code-font" style={{ color: 'var(--muted)', fontSize: '12px', letterSpacing: '1px' }}>
                  {k.key}
                </span>
                <button
                  onClick={() => k.raw && handleCopy(k.id, k.raw)}
                  disabled={!k.raw}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: k.raw ? 'pointer' : 'not-allowed',
                    color: k.raw ? 'var(--muted)' : 'var(--border)',
                    padding: '2px',
                    display: 'flex',
                  }}
                  title={k.raw ? 'Copy key' : "Only shown once at creation — this browser doesn't have the secret for this key. Revoke and create a new one to get a copyable key."}
                >
                  {copiedKeyId === k.id ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                </button>
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '12px' }}>
                <span className="frenix-mobile-label">Created: </span>{k.created}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '12px' }}>
                <span className="frenix-mobile-label">Last used: </span>{k.lastUsed}
              </div>
              <div className="frenix-key-actions">
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
                    <code data-copyable className="code-font" style={{ fontSize: '13px', wordBreak: 'break-all', userSelect: 'text' }}>
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

                <div style={{ padding: '12px', backgroundColor: 'var(--hover-bg)', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' }}>
                    This key also works as an MCP server for Claude Code / Claude Desktop:
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <code data-copyable className="code-font" style={{ fontSize: '11px', wordBreak: 'break-all', userSelect: 'text', color: 'var(--muted)' }}>
                      {`{"mcpServers":{"frenix":{"url":"https://api.frenix.sh/v1/mcp","headers":{"Authorization":"Bearer ${createdKey.raw}"}}}}`}
                    </code>
                    <button
                      onClick={() => handleCopy('mcp-config', `{\n  "mcpServers": {\n    "frenix": {\n      "url": "https://api.frenix.sh/v1/mcp",\n      "headers": { "Authorization": "Bearer ${createdKey.raw}" }\n    }\n  }\n}`)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', flexShrink: 0 }}
                    >
                      {copiedKeyId === 'mcp-config' ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
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
                    marginBottom: '10px',
                    outline: 'none',
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowLimitFields((v) => !v)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--muted)',
                    fontSize: '12px',
                    padding: 0,
                    marginBottom: showLimitFields ? '10px' : '16px',
                    textDecoration: 'underline',
                  }}
                >
                  {showLimitFields ? 'Hide limits' : 'Add spend / rate limits (optional)'}
                </button>

                {showLimitFields && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <LimitField label="Spend limit ($)" min="0" step="0.01" value={newKeySpendLimit} onChange={setNewKeySpendLimit} />
                      <LimitField label="Rate limit (req/min)" min="1" step="1" value={newKeyRateLimit} onChange={setNewKeyRateLimit} />
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '6px' }}>Token throughput caps (optional)</div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <LimitField label="Per minute" min="1" step="1" value={newKeyTokensPerMinute} onChange={setNewKeyTokensPerMinute} />
                      <LimitField label="Per hour" min="1" step="1" value={newKeyTokensPerHour} onChange={setNewKeyTokensPerHour} />
                      <LimitField label="Per day" min="1" step="1" value={newKeyTokensPerDay} onChange={setNewKeyTokensPerDay} />
                    </div>
                  </div>
                )}

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