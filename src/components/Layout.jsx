import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  Home as HomeIcon,
  Tag,
  Terminal,
  Layers,
  BookOpen,
  Activity,
  GitCommit,
  MessageCircle,
  Sun,
  Moon,
  Globe,
  ExternalLink,
  Send,
  LogOut,
  UserCheck,
  Menu,
  X
} from 'lucide-react';
import TelegramAuthModal from './TelegramAuthModal';
import CookieNotice from './CookieNotice';

export default function Layout() {
  const { isDark, toggleTheme, accentDisplay } = useTheme();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close the mobile drawer on every route change (e.g. after tapping a nav link).
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const getSectionTitle = () => {
    switch (location.pathname) {
      case '/pricing':
        return 'Pricing';
      case '/dashboard':
        return 'Dashboard';
      case '/models':
        return 'Models';
      case '/docs':
        return 'Documentation';
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

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    borderRadius: '18px',
    fontSize: '14px',
    color: isActive ? accentDisplay : 'var(--text)',
    backgroundColor: isActive ? 'var(--hover-bg)' : 'transparent',
    fontWeight: isActive ? '500' : '400',
    transition: 'background-color 0.15s ease, color 0.15s ease',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TelegramAuthModal />
      <CookieNotice />
      <div
        className={`frenix-mobile-backdrop ${mobileNavOpen ? 'open' : ''}`}
        onClick={() => setMobileNavOpen(false)}
      />
      <div style={{ display: 'flex', flex: 1, maxWidth: '1600px', width: '100%', margin: '0 auto' }}>

        {/* Left Sidebar */}
        <aside
          className={`frenix-sidebar ${mobileNavOpen ? 'open' : ''}`}
          style={{
            borderRight: '1px solid var(--border)',
            padding: '20px 14px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 6px', color: 'inherit' }}>
              <svg viewBox="0 0 55 40" width="22" height="16" fill="none" style={{ flexShrink: 0 }}>
                <path
                  fill="currentColor"
                  d="M23.6322 0.597911C19.9395 1.76672 16.9327 5.48248 10.9192 12.914C3.501 22.0814 -0.208097 26.665 0.00900851 30.5474C0.155095 33.1598 1.30933 35.6108 3.22485 37.3763C6.07159 40 11.9392 40 23.6745 40H24.3275C27.1975 40 29.9133 38.6992 31.7186 36.4682C37.6627 29.1224 40.6348 25.4496 44.4744 24.8957C45.4078 24.7611 46.3555 24.7611 47.2889 24.8957C49.8634 25.2671 52.048 27.0408 55 30.3839C50.2776 21.5248 41.6084 3.83856 31.37 0.597911C28.8514 -0.199304 26.1508 -0.199304 23.6322 0.597911Z"
                />
              </svg>
              <span style={{ fontWeight: 600, fontSize: '18px', letterSpacing: '-0.01em' }}>Frenix</span>
            </Link>
            <button
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close navigation menu"
              className="frenix-mobile-menu-btn"
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text)', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Primary Navigation */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '14px', flexShrink: 0 }}>
            <NavLink to="/" end style={navLinkStyle}>
              <HomeIcon size={16} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Home</span>
            </NavLink>
            <NavLink to="/pricing" style={navLinkStyle}>
              <Tag size={16} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Pricing</span>
            </NavLink>
            <NavLink to="/dashboard" style={navLinkStyle}>
              <Terminal size={16} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Dashboard</span>
            </NavLink>
            <NavLink to="/models" style={navLinkStyle}>
              <Layers size={16} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Models</span>
            </NavLink>
            <NavLink to="/docs" style={navLinkStyle}>
              <BookOpen size={16} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Documentation</span>
            </NavLink>
          </nav>

          <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0 10px', flexShrink: 0 }} />

          {/* Secondary Navigation & Support */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px', flexShrink: 0 }}>
            <NavLink to="/status" style={navLinkStyle}>
              <Activity size={16} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Status</span>
            </NavLink>
            <NavLink to="/changelog" style={navLinkStyle}>
              <GitCommit size={16} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Changelog</span>
            </NavLink>
            
            {/* Support link directed to @frenix_bot on Telegram */}
            <a
              href="https://t.me/frenix_bot"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '18px',
                fontSize: '14px',
                color: 'var(--text)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <MessageCircle size={16} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>Support</span>
              <ExternalLink size={12} style={{ color: 'var(--muted)', opacity: 0.7 }} />
            </a>
          </nav>

          <div style={{ flex: 1 }} />

          {/* Bottom language / theme */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 6px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--muted)' }}>
              <Globe size={14} />
              <span>EN</span>
            </div>
            <button
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

          {/* Auth Button in Sidebar */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '14px', backgroundColor: 'var(--hover-bg)', marginTop: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <UserCheck size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '12px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.displayName}
                </span>
              </div>
              <button
                onClick={logout}
                title="Sign out"
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
                marginTop: '4px',
              }}
            >
              <Send size={14} />
              <span>Sign in with Telegram</span>
            </button>
          )}
        </aside>

        {/* Right Content Area */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
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
                <button
                  onClick={() => setMobileNavOpen(true)}
                  aria-label="Open navigation menu"
                  className="frenix-mobile-menu-btn"
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text)', padding: '4px', alignItems: 'center' }}
                >
                  <Menu size={20} />
                </button>
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
            <Outlet />
          </main>
        </div>
      </div>

      {/* Footer */}
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
    </div>
  );
}