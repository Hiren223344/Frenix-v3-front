import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Lock, Send, ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { accentDisplay } = useTheme();

  if (!isAuthenticated) {
    return (
      <div className="animate-fadeInUp" style={{ padding: '80px 0 100px 0', textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            color: 'var(--text)',
          }}
        >
          <Lock size={28} />
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: 400, margin: '0 0 10px 0', letterSpacing: '-0.01em' }}>
          Authentication Required
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 28px 0' }}>
          You must sign in with Telegram to access your Dashboard and manage your Frenix API keys.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={openAuthModal}
            style={{
              padding: '12px 24px',
              borderRadius: '22px',
              backgroundColor: 'var(--text)',
              color: 'var(--bg)',
              border: 'none',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            <Send size={16} />
            <span>Sign in with Telegram</span>
          </button>

          <Link
            to="/"
            style={{
              padding: '10px 24px',
              borderRadius: '22px',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--text)',
              fontSize: '13px',
              fontWeight: 400,
              textAlign: 'center',
            }}
          >
            Back to Home
          </Link>
        </div>

        <div style={{ marginTop: '32px', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left', fontSize: '12px', color: 'var(--muted)' }}>
          <ShieldAlert size={18} style={{ flexShrink: 0, color: '#f59e0b' }} />
          <span>Frenix uses bot-mediated session verification via @frenix_bot without storing passwords or personal credentials.</span>
        </div>
      </div>
    );
  }

  return children;
}