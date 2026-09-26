import React, { useState, useEffect } from 'react';
import { BotAvatar } from 'bot-avatars';
import { MetalFx } from 'metal-fx';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTranslate } from '../context/LanguageContext';
import { SkeletonReveal, ScrollReveal, TextSwap, CardResize } from '../components/animations';
import AnimatedCounter from '../components/ui/animated-counter';
import DeleteButton from '../components/ui/delete-button';
import SplitText from '../components/ui/split-text';
import { CenterMorphModal, CenterMorphModalContent, CenterMorphModalTrigger } from '../components/motion/center-morph-modal';
import { Key, Plus, Copy, Check, BarChart3, Activity, RefreshCw, Wallet, Hash, Gift, AlertTriangle, Bell, X } from 'lucide-react';

// One optional-limit number input, shared by every field in the "Add spend
// / rate limits" section of the create-key form — each is otherwise
// identical (same styling, same "blank = no limit" semantics) so this
// avoids repeating that markup five times over.
function LimitField({ label, value, onChange, min, step, placeholder }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>{label}</label>
      <input
        type="number"
        min={min}
        step={step}
        placeholder={placeholder}
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
function keyLimitSummary(k, t) {
  const parts = [];
  if (k.spendLimit != null) {
    const spent = k.currentSpend != null ? k.currentSpend / 1_000_000 : 0;
    parts.push(`${t('Limit')}: $${spent.toFixed(2)}/$${(k.spendLimit / 1_000_000).toFixed(2)}`);
  }
  if (k.rateLimitRpm != null) parts.push(`${k.rateLimitRpm} ${t('req/min')}`);
  if (k.tokenLimitPerMinute != null) parts.push(`${tokenUsageLabel(k.currentTokensPerMinute, k.tokenLimitPerMinute, t)}/${t('min')}`);
  if (k.tokenLimitPerHour != null) parts.push(`${tokenUsageLabel(k.currentTokensPerHour, k.tokenLimitPerHour, t)}/${t('hr')}`);
  if (k.tokenLimitPerDay != null) parts.push(`${tokenUsageLabel(k.currentTokensPerDay, k.tokenLimitPerDay, t)}/${t('day')}`);
  return parts.join(' • ');
}

function tokenUsageLabel(current, limit, t) {
  const used = current != null ? current.toLocaleString() : '0';
  return `${used}/${limit.toLocaleString()} ${t('tok')}`;
}

export default function Dashboard() {
  const { isDark, accentDisplay } = useTheme();
  const beamTheme = isDark ? 'dark' : 'light';
  const { user } = useAuth();
  const toast = useToast();
  const t = useTranslate();

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
        throw new Error(t('No active Telegram session found. Please log in first.'));
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
        throw new Error(keysRes?.data?.error?.message || `${t('Failed to load API keys')} (HTTP ${keysRes.status})`);
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
          created: k.created_at ? new Date(k.created_at).toLocaleDateString() : t('Active'),
          lastUsed: k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : t('Never'),
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
      const message = err.message || t('Failed to sync with the Frenix gateway');
      setSyncError(message);
      toast.error(t('Sync failed'), message);
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
      if (document.hidden) return; // skip while the tab is backgrounded
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
        throw new Error(t('No active Telegram session found. Please log in first.'));
      }

      // Every limit field is optional: an empty/blank input means no cap,
      // same as leaving the field out of the request body entirely.
      const spendLimitDollars = newKeySpendLimit.trim() ? Number(newKeySpendLimit) : null;
      const rateLimitRpm = newKeyRateLimit.trim() ? Number(newKeyRateLimit) : null;
      const tokensPerMinute = newKeyTokensPerMinute.trim() ? Number(newKeyTokensPerMinute) : null;
      const tokensPerHour = newKeyTokensPerHour.trim() ? Number(newKeyTokensPerHour) : null;
      const tokensPerDay = newKeyTokensPerDay.trim() ? Number(newKeyTokensPerDay) : null;
      if (spendLimitDollars !== null && (!Number.isFinite(spendLimitDollars) || spendLimitDollars < 0)) {
        throw new Error(t('Spend limit must be a non-negative number.'));
      }
      const positiveIntFields = [
        [t('Rate limit'), rateLimitRpm],
        [t('Token limit per minute'), tokensPerMinute],
        [t('Token limit per hour'), tokensPerHour],
        [t('Token limit per day'), tokensPerDay],
      ];
      for (const [label, value] of positiveIntFields) {
        if (value !== null && (!Number.isFinite(value) || value <= 0)) {
          throw new Error(`${label} ${t('must be a positive number.')}`);
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
          created: t('Just now'),
          lastUsed: t('Never'),
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
        const serverError = createRes?.data?.error?.message || `${t('Gateway returned')} HTTP ${createRes.status}`;
        throw new Error(serverError);
      }
    } catch (err) {
      const message = err.message || t('Error communicating with Frenix gateway');
      setErrorMsg(message);
      toast.error(t('Could not create API key'), message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Returns true/false so DeleteButton (which shows an optimistic "Deleted"
  // checkmark only once this resolves) knows whether the revoke actually
  // succeeded server-side, instead of just assuming it did.
  const handleRevokeKey = async (id) => {
    const sessionToken = user?.sessionToken || localStorage.getItem('frenix_session_token');
    if (!sessionToken || !window.secureRelayRequest) {
      const message = t('No active Telegram session found. Please log in again and retry.');
      setSyncError(message);
      toast.error(t('Revoke failed'), message);
      return false;
    }

    // Only remove the key from the list once the server confirms it's
    // actually revoked — previously this always removed it locally even
    // when the DELETE failed or was silently skipped, so a key could look
    // revoked in the UI while staying fully active (and usable) server-side.
    const keyName = keys.find((k) => k.id === id)?.name;
    try {
      const relayRes = await window.secureRelayRequest(`/v1/keys/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${sessionToken}` }
      });
      if (!relayRes.ok) {
        throw new Error(relayRes?.data?.error?.message || `${t('Failed to revoke key')} (HTTP ${relayRes.status})`);
      }
    } catch (err) {
      const message = err.message || t('Failed to revoke key — it is still active. Please try again.');
      setSyncError(message);
      toast.error(t('Revoke failed'), message);
      return false;
    }

    setKeys((prev) => prev.filter((k) => k.id !== id));
    // DeleteButton's own "Deleted" checkmark never gets to render here — the
    // row (and the button with it) unmounts the instant this state update
    // lands — so this toast is the only success feedback the user gets.
    toast.success(t('API key revoked'), keyName ? `"${keyName}" ${t('is no longer active.')}` : undefined);
    return true;
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
      setSyncError(t('Could not copy automatically — long-press (or select) the key text to copy it manually.'));
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
      setSyncError(t('No active Telegram session found. Please log in again and retry.'));
      return;
    }
    let thresholdMicroCredits = null;
    if (!clear) {
      const dollars = Number(thresholdInput);
      if (!thresholdInput.trim() || !Number.isFinite(dollars) || dollars < 0) {
        setSyncError(t('Alert threshold must be a non-negative number.'));
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
        throw new Error(res?.data?.error?.message || `${t('Failed to update alert threshold')} (HTTP ${res.status})`);
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
      toast.success(clear ? t('Balance alert cleared') : t('Balance alert set'));
    } catch (err) {
      const message = err.message || t('Failed to update alert threshold');
      setSyncError(message);
      toast.error(t('Could not update alert'), message);
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
      setSyncError(t('Could not copy automatically — long-press (or select) the link text to copy it manually.'));
    }
  };

  return (
    <div className="animate-fadeInUp" style={{ padding: '64px 0 96px 0' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SplitText tag="h1" text={t('Dashboard')} className="frenix-page-title" textAlign="left" splitType="chars" delay={18} duration={0.6} from={{ opacity: 0, y: 18 }} to={{ opacity: 1, y: 0 }} />
            <BotAvatar type="circle" size={28} state={loading ? 'working' : 'default'} theme={beamTheme} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {account && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--muted)' }}>
                <span>{t('Tier')}: <strong style={{ color: 'var(--text)', textTransform: 'capitalize' }}>{account.tier || t('Free')}</strong></span>
                <span>&bull;</span>
                <span>{t('Credits')}: <strong style={{ color: 'var(--text)' }}>${Number(account.balance_credits || 0).toFixed(2)}</strong></span>
              </div>
            )}
            <MetalFx variant="button" preset="silver" theme={beamTheme} normalizeHostStyles={false} style={{ display: 'inline-block' }}>
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                title={t('Refresh live usage and keys')}
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
                <span>{loading ? t('Updating...') : t('Live Sync')}</span>
              </button>
            </MetalFx>
          </div>
        </div>
        <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--muted)', margin: 0, maxWidth: '580px' }}>
          {t('Manage API keys minted via your Telegram session, monitor throughput, and call unified endpoints.')}
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
            {t('Your balance')} (${Number(account.balance_credits || 0).toFixed(2)}) {t('is at or below your alert threshold. Top up to avoid an interruption.')}
          </span>
        </div>
      )}

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '36px' }}>
        <ScrollReveal y={12} style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', backgroundColor: 'var(--card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px' }}>{t('Credits left')}</span>
            <Wallet size={16} />
          </div>
          <AnimatedCounter
            value={Number(account?.balance_credits ?? 0)}
            decimals={2}
            prefix="$"
            style={{ fontSize: '26px', fontWeight: 500 }}
          />
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
            {account?.tier ? `${account.tier.toUpperCase()} ${t('tier balance')}` : t('Available balance')}
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
                ? `${t('Alert below')} $${(account.low_balance_threshold / 1_000_000).toFixed(2)}`
                : t('Set balance alert')}
            </span>
          </button>

          {showThresholdEditor && (
            <div style={{ marginTop: '8px', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder={t('$ threshold')}
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
                title={t('Save')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', padding: '4px' }}
              >
                <Check size={13} />
              </button>
              {account?.low_balance_threshold != null && (
                <button
                  onClick={() => handleSaveThreshold(true)}
                  disabled={savingThreshold}
                  title={t('Clear alert')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}
        </ScrollReveal>

        <ScrollReveal delay={0.04} y={12} style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', backgroundColor: 'var(--card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px' }}>{t('Total tokens used')}</span>
            <Hash size={16} />
          </div>
          <SkeletonReveal
            loading={loading && !account}
            style={{ height: '46px' }}
            skeleton={
              <>
                <div className="frenix-skel-bar" style={{ width: '70%', height: '26px', marginBottom: '6px' }} />
                <div className="frenix-skel-bar" style={{ width: '90%', height: '12px' }} />
              </>
            }
          >
            <AnimatedCounter value={Number(usage?.total_tokens ?? 0)} style={{ fontSize: '26px', fontWeight: 500 }} />
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{t('Lifetime, prompt + completion')}</div>
          </SkeletonReveal>
        </ScrollReveal>

        <ScrollReveal delay={0.08} y={12} style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', backgroundColor: 'var(--card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px' }}>{t('Requests (24h)')}</span>
            <Activity size={16} />
          </div>
          <SkeletonReveal
            loading={loading && !account}
            style={{ height: '46px' }}
            skeleton={
              <>
                <div className="frenix-skel-bar" style={{ width: '55%', height: '26px', marginBottom: '6px' }} />
                <div className="frenix-skel-bar" style={{ width: '75%', height: '12px' }} />
              </>
            }
          >
            <AnimatedCounter value={Number(usage?.requests_last_24h ?? 0)} style={{ fontSize: '26px', fontWeight: 500 }} />
            <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>{t('Live gateway counter')}</div>
          </SkeletonReveal>
        </ScrollReveal>

        <ScrollReveal delay={0.12} y={12} style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', backgroundColor: 'var(--card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px' }}>{t('Requests (30d)')}</span>
            <BarChart3 size={16} />
          </div>
          <SkeletonReveal
            loading={loading && !account}
            style={{ height: '46px' }}
            skeleton={
              <>
                <div className="frenix-skel-bar" style={{ width: '60%', height: '26px', marginBottom: '6px' }} />
                <div className="frenix-skel-bar" style={{ width: '85%', height: '12px' }} />
              </>
            }
          >
            <AnimatedCounter value={Number(usage?.requests_last_30d ?? 0)} style={{ fontSize: '26px', fontWeight: 500 }} />
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{t('30-day cumulative volume')}</div>
          </SkeletonReveal>
        </ScrollReveal>

        <ScrollReveal delay={0.16} y={12} style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', backgroundColor: 'var(--card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px' }}>{t('Active API Keys')}</span>
            <Key size={16} />
          </div>
          <SkeletonReveal
            loading={loading && !account}
            style={{ height: '46px' }}
            skeleton={
              <>
                <div className="frenix-skel-bar" style={{ width: '30%', height: '26px', marginBottom: '6px' }} />
                <div className="frenix-skel-bar" style={{ width: '65%', height: '12px' }} />
              </>
            }
          >
            <AnimatedCounter value={keys.length} style={{ fontSize: '26px', fontWeight: 500 }} />
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
              {account?.tier ? `${account.tier.toUpperCase()} ${t('Tier quota')}` : t('Authenticated')}
            </div>
          </SkeletonReveal>
        </ScrollReveal>
      </div>

      {/* Referrals */}
      {account?.referral_code && (
        <ScrollReveal style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '20px 22px', backgroundColor: 'var(--card)', marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Gift size={16} />
            <h2 style={{ fontSize: '16px', fontWeight: 500, margin: 0 }}>{t('Refer a friend, earn $100')}</h2>
          </div>
          <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--muted)', margin: '0 0 14px 0', maxWidth: '560px' }}>
            {t('Share your link. The moment someone signs up through it, you get $100 in credits — no limit on how many times.')}
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
              <TextSwap value={referralCopied ? t('Copied') : t('Copy link')} />
            </button>
            <span style={{ fontSize: '13px', color: 'var(--muted)', flexShrink: 0 }}>
              <strong style={{ color: 'var(--text)' }}>{account.referral_count ?? 0}</strong> {account.referral_count === 1 ? t('referral so far') : t('referrals so far')}
            </span>
          </div>
        </ScrollReveal>
      )}

      {/* API Keys Header & Creation */}
      <CenterMorphModal open={showModal} onOpenChange={setShowModal}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 400, margin: 0 }}>{t('API keys')}</h2>
        <CenterMorphModalTrigger>
          <button
            onClick={() => setCreatedKey(null)}
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
            <span>{t('Create API key')}</span>
          </button>
        </CenterMorphModalTrigger>
      </div>

      {/* Keys Table / Container */}
      <ScrollReveal style={{ border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', backgroundColor: 'var(--card)' }}>
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
          <div>{t('Name')}</div>
          <div>{t('Key')}</div>
          <div>{t('Created')}</div>
          <div>{t('Last used')}</div>
          <div className="frenix-key-actions">{t('Actions')}</div>
        </div>

        {keys.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
            {syncError
              ? t('Could not load your API keys. Try "Live Sync" above.')
              : t('No API keys found. Click "Create API key" above to generate your first key.')}
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
                {keyLimitSummary(k, t) && (
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{keyLimitSummary(k, t)}</div>
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
                  title={k.raw ? t('Copy key') : t("Only shown once at creation — this browser doesn't have the secret for this key. Revoke and create a new one to get a copyable key.")}
                >
                  {copiedKeyId === k.id ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                </button>
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '12px' }}>
                <span className="frenix-mobile-label">{t('Created')}: </span>{k.created}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '12px' }}>
                <span className="frenix-mobile-label">{t('Last used')}: </span>{k.lastUsed}
              </div>
              <div className="frenix-key-actions" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <DeleteButton aria-label={`${t('Revoke')} ${k.name}`} onConfirm={() => handleRevokeKey(k.id)} />
              </div>
            </div>
          ))
        )}
      </ScrollReveal>

      {/* Creation Modal */}
      <CenterMorphModalContent
        ariaLabel={t('Create New API Key')}
        ariaDescribedBy="create-key-description"
        dismissible={!isSubmitting}
        className="max-w-[440px]"
      >
          <div style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 500 }}>{t('Create New API Key')}</h3>
            <p id="create-key-description" style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--muted)' }}>
              {t('Give your key a recognizable name to track where it is being utilized.')}
            </p>

            {createdKey ? (
              <div>
                <div style={{ padding: '12px', backgroundColor: 'var(--hover-bg)', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' }}>
                    {t('Save this key now. You will not be able to view it in plaintext again:')}
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
                    {t('This key also works as an MCP server for Claude Code / Claude Desktop:')}
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
                  {t('Done')}
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
                  placeholder={t('Key name (e.g. Staging Agent, Codex CLI)')}
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
                  {showLimitFields ? t('Hide limits') : t('Add spend / rate limits (optional)')}
                </button>

                <CardResize active={showLimitFields}>
                  <div style={{ paddingBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <LimitField label={t('Spend limit ($)')} placeholder={t('No limit')} min="0" step="0.01" value={newKeySpendLimit} onChange={setNewKeySpendLimit} />
                      <LimitField label={t('Rate limit (req/min)')} placeholder={t('No limit')} min="1" step="1" value={newKeyRateLimit} onChange={setNewKeyRateLimit} />
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '6px' }}>{t('Token throughput caps (optional)')}</div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <LimitField label={t('Per minute')} placeholder={t('No limit')} min="1" step="1" value={newKeyTokensPerMinute} onChange={setNewKeyTokensPerMinute} />
                      <LimitField label={t('Per hour')} placeholder={t('No limit')} min="1" step="1" value={newKeyTokensPerHour} onChange={setNewKeyTokensPerHour} />
                      <LimitField label={t('Per day')} placeholder={t('No limit')} min="1" step="1" value={newKeyTokensPerDay} onChange={setNewKeyTokensPerDay} />
                    </div>
                  </div>
                </CardResize>

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
                    {t('Cancel')}
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
                    {isSubmitting ? t('Minting...') : t('Generate Key')}
                  </button>
                </div>
              </form>
            )}
          </div>
      </CenterMorphModalContent>
      </CenterMorphModal>
    </div>
  );
}
