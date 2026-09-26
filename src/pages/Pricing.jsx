import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BorderBeam } from 'border-beam';
import { MetalFx } from 'metal-fx';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTranslate } from '../context/LanguageContext';
import { Reveal, ScrollReveal } from '../components/animations';
import SplitText from '../components/ui/split-text';
import { BouncyAccordion } from '../components/motion/bouncy-accordion';
import { Check, User, Layers, Shield, ExternalLink, RefreshCw, Coins, HelpCircle } from 'lucide-react';

export default function Pricing() {
  const { isDark, accentDisplay } = useTheme();
  const beamTheme = isDark ? 'dark' : 'light';
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const toast = useToast();
  const t = useTranslate();
  const [proLoading, setProLoading] = useState(false);
  const [proError, setProError] = useState('');

  // Starts a GMPay Edge crypto checkout for the Pro tier (see
  // internal/billing.GMPayCreate) — the amount is always resolved
  // server-side, never sent from here. GMPay's hosted checkout
  // (payment_url) is what we always get back since no token/network is
  // specified, so we just hand the browser off to it rather than building
  // a custom QR/address UI.
  const handleChoosePro = async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setProError('');
    setProLoading(true);
    try {
      const token = user?.sessionToken || localStorage.getItem('frenix_session_token');
      if (!token || !window.secureRelayRequest) {
        throw new Error(t('No active session found. Please log in first.'));
      }
      const res = await window.secureRelayRequest('/v1/billing/gmpay/create', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: {},
      });
      if (!res.ok || !res.data?.payment_url) {
        if (res.status === 501) {
          throw new Error(t('Crypto checkout is not available yet — check back soon.'));
        }
        throw new Error(res.data?.error?.message || `${t('Failed to start checkout')} (HTTP ${res.status})`);
      }
      window.open(res.data.payment_url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      const message = err.message || t('Failed to start checkout.');
      setProError(message);
      toast.error(t('Checkout failed'), message);
    } finally {
      setProLoading(false);
    }
  };

  return (
    <div className="animate-fadeInUp" style={{ padding: '64px 0 96px 0' }}>
      <div style={{ marginBottom: '40px' }}>
        <SplitText tag="h1" text={t('Pricing Plans')} className="frenix-page-title-spaced" textAlign="left" splitType="chars" delay={18} duration={0.6} from={{ opacity: 0, y: 18 }} to={{ opacity: 1, y: 0 }} />
        <Reveal>
          <p
            className="t-stagger-line t-stagger-line--1"
            style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--muted)', margin: 0, maxWidth: '600px' }}
          >
            {t('Simple pricing with predictable concurrency and throughput. No surprise bills or token markups.')}
          </p>
        </Reveal>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '64px' }}>
        {/* Free Plan */}
        <ScrollReveal y={16} className="hover-lift" style={{ border: '1px solid var(--border)', borderRadius: '18px', padding: '28px', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--card)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '999px', padding: '3px 10px' }}>
              500 RPD
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 500, marginBottom: '4px' }}>{t('Free')}</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '22px' }}>{t('For experimenting & testing Frenix')}</div>
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
            {t('Start Free')}
          </Link>
          <div style={{ borderTop: '1px solid var(--border)', marginBottom: '18px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> {t('Access to free models tier')}</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> <strong>{t('500 requests per day (RPD)')}</strong></div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> {t('5 requests per minute burst')}</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> {t('1 active API key')}</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> {t('Telegram community support')}</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> {t('Standard response latency')}</div>
          </div>
        </ScrollReveal>

        {/* Pro Plan */}
        <ScrollReveal delay={0.08} y={16} style={{ position: 'relative', height: '100%' }}>
          <div style={{ position: 'absolute', top: '-11px', right: '24px', zIndex: 1, background: 'var(--text)', color: 'var(--bg)', fontSize: '11px', padding: '2px 12px', borderRadius: '12px', fontWeight: 500 }}>
            {t('Most Popular')}
          </div>
        <BorderBeam size="md" colorVariant="colorful" strength={0.7} theme={beamTheme} style={{ display: 'block', height: '100%' }}>
        <div className="hover-lift" style={{ border: '1.5px solid var(--text)', borderRadius: '18px', padding: '28px', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--card)', position: 'relative', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={20} />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '999px', padding: '3px 10px' }}>
              10 RPM
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 500, marginBottom: '4px' }}>{t('Pro')}</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '22px' }}>{t('For everyday builders & power agents')}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '22px' }}>
            <span style={{ fontSize: '32px', fontWeight: 300 }}>$30</span>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>/ {t('month')}</span>
          </div>
          {/* marginBottom lives on the MetalFx wrapper, not the button: the
              wrapper is a flex box that hugs its child's full margin box, so
              a margin set on the button itself was being pulled inside the
              wrapper's own rendered height — extending its solid background
              (and rounded-corner mask) well past the visible pill, into what
              was meant to be plain gap before the divider below. */}
          <MetalFx
            variant="button"
            preset="gold"
            theme={beamTheme}
            normalizeHostStyles={false}
            style={{ width: '100%', marginBottom: proError ? '10px' : '24px' }}
          >
            <button
              type="button"
              onClick={handleChoosePro}
              disabled={proLoading}
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
                border: 'none',
                cursor: proLoading ? 'default' : 'pointer',
                opacity: proLoading ? 0.7 : 1,
              }}
            >
              {proLoading ? t('Starting checkout…') : t('Choose Pro')}
            </button>
          </MetalFx>
          {proError && (
            <div style={{ fontSize: '12px', color: '#e5484d', marginBottom: '24px', lineHeight: 1.5 }}>{proError}</div>
          )}
          <div style={{ borderTop: '1px solid var(--border)', marginBottom: '18px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> {t('Unlimited access to all 150+ models')}</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> <strong>{t('10 requests per minute (10 RPM)')}</strong></div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> {t('Claude Code, Codex, Cline support')}</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> {t('Automatic provider failover')}</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> {t('Unlimited API key management')}</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> {t('Priority routing queue')}</div>
          </div>
        </div>
        </BorderBeam>
        </ScrollReveal>

        {/* Enterprise Plan */}
        <ScrollReveal delay={0.16} y={16} className="hover-lift" style={{ border: '1px solid var(--border)', borderRadius: '18px', padding: '28px', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--card)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={20} />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '999px', padding: '3px 10px' }}>
              {t('Custom Limits')}
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 500, marginBottom: '4px' }}>{t('Enterprise')}</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '22px' }}>{t('For high-scale production systems')}</div>
          <div style={{ fontSize: '32px', fontWeight: 300, marginBottom: '22px' }}>{t('Custom')}</div>
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
            <span>{t('Contact on Telegram')}</span>
            <ExternalLink size={14} />
          </a>
          <div style={{ borderTop: '1px solid var(--border)', marginBottom: '18px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> {t('Dedicated throughput guarantees')}</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> {t('Custom SLA & uptime monitor')}</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> {t('Bring-your-own-keys (BYOK)')}</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> {t('SSO, team roles & audit logs')}</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Check size={16} color={accentDisplay} /> {t('24/7 dedicated Telegram engineer')}</div>
          </div>
        </ScrollReveal>
      </div>

      {/* Feature Comparison */}
      <ScrollReveal className="hover-lift" style={{ border: '1px solid var(--border)', borderRadius: '18px', padding: '32px', backgroundColor: 'var(--card)' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 400, margin: '0 0 16px 0' }}>{t('Frequently Asked Pricing Questions')}</h2>
        <BouncyAccordion
          defaultValue={null}
          items={[
            {
              id: 'switch-plans',
              title: t('Can I switch plans anytime?'),
              icon: <RefreshCw size={15} />,
              description: t('Yes, upgrades take effect immediately. Downgrades take effect at the end of the billing period.'),
            },
            {
              id: 'overages',
              title: t('Do you charge for token overages?'),
              icon: <Coins size={15} />,
              description: t('No, we do not bill variable per-token surcharges. Pro plans provide unlimited requests subject to fair concurrent rate limiting.'),
            },
            {
              id: 'pick-a-tier',
              title: t('Need help picking a tier?'),
              icon: <HelpCircle size={15} />,
              description: (
                <>
                  {t('Chat with our team directly via Telegram at')}{' '}
                  <a href="https://t.me/frenix_bot" target="_blank" rel="noopener noreferrer" style={{ color: accentDisplay, textDecoration: 'underline' }}>@frenix_bot</a>.
                </>
              ),
            },
          ]}
        />
      </ScrollReveal>
    </div>
  );
}
