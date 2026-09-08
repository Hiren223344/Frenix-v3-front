import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

const DISMISSED_KEY = 'frenix_cookie_notice_dismissed';

// Frenix sets no HTTP cookies at all — only a few localStorage items
// (session token, API key metadata cache, referral code, theme
// preference; see /cookies). No consent banner is legally required for
// that, but showing one anyway is a plain, upfront signal to visitors
// about what the site stores in their browser, so it's here regardless.
export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(DISMISSED_KEY)) {
        setVisible(true);
      }
    } catch (_) {
      // If localStorage is unavailable, just don't show the banner —
      // showing a notice about storage we can't actually use would be odd.
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch (_) {}
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      style={{
        position: 'fixed',
        left: '16px',
        right: '16px',
        bottom: '16px',
        zIndex: 9998,
        maxWidth: '560px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '14px 16px',
        borderRadius: '14px',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--card)',
        boxShadow: '0 12px 30px -8px rgba(0, 0, 0, 0.3)',
      }}
    >
      <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: 'var(--muted)', flex: 1 }}>
        We use your browser's local storage to keep you signed in and remember your preferences — no tracking cookies. See our{' '}
        <Link to="/cookies" style={{ color: 'var(--text)', textDecoration: 'underline' }}>
          Cookie Policy
        </Link>
        .
      </p>
      <button
        onClick={dismiss}
        className="button-press"
        style={{
          flexShrink: 0,
          padding: '7px 14px',
          borderRadius: '10px',
          border: 'none',
          backgroundColor: 'var(--text)',
          color: 'var(--bg)',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Got it
      </button>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="button-press"
        style={{
          flexShrink: 0,
          display: 'flex',
          padding: '4px',
          borderRadius: '50%',
          border: 'none',
          background: 'none',
          color: 'var(--muted)',
          cursor: 'pointer',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
