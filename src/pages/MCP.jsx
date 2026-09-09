import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Copy, Check, Plug, ArrowRight } from 'lucide-react';

const TOOLS = [
  { name: 'list_models', mirrors: 'GET /v1/models', notes: 'pricing, capabilities, tier requirement' },
  { name: 'get_account', mirrors: 'GET /v1/me', notes: 'tier, balance, referral code' },
  { name: 'set_low_balance_threshold', mirrors: 'PUT /v1/me/low-balance-threshold', notes: 'omit threshold to clear it' },
  { name: 'get_usage', mirrors: 'GET /v1/usage', notes: 'request counts, lifetime tokens' },
  { name: 'list_keys', mirrors: 'GET /v1/keys', notes: 'never returns a raw key value' },
  { name: 'update_key_limits', mirrors: 'PATCH /v1/keys/{id}/limits', notes: 'replaces the full limit set, not a merge' },
  { name: 'revoke_key', mirrors: 'DELETE /v1/keys/{id}', notes: 'irreversible' },
  { name: 'chat_completion', mirrors: 'POST /v1/chat/completions', notes: 'spends credits, same as the REST call' },
  { name: 'anthropic_message', mirrors: 'POST /v1/messages', notes: 'native Anthropic shape; paid-tier models' },
  { name: 'create_embeddings', mirrors: 'POST /v1/embeddings', notes: 'spends credits, same as the REST call' },
];

const CONFIG_SNIPPET = (key) => `{
  "mcpServers": {
    "frenix": {
      "url": "https://api.frenix.sh/v1/mcp",
      "headers": { "Authorization": "Bearer ${key}" }
    }
  }
}`;

export default function MCP() {
  const { isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = CONFIG_SNIPPET('sk-frx-your-api-key');
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const el = document.createElement('textarea');
        el.value = text;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (_) {
      // Clipboard access denied — the code block itself is still selectable.
    }
  };

  return (
    <div className="animate-fadeInUp" style={{ padding: '64px 0 96px 0' }}>
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 300, margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
          MCP Gateway
        </h1>
        <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--muted)', margin: 0, maxWidth: '640px' }}>
          Every API key doubles as credentials for a personal MCP (Model Context Protocol) server, so an MCP
          client — Claude Code, Claude Desktop, or anything else that speaks MCP — can do almost everything
          this Dashboard can: route completions, manage key limits, check usage, and more.
        </p>
      </div>

      {/* Endpoint + connect card */}
      <div className="hover-lift" style={{ border: '1px solid var(--border)', borderRadius: '16px', padding: '20px 24px', backgroundColor: 'var(--card)', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <Plug size={16} />
          <span style={{ fontSize: '15px', fontWeight: 500 }}>POST /v1/mcp</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>
          Authenticated the same way as the rest of the account API — an <code className="code-font">Authorization: Bearer &lt;api key&gt;</code>{' '}
          header. Stateless: each request is a fresh MCP session, so there's no session setup beyond the bearer token.
          Tools are scoped to that key's own account — a caller can only ever see or spend its own data.
        </p>
      </div>

      {/* Tools table */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 400, margin: '0 0 16px 0' }}>Tools</h2>
        <div style={{ border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', backgroundColor: 'var(--card)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.6fr 2fr', padding: '10px 18px', borderBottom: '1px solid var(--border)', fontSize: '12px', fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <div>Tool</div>
            <div>Mirrors</div>
            <div>Notes</div>
          </div>
          {TOOLS.map((t, idx) => (
            <div
              key={t.name}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1.6fr 2fr',
                padding: '14px 18px',
                fontSize: '13px',
                borderBottom: idx === TOOLS.length - 1 ? 'none' : '1px solid var(--border)',
                alignItems: 'center',
              }}
            >
              <div className="code-font" style={{ fontWeight: 500 }}>{t.name}</div>
              <div className="code-font" style={{ color: 'var(--muted)', fontSize: '12px' }}>{t.mirrors}</div>
              <div style={{ color: 'var(--muted)', fontSize: '12px' }}>{t.notes}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '10px 0 0 0' }}>
          Not exposed: minting a new key. That requires a session specifically, not an API key — a leaked key
          must never be able to mint further standing credentials that outlive it getting revoked. Create keys
          from this Dashboard.
        </p>
      </div>

      {/* Config snippet */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 400, margin: '0 0 16px 0' }}>Claude Desktop / Claude Code config</h2>
        <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--muted)' }}>
            <span>claude_desktop_config.json</span>
            <button
              onClick={handleCopy}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {copied ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre
            className="code-font selectable-text"
            style={{ padding: '16px', fontSize: '13px', lineHeight: 1.8, overflowX: 'auto', margin: 0, whiteSpace: 'pre' }}
          >
            {CONFIG_SNIPPET('sk-frx-your-api-key')}
          </pre>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '10px 0 0 0' }}>
          Replace <code className="code-font">sk-frx-your-api-key</code> with a real key from your Dashboard —
          new keys show this same config pre-filled with the real value at creation time.
        </p>
      </div>

      {/* CTA */}
      <div className="hover-lift" style={{ border: '1px solid var(--border)', borderRadius: '16px', padding: '20px 24px', backgroundColor: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
            {isAuthenticated ? 'Ready to connect' : 'Sign in to create a key'}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
            {isAuthenticated
              ? 'Create an API key in your Dashboard to get a ready-to-paste config with the real key inlined.'
              : 'Sign in with Telegram, then create an API key from your Dashboard.'}
          </div>
        </div>
        <Link
          to="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: '18px',
            backgroundColor: 'var(--text)',
            color: 'var(--bg)',
            fontSize: '13px',
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          <span>Go to Dashboard</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
