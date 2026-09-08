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
        <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Last updated: September 8, 2026</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', lineHeight: 1.7, fontSize: '14px', color: 'var(--text)' }}>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>1. Zero Data Retention for Prompts &amp; Outputs</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            Frenix enforces a strict zero-retention policy for payload content. <strong>We do not log, persist, inspect, or store prompt text, system prompts, completions, function-call arguments, or streamed tokens.</strong> Request bodies are proxied to the upstream model provider and the response streamed back to you; the content itself never touches a database or persistent log. This section covers content only — see Section 2 for the request <em>metadata</em> (token counts, cost, timing) we do retain for billing and abuse prevention.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>2. Information We Collect</h2>
          <p style={{ margin: '0 0 10px 0', color: 'var(--muted)' }}>
            We collect and store the following, all necessary to operate accounts, billing, and abuse prevention for the service:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong>Account identity:</strong> your Telegram user ID, username, and first name, as supplied during @frenix_bot authentication, plus your account tier and (if applicable) which referral code you signed up with.</li>
            <li><strong>API key metadata:</strong> a name you give each key, a cryptographic hash of the key (never the plaintext key itself, which we cannot recover once shown to you), a short prefix for display, and its creation/last-used/revocation timestamps.</li>
            <li><strong>Session tokens:</strong> a cryptographic hash of your login session token, not the raw token itself.</li>
            <li><strong>Credit ledger:</strong> a full history of every credit movement on your account — purchases, usage charges, refunds, signup and referral bonuses, and admin adjustments — each with an amount, reason, and timestamp. This is a financial record we keep for accounting, dispute resolution, and fraud investigation.</li>
            <li><strong>Per-request metadata:</strong> for every API call, we record which model you called, prompt and completion token counts, the resulting cost, latency, and success/error status — tied to your account and API key. <strong>This is not anonymized</strong>: we use it to bill you accurately, show you your own usage in the dashboard, debug failures, and investigate abuse. It never includes the prompt or response content itself (see Section 1).</li>
            <li><strong>IP addresses:</strong> processed transiently to rate-limit login attempts and signup requests per address; not permanently stored alongside your account.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>3. Cookies &amp; Local Storage</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            We do not use tracking or advertising cookies. The dashboard stores a few items in your browser's local storage — your session token, a cache of API key metadata, and (if you arrived via a referral link) the referral code — purely so the site works across page loads. None of this is sent to any third party, and it never leaves your device except in requests you make directly to the Frenix API. See our <Link to="/cookies" style={{ color: 'var(--text)', textDecoration: 'underline' }}>Cookie Policy</Link> for the full breakdown.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>4. How We Use Your Information</h2>
          <p style={{ margin: '0 0 10px 0', color: 'var(--muted)' }}>
            We use the information above to:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Authenticate you and operate your account, API keys, and sessions.</li>
            <li>Meter and bill usage against your credit balance, and show you that usage in the dashboard.</li>
            <li>Grant and track signup and referral bonuses.</li>
            <li>Enforce rate limits and detect and prevent abuse, fraud, or violations of our <Link to="/terms" style={{ color: 'var(--text)', textDecoration: 'underline' }}>Terms of Service</Link>.</li>
            <li>Diagnose and fix technical issues.</li>
            <li>Comply with legal obligations, including tax and financial recordkeeping.</li>
          </ul>
          <p style={{ margin: '10px 0 0 0', color: 'var(--muted)' }}>
            We do not sell your personal information, and we do not use your account data for advertising.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>5. No Model Training</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            Your prompts and outputs are never used by us to train, fine-tune, or evaluate any model. We route requests through zero-data-retention agreements with upstream providers wherever they are available; see Section 6 for what remains outside our control once a request leaves our infrastructure.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>6. Third-Party Model Providers</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            To fulfill your requests, prompt and response content passes through the upstream AI provider a given model routes to (for example OpenAI, Anthropic, Google, or Meta) — that transmission is required for the service to function, and is not something Frenix can omit. We do not control, and this policy does not cover, how those providers themselves handle data once they receive it; review each provider's own privacy policy and terms for their independent practices, including whether they retain or train on inputs sent to their API. We select and configure zero-data-retention terms with providers wherever they offer it, but cannot guarantee a given provider's practices beyond what they publish themselves.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>7. Data Retention</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            We retain account, credit ledger, and per-request metadata (Section 2) for as long as your account is active, and for a reasonable period afterward as needed for legal, tax, accounting, or fraud-investigation purposes. Telegram login handshake tokens are short-lived (10 minutes) and purged automatically whether or not they're used. Prompt and completion content is never retained at all (Section 1), so there is nothing to delete on that front.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>8. Data Security</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            All traffic to and from the gateway is encrypted with TLS. API keys and session tokens are stored only as salted cryptographic hashes — never in plaintext — so even we cannot recover a key or session token once it's issued to you. Admin access to account and billing data is restricted and authenticated separately from the public API. No method of transmission or storage is perfectly secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>9. Your Rights &amp; Account Deletion</h2>
          <p style={{ margin: '0 0 10px 0', color: 'var(--muted)' }}>
            You can revoke any API key at any time from your Dashboard, which immediately stops it from authenticating further requests. To request a copy of the personal data we hold about you, request its correction, or request deletion of your account and associated data (subject to what we're required to retain per Section 7, such as financial records), contact us via the method in Section 13.
          </p>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            If you are located in the EEA, UK, California, or another jurisdiction with its own data protection law, you may have additional rights under that law (such as data portability or the right to object to certain processing); we will honor requests to the extent required by the law that applies to you.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>10. International Data Transfers</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            Our infrastructure and the upstream providers we route to may process and store data in countries other than your own. By using the service, you consent to your information being transferred to and processed in those countries, which may have different data protection laws than your home jurisdiction.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>11. Children's Privacy</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            Frenix is not directed at, and is not intended for use by, anyone under 18 years of age (or the age of legal majority in your jurisdiction). We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, contact us and we will delete it.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>12. Changes to This Policy</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            We may update this Privacy Policy from time to time by posting the revised version here and updating the "Last updated" date above. Continued use of the service after a change becomes effective constitutes acceptance of the revised policy.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>13. Contact</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            {/* TODO: fill in your legal entity name / operator name here — keep in sync with Terms of Service Section 21. */}
            Frenix is operated by <strong>[YOUR LEGAL NAME / ENTITY NAME — FILL THIS IN]</strong>. For privacy questions, data requests, or to report a security concern, contact us on Telegram at <a href="https://t.me/frenix_bot" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text)', textDecoration: 'underline' }}>@frenix_bot</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
