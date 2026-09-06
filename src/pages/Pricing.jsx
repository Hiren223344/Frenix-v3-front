import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Check, User, Layers, Shield, ArrowRight, ExternalLink } from 'lucide-react';

export default function Pricing() {
  const { accentDisplay } = useTheme();

  return (
    <div className="animate-fadeInUp" style={{ padding: '64px 0 96px 0' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 300, margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
          Pricing Plans
        </h1>
        <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--muted)', margin: 0, maxWidth: '600px' }}>
          Simple pricing with predictable concurrency and throughput. No surprise bills or token markups.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '64px' }}>
        {/* Free Plan */}
        <div className="hover-lift" style={{ border: '1px solid var(--border)', borderRadius: '18px', padding: '28px', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--card)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '999px', padding: '3px 10px' }}>
              500 RPD
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 500, marginBottom: '4px' }}>Free</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '22px' }}>For experimenting & testing Frenix</div>
          <div style={{ fontSize: '32px', fontWeight: 300, marginBottom: '22px' }}>$0</div>
          <Link
            to="/dashboard"
            className="button-press"
            style={{
              width: '100%',
              padding: '11px 0',
              border: '1px solid var(--text)',
              borderRadius: '22px',
              textAlign: 'center',
              backgroundColor: 'transparent',
              color: 'var(--text)',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '24px',
            }}
          >
            Start Free
          </Link>
          <div style={{ borderTop: '1px solid var(--border)', marginBottom: '18px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> Access to free models tier</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> <strong>500 requests per day (RPD)</strong></div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> 5 requests per minute burst</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> 1 active API key</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> Telegram community support</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> Standard response latency</div>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="hover-lift" style={{ border: '1.5px solid var(--text)', borderRadius: '18px', padding: '28px', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--card)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-11px', right: '24px', background: 'var(--text)', color: 'var(--bg)', fontSize: '11px', padding: '2px 12px', borderRadius: '12px', fontWeight: 500 }}>
            Most Popular
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={20} />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '999px', padding: '3px 10px' }}>
              20 RPM
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 500, marginBottom: '4px' }}>Pro</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '22px' }}>For everyday builders & power agents</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '22px' }}>
            <span style={{ fontSize: '32px', fontWeight: 300 }}>$30</span>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>/ month</span>
          </div>
          <Link
            to="/dashboard"
            className="button-press"
            style={{
              width: '100%',
              padding: '11px 0',
              borderRadius: '22px',
              textAlign: 'center',
              backgroundColor: 'var(--text)',
              color: 'var(--bg)',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '24px',
            }}
          >
            Choose Pro
          </Link>
          <div style={{ borderTop: '1px solid var(--border)', marginBottom: '18px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> Unlimited access to all 150+ models</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> <strong>20 requests per minute (20 RPM)</strong></div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> Claude Code, Codex, Cline support</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> Automatic provider failover</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> Unlimited API key management</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> Priority routing queue</div>
          </div>
        </div>

        {/* Enterprise Plan */}
        <div className="hover-lift" style={{ border: '1px solid var(--border)', borderRadius: '18px', padding: '28px', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--card)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={20} />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '999px', padding: '3px 10px' }}>
              Custom Limits
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 500, marginBottom: '4px' }}>Enterprise</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '22px' }}>For high-scale production systems</div>
          <div style={{ fontSize: '32px', fontWeight: 300, marginBottom: '22px' }}>Custom</div>
          <a
            href="https://t.me/frenix_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="button-press"
            style={{
              width: '100%',
              padding: '11px 0',
              border: '1px solid var(--text)',
              borderRadius: '22px',
              textAlign: 'center',
              backgroundColor: 'transparent',
              color: 'var(--text)',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>Contact on Telegram</span>
            <ExternalLink size={14} />
          </a>
          <div style={{ borderTop: '1px solid var(--border)', marginBottom: '18px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> Dedicated throughput guarantees</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> Custom SLA & uptime monitor</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> Bring-your-own-keys (BYOK)</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> SSO, team roles & audit logs</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> 24/7 dedicated Telegram engineer</div>
          </div>
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="hover-lift" style={{ border: '1px solid var(--border)', borderRadius: '18px', padding: '32px', backgroundColor: 'var(--card)' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 400, margin: '0 0 16px 0' }}>Frequently Asked Pricing Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: '15px', marginBottom: '4px' }}>Can I switch plans anytime?</div>
            <div style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6 }}>Yes, upgrades take effect immediately. Downgrades take effect at the end of the billing period.</div>
          </div>
          <div>
            <div style={{ fontWeight: 500, fontSize: '15px', marginBottom: '4px' }}>Do you charge for token overages?</div>
            <div style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6 }}>No, we do not bill variable per-token surcharges. Pro plans provide unlimited requests subject to fair concurrent rate limiting.</div>
          </div>
          <div>
            <div style={{ fontWeight: 500, fontSize: '15px', marginBottom: '4px' }}>Need help picking a tier?</div>
            <div style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6 }}>Chat with our team directly via Telegram at <a href="https://t.me/frenix_bot" target="_blank" rel="noopener noreferrer" style={{ color: accentDisplay, textDecoration: 'underline' }}>@frenix_bot</a>.</div>
          </div>
        </div>
      </div>
    </div>
  );
}