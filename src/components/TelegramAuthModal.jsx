import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, X, Shield, ExternalLink, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

// Use local proxy or direct API endpoint
const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'frenix.sh'
  ? 'https://api.frenix.sh'
  : (import.meta.env.DEV ? '' : 'https://api.frenix.sh');

export default function TelegramAuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginWithSession, loginWithBot } = useAuth();
  const [step, setStep] = useState('ready'); // 'ready' | 'loading' | 'waiting' | 'expired' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [botDeepLink, setBotDeepLink] = useState('');
  const pollIntervalRef = useRef(null);

  const cleanupPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const handleClose = () => {
    cleanupPolling();
    setStep('ready');
    closeAuthModal();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    if (isAuthModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cleanupPolling();
    };
  }, [isAuthModalOpen]);

  const handleStartTelegramAuth = async () => {
    setStep('loading');
    setErrorMessage('');
    cleanupPolling();

    try {
      // 1. Send encrypted envelope to frontend /api/relay
      let data;
      if (typeof window !== 'undefined' && window.secureRelayRequest) {
        const relayRes = await window.secureRelayRequest('/v1/auth/telegram/start', {
          method: 'POST',
        });
        if (!relayRes.ok) {
          throw new Error(`Failed to initialize session (${relayRes.status})`);
        }
        data = relayRes.data;
      } else {
        const res = await fetch(`${API_BASE}/v1/auth/telegram/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error(`Failed to initialize session (${res.status})`);
        data = await res.json();
      }

      const token = data.token;
      const deepLink = data.deep_link || `https://t.me/frenix_bot?start=${token}`;
      setBotDeepLink(deepLink);

      // Open bot deep link in new tab
      window.open(deepLink, '_blank', 'noopener,noreferrer');
      setStep('waiting');

      // 2. Poll via encrypted /api/relay
      pollIntervalRef.current = setInterval(async () => {
        try {
          let statusData;
          if (typeof window !== 'undefined' && window.secureRelayRequest) {
            const pollRelay = await window.secureRelayRequest(`/v1/auth/telegram/status?token=${encodeURIComponent(token)}`);
            if (pollRelay.status === 404 || pollRelay.status === 410) {
              cleanupPolling();
              setStep('expired');
              return;
            }
            statusData = pollRelay.data;
          } else {
            const statusRes = await fetch(`${API_BASE}/v1/auth/telegram/status?token=${encodeURIComponent(token)}`);
            if (statusRes.status === 404 || statusRes.status === 410) {
              cleanupPolling();
              setStep('expired');
              return;
            }
            statusData = await statusRes.json();
          }

          if (statusData && statusData.status === 'completed') {
            cleanupPolling();
            if (statusData.session_token) {
              localStorage.setItem('frenix_session_token', statusData.session_token);
            }
            loginWithSession({
              telegram_id: statusData.telegram_id,
              username: statusData.username,
              first_name: statusData.first_name,
              session_token: statusData.session_token
            });
            setStep('ready');
          } else if (statusData && statusData.status === 'expired') {
            cleanupPolling();
            setStep('expired');
          }
        } catch (pollErr) {
          console.warn('Status poll warning');
        }
      }, 1500);

    } catch (err) {
      console.error('Telegram auth start error:', err);
      // Fallback if network blocked or CORS error occurs
      setErrorMessage(err.message || 'Unable to connect to Frenix auth service.');
      setStep('error');
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="animate-fadeInUp"
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '18px',
          padding: '28px 24px',
          position: 'relative',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
        }}
      >
        <button
          onClick={handleClose}
          aria-label="Close modal"
          className="button-press"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            border: 'none',
            background: 'var(--hover-bg)',
            color: 'var(--text)',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            zIndex: 10,
          }}
        >
          <X size={18} />
        </button>

        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: 'var(--text)',
            color: 'var(--bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
          }}
        >
          <Send size={22} style={{ marginLeft: '-2px', marginTop: '2px' }} />
        </div>

        <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 500, letterSpacing: '-0.01em' }}>
          Sign in via Telegram
        </h2>
        <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>
          Click below to verify with <strong style={{ color: 'var(--text)' }}>@frenix_bot</strong> on Telegram. No username or password required.
        </p>

        {step === 'loading' && (
          <div style={{ padding: '20px', backgroundColor: 'var(--hover-bg)', borderRadius: '14px', border: '1px solid var(--border)', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
              <RefreshCw size={14} className="animate-spin" />
              <span>Generating secure Telegram session...</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
              Connecting to https://api.frenix.sh/v1/auth/telegram/start
            </div>
          </div>
        )}

        {step === 'waiting' && (
          <div style={{ padding: '18px', backgroundColor: 'var(--hover-bg)', borderRadius: '14px', border: '1px solid var(--border)', marginBottom: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              Waiting for @frenix_bot confirmation...
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>
              Click <strong>Start</strong> in the Telegram chat window to authenticate.
            </div>
            {botDeepLink && (
              <a
                href={botDeepLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: 'var(--text)',
                  textDecoration: 'underline',
                }}
              >
                <span>Re-open @frenix_bot</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}

        {step === 'expired' && (
          <div style={{ padding: '16px', backgroundColor: 'var(--hover-bg)', borderRadius: '14px', border: '1px solid var(--border)', marginBottom: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#ef4444', marginBottom: '4px' }}>
              Authentication session expired
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '10px' }}>
              Sessions expire after 10 minutes. Click below to generate a new session.
            </div>
            <button
              onClick={handleStartTelegramAuth}
              className="button-press"
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                backgroundColor: 'var(--text)',
                color: 'var(--bg)',
                border: 'none',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {step === 'error' && (
          <div style={{ padding: '16px', backgroundColor: 'var(--hover-bg)', borderRadius: '14px', border: '1px solid var(--border)', marginBottom: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#ef4444', marginBottom: '4px' }}>
              Connection Error
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '10px' }}>
              {errorMessage || 'Failed to communicate with auth endpoint.'}
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                onClick={handleStartTelegramAuth}
                className="button-press"
                style={{
                  padding: '7px 14px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--text)',
                  color: 'var(--bg)',
                  border: 'none',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  loginWithBot();
                  closeAuthModal();
                }}
                className="button-press"
                style={{
                  padding: '7px 14px',
                  borderRadius: '12px',
                  backgroundColor: 'transparent',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Offline Mode
              </button>
            </div>
          </div>
        )}

        {step === 'ready' && (
          <button
            type="button"
            onClick={handleStartTelegramAuth}
            className="button-press"
            style={{
              width: '100%',
              padding: '12px 18px',
              borderRadius: '16px',
              backgroundColor: 'var(--text)',
              color: 'var(--bg)',
              border: 'none',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            <Send size={15} />
            <span>Open @frenix_bot &amp; Verify</span>
            <ExternalLink size={13} style={{ opacity: 0.7 }} />
          </button>
        )}

        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: 'var(--muted)' }}>
          <Shield size={13} color="#16a34a" />
          <span>Verified authorization via @frenix_bot</span>
        </div>
      </div>
    </div>
  );
}