import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useTranslate } from '../context/LanguageContext';
import { Copy, Check, Code, ExternalLink } from 'lucide-react';
import SplitText from '../components/ui/split-text';
import { PreviewRail } from '../components/motion/preview-rail';

export default function Docs() {
  const { accentDisplay } = useTheme();
  const t = useTranslate();
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
    { id: 'quickstart', label: t('Quickstart'), description: t('Get a working request out in under a minute.') },
    { id: 'frontend-integration', label: t('Frontend Integration Guide'), description: t('Wire Frenix into a web app frontend.') },
    { id: 'authentication', label: t('Authentication & Keys'), description: t('Create, scope, and send your API keys.') },
    { id: 'client-configs', label: t('Claude Code & Codex Setup'), description: t('Point CLI coding agents at Frenix.') },
    { id: 'sdk-examples', label: t('Python & Node.js SDKs'), description: t('Drop-in examples with the official SDKs.') },
    { id: 'streaming', label: t('Streaming & Tool Calling'), description: t('SSE streaming and function-calling requests.') },
    { id: 'model-routing', label: t('Model Routing & Fallbacks'), description: t('How Frenix picks a backend and fails over.') },
    { id: 'errors', label: t('Error Codes & Failover'), description: t('Error shapes and what each status code means.') },
    { id: 'rate-limits', label: t('Rate Limits & Concurrency'), description: t('Per-tier limits and the headers that report them.') },
    { id: 'plugins', label: t('Plugins'), description: t('Give the model tools it can call mid-request.') },
    { id: 'referrals', label: t('Referral Program'), description: t('Earn credit for every signup you refer.') },
  ];

  return (
    <div className="animate-fadeInUp" style={{ padding: '64px 0 96px 0' }}>
      <div style={{ marginBottom: '36px' }}>
        <SplitText tag="h1" text={t('Documentation')} className="frenix-page-title-spaced" textAlign="left" splitType="chars" delay={18} duration={0.6} from={{ opacity: 0, y: 18 }} to={{ opacity: 1, y: 0 }} />
        <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--muted)', margin: 0, maxWidth: '640px' }}>
          {t('Complete developer reference for integrating Frenix into CLI coding assistants, custom applications, and autonomous agents.')}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '36px', flexWrap: 'wrap' }}>
        {/* Sidebar Nav — a compact tick rail: hover (or focus) a tick to see
            which section it is via the floating preview, click to jump. */}
        <aside style={{ flex: '0 0 60px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <PreviewRail
            items={navItems}
            activeId={activeTab}
            onItemSelect={(item) => setActiveTab(item.id)}
            highlightActive
            itemSize={22}
            label={t('Documentation sections')}
          />

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
            <span>{t('Ask Support')}</span>
            <ExternalLink size={13} />
          </a>
        </aside>

        {/* Main Content Area */}
        <div style={{ flex: '1 1 500px', minWidth: 0 }}>
          
          {/* TAB: Quickstart */}
          {activeTab === 'quickstart' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 400, margin: '0 0 12px 0' }}>{t('Quickstart Guide')}</h2>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 20px 0' }}>
                {t('Frenix acts as a single, ultra-fast reverse proxy that handles 150+ models from OpenAI, Anthropic, Google, Meta, and xAI. Point existing clients at Frenix without installing any new packages.')}
              </p>

              <h3 style={{ fontSize: '16px', fontWeight: 500, margin: '24px 0 10px 0' }}>1. {t('Set Environment Variables')}</h3>
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--card)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--muted)' }}>
                  <span>{t('Bash Profile (.bashrc / .zshrc)')}</span>
                  <button
                    onClick={() => copyCode('quick-env', 'export FRENIX_BASE_URL=https://api.frenix.sh/v1\nexport FRENIX_API_KEY=sk-frx-your-api-key')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedKey === 'quick-env' ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                    <span>{copiedKey === 'quick-env' ? t('Copied') : t('Copy')}</span>
                  </button>
                </div>
                <div className="code-font" style={{ padding: '16px', fontSize: '13px', lineHeight: 1.9 }}>
                  <div>export FRENIX_BASE_URL=https://api.frenix.sh/v1</div>
                  <div>export FRENIX_API_KEY=sk-frx-your-api-key</div>
                </div>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 500, margin: '24px 0 10px 0' }}>2. {t('Dispatch Your First Request')}</h3>
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--card)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--muted)' }}>
                  <span>{t('cURL Command')}</span>
                  <button
                    onClick={() => copyCode('quick-curl', 'curl https://api.frenix.sh/v1/chat/completions \\\n  -H "Authorization: Bearer $FRENIX_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "model": "claude-opus-4.5",\n    "messages": [{"role": "user", "content": "Explain raft consensus in simple words"}],\n    "temperature": 0.2\n  }\'')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedKey === 'quick-curl' ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                    <span>{copiedKey === 'quick-curl' ? t('Copied') : t('Copy')}</span>
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
                <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '4px' }}>{t('Unified Spec Guarantee')}</div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>
                  {t('Whether target model is Anthropic Claude, OpenAI GPT, Google Gemini, or Meta Llama, Frenix translates schemas automatically. You can always use the OpenAI-style')} <code className="code-font">/chat/completions</code> {t('endpoint.')}
                </p>
              </div>
            </div>
          )}

          {/* TAB: Authentication */}
          {activeTab === 'authentication' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 400, margin: '0 0 12px 0' }}>{t('Authentication & Key Scoping')}</h2>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 20px 0' }}>
                {t('All HTTP requests must carry your API key in standard HTTP Bearer authentication format.')}
              </p>

              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', backgroundColor: 'var(--card)', marginBottom: '24px' }}>
                <code className="code-font" style={{ fontSize: '13px', letterSpacing: '0.5px' }}>
                  Authorization: Bearer sk-frx-************
                </code>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 500, margin: '24px 0 10px 0' }}>{t('Key Security & Cryptography')}</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.9, fontSize: '14px', color: 'var(--muted)' }}>
                <li><strong>{t('No Plaintext Storage:')}</strong> {t('Keys are hashed with Argon2id upon creation.')}</li>
                <li><strong>{t('Instant Revocation:')}</strong> {t('Invalidate compromised keys instantly from your Dashboard.')}</li>
                <li><strong>{t('Per-Key Attribution:')}</strong> {t('Track separate keys for Production, Staging, CLI, and team members.')}</li>
              </ul>
            </div>
          )}

          {/* TAB: Client Configurations */}
          {activeTab === 'client-configs' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 400, margin: '0 0 12px 0' }}>{t('Claude Code, Codex & Cline Setup')}</h2>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 20px 0' }}>
                {t('Configure popular AI developer tools and autonomous coding agents to point to Frenix in 30 seconds.')}
              </p>

              <h3 style={{ fontSize: '16px', fontWeight: 500, margin: '24px 0 8px 0' }}>Claude Code CLI</h3>
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', backgroundColor: 'var(--card)', marginBottom: '12px' }}>
                <div className="code-font" style={{ fontSize: '13px', lineHeight: 1.8 }}>
                  <div>export ANTHROPIC_BASE_URL=https://api.frenix.sh</div>
                  <div>export ANTHROPIC_API_KEY=sk-frx-your-key</div>
                  <div style={{ color: 'var(--muted)', marginTop: '8px' }}># {t('Launch Claude Code')}</div>
                  <div>claude</div>
                </div>
              </div>
              <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 20px 0' }}>
                <strong>{t("No")}</strong> <code className="code-font">/v1</code> {t("suffix here — unlike the OpenAI-compatible base URLs below, the Anthropic SDK that Claude Code runs on appends")} <code className="code-font">/v1/messages</code> {t('to whatever you set')} <code className="code-font">ANTHROPIC_BASE_URL</code> {t('to. Add the')} <code className="code-font">/v1</code> {t('yourself and requests land on a doubled')} <code className="code-font">/v1/v1/messages</code> {t('and 404. Requests hit')} <code className="code-font">POST /v1/messages</code> {t("— Frenix's native Anthropic Messages endpoint, which routes to any model on the platform (not only Anthropic's own), including paid-tier ones the OpenAI-compatible endpoints block. Override the model Claude Code requests with")} <code className="code-font">ANTHROPIC_MODEL</code> {t('(and')} <code className="code-font">ANTHROPIC_SMALL_FAST_MODEL</code> {t('for its background/haiku-tier calls) if you want something other than its default.')}
              </p>

              <h3 style={{ fontSize: '16px', fontWeight: 500, margin: '24px 0 8px 0' }}>Cline / Roo Code ({t('VS Code Extension')})</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)', margin: '0 0 10px 0' }}>
                {t('Open Settings')} &rarr; {t('Select Provider:')} <strong>{t('OpenAI Compatible')}</strong>
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

              <h3 style={{ fontSize: '16px', fontWeight: 500, margin: '24px 0 8px 0' }}>{t('MCP Server (Claude Code, Claude Desktop)')}</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 10px 0' }}>
                {t('Every API key also works as an MCP server at')} <code className="code-font">POST /v1/mcp</code>{t(", exposing ten tools scoped to that key's own account — almost everything the Dashboard can do: model listing, account/usage/key management, and chat completions, embeddings, and Anthropic-native messages. See the")} <Link to="/mcp" style={{ color: 'inherit', textDecoration: 'underline' }}>{t('MCP page')}</Link> {t('for the full tool list.')}
              </p>
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--muted)' }}>
                  <span>claude_desktop_config.json</span>
                  <button
                    onClick={() => copyCode('mcp-config', '{\n  "mcpServers": {\n    "frenix": {\n      "url": "https://api.frenix.sh/v1/mcp",\n      "headers": { "Authorization": "Bearer sk-frx-your-api-key" }\n    }\n  }\n}')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedKey === 'mcp-config' ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                    <span>{copiedKey === 'mcp-config' ? t('Copied') : t('Copy')}</span>
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
              <h2 style={{ fontSize: '24px', fontWeight: 400, margin: '0 0 12px 0' }}>{t('Python & Node.js SDK Examples')}</h2>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 20px 0' }}>
                {t('Zero custom client libraries required. Use official')} <code className="code-font">openai</code> {t('or')} <code className="code-font">anthropic</code> {t('SDKs directly.')}
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
                    <span>{copiedKey === 'py-code' ? t('Copied') : t('Copy')}</span>
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
              <h2 style={{ fontSize: '24px', fontWeight: 400, margin: '0 0 12px 0' }}>{t('Streaming & Tool Calling')}</h2>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 20px 0' }}>
                {t('Frenix supports real-time Server-Sent Events (SSE) token streaming and complex multi-turn function calling without latency buffering.')}
              </p>

              <h3 style={{ fontSize: '16px', fontWeight: 500, margin: '20px 0 8px 0' }}>{t('Streaming Request Flag')}</h3>
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

              <h3 style={{ fontSize: '16px', fontWeight: 500, margin: '20px 0 8px 0' }}>{t('Function Calling / Tools')}</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
                {t('Pass tools in standard JSON schema under')} <code className="code-font">"tools"</code>. {t('Frenix handles native function invocation schemas across all providers automatically.')}
              </p>
            </div>
          )}

          {/* TAB: Model Routing */}
          {activeTab === 'model-routing' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 400, margin: '0 0 12px 0' }}>{t('Model Routing & Aliases')}</h2>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 20px 0' }}>
                {t('Instead of hardcoding provider credentials, Frenix accepts standard model IDs or smart generic aliases.')}
              </p>

              <div style={{ border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', backgroundColor: 'var(--card)', marginBottom: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1fr', padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: '12px', fontWeight: 500, color: 'var(--muted)' }}>
                  <div>{t('Model Slug')}</div><div>{t('Target Provider')}</div><div>{t('Tier')}</div>
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
                    <div style={{ color: 'var(--muted)' }}>{t(row.target)}</div>
                    <div><span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--muted)' }}>{t(row.tier)}</span></div>
                  </div>
                ))}
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '20px 22px', backgroundColor: 'var(--card)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 500, margin: '0 0 8px 0' }}>{t('Free vs. paid-tier model access')}</h3>
                <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 10px 0' }}>
                  <code className="code-font">GET /v1/models</code> {t('lists every model on the platform, including paid-tier ones — each entry carries an')} <code className="code-font">accessible</code> {t('field. Only free-tier models (')}<code className="code-font">accessible: true</code>{t(') are actually callable through')} <code className="code-font">/v1/chat/completions</code> {t('and')} <code className="code-font">/v1/embeddings</code>. {t("A request naming a paid-tier model gets")} <code className="code-font">403 permission_error</code> {t("from these endpoints regardless of your account's own tier — paid-tier models are served through a separate endpoint, not this one.")}
                </p>
                <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--muted)', margin: 0 }}>
                  {t("In short: use the models directory to see what's coming, but build against free-tier models for now.")}
                </p>
              </div>
            </div>
          )}

          {/* TAB: Errors & Failover */}
          {activeTab === 'errors' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 400, margin: '0 0 12px 0' }}>{t('Error Codes & Automatic Failover')}</h2>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 20px 0' }}>
                {t('Frenix continuously monitors health telemetry across regions. If an upstream data center returns 502/503/504 errors, your request fails over to backup cluster instances seamlessly.')}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', backgroundColor: 'var(--card)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span className="code-font" style={{ fontWeight: 600, fontSize: '14px' }}>401 {t('Unauthorized')}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{t('Missing or revoked API key. Verify your key in Dashboard.')}</div>
                </div>

                <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', backgroundColor: 'var(--card)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span className="code-font" style={{ fontWeight: 600, fontSize: '14px' }}>403 {t('Forbidden')}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{t("You named a paid-tier model. It's listed in the models directory for visibility, but not callable here — paid-tier access is served through a separate endpoint.")}</div>
                </div>

                <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', backgroundColor: 'var(--card)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span className="code-font" style={{ fontWeight: 600, fontSize: '14px' }}>429 {t('Too Many Requests')}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{t('Rate limit exceeded — 20 requests/minute flat, every tier.')}</div>
                </div>

                <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', backgroundColor: 'var(--card)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span className="code-font" style={{ fontWeight: 600, fontSize: '14px' }}>503 {t('Service Unavailable')}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{t('All upstream model clusters exhausted during catastrophic provider outage.')}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Rate limits */}
          {activeTab === 'rate-limits' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 400, margin: '0 0 12px 0' }}>{t('Rate Limits & Concurrency')}</h2>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 20px 0' }}>
                {t('One flat rate limit applies to every account, regardless of tier — credit balance, not request count, is what actually bounds how much you can use the gateway.')}
              </p>

              <div style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', backgroundColor: 'var(--card)', marginBottom: '20px', overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '420px', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--muted)' }}>
                      <th style={{ paddingBottom: '10px' }}>{t('Limit')}</th>
                      <th style={{ paddingBottom: '10px' }}>{t('Value')}</th>
                      <th style={{ paddingBottom: '10px' }}>{t('Applies to')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 0', fontWeight: 500 }}>{t('Requests per minute')}</td>
                      <td style={{ padding: '12px 0', fontWeight: 600 }}>20 RPM</td>
                      <td style={{ padding: '12px 0', color: 'var(--muted)' }}>{t('Every account, every tier')}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 0', fontWeight: 500 }}>{t('Daily request cap')}</td>
                      <td style={{ padding: '12px 0', fontWeight: 600 }}>{t('None')}</td>
                      <td style={{ padding: '12px 0', color: 'var(--muted)' }}>{t('Your credit balance is the real ceiling')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0 }}>
                {t('Response headers')} <code className="code-font">x-ratelimit-remaining-minute</code> {t('and')} <code className="code-font">x-ratelimit-reset</code> {t('indicate your current per-minute bucket status; a')} <code className="code-font">Retry-After</code> {t('header is set on a 429.')}
              </p>
            </div>
          )}

          {/* TAB: Referral Program */}
          {activeTab === 'plugins' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 400, margin: '0 0 12px 0' }}>{t('Plugins')}</h2>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 20px 0' }}>
                {t('A plugin gives the model a tool it can call during a chat completion — opt-in per request, not automatic. Name it in the')} <code className="code-font">plugins</code> {t("array and, if the model calls it, Frenix executes it server-side and feeds the result back — you get the model's final answer, not a tool call for you to resolve yourself.")}
              </p>

              <div style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', backgroundColor: 'var(--card)', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 500, margin: '0 0 10px 0' }}>{t('Available plugins')}</h3>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: 1.9, color: 'var(--muted)' }}>
                  <li><code className="code-font">frenix_search</code> — {t("Frenix's own built-in web search. No account or API key needed; shares at most the top 7 results with the model. Full details below.")}</li>
                  <li><code className="code-font">exa_search</code> — {t('web search via Exa (exa.ai), using your own Exa API key. Configure it first at')} <Link to="/plugins" style={{ color: accentDisplay }}>{t('Plugins')}</Link>.</li>
                  <li><code className="code-font">weather</code> — {t('current conditions for a named place, via Open-Meteo. No account or API key needed.')}</li>
                  <li><code className="code-font">calculator</code> — {t('evaluates an arithmetic expression locally. No account, API key, or network call.')}</li>
                  <li><code className="code-font">code_interpreter</code> — {t("runs a short code snippet on Piston, a free public sandboxed execution service — the code runs on Piston's own infrastructure, not Frenix's. No account or API key needed.")}</li>
                </ul>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '20px 22px', backgroundColor: 'var(--card)', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 500, margin: '0 0 10px 0' }}>{t('frenix_search, in depth')}</h3>
                <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 10px 0' }}>
                  {t('Naming')} <code className="code-font">frenix_search</code> {t('in the')} <code className="code-font">plugins</code> {t("array doesn't run a search — it hands the model a")} <code className="code-font">frenix_search(query: string)</code> {t('tool it can choose to call. Only when the model actually calls it does Frenix issue a live web search against its own self-hosted search backend and feed the results back as that tool call\'s result — you never see the intermediate tool call yourself, only the model\'s final answer, which may or may not have needed a search at all.')}
                </p>
                <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 10px 0' }}>
                  {t('Each result the model sees carries a title, source URL, and the scraped page text — up to 7 results per call, each truncated to what the search backend itself returns. A query that turns up nothing yields a plain')} <code className="code-font">"No results found."</code> {t('tool result rather than an error, so the model can say so or try a different query. A backend failure (timeout, unreachable) is likewise fed back as the tool\'s own error text, not surfaced as a failed HTTP request — the model sees the failure and can retry, rephrase, or tell you the search failed.')}
                </p>
                <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 10px 0' }}>
                  {t('Every call the model makes to')} <code className="code-font">frenix_search</code> {t('costs one more round trip to the underlying model — the first round is covered by the request you already sent, but the model\'s follow-up answer (after reading the search results) is a second, separately billed call, and a model that searches more than once before answering spends a third. Frenix caps this at 3 rounds total per request; a model still trying to search once that cap is hit gets cut off, and you receive whatever its last round produced as-is — which may itself be an unresolved tool call rather than a finished answer.')}
                </p>
                <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--muted)', margin: 0 }}>
                  {t('Unlike')} <code className="code-font">exa_search</code>, {t('there is no account to connect and no key to configure — it runs against infrastructure Frenix itself operates, so it works the moment you name it, on any account, at no extra setup cost.')}
                </p>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 500, margin: '0 0 10px 0' }}>{t('Using a plugin')}</h3>
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--card)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--muted)' }}>
                  <span>{t('cURL Command')}</span>
                  <button
                    onClick={() => copyCode('plugins-curl', 'curl https://api.frenix.sh/v1/chat/completions \\\n  -H "Authorization: Bearer $FRENIX_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "model": "frx-gpt-4o",\n    "messages": [{"role": "user", "content": "What\'s the latest on the Raft consensus paper?"}],\n    "plugins": ["frenix_search"]\n  }\'')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedKey === 'plugins-curl' ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                    <span>{copiedKey === 'plugins-curl' ? t('Copied') : t('Copy')}</span>
                  </button>
                </div>
                <div className="code-font" style={{ padding: '16px', fontSize: '13px', lineHeight: 1.9, overflowX: 'auto' }}>
                  <div>curl https://api.frenix.sh/v1/chat/completions \</div>
                  <div>&nbsp;&nbsp;-H "Authorization: Bearer $FRENIX_API_KEY" \</div>
                  <div>&nbsp;&nbsp;-H "Content-Type: application/json" \</div>
                  <div>&nbsp;&nbsp;-d '&#123;</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;"model": "frx-gpt-4o",</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;"messages": [&#123;"role": "user", "content": "What's the latest on the Raft consensus paper?"&#125;],</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;"plugins": ["frenix_search"]</div>
                  <div>&nbsp;&nbsp;&#125;'</div>
                </div>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '20px 22px', backgroundColor: 'var(--card)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 500, margin: '0 0 8px 0' }}>{t('Managing your plugins')}</h3>
                <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 10px 0' }}>
                  <code className="code-font">GET /v1/plugins</code> {t("lists every plugin Frenix knows, whether it's enabled on your account, and")} <code className="code-font">requires_api_key</code> — <code className="code-font">false</code> {t("means it's always on with nothing to configure. For a third-party plugin like")} <code className="code-font">exa_search</code>, <code className="code-font">PUT /v1/plugins/&#123;id&#125;</code> {t('stores (encrypted) your own API key and enables it;')} <code className="code-font">DELETE /v1/plugins/&#123;id&#125;</code> {t('removes it.')}
                </p>
                <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 10px 0' }}>
                  <code className="code-font">stream: true</code> {t('works together with')} <code className="code-font">plugins</code> {t('too — the tool-call loop always runs internally as buffered requests, but once it resolves you get the final answer back as a real SSE stream in the same shape as any other streamed completion.')}
                </p>
                <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--muted)', margin: 0 }}>
                  {t('Whenever')} <code className="code-font">plugins</code> {t('is set, Frenix prepends its own system message giving the model the current date/time and, when it can resolve one from the caller\'s IP, their approximate location and local time — useful for "today", "the weather right now", or "near me" without you supplying any of it yourself. A failed lookup just omits location; it\'s never invented, and never touches a system message you supply yourself.')}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'referrals' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 400, margin: '0 0 12px 0' }}>{t('Referral Program')}</h2>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 20px 0' }}>
                {t("Every account gets its own referral link. Share it — each time someone signs up through it, you're credited $100, with no cap on how many times.")}
              </p>

              <div style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', backgroundColor: 'var(--card)', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 500, margin: '0 0 10px 0' }}>{t('How it works')}</h3>
                <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: 1.9, color: 'var(--muted)' }}>
                  <li>{t('Grab your link from the')} <strong style={{ color: 'var(--text)' }}>{t('Dashboard')}</strong> — {t('it looks like')} <code className="code-font">https://frenix.sh/?ref=&lt;your code&gt;</code>.</li>
                  <li>{t('Anyone who opens it and signs up via Telegram is now attributed to you.')}</li>
                  <li>{t("The instant their account is created, you're credited")} <strong style={{ color: 'var(--text)' }}>$100</strong> — {t('they still get the normal $500 signup bonus too, unaffected.')}</li>
                </ol>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '20px 22px', backgroundColor: 'var(--card)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 500, margin: '0 0 8px 0' }}>{t('API details')}</h3>
                <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 10px 0' }}>
                  <code className="code-font">GET /v1/me</code> {t('returns your own')} <code className="code-font">referral_code</code> {t('and a running')} <code className="code-font">referral_count</code>. {t('To attribute a signup, pass')} <code className="code-font">referral_code</code> {t('in the JSON body of')} <code className="code-font">POST /v1/auth/telegram/start</code> — {t("it's optional, and an invalid or unknown code never blocks the signup, it just means no bonus is granted.")}
                </p>
                <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--muted)', margin: 0 }}>
                  {t("A referral is attributed once, the moment an account is first created — logging in again later never re-triggers it, and you can't refer yourself.")}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}