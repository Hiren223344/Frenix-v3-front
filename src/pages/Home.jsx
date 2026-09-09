import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Check, Copy, Terminal, Layers, Tag, BookOpen, Shield, HelpCircle, ArrowRight } from 'lucide-react';

export default function Home() {
  const { accentDisplay } = useTheme();
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    const text = 'export FRENIX_BASE_URL=https://api.frenix.sh/v1';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fadeInUp">
      {/* Hero Section */}
      <section style={{ padding: '80px 0 54px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--muted)' }}>Welcome to Frenix AI API</span>
          <span style={{ fontSize: '11px', color: 'var(--muted)', padding: '2px 8px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            current version shown in the sidebar, next to the logo
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 44px)', lineHeight: 1.15, fontWeight: 300, maxWidth: '680px', margin: '0 0 16px 0', letterSpacing: '-0.02em' }}>
          The fastest way to ship with any model.
        </h1>
        <p style={{ fontSize: '17px', lineHeight: 1.6, color: 'var(--muted)', maxWidth: '580px', margin: '0 0 32px 0' }}>
          One key for Claude Code, Codex, Cline, and your own apps. 150+ models behind a single unified endpoint.
        </p>

        {/* Command Box */}
        <div
          className="hover-lift"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '14px 18px',
            marginBottom: '36px',
            backgroundColor: 'var(--card)',
          }}
        >
          <code className="code-font" style={{ fontSize: '14px', color: 'var(--text)', overflowX: 'auto', whiteSpace: 'nowrap' }}>
            export FRENIX_BASE_URL=https://api.frenix.sh/v1
          </code>
          <button
            onClick={copyCommand}
            aria-label="Copy command"
            className="button-press"
            style={{
              flexShrink: 0,
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text)',
            }}
            title="Copy command"
          >
            {copied ? <Check size={16} color="#16a34a" className="animate-popIn" /> : <Copy size={15} />}
          </button>
        </div>

        {/* Quick link Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <Link
            to="/docs"
            className="hover-lift"
            style={{
              display: 'block',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '18px',
              backgroundColor: 'var(--card)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <BookOpen size={18} />
              <span style={{ fontWeight: 400, fontSize: '15px' }}>Documentation</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)' }}>OpenAI, Anthropic & Responses API</div>
          </Link>

          <Link
            to="/models"
            className="hover-lift"
            style={{
              display: 'block',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '18px',
              backgroundColor: 'var(--card)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Layers size={18} />
              <span style={{ fontWeight: 400, fontSize: '15px' }}>Models</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Browse full 150+ catalog</div>
          </Link>

          <Link
            to="/pricing"
            className="hover-lift"
            style={{
              display: 'block',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '18px',
              backgroundColor: 'var(--card)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Tag size={18} />
              <span style={{ fontWeight: 400, fontSize: '15px' }}>Pricing</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Compare plans & throughput</div>
          </Link>

          <Link
            to="/dashboard"
            className="hover-lift"
            style={{
              display: 'block',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '18px',
              backgroundColor: 'var(--card)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Terminal size={18} />
              <span style={{ fontWeight: 400, fontSize: '15px' }}>Dashboard</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Create and manage API keys</div>
          </Link>
        </div>
      </section>

      {/* Routing Highlights Banner */}
      <section style={{ padding: '48px 0', borderTop: '1px solid var(--border)' }}>
        <div
          className="hover-lift"
          style={{
            border: '1px solid var(--border)',
            borderRadius: '18px',
            padding: '30px',
            display: 'flex',
            gap: '24px',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            backgroundColor: 'var(--card)',
          }}
        >
          <div style={{ flex: '1 1 360px', minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.06em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
              Now Routing
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 400, margin: '0 0 8px 0' }}>Claude Opus 4.5 & GPT-5.1 are live.</h2>
            <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--muted)', margin: 0 }}>
              Every new model ships behind the same endpoint, the same key, and the same rate limits you already have. No SDK changes, zero migration cost.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/pricing" className="button-press" style={{ fontSize: '14px', fontWeight: 500, color: accentDisplay, display: 'flex', alignItems: 'center', gap: '6px' }}>
              Explore plans <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Terminal / Developer Code Preview */}
      <section style={{ padding: '56px 0', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 320px', minWidth: 0 }}>
            <h2 style={{ fontSize: '26px', fontWeight: 300, margin: '0 0 16px 0' }}>Keep the tools you already use</h2>
            <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 20px 0' }}>
              Streaming, tool calls, structured outputs, and agentic sessions remain 100% compatible. Point Claude Code, Codex, Cline, Cursor, or Aider to Frenix with zero rewrites.
            </p>
            <Link to="/docs" className="button-press" style={{ fontSize: '14px', fontWeight: 500, color: accentDisplay, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              Read the docs <ArrowRight size={15} />
            </Link>
          </div>
          <div style={{ flex: '1 1 320px', minWidth: 0 }}>
            <div className="hover-lift" style={{ border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', backgroundColor: 'var(--card)' }}>
              <div style={{ display: 'flex', gap: '6px', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#eab308' }} />
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
              </div>
              <div className="code-font" style={{ padding: '18px 20px', fontSize: '13px', lineHeight: 1.9 }}>
                <div>$ export FRENIX_BASE_URL=https://api.frenix.sh/v1</div>
                <div>$ export FRENIX_API_KEY=sk-frx-...</div>
                <div style={{ color: 'var(--muted)' }}># works instantly with any OpenAI/Anthropic client</div>
                <div>$ claude</div>
                <div style={{ color: '#16a34a' }}>✓ Frenix is ready (150+ models enabled)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Data Privacy */}
      <section style={{ padding: '56px 0', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          <Shield size={28} style={{ color: accentDisplay, flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 400, margin: '0 0 8px 0' }}>Your data stays yours</h2>
            <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--muted)', margin: 0 }}>
              Requests are never logged, stored, or used for model training. Keys, limits, and usage metrics stay strictly under your control.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '64px 0', borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 300, margin: '0 0 24px 0' }}>Frequently asked questions</h2>
        {[
          { q: 'Does Frenix work with Claude Code and Codex?', a: 'Yes. Point Claude Code, Codex, Cline, or any OpenAI- or Anthropic-compatible client at the Frenix endpoint and it works without changes.' },
          { q: 'Do I need to rewrite my project or backend?', a: 'No. Frenix speaks the exact standard request and response formats your client already expects. Swap the base URL and API key and continue.' },
          { q: 'What happens when an upstream provider goes down?', a: 'Frenix automatically detects degradation and switches to alternate healthy providers serving the same model weights seamlessly.' },
          { q: 'How do I get instant assistance or report bugs?', a: 'You can talk directly with our support team on Telegram at @frenix_bot anytime.' }
        ].map((item, idx) => (
          <div key={idx} style={{ padding: '18px 0', borderBottom: '1px solid var(--border)', transition: 'background-color 0.15s ease' }}>
            <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '6px' }}>{item.q}</div>
            <div style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--muted)' }}>{item.a}</div>
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section style={{ padding: '64px 0 96px 0', borderTop: '1px solid var(--border)' }}>
        <div className="hover-lift" style={{ border: '1px solid var(--border)', borderRadius: '18px', padding: '36px', backgroundColor: 'var(--card)' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 300, margin: '0 0 8px 0' }}>Get your API key in seconds</h2>
          <p style={{ fontSize: '15px', color: 'var(--muted)', margin: '0 0 24px 0' }}>Start immediately on the free tier. No credit card required.</p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link
              to="/dashboard"
              className="button-press"
              style={{
                padding: '10px 22px',
                borderRadius: '18px',
                backgroundColor: 'var(--text)',
                color: 'var(--bg)',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Get started
            </Link>
            <Link
              to="/pricing"
              className="button-press"
              style={{
                padding: '10px 22px',
                borderRadius: '18px',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}