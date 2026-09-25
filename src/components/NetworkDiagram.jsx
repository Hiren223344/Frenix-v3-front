import React, { useState, useRef, useEffect, useCallback } from 'react';

// Real model ids (src/pages/Models.jsx) the "now serving" badge cycles
// through — an illustrative animation, not a live request feed.
const MODEL_NAMES = ['claude-sonnet-4.5', 'gpt-6-astra', 'gemini-2.5-pro', 'deepseek-r1', 'llama-4-maverick'];

const NODE_META = {
  client: { kind: 'Client', name: 'Your app' },
  frenix: { kind: 'Gateway', name: 'Frenix', badge: '+3ms', on: true, main: true },
  anthropic: { kind: 'Provider', name: 'Anthropic', badge: '429', on: false },
  bedrock: { kind: 'Provider', name: 'AWS Bedrock', badge: '200', on: true, hit: true },
  vertex: { kind: 'Provider', name: 'Vertex AI', badge: 'standby', on: false },
  openrouter: { kind: 'Provider', name: 'OpenRouter', badge: 'standby', on: false },
};

const STATS = [
  { v: '150+', l: 'models' },
  { v: '99.98%', l: 'success rate' },
  { v: '3ms', l: 'gateway overhead' },
  { v: '1.2k', l: 'failovers / day' },
];

function layout(w) {
  const W = Math.max(w, 560);
  const c = 190;
  return {
    client: { x: W * 0.08, y: c - 30 },
    frenix: { x: W * 0.5 - 80, y: c - 30 },
    anthropic: { x: W * 0.92 - 160, y: 30 },
    bedrock: { x: W * 0.92 - 160, y: 110 },
    vertex: { x: W * 0.92 - 160, y: 190 },
    openrouter: { x: W * 0.92 - 160, y: 270 },
  };
}

function drag(e, onMove, onDone) {
  e.preventDefault();
  e.stopPropagation();
  const sx = e.clientX;
  const sy = e.clientY;
  const move = (ev) => onMove(ev.clientX - sx, ev.clientY - sy);
  const up = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    onDone?.();
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
}

export default function NetworkDiagram() {
  const canvasRef = useRef(null);
  const [pos, setPos] = useState(() => layout(900));
  const [moved, setMoved] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const [modelIndex, setModelIndex] = useState(0);

  useEffect(() => {
    const onResize = () => {
      const el = canvasRef.current;
      if (el && !moved) setPos(layout(el.clientWidth));
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [moved]);

  useEffect(() => {
    const iv = setInterval(() => setModelIndex((i) => (i + 1) % MODEL_NAMES.length), 2200);
    return () => clearInterval(iv);
  }, []);

  const grabNode = useCallback((id, e) => {
    // A touch drag on a node is indistinguishable from a page-scroll swipe
    // that happens to start over it — leave touch input to native scroll
    // and keep dragging a desktop-only (mouse/pen) affordance.
    if (e.pointerType === 'touch') return;
    const origin = { ...pos[id] };
    setMoved(true);
    drag(e, (dx, dy) => setPos((p) => ({ ...p, [id]: { x: origin.x + dx, y: origin.y + dy } })));
  }, [pos]);

  const startPan = useCallback((e) => {
    if (e.pointerType === 'touch') return;
    const origin = { ...pan };
    setPanning(true);
    drag(e, (dx, dy) => setPan({ x: origin.x + dx, y: origin.y + dy }), () => setPanning(false));
  }, [pan]);

  const resetCanvas = () => {
    const el = canvasRef.current;
    setMoved(false);
    setPan({ x: 0, y: 0 });
    setPos(layout(el ? el.clientWidth : 900));
  };

  const nodes = Object.keys(NODE_META).map((id) => {
    const m = NODE_META[id];
    const p = pos[id];
    return {
      id,
      ...m,
      x: p.x,
      y: p.y,
      op: m.on === false ? 0.55 : 1,
      border: m.main || m.hit ? 'var(--text)' : 'var(--border)',
      bg: m.main ? 'var(--hover-bg)' : 'var(--card)',
      badgeBg: m.hit ? 'var(--text)' : 'transparent',
      badgeColor: m.hit ? 'var(--bg)' : 'var(--muted)',
    };
  });

  const link = (a, b, style) => {
    const x1 = pos[a].x + 160;
    const y1 = pos[a].y + 30;
    const x2 = pos[b].x;
    const y2 = pos[b].y + 30;
    const mx = (x1 + x2) / 2;
    return { key: `${a}-${b}`, d: `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`, ...style };
  };
  const live = { stroke: 'var(--text)', w: 2, dash: '4 4', animated: true };
  const fail = { stroke: 'var(--border)', w: 1.5, dash: '3 4', animated: false };
  const idle = { stroke: 'var(--border)', w: 1.5, dash: '0', animated: false };
  const edges = [
    link('client', 'frenix', live),
    link('frenix', 'anthropic', fail),
    link('frenix', 'bedrock', live),
    link('frenix', 'vertex', idle),
    link('frenix', 'openrouter', idle),
  ];

  return (
    <div style={{ position: 'relative', width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderBottom: 'none', borderRadius: '18px 18px 0 0', textAlign: 'left' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: 500 }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--text)', animation: 'frenixLiveDotBlink 1.6s ease-in-out infinite' }} />
          Live routing
        </div>
        <span className="code-font" style={{ fontSize: '11.5px', color: 'var(--muted)' }}>req_8a2ce41</span>
        <span className="code-font" style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '999px', padding: '3px 10px' }}>
          {MODEL_NAMES[modelIndex]}
        </span>
      </div>

      <div
        ref={canvasRef}
        onPointerDown={startPan}
        style={{ position: 'relative', height: '380px', overflow: 'hidden', backgroundColor: 'var(--bg)', cursor: panning ? 'grabbing' : 'grab', touchAction: 'pan-y', userSelect: 'none' }}
      >
        <div style={{ position: 'absolute', inset: 0, transform: `translate(${pan.x}px, ${pan.y}px)` }}>
          <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }} width="1" height="1">
            {edges.map((ed) => (
              <path
                key={ed.key}
                d={ed.d}
                fill="none"
                stroke={ed.stroke}
                strokeWidth={ed.w}
                strokeDasharray={ed.dash}
                style={ed.animated ? { animation: 'frenixFlowDash 0.8s linear infinite' } : undefined}
              />
            ))}
          </svg>
          {nodes.map((n) => (
            <div
              key={n.id}
              onPointerDown={(e) => grabNode(n.id, e)}
              className="hover-lift"
              style={{
                position: 'absolute',
                left: `${n.x}px`,
                top: `${n.y}px`,
                width: '160px',
                height: '60px',
                border: `1px solid ${n.border}`,
                borderRadius: '12px',
                background: n.bg,
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '3px',
                cursor: 'grab',
                opacity: n.op,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10.5px', color: 'var(--muted)' }}>{n.kind}</span>
                {n.badge && (
                  <span className="code-font" style={{ fontSize: '10px', border: '1px solid var(--border)', borderRadius: '4px', padding: '0 5px', background: n.badgeBg, color: n.badgeColor }}>
                    {n.badge}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '13.5px', fontWeight: 500 }}>{n.name}</span>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', left: '14px', bottom: '12px', fontSize: '11.5px', color: 'var(--muted)', pointerEvents: 'none' }}>
          Drag nodes · drag background to pan
        </div>
        <button
          type="button"
          onClick={resetCanvas}
          onPointerDown={(e) => e.stopPropagation()}
          className="button-press"
          style={{ position: 'absolute', right: '12px', bottom: '10px', fontSize: '11.5px', color: 'var(--muted)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '999px', padding: '4px 12px', cursor: 'pointer' }}
        >
          Reset
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', borderTop: '1px solid var(--border)' }}>
        {STATS.map((s) => (
          <div key={s.l} style={{ padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: '4px', borderRight: '1px solid var(--border)' }}>
            <span style={{ fontSize: '24px', fontWeight: 300, letterSpacing: '-0.02em' }}>{s.v}</span>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{s.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
