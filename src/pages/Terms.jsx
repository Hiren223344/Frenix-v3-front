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
        <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Last updated: September 10, 2026</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', lineHeight: 1.7, fontSize: '14px', color: 'var(--text)' }}>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>1. Acceptance of Terms</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            By registering for an account, authenticating via @frenix_bot, generating API keys, purchasing or receiving credits, or routing requests through Frenix API endpoints (api.frenix.sh), you ("User", "you") agree to be bound by these Terms of Service ("Terms") and our <Link to="/privacy" style={{ color: 'var(--text)', textDecoration: 'underline' }}>Privacy Policy</Link>. If you do not agree to these Terms, do not access or use the service. You must be at least 18 years old, or the age of legal majority in your jurisdiction, to use Frenix.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>2. Service Description &amp; Gateway Operation</h2>
          <p style={{ margin: '0 0 10px 0', color: 'var(--muted)' }}>
            Frenix ("we", "us", "our") provides unified API gateway routing, proxying, load-balancing, and caching services connecting client applications with artificial intelligence foundation models operated by independent third parties (including OpenAI, Anthropic, Google, Meta, and others). We do not develop, train, host, or control these models. Frenix acts solely as an intermediary; we have no ability to alter, and no responsibility for, the content, accuracy, or behavior of any third-party model's output.
          </p>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            <strong style={{ color: 'var(--text)' }}>Automatic failover:</strong> where a model is configured with more than one upstream backend, we automatically route around a backend that is unhealthy or returning errors and retry your request against the next available one serving that same model, up to a bounded number of attempts — this happens transparently within the lifecycle of a single request, with no separate action or charge on your part. Failover applies only across backends we've configured for the requested model; it does not substitute a different model, and it does not guarantee availability if every configured backend for a model is unavailable at the same time, in which case the request fails and is not billed.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>3. Acceptable Use &amp; Prohibited Conduct</h2>
          <p style={{ margin: '0 0 10px 0', color: 'var(--muted)' }}>
            You agree not to use Frenix to:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Generate or disseminate illegal, harmful, harassing, defamatory, or sexually exploitative material, including any content involving minors.</li>
            <li>Conduct denial-of-service attacks, automated spamming, credential stuffing, or attempt to circumvent rate limits, tier gating, or credit accounting.</li>
            <li>Reverse engineer, decompile, or attempt to compromise gateway routing logic, internal infrastructure, or other users' accounts or API keys.</li>
            <li>Violate any upstream model provider's acceptable use policy or terms of service — you are independently responsible for complying with those third-party terms.</li>
            <li>Create multiple accounts, or otherwise manipulate signups, to abuse the signup bonus or referral program.</li>
            <li>Resell, sublicense, or provide access to the service to third parties in a manner that violates these Terms.</li>
          </ul>
          <p style={{ margin: '10px 0 0 0', color: 'var(--muted)' }}>
            Violation of this section is grounds for immediate suspension or termination, forfeiture of credit balance, and, where applicable, referral to law enforcement.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>4. Rate Limits &amp; Service Modifications</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            Every account, regardless of tier, is currently subject to a flat rate limit on request throughput; your actual usage is otherwise bounded by your credit balance rather than a daily request cap. We may change rate limits, tier structures, model availability, or pricing at any time, with or without notice, and may throttle or suspend accounts that trigger abnormal automated traffic.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>5. Fees, Credits &amp; Referrals</h2>
          <p style={{ margin: '0 0 10px 0', color: 'var(--muted)' }}>
            Frenix operates on a prepaid credit system. Credits (including any signup bonus or referral bonus) are non-transferable, have no cash value except as expressly stated, and are non-refundable except where required by applicable law or expressly stated below. We reserve the right to adjust pricing for any model or service at any time; changes apply prospectively to future usage, not to credits already spent.
          </p>
          <p style={{ margin: '0 0 10px 0', color: 'var(--muted)' }}>
            <strong style={{ color: 'var(--text)' }}>Yearly plans:</strong> if you purchase a yearly (annual) plan, you may appeal for a refund within 2 months (60 days) of the purchase date. Refund appeals must be submitted through Telegram support (@frenix_bot) within that window; appeals submitted after 2 months will not be considered. This exception applies only to yearly plan purchases — it does not extend to pay-as-you-go credit purchases, monthly plans, signup bonuses, or referral bonuses, which remain governed by the non-refundable policy above.
          </p>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            Referral bonuses are granted at our discretion for good-faith referrals. We reserve the right to withhold, reverse, or claw back any credit balance — including signup bonuses and referral bonuses — obtained through fraud, abuse, self-referral, fake accounts, or any violation of Section 3, without notice.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>6. Account &amp; API Key Responsibility</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            You are exclusively responsible for maintaining the confidentiality of your account and any API keys generated under it. Any request authenticated with your credentials is deemed authorized by you, and you are solely responsible for all activity and charges resulting from it, whether or not you authorized that specific use. If a key is leaked or compromised, you must revoke it immediately from your Frenix Dashboard. We are not liable for any loss arising from your failure to secure your credentials.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>7. Third-Party AI Output</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            Output generated through Frenix is produced by third-party AI models we do not control. Such output may be inaccurate, incomplete, biased, or otherwise objectionable. You are solely responsible for reviewing, verifying, and deciding whether and how to use any output before relying on it, publishing it, or acting on it, including for any commercial, legal, medical, financial, or safety-critical purpose. We disclaim all responsibility for the content of any AI-generated output routed through the service.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>8. Disclaimer of Warranties</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE", WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR ACCURACY. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE, OR THAT ANY OUTPUT FROM UPSTREAM MODELS WILL BE ACCURATE, RELIABLE, OR FIT FOR YOUR INTENDED USE. NO ADVICE OR INFORMATION, WHETHER ORAL OR WRITTEN, OBTAINED FROM US OR THROUGH THE SERVICE CREATES ANY WARRANTY NOT EXPRESSLY STATED IN THESE TERMS.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>9. Limitation of Liability</h2>
          <p style={{ margin: '0 0 10px 0', color: 'var(--muted)' }}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, FRENIX AND ITS OPERATORS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE OR ANY OUTPUT OBTAINED THROUGH IT, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            OUR TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATED TO THE SERVICE WILL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID US IN THE THREE MONTHS PRECEDING THE CLAIM, OR (B) FIFTY U.S. DOLLARS ($50). SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES, SO SOME OF THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>10. Indemnification</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            You agree to indemnify, defend, and hold harmless Frenix, its operators, and affiliates from and against any claims, damages, losses, liabilities, and expenses (including reasonable legal fees) arising out of or related to: (a) your use or misuse of the service; (b) any content you submit or generate through the service; (c) your violation of these Terms; or (d) your violation of any third-party right, including any upstream AI provider's terms of service or any applicable law.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>11. Termination &amp; Right to Refuse Service</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            We may suspend or terminate your access to the service, revoke API keys, refuse service to anyone, and/or forfeit any remaining credit balance, at our sole discretion, at any time, with or without notice and with or without cause, including for suspected violation of these Terms. You may stop using the service at any time. Sections 5 through 10 and 15 through 20 survive termination.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>12. Compliance With Laws; Export Control</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            You represent that you are not located in, and will not use the service from, any country or region subject to comprehensive trade sanctions, and that you are not on any restricted-party list. You are solely responsible for ensuring your use of the service complies with all laws applicable to you, including export control and data protection laws.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>13. Force Majeure</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            We are not liable for any failure or delay in performance resulting from causes beyond our reasonable control, including acts of God, natural disaster, war, terrorism, riot, labor conditions, governmental action, internet or telecommunications failure, denial-of-service or other cyberattack, or any outage, degradation, policy change, or discontinuation by an upstream AI model provider.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>14. Changes to These Terms</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            We may modify these Terms at any time by posting the updated version on this page and updating the "Last updated" date above. Your continued use of the service after a change becomes effective constitutes acceptance of the revised Terms. It is your responsibility to review this page periodically.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>15. Dispute Resolution: Binding Arbitration &amp; Class Action Waiver</h2>
          <p style={{ margin: '0 0 10px 0', color: 'var(--muted)' }}>
            PLEASE READ THIS SECTION CAREFULLY — IT AFFECTS YOUR LEGAL RIGHTS. Except for disputes qualifying for small-claims court or the injunctive relief described in Section 17, you and Frenix agree that any dispute, claim, or controversy arising out of or relating to these Terms or the service will be resolved by final and binding arbitration on an individual basis, rather than in court, before a single arbitrator, under the arbitration rules generally applicable in the jurisdiction named in Section 16. The arbitrator's decision will be final and binding and may be entered as a judgment in any court of competent jurisdiction.
          </p>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            YOU AND FRENIX EACH WAIVE ANY RIGHT TO A JURY TRIAL AND TO PARTICIPATE IN A CLASS ACTION, CLASS ARBITRATION, OR ANY OTHER REPRESENTATIVE PROCEEDING. Claims must be brought in an individual capacity only. If this class action waiver is found unenforceable as to a particular claim, that claim (and only that claim) will proceed in court rather than arbitration, and every other claim remains subject to this section.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>16. Governing Law</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            {/* TODO: fill in your actual jurisdiction (country/state) here before relying on this document. */}
            These Terms are governed by the laws of <strong>[YOUR COUNTRY/STATE — FILL THIS IN]</strong>, without regard to conflict-of-laws principles. Subject to Section 15, any dispute not resolved by arbitration will be brought exclusively in the courts located in that jurisdiction, and you consent to their personal jurisdiction.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>17. Injunctive Relief</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            Notwithstanding Section 15, we may seek injunctive or other equitable relief in any court of competent jurisdiction at any time to prevent actual or threatened infringement of our intellectual property, unauthorized access to the service, or violation of Section 3 (Acceptable Use).
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>18. Assignment</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            You may not assign or transfer these Terms or your account without our prior written consent. We may assign or transfer these Terms, in whole or in part, without restriction, including in connection with a merger, acquisition, or sale of assets.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>19. Waiver; No Third-Party Beneficiaries; Notices</h2>
          <p style={{ margin: '0 0 10px 0', color: 'var(--muted)' }}>
            Our failure to enforce any provision of these Terms is not a waiver of our right to enforce it later. These Terms do not create any rights for any third party.
          </p>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            We may provide notices to you via the email or Telegram account associated with your account, or by posting on this site; such notice is deemed received when sent. Legal notices to us should be sent via the contact method in Section 21.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>20. General</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            If any provision of these Terms is found unenforceable, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions remain in full effect. These Terms, together with our Privacy Policy, constitute the entire agreement between you and Frenix regarding the service, and supersede any prior agreements or representations, written or oral.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>21. Contact</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            {/* TODO: fill in your legal entity name / operator name here. */}
            Frenix is operated by <strong>[YOUR LEGAL NAME / ENTITY NAME — FILL THIS IN]</strong>. For legal inquiries or support, contact us on Telegram at <a href="https://t.me/frenix_bot" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text)', textDecoration: 'underline' }}>@frenix_bot</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
