import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// -- Data ----------------------------------------------------------------------
const BRANCHES = [
  { id: 'lighting',    label: 'Lighting',     color: '#ffffff',
    nodes: ['Golden Hour', 'Midday Light', 'Front Light', 'Side Light', 'Backlight'] },
  { id: 'composition', label: 'Composition',  color: '#ffffff',
    nodes: ['Rule of Thirds', 'Leading Lines', 'Framing', 'Negative Space', 'Symmetry'] },
  { id: 'story',       label: 'Story',        color: '#ffffff',
    nodes: ['Clear Subject', 'Emotion', 'Action', 'Meaning', 'Remove Clutter'] },
  { id: 'focus',       label: 'Focus',        color: '#ffffff',
    nodes: ['Sharp Subject', 'Autofocus', 'Tap Focus', 'Depth of Field', 'Isolation'] },
  { id: 'exposure',    label: 'Exposure',     color: '#ffffff',
    nodes: ['ISO', 'Shutter Speed', 'Aperture', 'Highlights', 'Shadows'] },
  { id: 'perspective', label: 'Perspective',  color: '#ffffff',
    nodes: ['Low Angle', 'High Angle', 'Close Up', 'Wide Shot', 'Dutch Tilt'] },
  { id: 'timing',      label: 'Timing',       color: '#ffffff',
    nodes: ['Peak Moment', 'Expression', 'Movement', 'Interaction', 'Anticipation'] },
  { id: 'background',  label: 'Background',   color: '#ffffff',
    nodes: ['Clean BG', 'Blurred BG', 'Match Mood', 'No Distraction'] },
  { id: 'color',       label: 'Color',        color: '#ffffff',
    nodes: ['Warm Tones', 'Cool Tones', 'Contrast', 'Color Story', 'Palette'] },
  { id: 'editing',     label: 'Editing',      color: '#ffffff',
    nodes: ['Exposure Adj.', 'Color Grade', 'Crop', 'Dodge & Burn', 'Sharpening'] },
  { id: 'style',       label: 'Style',        color: '#ffffff',
    nodes: ['Visual Identity', 'Consistent Tones', 'Consistent Frame', 'Signature Look'] },
];

const PILLARS = [
  { icon: '*', label: 'Light', tone: '#f97316',
    desc: 'We map light like terrain: direction, quality, and patience.' },
  { icon: '+', label: 'Composition', tone: '#0ea5e9',
    desc: 'We arrange tension and calm so the eye knows where to land.' },
  { icon: 'o', label: 'Story', tone: '#14b8a6',
    desc: 'We build context and emotion so the frame carries meaning.' },
  { icon: '0', label: 'Editing', tone: '#eab308',
    desc: 'We polish, not fabricate. The truth should still look true.' },
];

const PROCESS_STEPS = [
  { step: '01', label: 'Scout',
    desc: 'Read the light, background, and movement before you lift the camera.' },
  { step: '02', label: 'Frame',
    desc: 'Commit to a clean line. Remove the noise at the edges.' },
  { step: '03', label: 'Time',
    desc: 'Wait for expression, action, and the peak gesture.' },
  { step: '04', label: 'Refine',
    desc: 'Edit for mood and clarity, never for invention.' },
];

const FIELD_FRAMES = [
  { n: '01', title: 'Light as texture',  note: 'Soft highlights, confident shadows.' },
  { n: '02', title: 'Motion as rhythm',  note: 'Timing that feels alive.' },
  { n: '03', title: 'Color as emotion',  note: 'Palette drives the mood.' },
];

const FADE_UP = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

// -- Layout constants -----------------------------------------------------------
const N              = BRANCHES.length;
const MAP_MIN_W       = 1200;
const MAP_PADDING     = 120;
const MAP_SPINE_X     = 170;
const MAP_ROOT_Y      = 0;
const MAP_TOP_Y       = 100;
const MAP_ROW_GAP     = 320;
const MAP_NODE_GAP    = 190;
const MAP_HEADER_X    = MAP_SPINE_X + 110;
const MAP_LINE_START  = MAP_SPINE_X + 240;
const HEADER_W = 65;
const HEADER_GAP = 18;
const leftEnd = MAP_HEADER_X - HEADER_W / 2 - HEADER_GAP;
const rightStart = MAP_HEADER_X + HEADER_W / 2 + HEADER_GAP;
const SCROLL_PER_ROW   = 385;

// -- GSAP draw-in path ----------------------------------------------------------
function DrawnPath({
  d,
  stroke,
  strokeWidth = 1.2,
  delay = 0,
  dash = false,
  opacity = 1,
  animate = true,
  className,
}) {
  const ref = useRef(null);
  useEffect(() => {
    if (!animate) return;
    const el = ref.current;
    if (!el) return;
    const len = el.getTotalLength();
    gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(el, { strokeDashoffset: 0, duration: 0.7, delay, ease: 'power2.out' });
  }, [d, delay, animate]);
  return (
    <path
      ref={ref}
      className={className}
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeOpacity={opacity}
      strokeDasharray={dash ? '4 6' : undefined}
      strokeLinecap="round"
    />
  );
}

// -- Root node ------------------------------------------------------------------
function RootNode({ x, y, animate = true, className }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!animate) return;
    gsap.fromTo(ref.current,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(1.8)',
        transformOrigin: `${x/2}px ${y/2}px` });
  }, [x, y, animate]);
  const W = 190, H = 40;
  
}

// -- Branch column header -------------------------------------------------------
function BranchHeader({ b, i, x, y, open, active, onToggle, onHover, onBlur }) {
  const ref = useRef(null);
  const [hov, setHov] = useState(false);

  useEffect(() => {
    gsap.fromTo(ref.current,
      { y: -12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, delay: 0.35 + i * 0.055, ease: 'back.out(1.4)' });
  }, []);

  const W = 96, H = 32;

  const isHot = hov || active;

  return (
    <g ref={ref} onClick={onToggle}
      onMouseEnter={() => {
        setHov(true);
        if (onHover) onHover(b.id);
      }}
      onMouseLeave={() => {
        setHov(false);
        if (onBlur) onBlur();
      }}
      className="cursor-pointer">
      {/* glow */}
      <rect x={x - W/2 - 4} y={y - 4} width={W+8} height={H+8} rx={H/2+4}
        fill={b.color} opacity={isHot ? 0.24 : open ? 0.12 : 0}
        style={{ filter: 'blur(6px)', transition: 'opacity 0.2s' }} />
      <rect x={x - W/2} y={y} width={W} height={H} rx={H/2}
        fill={`${b.color}${open ? '2a' : '15'}`}
        stroke={b.color}
        strokeWidth={isHot ? 2 : 1.2}
        style={{ transition: 'stroke-width 0.15s' }} />
      <text x={x} y={y + H/2 + 4.5} textAnchor="middle"
        fill={b.color} fontSize={9} fontWeight="700" letterSpacing="0.08em"
        fontFamily="'Segoe UI',sans-serif" style={{ userSelect: 'none' }}>
        {b.label.toUpperCase()}
      </text>
    </g>
  );
}

// -- Sub-node chip --------------------------------------------------------------
function SubChip({ label, color, x, y, idx, active, dim, className }) {
  const W = 104, H = 25;
  const opacity = dim ? 0.25 : 1;
  const scale = active ? 1.05 : 1;
  const fill = active ? `${color}22` : `${color}15`;
  const stroke = active ? `${color}28` : `${color}45`;
  const textColor = active ? color : `${color}e0`;
  return (
    <motion.g
      className={className}
      initial={{ opacity: 0, y: -10, scale: 0.8 }}
      animate={{ opacity, y: 0, scale }}
      exit={{ opacity: 0, scale: 0.75 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28, delay: idx * 0.045 }}
      style={{ transformOrigin: `${x}px ${y + H/2}px` }}>
      <rect x={x - W/2} y={y} width={W} height={H} rx={6}
        fill={fill} stroke={stroke} strokeWidth={active ? 1.4 : 1}
        style={{ filter: active ? `drop-shadow(0 0 10px ${color}55)` : 'none' }} />
      <text x={x} y={y + H/2 + 4} textAnchor="middle"
        fill={textColor} fontSize={9} fontWeight="600" letterSpacing="0.04em"
        fontFamily="'Segoe UI',sans-serif" style={{ userSelect: 'none' }}>
        {label.length > 18 ? label.slice(0, 12) + '...' : label}
      </text>
    </motion.g>
  );
}

function NodeDot({ x, y, color, active, dim, idx, className }) {
  const opacity = dim ? 0.18 : active ? 0.95 : 0.6;
  const r = active ? 3.8 : 3;
  return (
    <motion.circle
      className={className}
      cx={x}
      cy={y}
      r={r}
      fill={color}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity, scale: active ? [1, 1.5, 1] : 1 }}
      transition={{ duration: active ? 1.6 : 0.4, repeat: active ? Infinity : 0, delay: idx * 0.02 }}
      style={{ filter: active ? `drop-shadow(0 0 8px ${color}99)` : 'none' }}
    />
  );
}

function LeaderLine({ x1, y1, x2, y2, color, active, dim }) {
  const opacity = dim ? 0.12 : active ? 0.65 : 0.35;
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeOpacity={opacity}
      strokeWidth={active ? 1.4 : 1}
      strokeLinecap="round"
    />
  );
}

// -- The tree SVG ---------------------------------------------------------------
function TreeDiagram({
  expanded,
  toggleBranch,
  activeId,
  onBranchHover,
  onBranchBlur,
  visibleRows,
  visibleNodes,
  scrollProgress,
}) {
  const maxNodes = Math.max(...BRANCHES.map(b => b.nodes.length));
  const mapWidth = Math.max(
    MAP_MIN_W,
    MAP_LINE_START + (maxNodes - 1) * MAP_NODE_GAP + MAP_PADDING
  );
  const mapHeight = MAP_TOP_Y + (N - 1) * MAP_ROW_GAP + 220;
  const root = { x: MAP_SPINE_X, y: MAP_ROOT_Y };
  const spineTop = root.y + 36;
  const spineBottom = MAP_TOP_Y + (N - 1) * MAP_ROW_GAP;
  const anyActive = Boolean(activeId);

  const rows = BRANCHES.map((b, i) => {
    const rowY = MAP_TOP_Y + i * MAP_ROW_GAP;
    const isOpen = expanded.has(b.id);
    const lineEnd = MAP_LINE_START + (isOpen ? (b.nodes.length - 1) * MAP_NODE_GAP : 60);
    const nodes = b.nodes.map((label, j) => {
      const nodeX = MAP_LINE_START + j * MAP_NODE_GAP;
      const nodeY = rowY;
      const offset = j % 2 === 0 ? -30 : 18;
      return {
        label,
        station: { x: nodeX, y: nodeY },
        leader: { x: nodeX, y: nodeY + offset },
        chip: { x: nodeX, y: nodeY + offset - 14 },
      };
    });
    return { b, i, rowY, isOpen, lineEnd, nodes };
  });

  return (
    <svg width={mapWidth} height={mapHeight} viewBox={`0 0 ${mapWidth} ${mapHeight}`}
      className="block" style={{ minWidth: mapWidth }}>

      <defs>
        <pattern id="atlas-grid" width="26" height="26" patternUnits="userSpaceOnUse">
          <path d="M 26 0 L 0 0 0 26" fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="1" />
        </pattern>
        <radialGradient id="atlas-glow" cx="50%" cy="0%" r="70%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.18" />
          <stop offset="65%" stopColor="#0b1220" stopOpacity="0" />
          <stop offset="100%" stopColor="#0b1220" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width={mapWidth} height={mapHeight} fill="url(#atlas-glow)" />
      <rect x="0" y="0" width={mapWidth} height={mapHeight} fill="url(#atlas-grid)" opacity="0.35" />

      <DrawnPath
        d={`M${MAP_SPINE_X} ${spineTop} L${MAP_SPINE_X} ${spineBottom}`}
        stroke="rgba(226,232,240,0.35)" strokeWidth={1.4} delay={0.05} opacity={0.7}
        animate={false}
        className="diagram-spine" />

      {rows.map(({ b, rowY , i }) => {
        const unlocked = i < visibleRows;
        const isActive = activeId === b.id;
        const dim = anyActive && !isActive;
        const fill = !unlocked
  ? 'rgba(255,255,255,0.015)'
  : isActive
  ? 'rgba(255,255,255,0.06)'
  : dim
  ? 'rgba(255,255,255,0.02)'
  : 'rgba(255,255,255,0.04)';
  

        return (
          <rect
            key={`row-${b.id}`}
            x={MAP_SPINE_X - 20}
            y={rowY - 46}
            width={mapWidth - MAP_SPINE_X + 20}
            height={92}
            rx={20}
            fill={fill}
          />
        );
      })}

      {rows.map(({ b, i, rowY, lineEnd }) => {
  const isActive = activeId === b.id;
  const dim = anyActive && !isActive;
  const unlocked = i < visibleRows;

  const opacity = !unlocked
    ? 0.18
    : dim
    ? 0.12
    : isActive
    ? 0.8
    : 0.5;
        return (
          <g key={`line-${b.id}`}>
            <line
    x1={MAP_SPINE_X}
    y1={rowY}
    x2={leftEnd}
    y2={rowY}
    stroke={b.color}
    strokeOpacity={opacity}
    strokeWidth={1.4}
    strokeLinecap="round"
  />
            <DrawnPath
              d={`M${MAP_LINE_START} ${rowY} L${lineEnd} ${rowY}`}
              stroke={b.color}
              strokeWidth={isActive ? 2 : 1.4}
              delay={0.2 + i * 0.05}
              opacity={opacity}
            />

            <line
    x1={rightStart}
    y1={rowY}
    x2={MAP_LINE_START - 18}
    y2={rowY}
    stroke={b.color}
    strokeOpacity={opacity}
    strokeWidth={1.4}
    strokeLinecap="round"
  />
            
            <circle cx={MAP_SPINE_X} cy={rowY} r={3.5} fill="rgba(226,232,240,0.8)" />
          </g>
        );
      })}

      <AnimatePresence>
        {rows.map(({ b, isOpen, nodes }) => {
          const isActive = activeId === b.id;
          const dim = anyActive && !isActive;
          if (!isOpen) return null;
          return nodes.slice(0, visibleNodes[b.id] || 0).map((node, j) => (
            <LeaderLine
              key={`lead-${b.id}-${j}`}
              x1={node.station.x}
              y1={node.station.y}
              x2={node.leader.x}
              y2={node.leader.y}
              color={b.color}
              active={isActive}
              dim={dim}
            />
          ));
        })}
      </AnimatePresence>

      <AnimatePresence>
        {rows.map(({ b, isOpen, nodes }) => {
          const isActive = activeId === b.id;
          const dim = anyActive && !isActive;
          if (!isOpen) return null;
         return nodes.slice(0, visibleNodes[b.id] || 0).map((node, j) => (
            <NodeDot key={`nd-${b.id}-${j}`}
              x={node.station.x}
              y={node.station.y}
              color={b.color}
              active={isActive}
              dim={dim}
              idx={j} />
          ));
        })}
      </AnimatePresence>

      <AnimatePresence>
        {rows.map(({ b, isOpen, nodes }) => {
          const isActive = activeId === b.id;
          const dim = anyActive && !isActive;
          if (!isOpen) return null;
         return nodes.slice(0, visibleNodes[b.id] || 0).map((node, j) => ( 
            <SubChip key={`sc-${b.id}-${j}`}
              label={node.label}
              color={b.color}
              x={node.chip.x}
              y={node.chip.y}
              idx={j}
              active={isActive}
              dim={dim} />
          ));
        })}
      </AnimatePresence>

      {rows.map(({ b, i, rowY }) => (
        <BranchHeader key={b.id} b={b} i={i}
          x={MAP_HEADER_X}
          y={rowY - 16}
          open={expanded.has(b.id)}
          active={activeId === b.id}
          onToggle={() => toggleBranch(b.id)}
          onHover={onBranchHover}
          onBlur={onBranchBlur} />
      ))}

      <RootNode x={root.x} y={root.y} />
    </svg>
  );
}

// -- Page ----------------------------------------------------------------------
export default function About() {
  const [expanded, setExpanded] = useState(() => new Set(BRANCHES.map(b => b.id)));
  const [activeBranch, setActiveBranch] = useState(null);
  const diagramWrapRef = useRef(null);


  const toggleBranch = useCallback(id => {
    setExpanded(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  const handleBranchHover = useCallback(id => {
    setActiveBranch(id);
  }, []);

  const clearBranchHover = useCallback(() => {
    setActiveBranch(null);
  }, []);

  const [scrollProgress, setScrollProgress] = useState(0);
const [visibleRows, setVisibleRows] = useState(1);
const [visibleNodes, setVisibleNodes] = useState({});

  useLayoutEffect(() => {
  if (!diagramWrapRef.current) return;

  const totalRows = BRANCHES.length;

  const ctx = gsap.context(() => {
    ScrollTrigger.create({
      trigger: diagramWrapRef.current,
      start: 'top center',
      end: `+=${totalRows * 450}`,
      scrub: 1,
      
      anticipatePin: 1,
      invalidateOnRefresh: true,

      onUpdate: (self) => {
        const raw = self.progress;
const p = Math.min(raw / 0.70, 1);
        setScrollProgress(p);

        const unlockedRows = Math.min(
          totalRows,
          Math.floor(p * totalRows) + 1
        );
        setVisibleRows(unlockedRows);

        const activeIndex = Math.min(
          Math.floor(p * totalRows),
          totalRows - 1
        );
        setActiveBranch(BRANCHES[activeIndex]?.id || null);

        const nextVisibleNodes = {};

        BRANCHES.forEach((branch, i) => {
          if (i < unlockedRows) {
            const rowStart = i / totalRows;
            const rowEnd = (i + 1) / totalRows;

            const localProgress = Math.min(
              Math.max((p - rowStart) / (rowEnd - rowStart), 0.2),
              1
            );

            nextVisibleNodes[branch.id] = Math.ceil(
              localProgress * branch.nodes.length
            );
          } else {
            nextVisibleNodes[branch.id] = 0;
          }
        });

        setVisibleNodes(nextVisibleNodes);
      },
    });

    ScrollTrigger.refresh();
  });

  return () => ctx.revert();
}, []);

  const expandAll   = () => setExpanded(new Set(BRANCHES.map(b => b.id)));
  const collapseAll = () => setExpanded(new Set());

  const TOPIC_COUNT = BRANCHES.reduce((s, b) => s + b.nodes.length, 0);
  const stats = [
    { v: N, l: 'Branches' },
    { v: TOPIC_COUNT, l: 'Topics' },
    { v: PILLARS.length, l: 'Pillars' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden text-white">

      {/* Background */}
      <div className="absolute inset-0 -z-10 ">
        <div className="absolute top-20 left-10 w-72 h-72 bg-fuchsia-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/20 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 w-[28rem] h-[28rem] bg-white/5 blur-[180px] rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:42px_42px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-16">

        {/* -- Hero -- */}
        <motion.div
          className="mb-12 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]"
          variants={STAGGER}
          initial="hidden"
          animate="show">
          <motion.div variants={FADE_UP} className="space-y-6">
            <p className="text-[10px] uppercase tracking-[0.5em] text-cyan-300/60">Neonlens Studio</p>
            <h1 className="text-[clamp(2.4rem,6vw,3.9rem)] font-black leading-[1.02] tracking-[-0.04em] text-white">
              About{' '}
              <span className=" text-[clamp(2.9rem,7vw,4.6rem)] leading-none text-transparent [-webkit-text-stroke:1.6px_rgba(226,232,240,0.75)]">
                Neonlens
              </span>
            </h1>
            <p className="max-w-xl text-[14px] leading-7 text-slate-300">
              Neonlens is a studio and community for creators who choreograph light,
              movement, and meaning. We turn craft into repeatable habits and
              help photographers build a visual language that feels unmistakably theirs.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="use-font px-8 py-3 text-[11px] uppercase tracking-[0.25em] text-white border-2 border-white font-semibold hover:-translate-y-1 hover:shadow-[6px_6px_0_white] hover:scale-[1.02] transition">
                Explore the community
              </button>
              <button
                type="button"
                className="use-font px-8 py-3 rounded-xl border border-white/20 text-[11px] uppercase tracking-[0.25em] text-slate-200 hover:bg-white/10 transition">
                Our manifesto
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-400">
              {['Founded 2023', '200+ creators', 'Global community'].map(item => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div variants={FADE_UP} className="grid gap-4">
            <div className="grid grid-cols-3 gap-3">
              {stats.map(({ v, l }) => (
                <div
                  key={l}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                  <p className="text-[22px] font-black text-white">{v}</p>
                  <p className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-slate-400">{l}</p>
                </div>
              ))}
            </div>
            <div
              className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Studio note</p>
              <p className="mt-3 text-[13px] leading-7 text-slate-300">
                We coach creators to see repetition as mastery. The same street
                can tell a new story when you change light, timing, and point of view.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-cyan-300/70">
                <span className="h-2 w-2 rounded-full bg-cyan-400/80" />
                Community first
              </div>
            </div>
            <motion.div
              className="flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-slate-400"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}>
              <span className="h-[2px] w-10 rounded-full bg-slate-500/70" />
              Scroll for the craft map
            </motion.div>
          </motion.div>
        </motion.div>

        {/* -- Pillars -- */}
        <motion.div
          className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          variants={STAGGER}
          initial="hidden"
          animate="show">
          {PILLARS.map(({ icon, label, desc, tone }) => (
            <motion.div
              key={label}
              variants={FADE_UP}
              className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center gap-3">
                <span className="text-lg" style={{ color: tone }}>{icon}</span>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-200">{label}</p>
              </div>
              <p className="mt-3 text-[12px] leading-[1.7] text-slate-300">{desc}</p>
              <div className="mt-4 h-[3px] w-12 rounded-full" style={{ background: `linear-gradient(90deg, ${tone}, transparent)` }} />
            </motion.div>
          ))}
        </motion.div>

        {/* -- Process -- */}
        <motion.div
          className="mb-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"
          variants={STAGGER}
          initial="hidden"
          animate="show">
          <motion.div variants={FADE_UP}>
            <p className="text-[10px] uppercase tracking-[0.38em] text-slate-400">Studio process</p>
            <h2 className="mt-2 text-[clamp(1.3rem,3vw,2rem)] font-bold tracking-tight text-white">
              From first light to final tone
            </h2>
            <p className="mt-3 text-[13px] leading-7 text-slate-300">
              Our workflow keeps the intent clear. We teach creators to slow
              down, read the scene, and make every click say something.
            </p>
          </motion.div>
          <div className="grid gap-3 sm:grid-cols-2">
            {PROCESS_STEPS.map(({ step, label, desc }) => (
              <motion.div
                key={step}
                variants={FADE_UP}
                className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[9px] uppercase tracking-[0.35em] text-slate-400">Step {step}</p>
                <p className="mt-2 text-[13px] font-semibold text-white">{label}</p>
                <p className="mt-2 text-[12px] leading-6 text-slate-400">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* -- Tree Diagram -- */}
        <div
  ref={diagramWrapRef}
  className="relative"
  style={{ height: `${BRANCHES.length * SCROLL_PER_ROW - 460}px` }}
>
    <div className=" top-0 h-screen flex items-start">
          <motion.div
            
            className="w-full rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55 }}>

          {/* header */}
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.38em] text-slate-400">Hierarchy tree</p>
              <h2 className="mt-1 text-[clamp(1.1rem,2.5vw,1.5rem)] font-bold tracking-tight text-white">
                Aspects of great photography
              </h2>
              <p className="mt-1 text-[12px] text-slate-300">
                Click any branch to expand its topics below it.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[['Expand all', expandAll], ['Collapse all', collapseAll]].map(([l, fn]) => (
                <motion.button
                  key={l}
                  onClick={fn}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="cursor-pointer rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300 hover:border-white/30 hover:text-white">
                  {l}
                </motion.button>
              ))}
              <span
                className="rounded-full border border-white/10 px-3 py-1 text-[9.5px] tracking-[0.14em] text-slate-400">
                {N} branches
              </span>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-3">
  <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
    <motion.div
      className="h-full rounded-full bg-cyan-400"
      style={{ width: `${scrollProgress * 100}%` }}
    />
  </div>
  <span className="text-[10px] font-bold tracking-[0.2em] text-cyan-300">
    {Math.round(scrollProgress * 100)}%
  </span>
</div>

          {/* branch legend/quick-toggle */}
          <div className="mb-5 flex flex-wrap gap-1.5">
            {BRANCHES.map(b => (
              <motion.button
                key={b.id}
                onClick={() => toggleBranch(b.id)}
                onMouseEnter={() => handleBranchHover(b.id)}
                onMouseLeave={clearBranchHover}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] transition-all duration-150"
                style={{
                  borderColor: expanded.has(b.id) ? `${b.color}55` : 'rgba(255,255,255,0.12)',
                  background: expanded.has(b.id) ? `${b.color}18` : 'rgba(255,255,255,0.04)',
                  color: expanded.has(b.id) ? b.color : '#cbd5f5',
                }}>
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: expanded.has(b.id) ? b.color : '#94a3b8' }} />
                {b.label}
              </motion.button>
            ))}
          </div>

          {/* diagram */}
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/30">
            <motion.div layout transition={{ type: 'spring', stiffness: 220, damping: 28 }}>
              <TreeDiagram
                expanded={expanded}
  toggleBranch={toggleBranch}
  activeId={activeBranch}
  onBranchHover={handleBranchHover}
  onBranchBlur={clearBranchHover}
  visibleRows={visibleRows}
  visibleNodes={visibleNodes}
  scrollProgress={scrollProgress}
              />
            </motion.div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {['Hierarchy tree', `${TOPIC_COUNT} topics`, 'Click branch to expand'].map(t => (
              <span
                key={t}
                className="rounded-full border border-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.16em] text-slate-400">
                {t}
              </span>
            ))}
            <span className="rounded-full border border-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.16em] text-cyan-300/70">
              Scroll to progress
            </span>
          </div>
          </motion.div>
          </div>
        </div>
        {/* -- Field Notes -- */}
        <motion.div
          className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}>
          <p className="mb-4 text-[10px] uppercase tracking-[0.38em] text-slate-400">Field notes</p>
          <div className="grid gap-3 md:grid-cols-3">
            {FIELD_FRAMES.map(f => (
              <div
                key={f.n}
                className="group flex min-h-[110px] flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-200 hover:-translate-y-1">
                <span className="text-[9px] uppercase tracking-[0.3em] text-slate-400">
                  Frame {f.n}
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-white">{f.title}</p>
                  <p className="mt-1 text-[12px] text-slate-400">{f.note}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
