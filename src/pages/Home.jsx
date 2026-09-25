import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Copy,
  Terminal,
  Layers,
  Tag,
  BookOpen,
  Shield,
  ArrowRight,
  Zap,
  Wrench,
  RefreshCw,
  KeyRound,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

const TOOLS = ['Claude Code', 'Codex', 'Cline', 'Cursor', 'Aider', 'OpenAI SDK', 'Anthropic SDK', 'Responses API'];

const STATS = [
  { value: '150+', label: 'models behind one endpoint' },
  { value: '1', label: 'key for every client' },
  { value: '0', label: 'code rewrites to switch' },
  { value: '0', label: 'prompts logged or trained on' },
];

const FEATURES = [
  { icon: Zap, title: 'Streaming, native', body: 'Server-sent events pass straight through, token by token, exactly as your client expects.' },
  { icon: Wrench, title: 'Tools & structured output', body: 'Tool calls, JSON schemas and agentic sessions stay 100% compatible with OpenAI and Anthropic formats.' },
  { icon: RefreshCw, title: 'Automatic failover', body: 'Degraded upstream? Frenix reroutes to a healthy provider serving the same weights — no retries on your side.' },
  { icon: Shield, title: 'Your data stays yours', body: 'Requests are never logged, stored, or used for training. Keys, limits and usage stay under your control.' },
];

const QUICK_LINKS = [
  { to: '/docs', icon: BookOpen, title: 'Documentation', body: 'OpenAI, Anthropic & Responses API' },
  { to: '/models', icon: Layers, title: 'Models', body: 'Browse the full 150+ catalog' },
  { to: '/pricing', icon: Tag, title: 'Pricing', body: 'Compare plans & throughput' },
  { to: '/dashboard', icon: Terminal, title: 'Dashboard', body: 'Create and manage API keys' },
];

const FAQS = [
  { q: 'Does Frenix work with Claude Code and Codex?', a: 'Yes. Point Claude Code, Codex, Cline, or any OpenAI- or Anthropic-compatible client at the Frenix endpoint and it works without changes.' },
  { q: 'Do I need to rewrite my project or backend?', a: 'No. Frenix speaks the exact standard request and response formats your client already expects. Swap the base URL and API key and continue.' },
  { q: 'What happens when an upstream provider goes down?', a: 'Frenix automatically detects degradation and switches to alternate healthy providers serving the same model weights seamlessly.' },
  { q: 'How do I get instant assistance or report bugs?', a: 'You can talk directly with our support team on Telegram at @frenix_bot anytime.' },
];

const sectionStyle = { padding: '72px 0', borderTop: '1px solid var(--border)' };

const eyebrowStyle = {
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--accent-display)',
  marginBottom: '12px',
};

const h2Style = {
  fontSize: 'clamp(26px, 3.6vw, 36px)',
  fontWeight: 400,
  letterSpacing: '-0.025em',
  lineHeight: 1.15,
  margin: '0 0 14px 0',
};

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

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
      <section className="stagger" style={{ padding: 'clamp(56px, 10vw, 104px) 0 56px 0', position: 'relative' }}>
        <Link to="/models" className="pill" style={{ marginBottom: '26px' }}>
          <span className="pill-tag">NEW</span>
          <span className="live-dot" style={{ width: '6px', height: '6px' }} />
          <span>Claude Fable 5.1 &amp; GPT-6 Astra are live</span>
          <ArrowRight size={13} />
        </Link>

        <h1
          style={{
            fontSize: 'clamp(40px, 7.4vw, 76px)',
            lineHeight: 1.02,
            fontWeight: 500,
            maxWidth: '860px',
            margin: '0 0 22px 0',
            letterSpacing: '-0.045em',
          }}
        >
          <span className="gradient-text">The fastest way to ship with </span>
          <span className="gradient-accent-text">any model.</span>
        </h1>

        <p style={{ fontSize: 'clamp(16px, 1.8vw, 19px)', lineHeight: 1.6, color: 'var(--muted)', maxWidth: '600px', margin: '0 0 34px 0' }}>
          One key for Claude Code, Codex, Cline, and your own apps. 150+ models behind a single unified endpoint — no SDK changes, zero migration cost.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '34px' }}>
          <Link
            to="/dashboard"
            className="btn-glow"
            style={{
              padding: '13px 24px',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <KeyRound size={16} />
            Get your API key
          </Link>
          <Link
            to="/docs"
            className="button-press glass"
            style={{
              padding: '13px 22px',
              borderRadius: '14px',
              border: '1px solid var(--border-strong)',
              color: 'var(--text)',
              fontSize: '15px',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Read the docs <ArrowRight size={16} />
          </Link>
        </div>

        {/* Command Box */}
        <div
          className="glow-border hover-lift"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '10px 10px 10px 18px',
            maxWidth: '620px',
            backgroundColor: 'var(--card)',
          }}
        >
          <code className="code-font" style={{ fontSize: '14px', color: 'var(--text)', overflowX: 'auto', whiteSpace: 'nowrap', minWidth: 0, lineHeight: 1.8, padding: '2px 0' }}>
            <span style={{ color: 'var(--accent-display)' }}>$</span> export <span style={{ color: 'var(--accent-2)' }}>FRENIX_BASE_URL</span>=https://api.frenix.sh/v1
          </code>
          <button
            onClick={copyCommand}
            aria-label="Copy command"
            className="button-press"
            style={{
              flexShrink: 0,
              width: '38px',
              height: '38px',
              borderRadius: '11px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--hover-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text)',
            }}
            title="Copy command"
          >
            {copied ? <Check size={16} color="#22c55e" className="animate-popIn" /> : <Copy size={15} />}
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px', paddingBottom: '56px' }}>
        {STATS.map((s) => (
          <div
            key={s.label}
            className="hover-lift"
            style={{ border: '1px solid var(--border)', borderRadius: '16px', padding: '22px 20px', backgroundColor: 'var(--card)' }}
          >
            <div className="stat-num gradient-accent-text" style={{ marginBottom: '8px' }}>{s.value}</div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.4 }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* Works-with marquee */}
      <section style={{ padding: '28px 0 40px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'center', marginBottom: '18px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Drop-in for the tools you already use
        </div>
        <div className="marquee">
          <div className="marquee-track">
            {[...TOOLS, ...TOOLS].map((t, i) => (
              <span
                key={i}
                aria-hidden={i >= TOOLS.length}
                style={{ fontSize: '17px', fontWeight: 500, color: 'var(--muted)', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.01em' }}
              >
                <Sparkles size={14} style={{ color: 'var(--accent-display)', opacity: 0.8 }} />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>Why Frenix</div>
        <h2 style={{ ...h2Style, maxWidth: '620px' }}>Everything your agents need. Nothing you have to rewrite.</h2>
        <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 32px 0', maxWidth: '560px' }}>
          Every new model ships behind the same endpoint, the same key, and the same rate limits you already have.
        </p>
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px' }}>
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="hover-lift" style={{ border: '1px solid var(--border)', borderRadius: '18px', padding: '22px', backgroundColor: 'var(--card)' }}>
              <div className="icon-chip" style={{ marginBottom: '16px' }}>
                <Icon size={18} />
              </div>
              <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '6px', letterSpacing: '-0.01em' }}>{title}</div>
              <div style={{ fontSize: '13.5px', lineHeight: 1.65, color: 'var(--muted)' }}>{body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Terminal / Developer Code Preview */}
      <section style={sectionStyle}>
        <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 320px', minWidth: 0 }}>
            <div style={eyebrowStyle}>Two lines. Done.</div>
            <h2 style={h2Style}>Keep the tools you already use</h2>
            <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 22px 0' }}>
              Streaming, tool calls, structured outputs, and agentic sessions remain 100% compatible. Point Claude Code, Codex, Cline, Cursor, or Aider to Frenix with zero rewrites.
            </p>
            <Link to="/docs" className="button-press" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--accent-display)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              Read the docs <ArrowRight size={15} />
            </Link>
          </div>
          <div style={{ flex: '1 1 360px', minWidth: 0, position: 'relative', isolation: 'isolate' }}>
            <div
              aria-hidden
              style={{ position: 'absolute', inset: '10% 5%', background: 'var(--grad)', filter: 'blur(60px)', opacity: 0.35, borderRadius: '50%', zIndex: -1 }}
            />
            <div className="hover-lift" style={{ border: '1px solid var(--border-strong)', borderRadius: '18px', overflow: 'hidden', backgroundColor: 'var(--card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff5f57' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#febc2e' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#28c840' }} />
                <span className="code-font" style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--muted)' }}>~/my-project — zsh</span>
              </div>
              <div className="code-font" style={{ padding: '20px 22px', fontSize: '13px', lineHeight: 2, overflowX: 'auto', whiteSpace: 'nowrap' }}>
                <div><span style={{ color: 'var(--accent-display)' }}>$</span> export <span style={{ color: 'var(--accent-2)' }}>FRENIX_BASE_URL</span>=https://api.frenix.sh/v1</div>
                <div><span style={{ color: 'var(--accent-display)' }}>$</span> export <span style={{ color: 'var(--accent-2)' }}>FRENIX_API_KEY</span>=sk-frx-...</div>
                <div style={{ color: 'var(--muted)' }}># works instantly with any OpenAI/Anthropic client</div>
                <div><span style={{ color: 'var(--accent-display)' }}>$</span> claude</div>
                <div style={{ color: '#22c55e' }}>
                  ✓ Frenix is ready (150+ models enabled)
                  <span className="animate-pulse-cursor" style={{ display: 'inline-block', width: '8px', height: '15px', background: 'var(--text)', marginLeft: '6px', verticalAlign: 'middle' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick link Cards */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>Jump in</div>
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {QUICK_LINKS.map(({ to, icon: Icon, title, body }) => (
            <Link
              key={to}
              to={to}
              className="hover-lift"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '16px 18px',
                backgroundColor: 'var(--card)',
              }}
            >
              <div className="icon-chip">
                <Icon size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: '15px', marginBottom: '2px' }}>{title}</div>
                <div style={{ fontSize: '12.5px', color: 'var(--muted)' }}>{body}</div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>FAQ</div>
        <h2 style={{ ...h2Style, marginBottom: '24px' }}>Frequently asked questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {FAQS.map((item, idx) => {
            const open = openFaq === idx;
            return (
              <div
                key={idx}
                className="hover-lift"
                style={{
                  border: `1px solid ${open ? 'color-mix(in srgb, var(--accent) 40%, transparent)' : 'var(--border)'}`,
                  borderRadius: '14px',
                  backgroundColor: 'var(--card)',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setOpenFaq(open ? -1 : idx)}
                  aria-expanded={open}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    padding: '18px 20px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text)',
                    fontSize: '15px',
                    fontWeight: 500,
                    textAlign: 'left',
                  }}
                >
                  {item.q}
                  <ChevronDown
                    size={18}
                    style={{ flexShrink: 0, color: open ? 'var(--accent-display)' : 'var(--muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease' }}
                  />
                </button>
                <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 0.3s ease' }}>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '0 20px 18px', fontSize: '14px', lineHeight: 1.7, color: 'var(--muted)' }}>{item.a}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '24px 0 104px 0' }}>
        <div
          className="glow-border"
          style={{
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid var(--border-strong)',
            borderRadius: '24px',
            padding: 'clamp(32px, 6vw, 56px)',
            backgroundColor: 'var(--card)',
            textAlign: 'center',
          }}
        >
          <div
            aria-hidden
            style={{ position: 'absolute', left: '50%', top: '-60%', width: '80%', height: '120%', transform: 'translateX(-50%)', background: 'var(--grad)', filter: 'blur(90px)', opacity: 0.28, zIndex: -1 }}
          />
          <h2 style={{ ...h2Style, fontSize: 'clamp(28px, 4.4vw, 44px)', fontWeight: 500 }}>
            <span className="gradient-text">Get your API key in </span>
            <span className="gradient-accent-text">seconds.</span>
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--muted)', margin: '0 auto 28px', maxWidth: '460px' }}>
            Start immediately on the free tier. No credit card required.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              to="/dashboard"
              className="btn-glow"
              style={{ padding: '13px 26px', borderRadius: '14px', fontSize: '15px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              Get started <ArrowRight size={16} />
            </Link>
            <Link
              to="/pricing"
              className="button-press glass"
              style={{ padding: '13px 24px', borderRadius: '14px', border: '1px solid var(--border-strong)', color: 'var(--text)', fontSize: '15px', fontWeight: 500 }}
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
