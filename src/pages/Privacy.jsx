import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Shield, Lock, EyeOff, Server, ArrowLeft } from 'lucide-react';

export default function Privacy() {
  const { accentDisplay } = useTheme();

  return (
    <div className="animate-fadeInUp" style={{ padding: '64px 0 96px 0', maxWidth: '800px', margin: '0 auto' }}>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          color: 'var(--muted)',
          marginBottom: '24px',
        }}
      >
        <ArrowLeft size={14} />
        <span>Back to Home</span>
      </Link>

      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 300, margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
          Privacy Policy
        </h1>
        <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Last updated: March 6, 2026</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', lineHeight: 1.7, fontSize: '14px', color: 'var(--text)' }}>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>1. Zero Data Retention for Prompts &amp; Outputs</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            Frenix enforces a strict zero-retention policy for payload data. <strong>We do not log, persist, inspect, or store prompt text, system prompts, completions, function arguments, or streamed tokens.</strong> All request traffic is proxied directly in-memory via high-throughput edge nodes.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>2. No Model Training</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            Your data is never used to train, fine-tune, or calibrate foundation models. All upstream agreements with model providers are configured with zero-data-retention (ZDR) clauses wherever available.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>3. Information We Collect</h2>
          <p style={{ margin: '0 0 10px 0', color: 'var(--muted)' }}>
            We only store minimal operational metadata required to deliver the gateway service:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong>Account Identity:</strong> Telegram User ID and username supplied during @frenix_bot verification.</li>
            <li><strong>API Key Hashes:</strong> Cryptographic hashes (Argon2id) of keys created in your dashboard. Plaintext keys are never stored.</li>
            <li><strong>Aggregate Metrics:</strong> Anonymized counters for concurrency tracking, requests per minute/day, and HTTP status codes (for rate limit enforcement).</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>4. Data Security &amp; Encryption</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            All incoming and outbound network traffic is encrypted using modern TLS 1.3 encryption in transit. Internal session tokens and key metadata are securely stored with restricted access and cryptographic salt verification.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>5. Third-Party Model Providers</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            When routing requests to upstream AI clusters (such as Anthropic, OpenAI, Google DeepMind, and Meta), payload data passes through secure API conduits to fulfill your completions. Please refer to each upstream provider's terms for independent processing policies.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>6. Account Deletion &amp; Data Rights</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            You can revoke your API keys at any time from your Dashboard. If you wish to delete your account record and associated Telegram metadata, contact our support team at <a href="https://t.me/frenix_bot" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text)', textDecoration: 'underline' }}>@frenix_bot</a>.
          </p>
        </section>
      </div>
    </div>
  );
}