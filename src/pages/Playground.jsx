import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, Plus, Loader2, AlertTriangle, SlidersHorizontal, X, Copy, Check } from 'lucide-react';
import { resolveProviderIcons, displayProviderFor, FrenixIcon } from '../components/icons/BrandIcons';

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

  const handleCopy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--card)', margin: '6px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px', borderBottom: '1px solid var(--border)' }}>
        <span className="code-font" style={{ fontSize: '11px', color: 'var(--muted)' }}>{lang || 'text'}</span>
        <button
          onClick={handleCopy}
          className="button-press"
          style={{ display: 'flex', alignItems: 'center', gap: '4px', border: 'none', background: 'none', color: 'var(--muted)', fontSize: '11px', cursor: 'pointer', padding: '2px' }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="code-font selectable-text" style={{ margin: 0, padding: '13px', fontSize: '13px', lineHeight: 1.6, overflowX: 'auto', whiteSpace: 'pre' }}>
        {value}
      </pre>
    </div>
  );
}

function MessageContent({ content }) {
  const blocks = parseContentBlocks(content);
  return blocks.map((b, i) => (
    b.type === 'code'
      ? <CodeBlock key={i} lang={b.lang} value={b.value} />
      : <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{b.value}</span>
  ));
}

export default function Playground() {
  const { user } = useAuth();

  const [models, setModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsError, setModelsError] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  const [systemPrompt, setSystemPrompt] = useState('');
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [lastUsage, setLastUsage] = useState(null);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const sessionToken = () => user?.sessionToken || localStorage.getItem('frenix_session_token');
  const firstName = (user?.username || 'there').replace(/^@/, '');

  useEffect(() => {
    const fetchModels = async () => {
      setModelsLoading(true);
      setModelsError('');
      try {
        const token = sessionToken();
        if (!token || !window.secureRelayRequest) {
          throw new Error('No active Telegram session found. Please log in first.');
        }
        const res = await window.secureRelayRequest('/v1/models', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok || !res.data?.data) {
          throw new Error(res?.data?.error?.message || `Failed to load models (HTTP ${res.status})`);
        }
        const accessible = res.data.data.filter((m) => m.accessible !== false);
        setModels(accessible);
        if (accessible.length > 0) setSelectedModel(accessible[0].id);
      } catch (err) {
        setModelsError(err.message || 'Failed to load models');
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

  const appendToLastAssistant = (deltaText) => {
    setMessages((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      updated[updated.length - 1] = { ...last, content: last.content + deltaText };
      return updated;
    });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending || !selectedModel) return;

    const token = sessionToken();
    if (!token || !window.secureRelayRequest) {
      setSendError('No active Telegram session found. Please log in first.');
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

      const res = await fetch(`${GATEWAY_BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ model: selectedModel, messages: apiMessages, stream: true }),
      });

      if (!res.ok) {
        let message = `Request failed (HTTP ${res.status})`;
        try {
          const errBody = await res.json();
          message = errBody?.error?.message || message;
        } catch (_) {
          // Non-JSON error body — fall back to the generic HTTP status message.
        }
        throw new Error(message);
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
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

            const deltaText = parsed?.choices?.[0]?.delta?.content;
            if (typeof deltaText === 'string' && deltaText) {
              appendToLastAssistant(deltaText);
            }
            if (parsed?.usage) usage = parsed.usage;
          }
        }
      }

      if (usage) setLastUsage(usage);
    } catch (err) {
      setSendError(err.message || 'Request failed');
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
          <h1 style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400, fontSize: '34px', margin: 0, color: 'var(--text)' }}>
            Good {greetingWord()}, {firstName}
          </h1>
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
              Thinking…
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
              placeholder="Optional system prompt…"
              rows={2}
              className="code-font"
              style={{
                flex: 1, padding: 0, border: 'none', backgroundColor: 'transparent', color: 'var(--text)',
                fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box',
              }}
            />
            <button
              onClick={() => setShowSystemPrompt(false)}
              aria-label="Close system prompt"
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Chat with Frenix…"
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
                aria-label="New chat"
                title="New chat"
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
                  {modelsLoading && <option>Loading…</option>}
                  {!modelsLoading && models.length === 0 && <option>No accessible models</option>}
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>{m.id}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowSystemPrompt((v) => !v)}
                aria-label="System prompt"
                title="System prompt"
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
            </div>

            <button
              onClick={handleSend}
              disabled={sending || !input.trim() || models.length === 0}
              aria-label="Send"
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

        {lastUsage && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', fontSize: '11px', color: 'var(--muted)' }}>
            {lastUsage.prompt_tokens} prompt + {lastUsage.completion_tokens} completion = {lastUsage.total_tokens} tokens
          </div>
        )}
      </div>
    </div>
  );
}
