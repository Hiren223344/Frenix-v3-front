import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SplitText from '../components/ui/split-text';
import { useTranslate } from '../context/LanguageContext';

export default function Cookies() {
  const t = useTranslate();

  return (
    <div className="animate-fadeInUp" style={{ padding: '64px 0 96px 0', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>
        <ArrowLeft size={14} />
        <span>{t('Back to Home')}</span>
      </Link>
      <div style={{ marginBottom: '36px' }}>
        <SplitText tag="h1" text={t('Cookie Policy')} className="frenix-page-title-spaced" textAlign="left" splitType="chars" delay={18} duration={0.6} from={{ opacity: 0, y: 18 }} to={{ opacity: 1, y: 0 }} />
        <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{t('Last updated: September 8, 2026')}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', lineHeight: 1.7, fontSize: '14px', color: 'var(--text)' }}>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>1. {t("We Don't Use Cookies")}</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            {t('Frenix does not set any HTTP cookies — no tracking cookies, no advertising cookies, no analytics cookies, and no "essential" session cookies either. This page exists to say so explicitly, and to document the one thing we do use in your browser instead: local storage.')}
          </p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>2. {t('What We Use Instead: Local Storage')}</h2>
          <p style={{ margin: '0 0 10px 0', color: 'var(--muted)' }}>
            {t("The dashboard stores a small number of items in your browser's local storage (not a cookie — a different browser mechanism that isn't sent to our servers on every request the way a cookie is). Specifically:")}
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong>{t('Session token:')}</strong> {t('lets you stay signed in across page loads without re-authenticating via Telegram every time.')}</li>
            <li><strong>{t('API key metadata cache:')}</strong> {t("so a key's raw secret, shown to you once at creation, can still be copied from the dashboard later in the same browser (we never store it server-side — see our")} <Link to="/privacy" style={{ color: 'var(--text)', textDecoration: 'underline' }}>{t('Privacy Policy')}</Link>).</li>
            <li><strong>{t('Referral code:')}</strong> {t('if you arrived via a')} <code style={{ fontFamily: 'monospace' }}>?ref=</code> {t('link, we remember the code locally until you actually sign up, so the referral is correctly attributed.')}</li>
            <li><strong>{t('Theme preference:')}</strong> {t("whether you're using light or dark mode.")}</li>
          </ul>
          <p style={{ margin: '10px 0 0 0', color: 'var(--muted)' }}>
            {t('None of this is used to track you across other sites, none of it is sold or shared with third parties, and none of it is accessible to us server-side — it lives only in your browser until you clear it or sign out.')}
          </p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>3. {t('Third-Party Cookies')}</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            {t("We don't embed any third-party analytics, advertising, or social widgets that would set their own cookies. If you follow a link out to Telegram (e.g. to @frenix_bot) or to an upstream AI provider's own site, that destination's cookie practices are governed by their own policy, not this one.")}
          </p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>4. {t('Managing or Clearing This Data')}</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            {t('You can clear everything described in Section 2 at any time through your browser\'s own settings (clearing "site data" or "local storage" for frenix.sh), or by signing out from the dashboard, which removes your session token. Since we set no cookies, there\'s nothing here that a cookie-blocking browser extension needs to block, and no cookie consent banner is required for what we do — this page is that disclosure instead.')}
          </p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>5. {t('Changes to This Policy')}</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            {t("If that ever changes — for example, if we introduce an analytics or advertising cookie in the future — we'll update this page first and reflect it here before it takes effect.")}
          </p>
        </section>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 8px 0' }}>6. {t('Contact')}</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>
            {t('Questions about this policy can go to the same place as any other privacy question — see our')} <Link to="/privacy" style={{ color: 'var(--text)', textDecoration: 'underline' }}>{t('Privacy Policy')}</Link>, {t('or contact us on Telegram at')} <a href="https://t.me/frenix_bot" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text)', textDecoration: 'underline' }}>@frenix_bot</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
