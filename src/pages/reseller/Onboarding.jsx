import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, CheckCircle2, Copy, RefreshCw } from 'lucide-react';
import { sessionToken, authedRequest } from './shared';
import { LoadingNotice, ErrorNotice } from './EmptyState';

const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid var(--border)',
  backgroundColor: 'var(--bg)', color: 'var(--text)', fontSize: '13px', outline: 'none',
};
const labelStyle = { display: 'block', fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' };
const cardStyle = { border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', backgroundColor: 'var(--card)' };
const primaryButtonStyle = (disabled) => ({
  padding: '9px 20px', borderRadius: '18px', border: 'none', backgroundColor: 'var(--text)', color: 'var(--bg)',
  fontSize: '13px', fontWeight: 500, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.6 : 1,
});
const secondaryButtonStyle = {
  padding: '9px 20px', borderRadius: '18px', border: '1px solid var(--border)', color: 'var(--text)',
  fontSize: '13px', fontWeight: 500, backgroundColor: 'transparent', cursor: 'pointer',
};

const STEPS = [
  { key: 'profile', label: 'Business info' },
  { key: 'domain', label: 'Domain' },
  { key: 'verify', label: 'Verify DNS' },
];

const STEP_HEADERS = {
  profile: {
    title: "Let's get you started",
    subtitle: "A few details about you and your business — then we'll get your domain set up.",
  },
  domain: {
    title: 'Almost there',
    subtitle: "Tell us the domain your customers will use, and we'll walk you through pointing its DNS at Frenix.",
  },
  verify: {
    title: 'One last check',
    subtitle: "Confirm your domain's DNS is pointed at Frenix, and you're fully set up.",
  },
};

function StepIndicator({ step }) {
  const idx = STEPS.findIndex((s) => s.key === step);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
      {STEPS.map((s, i) => (
        <React.Fragment key={s.key}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <div
              style={{
                width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 500, flexShrink: 0,
                backgroundColor: i <= idx ? 'var(--text)' : 'transparent',
                color: i <= idx ? 'var(--bg)' : 'var(--muted)',
                border: i <= idx ? 'none' : '1px solid var(--border)',
              }}
            >
              {i < idx ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '12px', color: i === idx ? 'var(--text)' : 'var(--muted)', fontWeight: i === idx ? 500 : 400, whiteSpace: 'nowrap' }}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function copyToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
}

// ResellerOnboarding is the 3-step wizard that replaces the old
// "call POST /reselling/trial yourself" gap (see EmptyState.jsx): step 1
// collects owner/company info and creates the tenant under the already
// logged-in Frenix identity (POST /reselling/onboarding); step 2 claims a
// domain (POST /reselling/domain); step 3 verifies that domain's DNS
// actually points at Frenix (POST /reselling/domain/verify) before
// calling it "assigned" — the backend only ever hands back a CNAME target
// hostname here, never a raw server IP. Resumable: a reload re-reads
// GET /reselling/me and picks up wherever the account actually is.
export default function ResellerOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const token = sessionToken(user);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState('profile');

  const [ownerFirstName, setOwnerFirstName] = useState('');
  const [ownerLastName, setOwnerLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [apiKeyReveal, setApiKeyReveal] = useState(null);

  const [domain, setDomain] = useState('');
  const [savedDomain, setSavedDomain] = useState('');
  const [dnsInstructions, setDnsInstructions] = useState(null);
  const [savingDomain, setSavingDomain] = useState(false);

  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState('');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        setError('No active session found — please sign in again.');
        setLoading(false);
        return;
      }
      try {
        const res = await authedRequest('/reselling/me', token, { method: 'GET' });
        if (cancelled) return;
        if (res.status === 404) {
          setStep('profile');
        } else if (!res.ok) {
          setError(res.data?.error?.message || `Failed to load onboarding status (HTTP ${res.status})`);
        } else {
          const me = res.data;
          if (me.owner_first_name) setOwnerFirstName(me.owner_first_name);
          if (me.owner_last_name) setOwnerLastName(me.owner_last_name);
          if (me.business_name) setCompanyName(me.business_name);
          if (me.company_location) setCompanyLocation(me.company_location);
          if (!me.domain) {
            setStep('domain');
          } else {
            setSavedDomain(me.domain);
            setDomain(me.domain);
            setDnsInstructions(me.dns_instructions || null);
            setVerified(!!me.dns_verified_at);
            setStep('verify');
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load onboarding status');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const submitProfile = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('No active session found — please sign in again.');
      return;
    }
    if (!ownerFirstName.trim() || !ownerLastName.trim() || !companyName.trim() || !companyLocation.trim()) return;
    setSavingProfile(true);
    setError('');
    try {
      const res = await authedRequest('/reselling/onboarding', token, {
        method: 'POST',
        body: {
          owner_first_name: ownerFirstName.trim(),
          owner_last_name: ownerLastName.trim(),
          company_name: companyName.trim(),
          company_location: companyLocation.trim(),
        },
      });
      if (res.status === 409) {
        // Already onboarded (e.g. an earlier session) — nothing new to
        // create, just move on to the domain step.
        setStep('domain');
        return;
      }
      if (!res.ok) {
        setError(res.data?.error?.message || `Failed to save business info (HTTP ${res.status})`);
        return;
      }
      setApiKeyReveal(res.data);
      setStep('domain');
    } catch (err) {
      setError(err.message || 'Failed to save business info');
    } finally {
      setSavingProfile(false);
    }
  };

  const submitDomain = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('No active session found — please sign in again.');
      return;
    }
    const trimmed = domain.trim().toLowerCase();
    if (!trimmed) return;

    // Resuming with the exact domain already on file: skip re-submitting.
    // POST /reselling/domain always resets review status and DNS
    // verification, even when the value is unchanged, so re-sending an
    // already-verified domain here would needlessly throw away that
    // verification.
    if (trimmed === savedDomain && dnsInstructions) {
      setVerifyMessage('');
      setStep('verify');
      return;
    }

    setSavingDomain(true);
    setError('');
    try {
      const res = await authedRequest('/reselling/domain', token, {
        method: 'POST',
        body: { domain: trimmed },
      });
      if (!res.ok) {
        setError(res.data?.error?.message || `Failed to save domain (HTTP ${res.status})`);
        return;
      }
      setSavedDomain(trimmed);
      setDnsInstructions(res.data.dns_instructions);
      setVerified(false);
      setVerifyMessage('');
      setStep('verify');
    } catch (err) {
      setError(err.message || 'Failed to save domain');
    } finally {
      setSavingDomain(false);
    }
  };

  const checkDns = async () => {
    if (!token) {
      setError('No active session found — please sign in again.');
      return;
    }
    setVerifying(true);
    setError('');
    setVerifyMessage('');
    try {
      const res = await authedRequest('/reselling/domain/verify', token, { method: 'POST' });
      if (!res.ok) {
        setError(res.data?.error?.message || `Failed to check DNS (HTTP ${res.status})`);
        return;
      }
      setVerified(!!res.data.verified);
      setVerifyMessage(res.data.message || '');
    } catch (err) {
      setError(err.message || 'Failed to check DNS');
    } finally {
      setVerifying(false);
    }
  };

  const header = STEP_HEADERS[step] || STEP_HEADERS.profile;

  return (
    <div className="animate-fadeInUp" style={{ padding: '64px 0 96px 0' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 300, margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>{header.title}</h1>
        <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--muted)', margin: 0, maxWidth: '620px' }}>{header.subtitle}</p>
      </div>

      {loading ? (
        <LoadingNotice label="Loading onboarding…" />
      ) : (
        <div style={{ maxWidth: '620px' }}>
          <StepIndicator step={step} />

          {error && (
            <div style={{ marginBottom: '16px' }}>
              <ErrorNotice message={error} />
            </div>
          )}

          {apiKeyReveal && (
            <div style={{ ...cardStyle, borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.08)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <AlertTriangle size={16} color="#f59e0b" />
                <strong style={{ fontSize: '13px' }}>Save your API key — it won't be shown again</strong>
              </div>
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'monospace', fontSize: '12px',
                  padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', wordBreak: 'break-all',
                }}
              >
                <span style={{ flex: 1 }}>{apiKeyReveal.api_key}</span>
                <button type="button" onClick={() => copyToClipboard(apiKeyReveal.api_key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', flexShrink: 0 }} title="Copy">
                  <Copy size={14} />
                </button>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px' }}>
                ${(apiKeyReveal.trial_credits_granted / 1_000_000).toFixed(2)} trial credit granted · trial expires{' '}
                {new Date(apiKeyReveal.trial_expires_at).toLocaleDateString()}
              </div>
            </div>
          )}

          {step === 'profile' && (
            <form onSubmit={submitProfile} style={cardStyle}>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <div style={{ flex: '1 1 180px' }}>
                  <label style={labelStyle}>Owner first name</label>
                  <input style={inputStyle} value={ownerFirstName} onChange={(e) => setOwnerFirstName(e.target.value)} placeholder="Jordan" />
                </div>
                <div style={{ flex: '1 1 180px' }}>
                  <label style={labelStyle}>Owner last name</label>
                  <input style={inputStyle} value={ownerLastName} onChange={(e) => setOwnerLastName(e.target.value)} placeholder="Lee" />
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Company name</label>
                <input style={inputStyle} value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme AI" />
              </div>
              <div style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>Company location</label>
                <input style={inputStyle} value={companyLocation} onChange={(e) => setCompanyLocation(e.target.value)} placeholder="Austin, TX, USA" />
              </div>
              <button type="submit" disabled={savingProfile} className="button-press" style={primaryButtonStyle(savingProfile)}>
                {savingProfile ? 'Saving…' : 'Continue'}
              </button>
            </form>
          )}

          {step === 'domain' && (
            <form onSubmit={submitDomain} style={cardStyle}>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 16px 0', lineHeight: 1.6 }}>
                The domain your own customers will use to reach your white-labeled Frenix instance.
              </p>
              <div style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>Domain</label>
                <input style={inputStyle} value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="app.yourcompany.com" />
              </div>
              <button type="submit" disabled={savingDomain} className="button-press" style={primaryButtonStyle(savingDomain)}>
                {savingDomain ? 'Saving…' : 'Continue'}
              </button>
            </form>
          )}

          {step === 'verify' && (
            <div style={cardStyle}>
              {verified ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle2 size={20} color="#22c55e" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Domain assigned</div>
                    <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>
                      <strong>{savedDomain}</strong> is correctly pointed at Frenix. Your reseller account is fully set up.
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
                      <button type="button" onClick={() => navigate('/reseller/dashboard')} className="button-press" style={primaryButtonStyle(false)}>
                        Go to dashboard
                      </button>
                      <button type="button" onClick={() => setStep('domain')} style={secondaryButtonStyle}>
                        Change domain
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 16px 0', lineHeight: 1.6 }}>
                    Add this record at your DNS provider for <strong>{savedDomain}</strong>, then check again. You're only
                    ever given a hostname to point at — never a raw server IP — so it stays correct even if we move
                    infrastructure later.
                  </p>
                  {dnsInstructions && (
                    <div style={{ marginBottom: '18px', borderRadius: '10px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: '10px 12px', color: 'var(--muted)', borderBottom: '1px solid var(--border)', width: '90px' }}>Type</td>
                            <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', fontFamily: 'monospace' }}>{dnsInstructions.record_type}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '10px 12px', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>Host</td>
                            <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', fontFamily: 'monospace', wordBreak: 'break-all' }}>{dnsInstructions.host}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>Target</td>
                            <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                                <span style={{ wordBreak: 'break-all' }}>{dnsInstructions.target}</span>
                                <button type="button" onClick={() => copyToClipboard(dnsInstructions.target)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', flexShrink: 0 }} title="Copy">
                                  <Copy size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      {dnsInstructions.note && (
                        <div style={{ padding: '10px 12px', fontSize: '11px', color: 'var(--muted)', backgroundColor: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
                          {dnsInstructions.note}
                        </div>
                      )}
                    </div>
                  )}

                  {verifyMessage && <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '14px', lineHeight: 1.6 }}>{verifyMessage}</div>}

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button type="button" onClick={checkDns} disabled={verifying} className="button-press" style={primaryButtonStyle(verifying)}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <RefreshCw size={13} className={verifying ? 'animate-spin' : ''} />
                        {verifying ? 'Checking…' : 'Check DNS'}
                      </span>
                    </button>
                    <button type="button" onClick={() => setStep('domain')} style={secondaryButtonStyle}>
                      Change domain
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
