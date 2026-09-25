import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useTranslate } from '../context/LanguageContext';
import { Search, Cpu, Filter, Check, Copy, Wifi, Lock } from 'lucide-react';
import { resolveProviderIcons, displayProviderFor } from '../components/icons/BrandIcons';
import SplitText from '../components/ui/split-text';

function formatContextWindow(tokens) {
  if (!tokens) return '—';
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(tokens % 1_000_000 === 0 ? 0 : 1)}M tokens`;
  if (tokens >= 1_000) return `${Math.round(tokens / 1000)}k tokens`;
  return `${tokens} tokens`;
}

function describeCapabilities(capabilities) {
  if (!capabilities) return 'Text';
  const labels = [];
  if (capabilities.vision) labels.push('Vision');
  if (capabilities.tools) labels.push('Tools');
  if (capabilities.streaming) labels.push('Streaming');
  if (capabilities.json_mode) labels.push('JSON mode');
  return labels.length ? labels.join(', ') : 'Text';
}

// Groups the flat GET /v1/models response into the same
// { provider, models: [{ id, name, context, type, tier }] } shape the
// static catalog below uses, so the rest of this page doesn't care whether
// it's rendering real or placeholder data. displayProviderFor (see
// BrandIcons.jsx) decides the section by model id, not the backend's raw
// wire-format provider field.
function groupLiveModels(data) {
  const byProvider = new Map();
  for (const m of data) {
    const provider = displayProviderFor(m);
    if (!byProvider.has(provider)) byProvider.set(provider, []);
    byProvider.get(provider).push({
      id: m.id,
      name: m.id,
      context: formatContextWindow(m.context_window),
      type: describeCapabilities(m.capabilities),
      tier: m.tier_required ? m.tier_required[0].toUpperCase() + m.tier_required.slice(1) : 'Free',
      // Paid-tier models are listed for visibility but aren't callable via
      // /v1/chat/completions or /v1/embeddings — they're served through a
      // separate endpoint. The static catalog below has no such
      // restriction (it's placeholder data, not live), so it defaults true.
      accessible: m.accessible !== false,
    });
  }
  return Array.from(byProvider.entries()).map(([provider, models]) => ({ provider, models }));
}

const MODEL_DATA = [
  {
    provider: 'OpenAI',
    models: [
      { id: 'gpt-6-astra', name: 'GPT-6 Astra', context: '1M tokens', type: 'Latest flagship reasoning & general', tier: 'Pro' },
      { id: 'gpt-5.1', name: 'GPT-5.1', context: '1M tokens', type: 'Flagship reasoning & general', tier: 'Pro' },
      { id: 'gpt-4o', name: 'GPT-4o', context: '128k tokens', type: 'Fast multimodal powerhouse', tier: 'Free & Pro' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', context: '128k tokens', type: 'Affordable low latency', tier: 'Free & Pro' },
      { id: 'o3', name: 'o3', context: '200k tokens', type: 'High reasoning & math benchmark', tier: 'Pro' },
      { id: 'o3-mini', name: 'o3-mini', context: '200k tokens', type: 'Fast STEM & code reasoning', tier: 'Pro' },
    ],
  },
  {
    provider: 'Anthropic',
    models: [
      { id: 'claude-fable-5.1', name: 'Claude Fable 5.1', context: '200k tokens', type: 'Latest flagship model', tier: 'Pro' },
      { id: 'claude-opus-4.5', name: 'Claude Opus 4.5', context: '200k tokens', type: 'Top agentic coding & complex synthesis', tier: 'Pro' },
      { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', context: '200k tokens', type: 'Balanced speed, intelligence & refactoring', tier: 'Free & Pro' },
      { id: 'claude-haiku-4', name: 'Claude Haiku 4', context: '200k tokens', type: 'Ultra-fast sub-second responses', tier: 'Free & Pro' },
    ],
  },
  {
    provider: 'Google DeepMind',
    models: [
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', context: '2M tokens', type: 'Mega context & multimodal reasoning', tier: 'Pro' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', context: '1M tokens', type: 'Superfast high-throughput', tier: 'Free & Pro' },
      { id: 'gemini-2.5-flash-thinking', name: 'Gemini 2.5 Flash Thinking', context: '1M tokens', type: 'Explicit step-by-step thinking', tier: 'Pro' },
    ],
  },
  {
    provider: 'Meta',
    models: [
      { id: 'llama-4-maverick', name: 'Llama 4 Maverick', context: '128k tokens', type: 'Open-weight giant & instruction following', tier: 'Free & Pro' },
      { id: 'llama-4-scout', name: 'Llama 4 Scout', context: '128k tokens', type: 'Compact edge and low latency agent', tier: 'Free & Pro' },
      { id: 'llama-3.3-70b-instruct', name: 'Llama 3.3 70B', context: '128k tokens', type: 'Standard reliable workhorse', tier: 'Free & Pro' },
    ],
  },
  {
    provider: 'xAI & Mistral',
    models: [
      { id: 'grok-4', name: 'Grok 4', context: '128k tokens', type: 'Real-time updated knowledge & reasoning', tier: 'Pro' },
      { id: 'mistral-large-3', name: 'Mistral Large 3', context: '128k tokens', type: 'European multilingual & structured reasoning', tier: 'Pro' },
      { id: 'codestral-25', name: 'Codestral 25', context: '256k tokens', type: 'Dedicated code generation & fill-in-the-middle', tier: 'Free & Pro' },
    ],
  },
  {
    provider: 'DeepSeek',
    models: [
      { id: 'deepseek-r1', name: 'DeepSeek R1', context: '64k tokens', type: 'Open reasoning with transparent chain-of-thought', tier: 'Free & Pro' },
      { id: 'deepseek-v3', name: 'DeepSeek V3', context: '64k tokens', type: 'MoE architecture, high token throughput', tier: 'Free & Pro' },
    ],
  },
];

export default function Models() {
  const { accentDisplay } = useTheme();
  const { user } = useAuth();
  const t = useTranslate();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('All');
  const [liveData, setLiveData] = useState(null);

  useEffect(() => {
    const sessionToken = user?.sessionToken || localStorage.getItem('frenix_session_token');
    if (!sessionToken || !window.secureRelayRequest) return;

    let cancelled = false;
    window.secureRelayRequest('/v1/models', {
      headers: { Authorization: `Bearer ${sessionToken}` },
    }).then((res) => {
      if (cancelled || !res.ok || !res.data?.data?.length) return;
      setLiveData(groupLiveModels(res.data.data));
    }).catch(() => {
      // Fall back to the static catalog below.
    });

    return () => { cancelled = true; };
  }, [user]);

  const catalog = liveData || MODEL_DATA;

  const copyModelId = (id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(id);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const providers = useMemo(() => ['All', ...catalog.map((g) => g.provider)], [catalog]);

  const filteredData = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return catalog.map((group) => {
      if (selectedProvider !== 'All' && group.provider !== selectedProvider) {
        return null;
      }
      const matchingModels = group.models.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.type.toLowerCase().includes(q)
      );
      if (matchingModels.length === 0) return null;
      return {
        ...group,
        models: matchingModels,
      };
    }).filter(Boolean);
  }, [catalog, searchTerm, selectedProvider]);

  return (
    <div className="animate-fadeInUp" style={{ padding: '64px 0 96px 0' }}>
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <SplitText tag="h1" text={t('Models Directory')} className="frenix-page-title" textAlign="left" splitType="chars" delay={18} duration={0.6} from={{ opacity: 0, y: 18 }} to={{ opacity: 1, y: 0 }} />
          {liveData && (
            <span
              title={t('Showing models available on your account right now')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: 500,
                color: '#16a34a',
                border: '1px solid #16a34a',
                borderRadius: '10px',
                padding: '2px 8px',
              }}
            >
              <Wifi size={11} />
              {t('Live')}
            </span>
          )}
        </div>
        <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--muted)', margin: '0 0 24px 0', maxWidth: '640px' }}>
          {liveData
            ? t('Models available on your account right now, fetched live from the gateway. Switch any model instantaneously by passing its ID in your existing client.')
            : t('150+ models across every major provider behind one unified endpoint. Switch any model instantaneously by passing its ID in your existing client.')}
        </p>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('Filter models by name, slug or capability (e.g. gpt-5, opus, reasoning)...')}
            className="code-font hover-lift"
            style={{
              width: '100%',
              padding: '12px 14px 12px 42px',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              fontSize: '13px',
              color: 'var(--text)',
              backgroundColor: 'var(--card)',
              outline: 'none',
            }}
          />
        </div>

        {/* Provider Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {providers.map((p) => {
            const active = selectedProvider === p;
            return (
              <button
                key={p}
                onClick={() => setSelectedProvider(p)}
                className="button-press"
                style={{
                  fontSize: '12px',
                  padding: '5px 12px',
                  borderRadius: '16px',
                  border: `1px solid ${active ? 'var(--text)' : 'var(--border)'}`,
                  backgroundColor: active ? 'var(--text)' : 'var(--card)',
                  color: active ? 'var(--bg)' : 'var(--text)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
              >
                {p === 'All' ? t('All') : p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Model Cards / Listings */}
      {filteredData.length === 0 ? (
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--muted)' }}>
          {t('No models found matching')} "{searchTerm}". {t('Try a different search term.')}
        </div>
      ) : (
        filteredData.map((group) => {
          const providerIcons = resolveProviderIcons(group.provider);
          return (
          <div key={group.provider} style={{ marginBottom: '36px' }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {providerIcons.length > 0 ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {providerIcons.map((Icon, i) => <Icon key={i} size={14} />)}
                </span>
              ) : (
                <Cpu size={14} />
              )}
              <span>{group.provider}</span>
              <span style={{ fontSize: '11px', opacity: 0.7 }}>({group.models.length})</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {group.models.map((m) => {
                const isCopied = copiedId === m.id;
                const isAccessible = m.accessible !== false;
                return (
                  <div
                    key={m.id}
                    className="hover-lift"
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: '14px',
                      padding: '16px',
                      backgroundColor: 'var(--card)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      opacity: isAccessible ? 1 : 0.75,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
                        <span style={{ fontWeight: 500, fontSize: '15px' }}>{m.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          {!isAccessible && (
                            <span
                              title={t('Listed for visibility only — paid-tier models are served through a separate endpoint, not /v1/chat/completions or /v1/embeddings')}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                border: '1px solid var(--border)',
                                color: 'var(--muted)',
                              }}
                            >
                              <Lock size={10} />
                              {t('Separate endpoint')}
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              border: '1px solid var(--border)',
                              color: 'var(--muted)',
                            }}
                          >
                            {t(m.tier)}
                          </span>
                        </div>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                        {t(m.type)}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '6px' }}>
                      <span className="code-font" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        {m.context}
                      </span>
                      <button
                        onClick={() => copyModelId(m.id)}
                        className="code-font button-press"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          backgroundColor: 'transparent',
                          color: isCopied ? '#16a34a' : 'var(--text)',
                          padding: '4px 8px',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        {isCopied ? <Check size={12} className="animate-popIn" /> : <Copy size={12} />}
                        <span>{isCopied ? t('Copied') : m.id}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          );
        })
      )}
    </div>
  );
}