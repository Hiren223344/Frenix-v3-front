import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Copy, RefreshCw, CheckCircle2 } from 'lucide-react';
import { sessionToken, authedRequest } from './shared';
import { NotATenantNotice, LoadingNotice, ErrorNotice } from './EmptyState';

const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid var(--border)',
  backgroundColor: 'var(--bg)', color: 'var(--text)', fontSize: '13px', outline: 'none',
};
const labelStyle = { display: 'block', fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' };
const cardStyle = { border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', backgroundColor: 'var(--card)', marginBottom: '20px' };
const primaryButtonStyle = (disabled) => ({
  padding: '9px 20px', borderRadius: '18px', border: 'none', backgroundColor: 'var(--text)', color: 'var(--bg)',
  fontSize: '13px', fontWeight: 500, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.6 : 1,
});

function copyToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
}

// ResellerSettings is the ongoing-management counterpart to Onboarding.jsx:
// Onboarding's step 1 (business info) only ever runs once, at signup — this
// is how a tenant edits those same fields afterward (POST
// /reselling/profile) — and it also surfaces domain claim/DNS verification
// (POST /reselling/domain, POST /reselling/domain/verify) as a
// persistently-reachable page rather than something only visible mid-wizard.
export default function ResellerSettings() {
  const { user } = useAuth();
  const token = sessionToken(user);

  const [loading, setLoading] = useState(true);
  const [notTenant, setNotTenant] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  const [ownerFirstName, setOwnerFirstName] = useState('');
  const [ownerLastName, setOwnerLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [domain, setDomain] = useState('');
  const [savedDomain, setSavedDomain] = useState('');
  const [dnsInstructions, setDnsInstructions] = useState(null);
  const [verified, setVerified] = useState(false);
  const [savingDomain, setSavingDomain] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState('');

  const load = useCallback(async () => {
    if (!token) {
      setError('No active session found — please sign in again.');
      setLoading(false);
      return;
    }
    try {
      const res = await authedRequest('/reselling/me', token, { method: 'GET' });
      if (res.status === 404) {
        setNotTenant(true);
        return;
      }
      if (!res.ok) {
        setError(res.data?.error?.message || `Failed to load settings (HTTP ${res.status})`);
        return;
      }
      const me = res.data;
      setOwnerFirstName(me.owner_first_name || '');
      setOwnerLastName(me.owner_last_name || '');
      setCompanyName(me.business_name || '');
      setCompanyLocation(me.company_location || '');
      setDomain(me.domain || '');
      setSavedDomain(me.domain || '');
      setDnsInstructions(me.dns_instructions || null);
      setVerified(!!me.dns_verified_at);
    } catch (err) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('No active session found — please sign in again.');
      return;
    }
    if (!ownerFirstName.trim() || !ownerLastName.trim() || !companyName.trim() || !companyLocation.trim()) return;
    setSavingProfile(true);
    setError('');
    setSaved('');
    try {
      const res = await authedRequest('/reselling/profile', token, {
        method: 'POST',
        body: {
          owner_first_name: ownerFirstName.trim(),
          owner_last_name: ownerLastName.trim(),
          company_name: companyName.trim(),
          company_location: companyLocation.trim(),
        },
      });
      if (!res.ok) {
        setError(res.data?.error?.message || `Failed to save changes (HTTP ${res.status})`);
        return;
      }
      setSaved('profile');
    } catch (err) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSavingProfile(false);
    }
  };

  const saveDomain = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('No active session found — please sign in again.');
      return;
    }
    const trimmed = domain.trim().toLowerCase();
    if (!trimmed) return;
    if (trimmed === savedDomain) return;

    setSavingDomain(true);
    setError('');
    setSaved('');
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
      setSaved('domain');
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

  if (notTenant) return <NotATenantNotice />;
  if (loading) return <LoadingNotice label="Loading settings…" />;

  return (
    <div style={{ maxWidth: '620px' }}>
      {error && (
        <div style={{ marginBottom: '16px' }}>
          <ErrorNotice message={error} />
        </div>
      )}

      <form onSubmit={saveProfile} style={cardStyle}>
        <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '16px' }}>Business info</div>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <div style={{ flex: '1 1 180px' }}>
            <label style={labelStyle}>Owner first name</label>
            <input style={inputStyle} value={ownerFirstName} onChange={(e) => setOwnerFirstName(e.target.value)} />
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <label style={labelStyle}>Owner last name</label>
            <input style={inputStyle} value={ownerLastName} onChange={(e) => setOwnerLastName(e.target.value)} />
          </div>
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Company name</label>
          <input style={inputStyle} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </div>
        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>Company location</label>
          <input style={inputStyle} value={companyLocation} onChange={(e) => setCompanyLocation(e.target.value)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="submit" disabled={savingProfile} className="button-press" style={primaryButtonStyle(savingProfile)}>
            {savingProfile ? 'Saving…' : 'Save changes'}
          </button>
          {saved === 'profile' && <span style={{ fontSize: '12px', color: '#22c55e' }}>Saved</span>}
        </div>
      </form>

      <form onSubmit={saveDomain} style={cardStyle}>
        <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '16px' }}>Domain</div>
        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>Domain your customers use</label>
          <input style={inputStyle} value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="app.yourcompany.com" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="submit"
            disabled={savingDomain || domain.trim().toLowerCase() === savedDomain}
            className="button-press"
            style={primaryButtonStyle(savingDomain || domain.trim().toLowerCase() === savedDomain)}
          >
            {savingDomain ? 'Saving…' : 'Save domain'}
          </button>
          {saved === 'domain' && <span style={{ fontSize: '12px', color: '#22c55e' }}>Saved — check DNS below</span>}
        </div>

        {savedDomain && (
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            {verified ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <CheckCircle2 size={16} color="#22c55e" />
                <span>
                  <strong>{savedDomain}</strong> is verified and pointed at Frenix.
                </span>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 14px 0', lineHeight: 1.6 }}>
                  Add this record at your DNS provider for <strong>{savedDomain}</strong>, then check again. You're only
                  ever given a hostname to point at — never a raw server IP.
                </p>
                {dnsInstructions && (
                  <div style={{ marginBottom: '16px', borderRadius: '10px', border: '1px solid var(--border)', overflow: 'hidden' }}>
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
                <button type="button" onClick={checkDns} disabled={verifying} className="button-press" style={primaryButtonStyle(verifying)}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <RefreshCw size={13} className={verifying ? 'animate-spin' : ''} />
                    {verifying ? 'Checking…' : 'Check DNS'}
                  </span>
                </button>
              </>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
