import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, GitCommit, Zap, Shield, ArrowRight } from 'lucide-react';

const RELEASES = [
  {
    version: 'v1.4.0',
    date: 'March 6, 2026',
    tag: 'Latest Release',
    title: 'Claude Opus 4.5 & GPT-5.1 Support, Bot-Only Auth & Status Dashboard',
    changes: [
      {
        type: 'New Models',
        items: [
          'Added native zero-latency routing for Claude Opus 4.5 and Sonnet 4.5.',
          'Enabled GPT-5.1 and o3 reasoning endpoints with 1M token unified context support.',
          'Added DeepSeek R1 and V3 reasoning models to the compatibility matrix.',
        ],
      },
      {
        type: 'Authentication & Security',
        items: [
          'Introduced passwordless bot verification via @frenix_bot on Telegram.',
          'Automated key hashing using Argon2id with instant client-side revocation.',
          'Enforced protected dashboard access requiring verified Telegram sessions.',
        ],
      },
      {
        type: 'Platform & Infrastructure',
        items: [
          'Launched public real-time cluster health and 90-day uptime tracker at /status.',
          'Updated Pro tier to 20 Requests Per Minute (RPM) with unlimited daily throughput.',
          'Provisioned Free tier with 500 Requests Per Day (RPD) with 5 RPM burst concurrency.',
        ],
      },
    ],
  },
  {
    version: 'v1.3.0',
    date: 'February 20, 2026',
    title: 'Streaming Engine v2 & Claude Code CLI Integration',
    changes: [
      {
        type: 'Performance',
        items: [
          'Reduced median Time-to-First-Byte (TTFB) on SSE streams to under 28ms.',
          'Optimized parallel tool and function calling translation across Anthropic and OpenAI schemas.',
        ],
      },
      {
        type: 'Integrations',
        items: [
          'Added direct support for Claude Code CLI via ANTHROPIC_BASE_URL override.',
          'Verified end-to-end compatibility with Cline, Roo Code, and Cursor agent sessions.',
        ],
      },
    ],
  },
  {
    version: 'v1.2.0',
    date: 'January 28, 2026',
    title: 'Automated Multi-Region Failover & Zero Data Retention Guarantee',
    changes: [
      {
        type: 'Reliability',
        items: [
          'Deployed automatic cluster failover routing around degraded upstream data centers in under 1.2 seconds.',
          'Added regional edge points of presence across US East, US West, and EU Central.',
        ],
      },
      {
        type: 'Privacy',
        items: [
          'Published formal Zero Data Retention (ZDR) policy: no logging, inspecting, or persisting of user prompts.',
          'Guaranteed zero model training on gateway payload data.',
        ],
      },
    ],
  },
  {
    version: 'v1.0.0',
    date: 'January 10, 2026',
    title: 'Initial Launch of Frenix AI Gateway',
    changes: [
      {
        type: 'Core Platform',
        items: [
          'Unified endpoint for 150+ models under api.frenix.sh/v1.',
          'Simple per-request quotas without variable dynamic token markups.',
          'Developer dashboard for generating and monitoring API keys.',
        ],
      },
    ],
  },
];

export default function Changelog() {
  const { accentDisplay } = useTheme();

  return (
    <div className="animate-fadeInUp" style={{ padding: '64px 0 96px 0', maxWidth: '820px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 300, margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
          Changelog
        </h1>
        <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--muted)', margin: 0 }}>
          New features, model additions, performance benchmarks, and platform improvements.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        {RELEASES.map((release, idx) => (
          <div
            key={idx}
            className="hover-lift"
            style={{
              border: '1px solid var(--border)',
              borderRadius: '18px',
              padding: '30px',
              backgroundColor: 'var(--card)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="code-font" style={{ fontSize: '16px', fontWeight: 500 }}>
                  {release.version}
                </span>
                {release.tag && (
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--hover-bg)',
                      fontWeight: 500,
                    }}
                  >
                    {release.tag}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{release.date}</div>
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: 400, margin: '0 0 20px 0', lineHeight: 1.4 }}>
              {release.title}
            </h2>

            {/* Change groups */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {release.changes.map((group, gIdx) => (
                <div key={gIdx}>
                  <div style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', marginBottom: '8px' }}>
                    {group.type}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: 1.7, color: 'var(--text)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {group.items.map((item, iIdx) => (
                      <li key={iIdx} style={{ color: 'var(--muted)' }}>
                        <span style={{ color: 'var(--text)' }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}