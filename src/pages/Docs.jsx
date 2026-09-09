import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Copy, Check, Terminal, ShieldCheck, Zap, Repeat, HelpCircle, Code, Cpu, ExternalLink } from 'lucide-react';

export default function Docs() {
  const { accentDisplay } = useTheme();
  const [activeTab, setActiveTab] = useState('quickstart');
  const [copiedKey, setCopiedKey] = useState(null);

  const copyCode = (key, text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const navItems = [
    { id: 'quickstart', label: 'Quickstart' },
    { id: 'frontend-integration', label: 'Frontend Integration Guide' },
    { id: 'authentication', label: 'Authentication & Keys' },
    { id: 'client-configs', label: 'Claude Code & Codex Setup' },
    { id: 'sdk-examples', label: 'Python & Node.js SDKs' },
    { id: 'streaming', label: 'Streaming & Tool Calling' },
    { id: 'model-routing', label: 'Model Routing & Fallbacks' },
    { id: 'errors', label: 'Error Codes & Failover' },
    { id: 'rate-limits', label: 'Rate Limits & Concurrency' },
    { id: 'referrals', label: 'Referral Program' },
  ];

  return (
    <div className="animate-fadeInUp" style={{ padding: '64px 0 96px 0' }}>
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 300, margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
          Documentation
        </h1>
        <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--muted)', margin: 0, maxWidth: '640px' }}>
          Complete developer reference for integrating Frenix into CLI coding assistants, custom applications, and autonomous agents.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '36px', flexWrap: 'wrap' }}>
        {/* Sidebar Nav */}
        <aside style={{ flex: '0 0 220px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  textAlign: 'left',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  backgroundColor: isActive ? 'var(--hover-bg)' : 'transparent',
                  color: isActive ? 'var(--text)' : 'var(--muted)',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: isActive ? 500 : 400,
                  transition: 'all 0.15s ease',
                }}
              >
                {item.label}
              </button>
            );
          })}

          <div style={{ borderTop: '1px solid var(--border)', margin: '14px 0 10px' }} />
          <a
            href="https://t.me/frenix_bot"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '13px',
              color: 'var(--muted)',
            }}
          >
            <span>Ask Support</span>
            <ExternalLink size={13} />
          </a>
        </aside>

        {/* Main Content Area */}
        <div style={{ flex: '1 1 500px', minWidth: 0 }}>
          
          {/* TAB: Quickstart */}
          {activeTab === 'quickstart' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 400, margin: '0 0 12px 0' }}>Quickstart Guide</h2>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 20px 0' }}>
                Frenix acts as a single, ultra-fast reverse proxy that handles 150+ models from OpenAI, Anthropic, Google, Meta, and xAI. Point existing clients at Frenix without installing any new packages.
              </p>

              <h3 style={{ fontSize: '16px', fontWeight: 500, margin: '24px 0 10px 0' }}>1. Set Environment Variables</h3>
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--card)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--muted)' }}>
                  <span>Bash Profile (.bashrc / .zshrc)</span>
                  <button
                    onClick={() => copyCode('quick-env', 'export FRENIX_BASE_URL=https://api.frenix.sh/v1\nexport FRENIX_API_KEY=sk-frx-your-api-key')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedKey === 'quick-env' ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                    <span>{copiedKey === 'quick-env' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="code-font" style={{ padding: '16px', fontSize: '13px', lineHeight: 1.9 }}>
                  <div>export FRENIX_BASE_URL=https://api.frenix.sh/v1</div>
                  <div>export FRENIX_API_KEY=sk-frx-your-api-key</div>
                </div>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 500, margin: '24px 0 10px 0' }}>2. Dispatch Your First Request</h3>
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--card)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--muted)' }}>
                  <span>cURL Command</span>
                  <button
                    onClick={() => copyCode('quick-curl', 'curl https://api.frenix.sh/v1/chat/completions \\\n  -H "Authorization: Bearer $FRENIX_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "model": "claude-opus-4.5",\n    "messages": [{"role": "user", "content": "Explain raft consensus in simple words"}],\n    "temperature": 0.2\n  }\'')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedKey === 'quick-curl' ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                    <span>{copiedKey === 'quick-curl' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="code-font" style={{ padding: '16px', fontSize: '13px', lineHeight: 1.9, overflowX: 'auto' }}>
                  <div>curl https://api.frenix.sh/v1/chat/completions \</div>
                  <div>&nbsp;&nbsp;-H "Authorization: Bearer $FRENIX_API_KEY" \</div>
                  <div>&nbsp;&nbsp;-H "Content-Type: application/json" \</div>
                  <div>&nbsp;&nbsp;-d '&#123;</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;"model": "claude-opus-4.5",</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;"messages": [&#123;"role": "user", "content": "Explain raft consensus in simple words"&#125;],</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;"temperature": 0.2</div>
                  <div>&nbsp;&nbsp;&#125;'</div>
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
                <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '4px' }}>Unified Spec Guarantee</div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>
                  Whether target model is Anthropic Claude, OpenAI GPT, Google Gemini, or Meta Llama, Frenix translates schemas automatically. You can always use the OpenAI-style <code className="code-font">/chat/completions</code> endpoint.
                </p>
              </div>
            </div>
          )}

          {/* TAB: Authentication */}
          {activeTab === 'authentication' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 400, margin: '0 0 12px 0' }}>Authentication & Key Scoping</h2>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 20px 0' }}>
                All HTTP requests must carry your API key in standard HTTP Bearer authentication format.
              </p>

              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', backgroundColor: 'var(--card)', marginBottom: '24px' }}>
                <code className="code-font" style={{ fontSize: '13px', letterSpacing: '0.5px' }}>
                  Authorization: Bearer sk-frx-************
                </code>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 500, margin: '24px 0 10px 0' }}>Key Security & Cryptography</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.9, fontSize: '14px', color: 'var(--muted)' }}>
                <li><strong>No Plaintext Storage:</strong> Keys are hashed with Argon2id upon creation.</li>
                <li><strong>Instant Revocation:</strong> Invalidate compromised keys instantly from your Dashboard.</li>
                <li><strong>Per-Key Attribution:</strong> Track separate keys for Production, Staging, CLI, and team members.</li>
              </ul>
            </div>
          )}

          {/* TAB: Client Configurations */}
          {activeTab === 'client-configs' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 400, margin: '0 0 12px 0' }}>Claude Code, Codex & Cline Setup</h2>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 20px 0' }}>
                Configure popular AI developer tools and autonomous coding agents to point to Frenix in 30 seconds.
              </p>

              <h3 style={{ fontSize: '16px', fontWeight: 500, margin: '24px 0 8px 0' }}>Claude Code CLI</h3>
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', backgroundColor: 'var(--card)', marginBottom: '20px' }}>
                <div className="code-font" style={{ fontSize: '13px', lineHeight: 1.8 }}>
                  <div>export ANTHROPIC_BASE_URL=https://api.frenix.sh/v1</div>
                  <div>export ANTHROPIC_API_KEY=sk-frx-your-key</div>
                  <div style={{ color: 'var(--muted)', marginTop: '8px' }}># Launch Claude Code</div>
                  <div>claude</div>
                </div>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 500, margin: '24px 0 8px 0' }}>Cline / Roo Code (VS Code Extension)</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '0 0 10px 0' }}>
                Open Settings &rarr; Select Provider: <strong>OpenAI Compatible</strong>
              </p>
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', backgroundColor: 'var(--card)', marginBottom: '20px' }}>
                <div className="code-font" style={{ fontSize: '13px', lineHeight: 1.8 }}>
                  <div>Base URL: https://api.frenix.sh/v1</div>
                  <div>API Key: sk-frx-your-key</div>
                  <div>Model ID: claude-opus-4.5 (or gpt-5.1)</div>
                </div>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 500, margin: '24px 0 8px 0' }}>Aider & OpenCode</h3>
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', backgroundColor: 'var(--card)', marginBottom: '20px' }}>
                <div className="code-font" style={{ fontSize: '13px', lineHeight: 1.8 }}>
                  <div>export OPENAI_API_BASE=https://api.frenix.sh/v1</div>
                  <div>export OPENAI_API_KEY=sk-frx-your-key</div>
                  <div>aider --model openai/claude-opus-4.5</div>
                </div>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 500, margin: '24px 0 8px 0' }}>MCP Server (Claude Code, Claude Desktop)</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 10px 0' }}>
                Every API key also works as an MCP server at <code className="code-font">POST /v1/mcp</code>, exposing ten tools scoped to that key's own account — almost everything the Dashboard can do: model listing, account/usage/key management, and chat completions, embeddings, and Anthropic-native messages. See the <Link to="/mcp" style={{ color: 'inherit', textDecoration: 'underline' }}>MCP page</Link> for the full tool list.
              </p>
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--muted)' }}>
                  <span>claude_desktop_config.json</span>
                  <button
                    onClick={() => copyCode('mcp-config', '{\n  "mcpServers": {\n    "frenix": {\n      "url": "https://api.frenix.sh/v1/mcp",\n      "headers": { "Authorization": "Bearer sk-frx-your-api-key" }\n    }\n  }\n}')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedKey === 'mcp-config' ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                    <span>{copiedKey === 'mcp-config' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="code-font" style={{ padding: '16px', fontSize: '13px', lineHeight: 1.8 }}>
                  <div>&#123;</div>
                  <div>&nbsp;&nbsp;"mcpServers": &#123;</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;"frenix": &#123;</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"url": <span style={{ color: '#16a34a' }}>"https://api.frenix.sh/v1/mcp"</span>,</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"headers": &#123; "Authorization": <span style={{ color: '#16a34a' }}>"Bearer sk-frx-your-api-key"</span> &#125;</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&#125;</div>
                  <div>&nbsp;&nbsp;&#125;</div>
                  <div>&#125;</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SDK Examples */}
          {activeTab === 'sdk-examples' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 400, margin: '0 0 12px 0' }}>Python & Node.js SDK Examples</h2>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 20px 0' }}>
                Zero custom client libraries required. Use official <code className="code-font">openai</code> or <code className="code-font">anthropic</code> SDKs directly.
              </p>

              <h3 style={{ fontSize: '16px', fontWeight: 500, margin: '20px 0 8px 0' }}>Python (openai-python)</h3>
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--card)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--muted)' }}>
                  <span>app.py</span>
                  <button
                    onClick={() => copyCode('py-code', 'from openai import OpenAI\n\nclient = OpenAI(\n    base_url="https://api.frenix.sh/v1",\n    api_key="sk-frx-your-api-key"\n)\n\nresponse = client.chat.completions.create(\n    model="gpt-5.1",\n    messages=[{"role": "user", "content": "Write an async task scheduler"}]\n)\nprint(response.choices[0].message.content)')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedKey === 'py-code' ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                    <span>{copiedKey === 'py-code' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="code-font" style={{ padding: '16px', fontSize: '13px', lineHeight: 1.9, overflowX: 'auto' }}>
                  <div><span style={{ color: '#ec4899' }}>from</span> openai <span style={{ color: '#ec4899' }}>import</span> OpenAI</div>
                  <br />
                  <div>client = OpenAI(</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;base_url=<span style={{ color: '#16a34a' }}>"https://api.frenix.sh/v1"</span>,</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;api_key=<span style={{ color: '#16a34a' }}>"sk-frx-your-api-key"</span></div>
                  <div>)</div>
                  <br />
                  <div>response = client.chat.completions.create(</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;model=<span style={{ color: '#16a34a' }}>"gpt-5.1"</span>,</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;messages=[&#123;<span style={{ color: '#16a34a' }}>"role"</span>: <span style={{ color: '#16a34a' }}>"user"</span>, <span style={{ color: '#16a34a' }}>"content"</span>: <span style={{ color: '#16a34a' }}>"Write an async task scheduler"</span>&#125;]</div>
                  <div>)</div>
                  <div>print(response.choices[0].message.content)</div>
                </div>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 500, margin: '20px 0 8px 0' }}>TypeScript / Node.js</h3>
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--card)' }}>
                <div className="code-font" style={{ padding: '16px', fontSize: '13px', lineHeight: 1.9, overflowX: 'auto' }}>
                  <div><span style={{ color: '#ec4899' }}>import</span> OpenAI <span style={{ color: '#ec4899' }}>from</span> <span style={{ color: '#16a34a' }}>'openai'</span>;</div>
                  <br />
                  <div><span style={{ color: '#ec4899' }}>const</span> openai = <span style={{ color: '#ec4899' }}>new</span> OpenAI(&#123;</div>
                  <div>&nbsp;&nbsp;baseURL: <span style={{ color: '#16a34a' }}>'https://api.frenix.sh/v1'</span>,</div>
                  <div>&nbsp;&nbsp;apiKey: process.env.FRENIX_API_KEY,</div>
                  <div>&#125;);</div>
                  <br />
                  <div><span style={{ color: '#ec4899' }}>const</span> completion = <span style={{ color: '#ec4899' }}>await</span> openai.chat.completions.create(&#123;</div>
                  <div>&nbsp;&nbsp;model: <span style={{ color: '#16a34a' }}>'claude-opus-4.5'</span>,</div>
                  <div>&nbsp;&nbsp;messages: [&#123; role: <span style={{ color: '#16a34a' }}>'user'</span>, content: <span style={{ color: '#16a34a' }}>'Summarize system performance metrics'</span> &#125;],</div>
                  <div>&#125;);</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Streaming */}
          {activeTab === 'streaming' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 400, margin: '0 0 12px 0' }}>Streaming & Tool Calling</h2>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 20px 0' }}>
                Frenix supports real-time Server-Sent Events (SSE) token streaming and complex multi-turn function calling without latency buffering.
              </p>

              <h3 style={{ fontSize: '16px', fontWeight: 500, margin: '20px 0 8px 0' }}>Streaming Request Flag</h3>
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', backgroundColor: 'var(--card)', marginBottom: '24px' }}>
                <div className="code-font" style={{ fontSize: '13px', lineHeight: 1.8 }}>
                  <div>curl https://api.frenix.sh/v1/chat/completions \</div>
                  <div>&nbsp;&nbsp;-H "Authorization: Bearer $FRENIX_API_KEY" \</div>
                  <div>&nbsp;&nbsp;-H "Content-Type: application/json" \</div>
                  <div>&nbsp;&nbsp;-d '&#123;</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;"model": "claude-sonnet-4.5",</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;"stream": true,</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;"messages": [&#123;"role": "user", "content": "Stream a 200-word story"&#125;]</div>
                  <div>&nbsp;&nbsp;&#125;'</div>
                </div>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 500, margin: '20px 0 8px 0' }}>Function Calling / Tools</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
                Pass tools in standard JSON schema under <code className="code-font">"tools"</code>. Frenix handles native function invocation schemas across all providers automatically.
              </p>
            </div>
          )}

          {/* TAB: Model Routing */}
          {activeTab === 'model-routing' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 400, margin: '0 0 12px 0' }}>Model Routing & Aliases</h2>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 20px 0' }}>
                Instead of hardcoding provider credentials, Frenix accepts standard model IDs or smart generic aliases.
              </p>

              <div style={{ border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', backgroundColor: 'var(--card)', marginBottom: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1fr', padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: '12px', fontWeight: 500, color: 'var(--muted)' }}>
                  <div>Model Slug</div><div>Target Provider</div><div>Tier</div>
                </div>
                {[
                  { slug: 'claude-opus-4.5', target: 'Anthropic Opus 4.5 (200k context)', tier: 'Pro' },
                  { slug: 'gpt-5.1', target: 'OpenAI Flagship (1M context)', tier: 'Pro' },
                  { slug: 'gemini-2.5-pro', target: 'Google DeepMind (2M context)', tier: 'Pro' },
                  { slug: 'llama-4-maverick', target: 'Meta Open Weights (128k context)', tier: 'Free & Pro' },
                  { slug: 'deepseek-r1', target: 'DeepSeek Reasoning MoE', tier: 'Free & Pro' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1fr', padding: '12px 16px', borderBottom: i === 4 ? 'none' : '1px solid var(--border)', fontSize: '13px' }}>
                    <div className="code-font">{row.slug}</div>
                    <div style={{ color: 'var(--muted)' }}>{row.target}</div>
                    <div><span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--muted)' }}>{row.tier}</span></div>
                  </div>
                ))}
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '20px 22px', backgroundColor: 'var(--card)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 500, margin: '0 0 8px 0' }}>Free vs. paid-tier model access</h3>
                <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 10px 0' }}>
                  <code className="code-font">GET /v1/models</code> lists every model on the platform, including paid-tier ones — each entry carries an <code className="code-font">accessible</code> field. Only free-tier models (<code className="code-font">accessible: true</code>) are actually callable through <code className="code-font">/v1/chat/completions</code> and <code className="code-font">/v1/embeddings</code>. A request naming a paid-tier model gets <code className="code-font">403 permission_error</code> from these endpoints regardless of your account's own tier — paid-tier models are served through a separate endpoint, not this one.
                </p>
                <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--muted)', margin: 0 }}>
                  In short: use the models directory to see what's coming, but build against free-tier models for now.
                </p>
              </div>
            </div>
          )}

          {/* TAB: Errors & Failover */}
          {activeTab === 'errors' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 400, margin: '0 0 12px 0' }}>Error Codes & Automatic Failover</h2>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 20px 0' }}>
                Frenix continuously monitors health telemetry across regions. If an upstream data center returns 502/503/504 errors, your request fails over to backup cluster instances seamlessly.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', backgroundColor: 'var(--card)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span className="code-font" style={{ fontWeight: 600, fontSize: '14px' }}>401 Unauthorized</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Missing or revoked API key. Verify your key in Dashboard.</div>
                </div>

                <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', backgroundColor: 'var(--card)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span className="code-font" style={{ fontWeight: 600, fontSize: '14px' }}>403 Forbidden</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>You named a paid-tier model. It's listed in the models directory for visibility, but not callable here — paid-tier access is served through a separate endpoint.</div>
                </div>

                <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', backgroundColor: 'var(--card)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span className="code-font" style={{ fontWeight: 600, fontSize: '14px' }}>429 Too Many Requests</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Rate limit exceeded — 20 requests/minute flat, every tier.</div>
                </div>

                <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', backgroundColor: 'var(--card)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span className="code-font" style={{ fontWeight: 600, fontSize: '14px' }}>503 Service Unavailable</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>All upstream model clusters exhausted during catastrophic provider outage.</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Rate limits */}
          {activeTab === 'rate-limits' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 400, margin: '0 0 12px 0' }}>Rate Limits & Concurrency</h2>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 20px 0' }}>
                One flat rate limit applies to every account, regardless of tier — credit balance, not request count, is what actually bounds how much you can use the gateway.
              </p>

              <div style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', backgroundColor: 'var(--card)', marginBottom: '20px', overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '420px', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--muted)' }}>
                      <th style={{ paddingBottom: '10px' }}>Limit</th>
                      <th style={{ paddingBottom: '10px' }}>Value</th>
                      <th style={{ paddingBottom: '10px' }}>Applies to</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 0', fontWeight: 500 }}>Requests per minute</td>
                      <td style={{ padding: '12px 0', fontWeight: 600 }}>20 RPM</td>
                      <td style={{ padding: '12px 0', color: 'var(--muted)' }}>Every account, every tier</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 0', fontWeight: 500 }}>Daily request cap</td>
                      <td style={{ padding: '12px 0', fontWeight: 600 }}>None</td>
                      <td style={{ padding: '12px 0', color: 'var(--muted)' }}>Your credit balance is the real ceiling</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0 }}>
                Response headers <code className="code-font">x-ratelimit-remaining-minute</code> and <code className="code-font">x-ratelimit-reset</code> indicate your current per-minute bucket status; a <code className="code-font">Retry-After</code> header is set on a 429.
              </p>
            </div>
          )}

          {/* TAB: Referral Program */}
          {activeTab === 'referrals' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 400, margin: '0 0 12px 0' }}>Referral Program</h2>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 20px 0' }}>
                Every account gets its own referral link. Share it — each time someone signs up through it, you're credited $100, with no cap on how many times.
              </p>

              <div style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', backgroundColor: 'var(--card)', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 500, margin: '0 0 10px 0' }}>How it works</h3>
                <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: 1.9, color: 'var(--muted)' }}>
                  <li>Grab your link from the <strong style={{ color: 'var(--text)' }}>Dashboard</strong> — it looks like <code className="code-font">https://frenix.sh/?ref=&lt;your code&gt;</code>.</li>
                  <li>Anyone who opens it and signs up via Telegram is now attributed to you.</li>
                  <li>The instant their account is created, you're credited <strong style={{ color: 'var(--text)' }}>$100</strong> — they still get the normal $500 signup bonus too, unaffected.</li>
                </ol>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '20px 22px', backgroundColor: 'var(--card)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 500, margin: '0 0 8px 0' }}>API details</h3>
                <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 10px 0' }}>
                  <code className="code-font">GET /v1/me</code> returns your own <code className="code-font">referral_code</code> and a running <code className="code-font">referral_count</code>. To attribute a signup, pass <code className="code-font">referral_code</code> in the JSON body of <code className="code-font">POST /v1/auth/telegram/start</code> — it's optional, and an invalid or unknown code never blocks the signup, it just means no bonus is granted.
                </p>
                <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--muted)', margin: 0 }}>
                  A referral is attributed once, the moment an account is first created — logging in again later never re-triggers it, and you can't refer yourself.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}