import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTranslate } from '../context/LanguageContext';
import { Send, Plus, Loader2, AlertTriangle, SlidersHorizontal, X, Copy, Check, ChevronDown, ChevronUp, BrainCircuit, Globe } from 'lucide-react';
import { resolveProviderIcons, displayProviderFor, FrenixIcon } from '../components/icons/BrandIcons';
import SplitText from '../components/ui/split-text';

// Same fallback pattern main.jsx uses for GATEWAY_BASE_URL: relative paths
// reach the gateway via the Vite dev proxy, production talks to it directly
// since it lives on a different domain. Duplicated here (rather than
// exported from main.jsx) because this page needs a raw, unwrapped fetch —
// window.secureRelayRequest buffers the whole response with res.json() and
// has no way to hand back a readable stream.
const GATEWAY_BASE_URL = import.meta.env.DEV ? '' : 'https://api.frenix.sh';

function greetingWord() {
  const h = new Date().getHours();
  if (h < 5) return 'evening';
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

// Splits a message's raw text on ```lang\n...\n``` fences so code can be
// rendered in its own block instead of as plain wrapped text.
function parseContentBlocks(content) {
  const blocks = [];
  const fence = /```(\S*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  while ((match = fence.exec(content)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: 'text', value: content.slice(lastIndex, match.index) });
    }
    blocks.push({ type: 'code', lang: match[1], value: match[2].replace(/\n$/, '') });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) {
    blocks.push({ type: 'text', value: content.slice(lastIndex) });
  }
  return blocks;
}

function CodeBlock({ lang, value }) {
  const [copied, setCopied] = useState(false);
  const t = useTranslate();

  const handleCopy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--card)', margin: '6px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px', borderBottom: '1px solid var(--border)' }}>
        <span className="code-font" style={{ fontSize: '11px', color: 'var(--muted)' }}>{lang || t('text')}</span>
        <button
          onClick={handleCopy}
          className="button-press"
          style={{ display: 'flex', alignItems: 'center', gap: '4px', border: 'none', background: 'none', color: 'var(--muted)', fontSize: '11px', cursor: 'pointer', padding: '2px' }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? t('Copied') : t('Copy')}
        </button>
      </div>
      <pre className="code-font selectable-text" style={{ margin: 0, padding: '13px', fontSize: '13px', lineHeight: 1.6, overflowX: 'auto', whiteSpace: 'pre' }}>
        {value}
      </pre>
    </div>
  );
}

// Inline markdown: code spans, bold, italic, and links. Deliberately just
// these four (in this precedence order, code first so `**not bold**` inside
// a code span is left alone) rather than pulling in a markdown library —
// this app has exactly three runtime deps and model replies only ever use
// this subset in practice.
const INLINE_PATTERN = /(`[^`]+`)|(\*\*[^*]+\*\*)|(__[^_]+__)|(\[[^\]]+\]\([^)\s]+\))|(\*[^*\n]+\*)|(_[^_\n]+_)/g;

function renderInline(text, keyPrefix) {
  const nodes = [];
  let lastIndex = 0;
  let match;
  let i = 0;
  INLINE_PATTERN.lastIndex = 0;
  while ((match = INLINE_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;
    if (token.startsWith('`')) {
      nodes.push(
        <code key={key} className="code-font selectable-text" style={{ backgroundColor: 'var(--hover-bg)', padding: '2px 5px', borderRadius: '5px', fontSize: '0.9em' }}>
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') || token.startsWith('__')) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('[')) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      nodes.push(
        <a key={key} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-display)', textDecoration: 'underline' }}>
          {linkMatch[1]}
        </a>
      );
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

// Block markdown over a fence-free text chunk: headings, blockquotes,
// unordered/ordered lists, and paragraphs (blank-line separated), each run
// through renderInline for the four inline forms above.
function renderMarkdownBlock(text, keyPrefix) {
  const chunks = text.split(/\n{2,}/);

  return chunks.map((chunk, ci) => {
    const lines = chunk.split('\n');
    const nonEmpty = lines.filter((l) => l.trim() !== '');
    if (nonEmpty.length === 0) return null;
    const blockKey = `${keyPrefix}-b${ci}`;

    const headingMatch = nonEmpty.length === 1 && nonEmpty[0].match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const size = { 1: '19px', 2: '18px', 3: '16px', 4: '15px', 5: '15px', 6: '15px' }[headingMatch[1].length];
      return (
        <div key={blockKey} style={{ fontWeight: 600, fontSize: size, margin: '10px 0 6px' }}>
          {renderInline(headingMatch[2], blockKey)}
        </div>
      );
    }

    if (nonEmpty.every((l) => /^\s*>\s?/.test(l))) {
      const quoted = nonEmpty.map((l) => l.replace(/^\s*>\s?/, '')).join(' ');
      return (
        <div key={blockKey} style={{ borderLeft: '3px solid var(--border)', paddingLeft: '12px', color: 'var(--muted)', margin: '8px 0' }}>
          {renderInline(quoted, blockKey)}
        </div>
      );
    }

    if (nonEmpty.every((l) => /^\s*[-*]\s+/.test(l))) {
      return (
        <ul key={blockKey} style={{ margin: '6px 0', paddingLeft: '22px' }}>
          {nonEmpty.map((l, li) => (
            <li key={li} style={{ marginBottom: '3px' }}>{renderInline(l.replace(/^\s*[-*]\s+/, ''), `${blockKey}-${li}`)}</li>
          ))}
        </ul>
      );
    }

    if (nonEmpty.every((l) => /^\s*\d+\.\s+/.test(l))) {
      return (
        <ol key={blockKey} style={{ margin: '6px 0', paddingLeft: '22px' }}>
          {nonEmpty.map((l, li) => (
            <li key={li} style={{ marginBottom: '3px' }}>{renderInline(l.replace(/^\s*\d+\.\s+/, ''), `${blockKey}-${li}`)}</li>
          ))}
        </ol>
      );
    }

    return (
      <p key={blockKey} style={{ margin: '0 0 8px 0' }}>
        {nonEmpty.map((l, li) => (
          <React.Fragment key={li}>
            {li > 0 && <br />}
            {renderInline(l, `${blockKey}-${li}`)}
          </React.Fragment>
        ))}
      </p>
    );
  });
}

function MessageContent({ content }) {
  const blocks = parseContentBlocks(content);
  return blocks.map((b, i) => (
    b.type === 'code'
      ? <CodeBlock key={i} lang={b.lang} value={b.value} />
      : <React.Fragment key={i}>{renderMarkdownBlock(b.value, `t${i}`)}</React.Fragment>
  ));
}

// A model's reasoning_content (its chain-of-thought before the final
// answer) shown as a collapsible aside, the same shape Claude.ai and
// similar chat UIs use for extended-thinking output. Starts open while the
// answer is still being generated, then auto-collapses exactly once real
// content starts arriving — the user's own toggle takes over after that.
function ThinkingBlock({ text, startOpen, autoCollapseWhen }) {
  const [open, setOpen] = useState(startOpen);
  const collapsedOnceRef = useRef(false);
  const t = useTranslate();

  useEffect(() => {
    if (autoCollapseWhen && !collapsedOnceRef.current) {
      collapsedOnceRef.current = true;
      setOpen(false);
    }
  }, [autoCollapseWhen]);

  return (
    <div style={{ margin: '0 0 8px 0' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="button-press"
        style={{ display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'none', color: 'var(--muted)', fontSize: '12px', cursor: 'pointer', padding: '2px 0' }}
      >
        <BrainCircuit size={13} />
        {t('Thinking')}
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && (
        <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '12px', margin: '6px 0', color: 'var(--muted)', fontSize: '13px' }}>
          <MessageContent content={text} />
        </div>
      )}
    </div>
  );
}

export default function Playground() {
  const { user } = useAuth();
  const toast = useToast();
  const t = useTranslate();

  const [models, setModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsError, setModelsError] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  const [systemPrompt, setSystemPrompt] = useState('');
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [lastUsage, setLastUsage] = useState(null);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const sessionToken = () => user?.sessionToken || localStorage.getItem('frenix_session_token');
  const firstName = (user?.username || t('there')).replace(/^@/, '');

  useEffect(() => {
    const fetchModels = async () => {
      setModelsLoading(true);
      setModelsError('');
      try {
        const token = sessionToken();
        if (!token || !window.secureRelayRequest) {
          throw new Error(t('No active Telegram session found. Please log in first.'));
        }
        const res = await window.secureRelayRequest('/v1/models', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok || !res.data?.data) {
          throw new Error(res?.data?.error?.message || `${t('Failed to load models')} (HTTP ${res.status})`);
        }
        const accessible = res.data.data.filter((m) => m.accessible !== false);
        setModels(accessible);
        if (accessible.length > 0) setSelectedModel(accessible[0].id);
      } catch (err) {
        setModelsError(err.message || t('Failed to load models'));
      } finally {
        setModelsLoading(false);
      }
    };
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  const appendToLastAssistant = (field, deltaText) => {
    setMessages((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      updated[updated.length - 1] = { ...last, [field]: (last[field] || '') + deltaText };
      return updated;
    });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending || !selectedModel) return;

    const token = sessionToken();
    if (!token || !window.secureRelayRequest) {
      setSendError(t('No active Telegram session found. Please log in first.'));
      return;
    }

    const userMessage = { role: 'user', content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setSendError('');
    setLastUsage(null);
    setSending(true);

    let assistantStarted = false;

    try {
      const apiMessages = systemPrompt.trim()
        ? [{ role: 'system', content: systemPrompt.trim() }, ...nextMessages]
        : nextMessages;

      // The gateway's tool-call loop (when plugins is set) always runs
      // internally as buffered requests — a model deciding whether to call
      // a tool isn't something you can stream — but once it resolves to a
      // final answer, that answer still comes back as a real SSE stream in
      // the same shape as any other streamed completion, so this is the
      // same request/parsing path either way.
      const body = { model: selectedModel, messages: apiMessages, stream: true };
      if (searchEnabled) body.plugins = ['frenix_search'];

      const res = await fetch(`${GATEWAY_BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let message = `${t('Request failed')} (HTTP ${res.status})`;
        try {
          const errBody = await res.json();
          message = errBody?.error?.message || message;
        } catch (_) {
          // Non-JSON error body — fall back to the generic HTTP status message.
        }
        throw new Error(message);
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: '', reasoning: '' }]);
      assistantStarted = true;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let usage = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf('\n\n')) >= 0) {
          const rawEvent = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);

          for (const line of rawEvent.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const payload = trimmed.slice(5).trim();
            if (!payload || payload === '[DONE]') continue;

            let parsed;
            try {
              parsed = JSON.parse(payload);
            } catch (_) {
              continue;
            }

            const delta = parsed?.choices?.[0]?.delta;
            if (typeof delta?.content === 'string' && delta.content) {
              appendToLastAssistant('content', delta.content);
            }
            if (typeof delta?.reasoning_content === 'string' && delta.reasoning_content) {
              appendToLastAssistant('reasoning', delta.reasoning_content);
            }
            if (parsed?.usage) usage = parsed.usage;
          }
        }
      }

      if (usage) setLastUsage(usage);
    } catch (err) {
      const message = err.message || t('Request failed');
      setSendError(message);
      toast.error(t('Message failed to send'), message);
      if (!assistantStarted) {
        // Nothing ever streamed back — roll back the optimistic user
        // message so a failed send doesn't leave a one-sided message the
        // model never actually saw.
        setMessages((prev) => prev.filter((m) => m !== userMessage));
        setInput(text);
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setSendError('');
    setLastUsage(null);
  };

  const selectedModelInfo = models.find((m) => m.id === selectedModel);
  const providerIcons = selectedModelInfo ? resolveProviderIcons(displayProviderFor(selectedModelInfo)) : [];
  const supportsSearch = !!selectedModelInfo?.capabilities?.tools;

  useEffect(() => {
    if (!supportsSearch) setSearchEnabled(false);
  }, [supportsSearch]);

  const hasMessages = messages.length > 0;
  const lastMessage = messages[messages.length - 1];
  const awaitingFirstToken = sending && (!lastMessage || lastMessage.role !== 'assistant');
  const isStreamingReply = sending && lastMessage?.role === 'assistant';

  return (
    <div
      className="animate-fadeInUp"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 180px)',
        minHeight: '460px',
        padding: '24px 0 0 0',
      }}
    >
      {!hasMessages ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '22px', textAlign: 'center', padding: '0 16px' }}>
          <FrenixIcon size={40} style={{ color: 'var(--accent-display)' }} />
          <SplitText
            tag="h1"
            text={`${t('Good')} ${t(greetingWord())}, ${firstName}`}
            className="frenix-playground-greeting"
            textAlign="center"
            splitType="chars"
            delay={18}
            duration={0.6}
            from={{ opacity: 0, y: 18 }}
            to={{ opacity: 1, y: 0 }}
          />
          {modelsError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', border: '1px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', fontSize: '13px', maxWidth: '440px' }}>
              <AlertTriangle size={14} style={{ flexShrink: 0 }} />
              {modelsError}
            </div>
          )}
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px', padding: '4px 4px 24px 4px' }}>
          {messages.map((m, i) => {
            const isLast = i === messages.length - 1;
            return (
              <div
                key={i}
                style={{
                  maxWidth: '78%',
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  padding: '11px 16px',
                  borderRadius: '18px',
                  fontSize: '15px',
                  lineHeight: 1.6,
                  backgroundColor: m.role === 'user' ? 'var(--hover-bg)' : 'transparent',
                }}
              >
                {m.reasoning && (
                  <ThinkingBlock text={m.reasoning} startOpen={!m.content} autoCollapseWhen={!!m.content} />
                )}
                <MessageContent content={m.content} />
                {isLast && isStreamingReply && (
                  <span className="animate-pulse-cursor" style={{ display: 'inline-block', width: '7px', height: '15px', marginLeft: '2px', verticalAlign: '-2px', backgroundColor: 'var(--muted)' }} />
                )}
              </div>
            );
          })}
          {awaitingFirstToken && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', fontSize: '13px', alignSelf: 'flex-start', padding: '11px 16px' }}>
              <Loader2 size={14} className="animate-spin" />
              {t('Thinking…')}
            </div>
          )}
          {sendError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', border: '1px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', fontSize: '12px', alignSelf: 'flex-start' }}>
              <AlertTriangle size={13} style={{ flexShrink: 0 }} />
              {sendError}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Composer */}
      <div style={{ padding: '12px 0 24px 0' }}>
        {showSystemPrompt && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px', padding: '10px 14px', borderRadius: '16px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder={t('Optional system prompt…')}
              rows={2}
              className="code-font"
              style={{
                flex: 1, padding: 0, border: 'none', backgroundColor: 'transparent', color: 'var(--text)',
                fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box',
              }}
            />
            <button
              onClick={() => setShowSystemPrompt(false)}
              aria-label={t('Close system prompt')}
              style={{ display: 'flex', border: 'none', background: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: '26px',
            backgroundColor: 'var(--card)',
            padding: '12px 14px 10px 20px',
            boxShadow: '0 2px 16px rgba(0, 0, 0, 0.06)',
          }}
        >
          <textarea
            ref={textareaRef}
            className="t-resize"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('Chat with Frenix…')}
            rows={1}
            disabled={models.length === 0}
            style={{
              width: '100%', padding: '2px 0 10px 0', border: 'none', backgroundColor: 'transparent',
              color: 'var(--text)', fontSize: '15px', outline: 'none', resize: 'none', boxSizing: 'border-box',
              maxHeight: '200px', overflowY: 'auto', display: 'block', fontFamily: 'inherit',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <button
                onClick={handleClear}
                disabled={messages.length === 0}
                aria-label={t('New chat')}
                title={t('New chat')}
                className="button-press"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px',
                  borderRadius: '50%', border: '1px solid var(--border)', backgroundColor: 'transparent',
                  color: 'var(--muted)', cursor: messages.length === 0 ? 'default' : 'pointer',
                  opacity: messages.length === 0 ? 0.5 : 1, flexShrink: 0,
                }}
              >
                <Plus size={15} />
              </button>

              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px 5px 10px',
                  borderRadius: '16px', backgroundColor: 'var(--hover-bg)', minWidth: 0,
                }}
              >
                {providerIcons.map((Icon, i) => <Icon key={i} size={13} style={{ flexShrink: 0 }} />)}
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={modelsLoading || models.length === 0}
                  className="code-font"
                  style={{
                    border: 'none', backgroundColor: 'transparent', color: 'var(--text)', fontSize: '12px',
                    outline: 'none', cursor: 'pointer', maxWidth: '180px', textOverflow: 'ellipsis',
                  }}
                >
                  {modelsLoading && <option>{t('Loading…')}</option>}
                  {!modelsLoading && models.length === 0 && <option>{t('No accessible models')}</option>}
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>{m.id}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowSystemPrompt((v) => !v)}
                aria-label={t('System prompt')}
                title={t('System prompt')}
                className="button-press"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px',
                  borderRadius: '50%', border: '1px solid var(--border)',
                  backgroundColor: showSystemPrompt ? 'var(--hover-bg)' : 'transparent',
                  color: 'var(--muted)', cursor: 'pointer', flexShrink: 0,
                }}
              >
                <SlidersHorizontal size={13} />
              </button>

              <button
                onClick={() => setSearchEnabled((v) => !v)}
                disabled={!supportsSearch}
                aria-label={t('Web search')}
                title={supportsSearch ? t('Web search (frenix_search, built in)') : t("This model doesn't support tool calling, so it can't use web search")}
                className="button-press"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px',
                  borderRadius: '50%', border: '1px solid var(--border)',
                  backgroundColor: searchEnabled ? 'var(--hover-bg)' : 'transparent',
                  color: searchEnabled ? 'var(--accent-display)' : 'var(--muted)',
                  cursor: supportsSearch ? 'pointer' : 'default',
                  opacity: supportsSearch ? 1 : 0.4, flexShrink: 0,
                }}
              >
                <Globe size={13} />
              </button>
            </div>

            <button
              onClick={handleSend}
              disabled={sending || !input.trim() || models.length === 0}
              aria-label={t('Send')}
              className="button-press"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px',
                borderRadius: '50%', border: 'none',
                backgroundColor: !input.trim() || sending ? 'var(--border)' : 'var(--text)',
                color: !input.trim() || sending ? 'var(--muted)' : 'var(--bg)',
                cursor: sending || !input.trim() ? 'default' : 'pointer', flexShrink: 0,
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>

        {searchEnabled && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '10px', fontSize: '11px', color: 'var(--muted)' }}>
            <Globe size={11} />
            {t('Web search on — the model decides whether it actually searches.')}
          </div>
        )}

        {lastUsage && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', fontSize: '11px', color: 'var(--muted)' }}>
            {lastUsage.prompt_tokens} {t('prompt')} + {lastUsage.completion_tokens} {t('completion')} = {lastUsage.total_tokens} {t('tokens')}
          </div>
        )}
      </div>
    </div>
  );
}
