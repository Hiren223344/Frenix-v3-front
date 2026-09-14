import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, Plus, Loader2, AlertTriangle, SlidersHorizontal, X } from 'lucide-react';
import { resolveProviderIcons, displayProviderFor, FrenixIcon } from '../components/icons/BrandIcons';

function greetingWord() {
  const h = new Date().getHours();
  if (h < 5) return 'evening';
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
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
    setSending(true);

    try {
      const apiMessages = systemPrompt.trim()
        ? [{ role: 'system', content: systemPrompt.trim() }, ...nextMessages]
        : nextMessages;

      const res = await window.secureRelayRequest('/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { model: selectedModel, messages: apiMessages },
      });

      if (!res.ok) {
        throw new Error(res?.data?.error?.message || `Request failed (HTTP ${res.status})`);
      }

      const content = res.data?.choices?.[0]?.message?.content;
      const responseText = typeof content === 'string' ? content : (content?.text ?? '');
      setMessages((prev) => [...prev, { role: 'assistant', content: responseText || '(empty response)' }]);
      setLastUsage(res.data?.usage || null);
    } catch (err) {
      setSendError(err.message || 'Request failed');
      // Roll back the optimistic user message so a failed send doesn't
      // leave a one-sided message the model never actually saw.
      setMessages((prev) => prev.filter((m) => m !== userMessage));
      setInput(text);
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
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                maxWidth: '78%',
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                padding: '11px 16px',
                borderRadius: '18px',
                fontSize: '15px',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                backgroundColor: m.role === 'user' ? 'var(--hover-bg)' : 'transparent',
              }}
            >
              {m.content}
            </div>
          ))}
          {sending && (
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
