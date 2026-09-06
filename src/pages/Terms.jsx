import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FileText, Shield, AlertCircle, ArrowLeft } from 'lucide-react';

export default function Terms() {
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
          Terms of Service
        </h1>
        <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Last updated: March 6, 2026</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', lineHeight: 1.7, fontSize: '14px', color: 'var(--text)' }}>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>1. Acceptance of Terms</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            By registering for an account, authenticating via @frenix_bot, generating API keys, or routing requests through Frenix API endpoints (api.frenix.sh), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not access or use the service.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>2. Service Description &amp; Gateway Operation</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            Frenix provides unified API gateway routing, proxying, load-balancing, and caching services connecting client applications with artificial intelligence foundation models. Upstream models are executed on third-party computing clusters and infrastructure.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>3. Acceptable Use &amp; Prohibited Conduct</h2>
          <p style={{ margin: '0 0 10px 0', color: 'var(--muted)' }}>
            You agree not to use Frenix to:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Generate or disseminate illegal, harmful, harassing, or sexually exploitative material.</li>
            <li>Conduct denial-of-service attacks, automated spamming, or attempt to circumvent rate limits.</li>
            <li>Reverse engineer or compromise gateway proxy routing logic or internal infrastructure.</li>
            <li>Violate upstream model providers' acceptable use guidelines (including OpenAI, Anthropic, Google, and Meta).</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>4. Quotas, Concurrency &amp; Rate Limits</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            Accounts on the Free tier are provisioned with 500 Requests Per Day (RPD) and a 5 RPM burst limit. Accounts on the Pro tier receive 20 Requests Per Minute (RPM) with unlimited daily throughput. Frenix reserves the right to throttle or temporarily suspend endpoints that trigger extreme automated floods or exceed allocated concurrency windows.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>5. API Key Responsibility</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            You are exclusively responsible for securing any API keys generated under your account. Any request authenticated with your credentials will be deemed authorized by you. If an API key is leaked, you must immediately revoke it from your Frenix Dashboard.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>6. Service Availability &amp; Disclaimers</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            Frenix provides automatic failover across redundant provider clusters. However, the service is provided "as is" and "as available". We do not warrant that output from external AI models will be error-free, factual, or uninterrupted.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>7. Termination &amp; Contact</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            We reserve the right to revoke API keys or terminate access for violations of these terms. For any legal inquiries or support issues, contact our team on Telegram at <a href="https://t.me/frenix_bot" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text)', textDecoration: 'underline' }}>@frenix_bot</a>.
          </p>
        </section>
      </div>
    </div>
  );
}