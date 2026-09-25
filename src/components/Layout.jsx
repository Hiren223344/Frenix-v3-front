import React, { useState, useEffect, Suspense } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { BotAvatar } from 'bot-avatars';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { SoundToggle } from './sound';
import {
  AnimatedSidebar,
  AnimatedSidebarClose,
  AnimatedSidebarContent,
  AnimatedSidebarFooter,
  AnimatedSidebarGroup,
  AnimatedSidebarGroupContent,
  AnimatedSidebarHeader,
  AnimatedSidebarInset,
  AnimatedSidebarMenu,
  AnimatedSidebarMenuButton,
  AnimatedSidebarMenuItem,
  AnimatedSidebarProvider,
  AnimatedSidebarRail,
  AnimatedSidebarTrigger,
} from './motion/animated-sidebar';
import {
  Home as HomeIcon,
  Tag,
  Terminal,
  MessageSquare,
  Layers,
  BookOpen,
  Activity,
  Plug,
  Puzzle,
  GitCommit,
  MessageCircle,
  Sun,
  Moon,
  Globe,
  ExternalLink,
  Send,
  LogOut,
  UserCheck,
  PanelLeft,
  Menu,
  X
} from 'lucide-react';
import TelegramAuthModal from './TelegramAuthModal';
import CookieNotice from './CookieNotice';

// Same fallback pattern as Status.jsx's STATUS_URL: only used if
// window.secureRelayRequest (set synchronously in main.jsx before React
// mounts) isn't available for some reason.
const STATUS_URL = typeof window !== 'undefined' && window.location.hostname === 'frenix.sh'
  ? 'https://api.frenix.sh/v1/status'
  : (import.meta.env.DEV ? '/v1/status' : 'https://api.frenix.sh/v1/status');

const PRIMARY_NAV = [
  { to: '/', end: true, label: 'Home', Icon: HomeIcon },
  { to: '/pricing', label: 'Pricing', Icon: Tag },
  { to: '/dashboard', label: 'Dashboard', Icon: Terminal },
  { to: '/playground', label: 'Playground', Icon: MessageSquare },
  { to: '/models', label: 'Models', Icon: Layers },
  { to: '/docs', label: 'Documentation', Icon: BookOpen },
  { to: '/mcp', label: 'MCP', Icon: Plug },
  { to: '/plugins', label: 'Plugins', Icon: Puzzle },
];

const SECONDARY_NAV = [
  { to: '/status', label: 'Status', Icon: Activity },
  { to: '/changelog', label: 'Changelog', Icon: GitCommit },
];

// The full sidebar collapses to an off-canvas drawer below md (768px) and
// stays closed until the header's hamburger is tapped — leaving mobile
// visitors with no visible way to navigate at all until they discover that
// button. This always-on bottom tab bar surfaces the handful of
// destinations people actually jump between, with "More" opening the same
// drawer for everything else.
const MOBILE_TAB_NAV = [
  { to: '/', end: true, label: 'Home', Icon: HomeIcon },
  { to: '/pricing', label: 'Pricing', Icon: Tag },
  { to: '/dashboard', label: 'Dashboard', Icon: Terminal },
  { to: '/playground', label: 'Chat', Icon: MessageSquare },
];

export default function Layout() {
  const { isDark, toggleTheme, accentDisplay } = useTheme();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const location = useLocation();
  // The version shown next to the logo comes from the gateway itself
  // (GET /v1/status), not a hardcoded frontend constant, so the sidebar
  // can never drift out of sync with what's actually deployed. Stays null
  // (badge hidden) until the fetch resolves.
  const [appVersion, setAppVersion] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let payload;
        if (typeof window !== 'undefined' && window.secureRelayRequest) {
          const res = await window.secureRelayRequest('/v1/status', { method: 'GET' });
          if (res.ok) payload = res.data;
        } else {
          const res = await fetch(STATUS_URL, { method: 'GET', cache: 'no-store' });
          if (res.ok) payload = await res.json();
        }
        if (!cancelled && payload?.version) {
          setAppVersion(payload.version);
        }
      } catch (err) {
        console.warn('Failed to fetch gateway version:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getSectionTitle = () => {
    switch (location.pathname) {
      case '/pricing':
        return 'Pricing';
      case '/dashboard':
        return 'Dashboard';
      case '/playground':
        return 'Playground';
      case '/models':
        return 'Models';
      case '/docs':
        return 'Documentation';
      case '/mcp':
        return 'MCP Gateway';
      case '/plugins':
        return 'Plugins';
      case '/status':
        return 'Status';
      case '/changelog':
        return 'Changelog';
      case '/terms':
        return 'Terms of Service';
      case '/privacy':
        return 'Privacy Policy';
      case '/cookies':
        return 'Cookie Policy';
      default:
        return 'AI gateway';
    }
  };

  const isNavActive = ({ to, end }) => (end ? location.pathname === to : location.pathname.startsWith(to));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TelegramAuthModal />
      <CookieNotice />

      <AnimatedSidebarProvider style={{ maxWidth: '1600px', width: '100%', margin: '0 auto', flex: 1 }}>
        <AnimatedSidebar
          ariaLabel="Frenix navigation"
          collapsible="icon"
          panelClassName="border-border bg-background"
        >
          {/* Logo */}
          <AnimatedSidebarHeader className="p-3 pb-2">
            <div className="flex min-h-11 items-center gap-2.5 overflow-hidden px-1.5">
              <Link to="/" className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden text-inherit">
                <svg viewBox="0 0 55 40" width="20" height="15" fill="none" className="shrink-0">
                  <path
                    fill="currentColor"
                    d="M23.6322 0.597911C19.9395 1.76672 16.9327 5.48248 10.9192 12.914C3.501 22.0814 -0.208097 26.665 0.00900851 30.5474C0.155095 33.1598 1.30933 35.6108 3.22485 37.3763C6.07159 40 11.9392 40 23.6745 40H24.3275C27.1975 40 29.9133 38.6992 31.7186 36.4682C37.6627 29.1224 40.6348 25.4496 44.4744 24.8957C45.4078 24.7611 46.3555 24.7611 47.2889 24.8957C49.8634 25.2671 52.048 27.0408 55 30.3839C50.2776 21.5248 41.6084 3.83856 31.37 0.597911C28.8514 -0.199304 26.1508 -0.199304 23.6322 0.597911Z"
                  />
                </svg>
                <span className="flex min-w-0 items-center gap-2 group-data-[state=collapsed]/sidebar:hidden">
                  <span style={{ fontWeight: 600, fontSize: '18px', letterSpacing: '-0.01em' }}>Frenix</span>
                  <BotAvatar type="circle" size={20} state="default" theme={isDark ? 'dark' : 'light'} />
                  {appVersion && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 500,
                        color: 'var(--muted)',
                        padding: '1px 6px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      v{appVersion}
                    </span>
                  )}
                </span>
              </Link>
              <AnimatedSidebarClose className="ml-auto shrink-0 text-muted-foreground hover:bg-muted md:hidden">
                <X size={18} />
              </AnimatedSidebarClose>
            </div>
          </AnimatedSidebarHeader>

          <AnimatedSidebarContent className="px-2">
            {/* Primary Navigation */}
            <AnimatedSidebarGroup>
              <AnimatedSidebarGroupContent>
                <AnimatedSidebarMenu>
                  {PRIMARY_NAV.map((item) => (
                    <AnimatedSidebarMenuItem key={item.to}>
                      <AnimatedSidebarMenuButton
                        to={item.to}
                        isActive={isNavActive(item)}
                        icon={<item.Icon size={16} />}
                      >
                        {item.label}
                      </AnimatedSidebarMenuButton>
                    </AnimatedSidebarMenuItem>
                  ))}
                </AnimatedSidebarMenu>
              </AnimatedSidebarGroupContent>
            </AnimatedSidebarGroup>

            {/* Secondary Navigation & Support */}
            <AnimatedSidebarGroup className="mt-2 border-t border-border pt-2">
              <AnimatedSidebarGroupContent>
                <AnimatedSidebarMenu>
                  {SECONDARY_NAV.map((item) => (
                    <AnimatedSidebarMenuItem key={item.to}>
                      <AnimatedSidebarMenuButton
                        to={item.to}
                        isActive={isNavActive(item)}
                        icon={<item.Icon size={16} />}
                      >
                        {item.label}
                      </AnimatedSidebarMenuButton>
                    </AnimatedSidebarMenuItem>
                  ))}
                  <AnimatedSidebarMenuItem>
                    <AnimatedSidebarMenuButton
                      href="https://t.me/frenix_bot"
                      icon={<MessageCircle size={16} />}
                      badge={<ExternalLink size={11} style={{ opacity: 0.7 }} />}
                    >
                      Support
                    </AnimatedSidebarMenuButton>
                  </AnimatedSidebarMenuItem>
                </AnimatedSidebarMenu>
              </AnimatedSidebarGroupContent>
            </AnimatedSidebarGroup>
          </AnimatedSidebarContent>

          <AnimatedSidebarFooter className="gap-2 border-t border-border p-3">
            {/* Bottom language / theme */}
            <div className="flex items-center justify-between px-0.5">
              <div
                className="flex items-center gap-1.5 group-data-[state=collapsed]/sidebar:hidden"
                style={{ fontSize: '12px', color: 'var(--muted)' }}
              >
                <Globe size={14} />
                <span>EN</span>
              </div>
              <div className="ml-auto flex items-center gap-0.5">
                <SoundToggle />
                <button
                  data-slot="button"
                  onClick={toggleTheme}
                  aria-label="Toggle dark mode"
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: 'var(--text)',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '6px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              </div>
            </div>

            {/* Auth Button in Sidebar */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '14px', backgroundColor: 'var(--hover-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <UserCheck size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                  <span
                    className="group-data-[state=collapsed]/sidebar:hidden"
                    style={{ fontSize: '12px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {user?.displayName}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="group-data-[state=collapsed]/sidebar:hidden"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--muted)',
                    padding: '4px',
                    display: 'flex',
                  }}
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '10px 0',
                  borderRadius: '18px',
                  background: 'var(--text)',
                  color: 'var(--bg)',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <Send size={14} />
                <span className="group-data-[state=collapsed]/sidebar:hidden">Sign in with Telegram</span>
              </button>
            )}
          </AnimatedSidebarFooter>

          <AnimatedSidebarRail />
        </AnimatedSidebar>

        <AnimatedSidebarInset className="bg-background">
          {/* Header */}
          <header
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 40,
              backgroundColor: 'var(--bg)',
              borderBottom: '1px solid var(--border)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div
              className="frenix-header-inner"
              style={{
                padding: '0 28px',
                minHeight: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 0' }}>
                <AnimatedSidebarTrigger
                  aria-label="Toggle sidebar"
                  className="text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <PanelLeft size={18} />
                </AnimatedSidebarTrigger>
                <span style={{ fontWeight: 600, fontSize: '18px', letterSpacing: '-0.01em' }}>Frenix</span>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{getSectionTitle()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0' }}>
                <Link
                  to="/docs"
                  style={{ fontSize: '14px', color: 'var(--text)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = accentDisplay)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text)')}
                >
                  Read documentation
                </Link>

                {isAuthenticated ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Link
                      to="/dashboard"
                      style={{
                        fontSize: '13px',
                        padding: '6px 14px',
                        borderRadius: '18px',
                        backgroundColor: 'var(--hover-bg)',
                        color: 'var(--text)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Terminal size={14} />
                      <span>{user?.displayName}</span>
                    </Link>
                    <button
                      onClick={logout}
                      style={{
                        fontSize: '12px',
                        padding: '6px 12px',
                        borderRadius: '18px',
                        border: '1px solid var(--border)',
                        background: 'none',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={openAuthModal}
                    style={{
                      fontSize: '13px',
                      padding: '7px 16px',
                      border: 'none',
                      borderRadius: '18px',
                      backgroundColor: 'var(--text)',
                      color: 'var(--bg)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 500,
                    }}
                  >
                    <Send size={14} />
                    <span>Sign in with Telegram</span>
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Main Outlet */}
          <main className="frenix-main-outlet" style={{ flex: '1 1 auto', maxWidth: '1024px', margin: '0 auto', padding: '0 28px', width: '100%' }}>
            <Suspense fallback={null}>
              <Outlet />
            </Suspense>
          </main>

          {/* Footer — only shown on the Home page; every other page keeps its
              content flush against the viewport bottom instead of repeating
              the full sitemap-style link list on every navigation. */}
          {location.pathname === '/' && (
          <footer style={{ borderTop: '1px solid var(--border)', marginTop: 'auto', background: 'var(--bg)' }}>
            <div
              className="frenix-footer-inner"
              style={{
                maxWidth: '1024px',
                margin: '0 auto',
                padding: '36px 28px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '15px' }}>Frenix</div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <Link to="/" style={{ fontSize: '13px', color: 'var(--muted)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}>
                  Home
                </Link>
                <Link to="/pricing" style={{ fontSize: '13px', color: 'var(--muted)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}>
                  Pricing
                </Link>
                <Link to="/models" style={{ fontSize: '13px', color: 'var(--muted)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}>
                  Models
                </Link>
                <Link to="/docs" style={{ fontSize: '13px', color: 'var(--muted)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}>
                  Documentation
                </Link>
                <Link to="/mcp" style={{ fontSize: '13px', color: 'var(--muted)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}>
                  MCP
                </Link>
                <Link to="/plugins" style={{ fontSize: '13px', color: 'var(--muted)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}>
                  Plugins
                </Link>
                <Link to="/status" style={{ fontSize: '13px', color: 'var(--muted)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}>
                  Status
                </Link>
                <Link to="/changelog" style={{ fontSize: '13px', color: 'var(--muted)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}>
                  Changelog
                </Link>
                <Link to="/terms" style={{ fontSize: '13px', color: 'var(--muted)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}>
                  Terms
                </Link>
                <Link to="/privacy" style={{ fontSize: '13px', color: 'var(--muted)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}>
                  Privacy
                </Link>
                <Link to="/cookies" style={{ fontSize: '13px', color: 'var(--muted)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}>
                  Cookies
                </Link>
                <a href="https://t.me/frenix_bot" target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: 'var(--muted)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}>
                  Telegram Support (@frenix_bot)
                </a>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>&copy; 2026 Frenix. All rights reserved.</div>
            </div>
          </footer>
          )}

          {/* Reserves the space the fixed mobile tab bar below sits over, so
              the last bit of page content never ends up hidden behind it. */}
          <div className="md:hidden" style={{ height: '64px', paddingBottom: 'env(safe-area-inset-bottom)' }} aria-hidden="true" />
        </AnimatedSidebarInset>

        {/* Always-visible mobile navigation — see MOBILE_TAB_NAV above. */}
        <nav
          aria-label="Mobile navigation"
          className="border-border bg-background flex md:hidden"
          style={{
            position: 'fixed',
            insetInline: 0,
            bottom: 0,
            zIndex: 45,
            alignItems: 'stretch',
            borderTop: '1px solid var(--border)',
            backdropFilter: 'blur(8px)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {MOBILE_TAB_NAV.map((item) => {
            const active = isNavActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  padding: '8px 0',
                  fontSize: '10.5px',
                  fontWeight: 500,
                  color: active ? accentDisplay : 'var(--muted)',
                }}
              >
                <item.Icon size={19} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <AnimatedSidebarTrigger
            aria-label="Open full menu"
            className="text-muted-foreground hover:bg-transparent hover:text-foreground"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              padding: '8px 0',
              fontSize: '10.5px',
              fontWeight: 500,
              width: 'auto',
              height: 'auto',
            }}
          >
            <Menu size={19} />
            <span>More</span>
          </AnimatedSidebarTrigger>
        </nav>
      </AnimatedSidebarProvider>
    </div>
  );
}
