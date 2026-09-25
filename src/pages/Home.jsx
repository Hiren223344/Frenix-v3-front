import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BorderBeam } from 'border-beam';
import { BotAvatar } from 'bot-avatars';
import { MetalFx } from 'metal-fx';
import { useTheme } from '../context/ThemeContext';
import { Reveal, ScrollReveal } from '../components/animations';
import NetworkDiagram from '../components/NetworkDiagram';
import {
  Check,
  Copy,
  ArrowRight,
  Repeat,
  Braces,
  Terminal,
  Gauge,
  KeyRound,
  Plug,
} from 'lucide-react';

const TOOLS = ['OpenAI SDK', 'Claude Code', 'Codex', 'Cline', 'Cursor', 'LangChain', 'Vercel AI SDK'];

const FEATURES = [
  { Icon: Repeat, tag: 'routing', title: 'Automatic provider failover', body: 'When a provider rate-limits or goes down, requests reroute to a healthy equivalent in milliseconds. Your users never see it.' },
  { Icon: Braces, tag: 'compat', title: 'OpenAI-compatible API', body: 'Drop-in for any OpenAI or Anthropic SDK. The same request schema works across all 150+ models.' },
  { Icon: Terminal, tag: 'agents', title: 'Coding agents built-in', body: 'First-class support for Claude Code, Codex and Cline. Point them at Frenix with zero rewrites.' },
  { Icon: Gauge, tag: 'limits', title: 'Predictable throughput', body: 'Plans priced by requests per minute, not tokens. Know what you can build before the month starts.' },
  { Icon: KeyRound, tag: 'keys', title: 'Keys & spend limits', body: 'Issue scoped API keys per project, cap spend or rate per key, and rotate instantly from the dashboard.' },
  { Icon: Plug, tag: 'mcp', title: 'MCP & Plugins', body: 'Expose tools over MCP and extend the gateway with plugins for search, logging and guardrails.' },
];

const STEPS = [
  { n: '01', title: 'Sign in', body: 'Authenticate with Telegram — no separate account or password to manage.' },
  { n: '02', title: 'Create a key', body: 'Generate a scoped API key from the Dashboard. Free tier needs no card.' },
  { n: '03', title: 'Connect your tool', body: 'SDK, Claude Code, Codex or Cline — point them at one base URL and go.' },
];

const MODELS = [
  { id: 'gpt-6-astra', ctx: '1M tokens', type: 'Latest flagship reasoning & general' },
  { id: 'claude-fable-5.1', ctx: '200k tokens', type: 'Latest flagship model' },
  { id: 'claude-sonnet-4.5', ctx: '200k tokens', type: 'Balanced speed & refactoring' },
  { id: 'gemini-2.5-pro', ctx: '2M tokens', type: 'Mega context & multimodal' },
  { id: 'deepseek-r1', ctx: '64k tokens', type: 'Open reasoning, transparent CoT' },
];

const PLANS = [
  {
    icon: '○', limit: '500 RPD', name: 'Free', desc: 'For experimenting & testing Frenix', price: '$0', per: '',
    cta: 'Start Free', to: '/dashboard', border: 'var(--border)', filled: false,
    items: ['Access to free models tier', '500 requests per day', '5 requests per minute burst', '1 active API key'],
  },
  {
    icon: '≡', limit: '10 RPM', name: 'Pro', desc: 'For everyday builders & power agents', price: '$30', per: '/ month',
    cta: 'Choose Pro', to: '/pricing', border: 'var(--text)', filled: true, popular: true,
    items: ['Unlimited access to all 150+ models', '10 requests per minute', 'Claude Code, Codex, Cline support', 'Automatic provider failover'],
  },
  {
    icon: '◇', limit: 'Custom Limits', name: 'Enterprise', desc: 'For high-scale production systems', price: 'Custom', per: '',
    cta: 'Contact on Telegram', to: 'https://t.me/frenix_bot', external: true, border: 'var(--border)', filled: false,
    items: ['Dedicated throughput guarantees', 'Custom SLA & uptime monitor', 'Bring-your-own-keys (BYOK)', 'SSO, team roles & audit logs'],
  },
];

export default function Home() {
  const { isDark, accentDisplay } = useTheme();
  const beamTheme = isDark ? 'dark' : 'light';
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
      {/* Hero */}
      <section style={{ padding: '80px 0 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <BotAvatar type="circle" size={26} state="default" theme={beamTheme} />
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12.5px',
              color: 'var(--muted)',
              border: '1px solid var(--border)',
              borderRadius: '999px',
              padding: '4px 10px 4px 4px',
            }}
          >
            <span style={{ backgroundColor: 'var(--text)', color: 'var(--bg)', borderRadius: '999px', padding: '2px 8px', fontSize: '11px', fontWeight: 500 }}>v0.3.2</span>
            MCP &amp; Plugins are live
          </span>
        </div>

        <Reveal>
          <h1
            className="t-stagger-line t-stagger-line--1"
            style={{ margin: 0, fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 1.02, fontWeight: 400, letterSpacing: '-0.03em', maxWidth: '720px' }}
          >
            One API key.<br />
            <span style={{ color: 'var(--muted)' }}>Every model.</span>
          </h1>
          <p
            className="t-stagger-line t-stagger-line--2"
            style={{ margin: '18px 0 0 0', fontSize: '17px', lineHeight: 1.6, color: 'var(--muted)', maxWidth: '520px' }}
          >
            The OpenAI-compatible gateway with automatic failover and flat, predictable pricing.
          </p>
        </Reveal>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', margin: '28px 0 20px 0' }}>
          <MetalFx variant="button" preset="chromatic" theme={beamTheme} normalizeHostStyles={false}>
            <Link
              to="/dashboard"
              className="button-press"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '13px 22px 13px 26px',
                borderRadius: '999px',
                backgroundColor: 'var(--text)',
                color: 'var(--bg)',
                fontSize: '15px',
                fontWeight: 500,
              }}
            >
              Start free <ArrowRight size={15} />
            </Link>
          </MetalFx>
          <button
            onClick={copyCommand}
            className="button-press code-font"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '13.5px',
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              padding: '12px 18px',
              borderRadius: '999px',
              cursor: 'pointer',
            }}
          >
            <span style={{ color: 'var(--muted)' }}>&gt;_</span>
            export FRENIX_BASE_URL=...
            <span style={{ fontSize: '11px', color: 'var(--muted)', borderLeft: '1px solid var(--border)', paddingLeft: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {copied ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
              {copied ? 'copied' : 'copy'}
            </span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', fontSize: '12.5px', color: 'var(--muted)', marginBottom: '56px' }}>
          <span>500 free requests / day</span><span style={{ color: 'var(--border)' }}>·</span>
          <span>No token markups</span><span style={{ color: 'var(--border)' }}>·</span>
          <span>BYOK supported</span>
        </div>

        <BorderBeam size="md" colorVariant="mono" strength={0.4} theme={beamTheme} style={{ display: 'block' }}>
          <NetworkDiagram />
        </BorderBeam>
      </section>

      {/* Works with */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginTop: '0' }}>
        <ScrollReveal style={{ padding: '22px 0', display: 'flex', alignItems: 'center', gap: '34px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Works with</span>
          {TOOLS.map((t) => (
            <span key={t} style={{ fontSize: '15px', fontWeight: 500, color: 'var(--muted)' }}>{t}</span>
          ))}
        </ScrollReveal>
      </section>

      {/* Features */}
      <section style={{ padding: '96px 0 40px 0' }}>
        <ScrollReveal style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap', marginBottom: '36px' }}>
          <h2 style={{ margin: 0, fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1.1, fontWeight: 400, letterSpacing: '-0.02em', maxWidth: '560px' }}>
            Everything between your code and the model.
          </h2>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '15px', lineHeight: 1.55, maxWidth: '340px' }}>
            Routing, failover, keys and limits handled once — at the gateway, not in every service.
          </p>
        </ScrollReveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '16px' }}>
          {FEATURES.map(({ Icon, tag, title, body }, i) => (
            <ScrollReveal key={tag} delay={Math.min(i, 3) * 0.06} y={16}>
              <div className="hover-lift" style={{ border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', backgroundColor: 'var(--card)', display: 'flex', flexDirection: 'column', gap: '14px', minHeight: '200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ width: '36px', height: '36px', border: '1px solid var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} />
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '999px', padding: '3px 9px' }}>{tag}</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 500, letterSpacing: '-0.01em' }}>{title}</div>
                <div style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.55 }}>{body}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Quickstart */}
      <section style={{ padding: '56px 0', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: '48px', alignItems: 'center' }}>
        <ScrollReveal style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Quickstart</span>
          <h2 style={{ margin: 0, fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1.1, fontWeight: 400, letterSpacing: '-0.02em' }}>Live in three steps.</h2>
          <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border)' }}>
            {STEPS.map((s) => (
              <div key={s.n} style={{ display: 'grid', gridTemplateColumns: '36px 1fr', gap: '12px', padding: '18px 0', borderBottom: '1px solid var(--border)' }}>
                <span className="code-font" style={{ fontSize: '13px', color: 'var(--muted)' }}>{s.n}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 500 }}>{s.title}</span>
                  <span style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.5 }}>{s.body}</span>
                </div>
              </div>
            ))}
          </div>
          <Link to="/docs" className="button-press" style={{ alignSelf: 'flex-start', fontSize: '14px', border: '1px solid var(--border)', borderRadius: '999px', padding: '10px 18px', color: 'var(--text)' }}>
            Read documentation ↗
          </Link>
        </ScrollReveal>
        <ScrollReveal delay={0.1} className="hover-lift code-font" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '22px', fontSize: '13px', lineHeight: 2, color: 'var(--muted)', overflowX: 'auto' }}>
          <div><span style={{ color: 'var(--border)' }}>$</span> <span style={{ color: 'var(--text)' }}>export FRENIX_BASE_URL=https://api.frenix.sh/v1</span></div>
          <div><span style={{ color: 'var(--border)' }}>$</span> <span style={{ color: 'var(--text)' }}>export FRENIX_API_KEY=sk-frx-...</span></div>
          <div style={{ height: '10px' }} />
          <div><span style={{ color: 'var(--border)' }}>$</span> <span style={{ color: 'var(--text)' }}>curl $FRENIX_BASE_URL/chat/completions \</span></div>
          <div>&nbsp;&nbsp;-H "Authorization: Bearer $FRENIX_API_KEY"</div>
          <div style={{ color: '#16a34a' }}>✓ Frenix is ready (150+ models enabled)</div>
        </ScrollReveal>
      </section>

      {/* Models */}
      <section style={{ padding: '40px 0' }}>
        <ScrollReveal style={{ border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', backgroundColor: 'var(--card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '18px', fontWeight: 500 }}>Models</span>
              <span style={{ fontSize: '13.5px', color: 'var(--muted)' }}>150+ models, one schema.</span>
            </div>
            <Link to="/models" className="button-press" style={{ fontSize: '13px', color: accentDisplay }}>View all →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr) minmax(0, 2fr)', gap: '12px', padding: '12px 24px', fontSize: '12px', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
            <span>Model</span><span>Context</span><span>Notes</span>
          </div>
          {MODELS.map((m) => (
            <div key={m.id} className="hover-lift" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr) minmax(0, 2fr)', gap: '12px', padding: '14px 24px', fontSize: '14px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
              <span className="code-font" style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.id}</span>
              <span style={{ color: 'var(--muted)' }}>{m.ctx}</span>
              <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{m.type}</span>
            </div>
          ))}
        </ScrollReveal>
      </section>

      {/* Pricing */}
      <section style={{ padding: '56px 0', borderTop: '1px solid var(--border)' }}>
        <ScrollReveal>
          <h2 style={{ margin: '0 0 10px 0', fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1.1, fontWeight: 400, letterSpacing: '-0.02em' }}>Pricing Plans</h2>
          <p style={{ margin: '0 0 36px 0', color: 'var(--muted)', fontSize: '15px', lineHeight: 1.55, maxWidth: '520px' }}>
            Simple pricing with predictable concurrency and throughput. No surprise bills or token markups.
          </p>
        </ScrollReveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
          {PLANS.map((p, i) => {
            const card = (
              <div className="hover-lift" style={{ position: 'relative', border: `${p.popular ? '1.5px' : '1px'} solid ${p.border}`, borderRadius: '16px', padding: '28px', backgroundColor: 'var(--card)', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ width: '38px', height: '38px', border: '1px solid var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{p.icon}</span>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '999px', padding: '3px 10px' }}>{p.limit}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 500 }}>{p.name}</span>
                  <span style={{ fontSize: '13.5px', color: 'var(--muted)' }}>{p.desc}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 300, letterSpacing: '-0.02em' }}>{p.price}</span>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{p.per}</span>
                </div>
                {p.external ? (
                  <a href={p.to} target="_blank" rel="noopener noreferrer" className="button-press" style={{ textAlign: 'center', fontSize: '14.5px', fontWeight: 500, borderRadius: '999px', padding: '12px', border: '1px solid var(--text)', backgroundColor: 'transparent', color: 'var(--text)' }}>
                    {p.cta}
                  </a>
                ) : (
                  <Link to={p.to} className="button-press" style={{ textAlign: 'center', fontSize: '14.5px', fontWeight: 500, borderRadius: '999px', padding: '12px', border: p.filled ? 'none' : '1px solid var(--text)', backgroundColor: p.filled ? 'var(--text)' : 'transparent', color: p.filled ? 'var(--bg)' : 'var(--text)' }}>
                    {p.cta}
                  </Link>
                )}
                <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {p.items.map((i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '13.5px', color: 'var(--text)' }}>
                      <Check size={15} color={accentDisplay} style={{ flexShrink: 0, marginTop: '2px' }} /> {i}
                    </div>
                  ))}
                </div>
              </div>
            );
            if (!p.popular) {
              return (
                <ScrollReveal key={p.name} delay={i * 0.08} y={16}>
                  {card}
                </ScrollReveal>
              );
            }
            return (
              <ScrollReveal key={p.name} delay={i * 0.08} y={16} style={{ position: 'relative', height: '100%' }}>
                <span style={{ position: 'absolute', top: '-11px', right: '24px', zIndex: 1, background: 'var(--text)', color: 'var(--bg)', fontSize: '11px', fontWeight: 500, borderRadius: '999px', padding: '3px 10px' }}>
                  Most Popular
                </span>
                <BorderBeam size="md" colorVariant="colorful" strength={0.6} theme={beamTheme} style={{ display: 'block', height: '100%' }}>
                  {card}
                </BorderBeam>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '20px 0 96px 0' }}>
        <ScrollReveal>
        <BorderBeam size="md" colorVariant="colorful" strength={0.4} theme={beamTheme} style={{ display: 'block' }}>
          <div className="hover-lift" style={{ border: '1px solid var(--border)', borderRadius: '16px', padding: '56px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center', backgroundColor: 'var(--card)' }}>
            <h2 style={{ margin: 0, fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 400, letterSpacing: '-0.02em' }}>Swap one base URL. Keep your stack.</h2>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '15px' }}>Free forever tier. No card required.</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <MetalFx variant="button" preset="chromatic" theme={beamTheme} normalizeHostStyles={false}>
                <Link to="/dashboard" className="button-press" style={{ display: 'inline-block', fontSize: '15px', fontWeight: 500, backgroundColor: 'var(--text)', color: 'var(--bg)', padding: '13px 24px', borderRadius: '999px' }}>
                  Get your API key
                </Link>
              </MetalFx>
              <a href="https://t.me/frenix_bot" target="_blank" rel="noopener noreferrer" className="button-press" style={{ fontSize: '15px', border: '1px solid var(--border)', color: 'var(--text)', padding: '13px 24px', borderRadius: '999px' }}>
                Join Telegram
              </a>
            </div>
          </div>
        </BorderBeam>
        </ScrollReveal>
      </section>
    </div>
  );
}
