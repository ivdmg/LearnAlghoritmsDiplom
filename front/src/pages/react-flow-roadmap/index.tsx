import {
  useState, useCallback, useRef, useMemo, useLayoutEffect, useEffect,
  useSyncExternalStore,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Handle,
  Position,
  useStore,
  getBezierPath,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type EdgeProps,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Layout, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { ThemeToggle } from '@/widgets/theme-toggle/ui/theme-toggle';
import { ROADMAP } from '@/shared/config/roadmap-data';
import styles from './react-flow-roadmap.module.css';

/* ── colour palette per topic ── */

const TOPIC_COLORS: Record<string, string> = {
  osnovy: '#10b981',
  rekursiya: '#3b82f6',
  sortirovki: '#6366f1',
  poisk: '#8b5cf6',
  derevya: '#a855f7',
  grafy: '#ec4899',
  dp: '#f43f5e',
  struktury: '#f97316',
  prodvinutye: '#ef4444',
};

/* ── layout constants ── */

interface TopicLayout {
  id: string;
  x: number;
  y: number;
  subtopicSide: 'left' | 'right';
}

const ROW_GAP = 500;
const SUBTOPIC_OFFSET_RIGHT = 400;
const SUBTOPIC_OFFSET_LEFT = -420;
const SUBTOPIC_SPACING_Y = 58;
const VIEWPORT_PAD_TOP = 30;

const LAYOUT: TopicLayout[] = [
  { id: 'osnovy',      x: 0,    y: ROW_GAP * 0, subtopicSide: 'right' },
  { id: 'rekursiya',   x: 0,    y: ROW_GAP * 1, subtopicSide: 'left'  },
  { id: 'sortirovki',  x: -300, y: ROW_GAP * 2, subtopicSide: 'left'  },
  { id: 'poisk',       x: 300,  y: ROW_GAP * 2, subtopicSide: 'right' },
  { id: 'derevya',     x: 0,    y: ROW_GAP * 3, subtopicSide: 'right' },
  { id: 'grafy',       x: -300, y: ROW_GAP * 4, subtopicSide: 'left'  },
  { id: 'struktury',   x: 300,  y: ROW_GAP * 4, subtopicSide: 'right' },
  { id: 'dp',          x: 0,    y: ROW_GAP * 5, subtopicSide: 'left'  },
  { id: 'prodvinutye', x: 0,    y: ROW_GAP * 6, subtopicSide: 'right' },
];

const MAIN_CONNECTIONS: [string, string][] = [
  ['osnovy', 'rekursiya'],
  ['rekursiya', 'sortirovki'],
  ['rekursiya', 'poisk'],
  ['sortirovki', 'derevya'],
  ['poisk', 'derevya'],
  ['derevya', 'grafy'],
  ['derevya', 'struktury'],
  ['grafy', 'dp'],
  ['struktury', 'dp'],
  ['dp', 'prodvinutye'],
];

/* ── graph Y‑bounds (static, from layout data) ── */

let _gMinY = Infinity;
let _gMaxY = -Infinity;
for (const layout of LAYOUT) {
  const topic = ROADMAP.find((t) => t.id === layout.id);
  if (!topic) continue;
  _gMinY = Math.min(_gMinY, layout.y);
  _gMaxY = Math.max(_gMaxY, layout.y + 50);
  const count = topic.subtopics.length;
  if (count > 0) {
    const totalH = (count - 1) * SUBTOPIC_SPACING_Y;
    const startY = layout.y - totalH / 2;
    _gMinY = Math.min(_gMinY, startY);
    _gMaxY = Math.max(_gMaxY, startY + totalH + 40);
  }
}
const GRAPH_MIN_Y = _gMinY;
const GRAPH_MAX_Y = _gMaxY;

/* ── fuse (burning-line) configuration ── */

const FUSE_LEVELS: string[][] = [
  ['osnovy-rekursiya'],
  ['rekursiya-sortirovki', 'rekursiya-poisk'],
  ['sortirovki-derevya', 'poisk-derevya'],
  ['derevya-grafy', 'derevya-struktury'],
  ['grafy-dp', 'struktury-dp'],
  ['dp-prodvinutye'],
];

function fuseRange(edgeKey: string): [number, number] {
  const total = FUSE_LEVELS.length;
  const idx = FUSE_LEVELS.findIndex((lvl) => lvl.includes(edgeKey));
  if (idx === -1) return [0, 1];
  return [idx / total, (idx + 1) / total];
}

// progress threshold at which each topic is considered "reached" by the fuse
const TOPIC_REACHED_AT: Record<string, number> = { osnovy: 0 };
for (const [src, tgt] of MAIN_CONNECTIONS) {
  const [, pEnd] = fuseRange(`${src}-${tgt}`);
  if (!(tgt in TOPIC_REACHED_AT) || pEnd > TOPIC_REACHED_AT[tgt]) {
    TOPIC_REACHED_AT[tgt] = pEnd;
  }
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/* ── raw progress from viewport (used internally and by smooth driver) ── */

function useRawProgress() {
  const transform = useStore((s) => s.transform);
  const containerH = useStore((s) => s.height);
  const [, ty, zoom] = transform;
  const yTop = -GRAPH_MIN_Y * zoom + VIEWPORT_PAD_TOP;
  const yBottom = -GRAPH_MAX_Y * zoom + containerH;
  const range = yTop - yBottom;
  return range > 0 ? clamp((yTop - ty) / range, 0, 1) : 0;
}

/*
 * Сглаживание прогресса через requestAnimationFrame.
 * useRawProgress() даёт значение, привязанное к viewport (обновляется на каждый wheel → рвано).
 * RAF-цикл каждые ~16ms приближает _smoothProgress к _targetProgress (lerp).
 * useSmoothProgress() подписывает компоненты на _smoothProgress — edgeProgress обновляется плавно.
 */
let _smoothProgress = 0;
let _targetProgress = 0;
let _rafId = 0;
const _smoothSubs = new Set<() => void>();
/** Скорость приближения к цели за кадр (0..1). Чем больше — тем быстрее догоняет скролл. */
const SMOOTH_LERP = 0.12;

function _notifySmooth() {
  for (const fn of _smoothSubs) fn();
}

function _smoothTick() {
  const d = _targetProgress - _smoothProgress;
  if (Math.abs(d) < 0.0005) {
    _smoothProgress = _targetProgress;
    _rafId = 0;
    _notifySmooth();
    return;
  }
  _smoothProgress += d * SMOOTH_LERP;
  _notifySmooth();
  _rafId = requestAnimationFrame(_smoothTick);
}

function _setSmoothTarget(v: number) {
  _targetProgress = v;
  if (!_rafId) _rafId = requestAnimationFrame(_smoothTick);
}

/**
 * Возвращает сглаженный прогресс скролла (0..1).
 * Сырой прогресс из viewport обновляется рывками на каждом wheel;
 * здесь он интерполируется в RAF (60 fps), поэтому линии фитиля движутся плавно.
 */
function useSmoothProgress(): number {
  return useSyncExternalStore(
    (cb) => { _smoothSubs.add(cb); return () => { _smoothSubs.delete(cb); }; },
    () => _smoothProgress,
    () => _smoothProgress,
  );
}

/** Внутри React Flow подписывается на viewport и передаёт сырой прогресс в RAF-сглаживание. */
function SmoothProgressDriver() {
  const raw = useRawProgress();
  useLayoutEffect(() => { _setSmoothTarget(raw); }, [raw]);
  useEffect(() => () => { if (_rafId) cancelAnimationFrame(_rafId); _rafId = 0; }, []);
  return null;
}

/* ── custom node components ── */

function TopicNode({ data }: { data: Record<string, unknown> }) {
  const color = data.color as string;
  return (
    <div className={styles.topicNode} style={{ background: color }}>
      <Handle type="target" position={Position.Top} id="top" className={styles.handle} />
      <span>{data.label as string}</span>
      <Handle type="source" position={Position.Bottom} id="bottom" className={styles.handle} />
      <Handle type="source" position={Position.Right} id="right" className={styles.handle} />
      <Handle type="source" position={Position.Left} id="left" className={styles.handle} />
    </div>
  );
}

function SubtopicNode({ data }: { data: Record<string, unknown> }) {
  const color = data.color as string;
  const side = data.side as 'left' | 'right';
  return (
    <div className={styles.subtopicNode} style={{ borderColor: color }}>
      <Handle
        type="target"
        position={side === 'right' ? Position.Left : Position.Right}
        className={styles.handle}
      />
      <span>{data.label as string}</span>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  topicNode: TopicNode,
  subtopicNode: SubtopicNode,
};

/* ── custom edge: main fuse (scroll-driven, smoothed via CSS transition) ── */

function FuseEdge({
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
  });

  const pStart = (data?.progressStart as number) ?? 0;
  const pEnd = (data?.progressEnd as number) ?? 1;

  // Сглаженный прогресс (RAF) — линия и кончик фитиля движутся плавно, без рывков от wheel
  const gp = useSmoothProgress();
  const edgeProgress = clamp((gp - pStart) / (pEnd - pStart), 0, 1);

  const bgRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(0);
  useLayoutEffect(() => {
    if (bgRef.current) setLen(bgRef.current.getTotalLength());
  }, [edgePath]);

  const offset = len > 0 ? len * (1 - edgeProgress) : 0;

  let tipX = sourceX;
  let tipY = sourceY;
  if (len > 0 && edgeProgress > 0 && bgRef.current) {
    const pt = bgRef.current.getPointAtLength(len * Math.min(edgeProgress, 0.999));
    tipX = pt.x;
    tipY = pt.y;
  }
  const showTip = len > 0 && edgeProgress > 0 && edgeProgress < 1;

  const T = '0.18s ease-out';

  return (
    <g>
      <path
        ref={bgRef}
        d={edgePath}
        stroke="#475569"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />

      {len > 0 && edgeProgress > 0 && (
        <>
          <path
            d={edgePath}
            fill="none"
            style={{
              stroke: 'rgba(249,115,22,0.25)',
              strokeWidth: 14,
              strokeLinecap: 'round',
              strokeDasharray: len,
              strokeDashoffset: offset,
              transition: `stroke-dashoffset ${T}`,
            }}
          />
          <path
            d={edgePath}
            fill="none"
            style={{
              stroke: '#f97316',
              strokeWidth: 3.5,
              strokeLinecap: 'round',
              strokeDasharray: len,
              strokeDashoffset: offset,
              transition: `stroke-dashoffset ${T}`,
            }}
          />
        </>
      )}

      <g
        style={{
          transform: `translate(${tipX}px, ${tipY}px)`,
          opacity: showTip ? 1 : 0,
          transition: `transform ${T}, opacity 0.1s ease-out`,
        }}
      >
        <circle r={8} fill="rgba(249,115,22,0.25)" />
        <circle r={4} fill="#fff" />
      </g>
    </g>
  );
}

/* ── custom edge: subtopic fuse (auto-animates when topic is reached) ── */

function SubtopicFuseEdge({
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
  });

  const reachedAt = (data?.reachedAt as number) ?? 0;
  const stagger = (data?.stagger as number) ?? 0;
  const color = (data?.color as string) ?? '#94a3b8';

  // Сглаженный прогресс — порог reached срабатывает плавно, линия к подтеме не дёргается
  const gp = useSmoothProgress();
  const reached = gp >= reachedAt;

  const bgRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(0);
  useLayoutEffect(() => {
    if (bgRef.current) setLen(bgRef.current.getTotalLength());
  }, [edgePath]);

  const offset = reached ? 0 : len;
  const dur = reached ? 0.55 : 0.3;
  const delay = reached ? stagger : 0;

  return (
    <g>
      <path
        ref={bgRef}
        d={edgePath}
        fill="none"
        style={{ stroke: color, strokeWidth: 1.5, opacity: 0.18, strokeLinecap: 'round' }}
      />

      {len > 0 && (
        <>
          <path
            d={edgePath}
            fill="none"
            style={{
              stroke: color,
              strokeWidth: 6,
              opacity: reached ? 0.12 : 0,
              strokeLinecap: 'round',
              transition: `opacity ${dur}s ease-in-out ${delay}s`,
            }}
          />
          <path
            d={edgePath}
            fill="none"
            style={{
              stroke: color,
              strokeWidth: 2,
              strokeLinecap: 'round',
              strokeDasharray: len,
              strokeDashoffset: offset,
              transition: `stroke-dashoffset ${dur}s ease-in-out ${delay}s`,
            }}
          />
        </>
      )}
    </g>
  );
}

const edgeTypes: EdgeTypes = {
  fuseEdge: FuseEdge,
  subtopicFuseEdge: SubtopicFuseEdge,
};

/* ── graph builder ── */

function buildGraph(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  for (const layout of LAYOUT) {
    const topic = ROADMAP.find((t) => t.id === layout.id);
    if (!topic) continue;

    const color = TOPIC_COLORS[topic.id] ?? '#64748b';
    const reachedAt = TOPIC_REACHED_AT[topic.id] ?? 0;

    nodes.push({
      id: topic.id,
      type: 'topicNode',
      position: { x: layout.x, y: layout.y },
      data: { label: topic.title, color },
    });

    const count = topic.subtopics.length;
    const totalH = (count - 1) * SUBTOPIC_SPACING_Y;
    const startY = layout.y - totalH / 2;
    const isRight = layout.subtopicSide === 'right';
    const subtopicX = layout.x + (isRight ? SUBTOPIC_OFFSET_RIGHT : SUBTOPIC_OFFSET_LEFT);

    topic.subtopics.forEach((sub, i) => {
      nodes.push({
        id: sub.id,
        type: 'subtopicNode',
        position: { x: subtopicX, y: startY + i * SUBTOPIC_SPACING_Y },
        data: { label: sub.title, color, side: layout.subtopicSide },
      });

      edges.push({
        id: `e-${topic.id}-${sub.id}`,
        source: topic.id,
        target: sub.id,
        sourceHandle: isRight ? 'right' : 'left',
        type: 'subtopicFuseEdge',
        data: { reachedAt, stagger: i * 0.08, color },
      });
    });
  }

  for (const [src, tgt] of MAIN_CONNECTIONS) {
    const key = `${src}-${tgt}`;
    const [pStart, pEnd] = fuseRange(key);

    edges.push({
      id: `e-main-${key}`,
      source: src,
      target: tgt,
      sourceHandle: 'bottom',
      targetHandle: 'top',
      type: 'fuseEdge',
      data: { progressStart: pStart, progressEnd: pEnd },
    });
  }

  return { nodes, edges };
}

/* ── page component ── */

/** Регулирует скорость скролла: множитель для deltaY. Чем меньше (0.3–0.5) — тем медленнее и мягче. */
const SCROLL_SPEED = 0.4;
/** Регулирует плавность анимации: коэффициент интерполяции currentY → targetY (0.1–0.15). Чем меньше — плавнее и инерционнее. */
const SMOOTH_FACTOR = 0.12;

export function ReactFlowRoadmapPage() {
  const navigate = useNavigate();
  const { nodes, edges } = useMemo(buildGraph, []);
  const [ready, setReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ссылка на инстанс React Flow для вызова setViewport из RAF-цикла
  const flowInstanceRef = useRef<ReactFlowInstance | null>(null);
  // Фиксированные x и zoom (задаются в onInit), скролл меняет только y
  const viewportXRef = useRef(0);
  const zoomRef = useRef(1);
  // Целевая и текущая позиция канваса по Y (viewport coordinates). Скролл плавно интерполирует currentY к targetY.
  const targetYRef = useRef(0);
  const currentYRef = useRef(0);
  // Границы viewport Y (чтобы не уехать за границы графа)
  const minViewportYRef = useRef(0);
  const maxViewportYRef = useRef(0);

  const graphExtent = useMemo(
    (): [[number, number], [number, number]] => [
      [-Infinity, GRAPH_MIN_Y - 20],
      [Infinity, GRAPH_MAX_Y + 20],
    ],
    [],
  );

  const onInit = useCallback((instance: ReactFlowInstance) => {
    flowInstanceRef.current = instance;
    let attempts = 0;
    const adjust = () => {
      const allNodes = instance.getNodes();
      const container = containerRef.current;
      if (!allNodes.length || !container) return;

      if (!allNodes.some((n) => n.measured?.width) && attempts < 10) {
        attempts++;
        setTimeout(adjust, 50);
        return;
      }

      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity;
      for (const n of allNodes) {
        const w = n.measured?.width ?? (n.type === 'topicNode' ? 250 : 400);
        minX = Math.min(minX, n.position.x);
        maxX = Math.max(maxX, n.position.x + w);
        minY = Math.min(minY, n.position.y);
      }

      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const padX = 20;
      const graphWidth = maxX - minX;
      const zoom = (cw - padX * 2) / graphWidth;
      const graphCenterX = (minX + maxX) / 2;
      const initialX = cw / 2 - graphCenterX * zoom;
      const initialY = -minY * zoom + VIEWPORT_PAD_TOP;

      viewportXRef.current = initialX;
      zoomRef.current = zoom;
      currentYRef.current = initialY;
      targetYRef.current = initialY;
      // Верхняя граница: верх графа у верхнего края контейнера. Нижняя: низ графа у нижнего края.
      maxViewportYRef.current = -GRAPH_MIN_Y * zoom + VIEWPORT_PAD_TOP;
      minViewportYRef.current = ch - GRAPH_MAX_Y * zoom;

      instance.setViewport({ x: initialX, y: initialY, zoom });
      setReady(true);
    };

    setTimeout(adjust, 50);
  }, []);

  // Глобальный wheel на контейнере: обновляем targetY, блокируем стандартный скролл. Минус перед deltaY исправляет инверсию (колёсико вниз — контент вниз). SCROLL_SPEED замедляет скролл.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !ready) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const minY = minViewportYRef.current;
      const maxY = maxViewportYRef.current;
      targetYRef.current = clamp(targetYRef.current - e.deltaY * SCROLL_SPEED, minY, maxY);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [ready]);

  // RAF-цикл: плавно интерполируем currentY к targetY (SMOOTH_FACTOR задаёт плавность/инерцию) и обновляем viewport. edgeProgress в FuseEdge/SubtopicFuseEdge остаётся синхронизированным через useSmoothProgress.
  useEffect(() => {
    let rafId = 0;
    const animate = () => {
      const instance = flowInstanceRef.current;
      const minY = minViewportYRef.current;
      const maxY = maxViewportYRef.current;
      if (!instance) {
        rafId = requestAnimationFrame(animate);
        return;
      }
      const targetY = clamp(targetYRef.current, minY, maxY);
      const currentY = currentYRef.current;
      const diff = targetY - currentY;
      if (Math.abs(diff) > 0.5) {
        currentYRef.current = currentY + diff * SMOOTH_FACTOR;
        currentYRef.current = clamp(currentYRef.current, minY, maxY);
        instance.setViewport({
          x: viewportXRef.current,
          y: currentYRef.current,
          zoom: zoomRef.current,
        });
      }
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [ready]);

  return (
    <Layout className={styles.layout}>
      <Layout.Header className={styles.header}>
        <div className={styles.headerLeft}>
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
            className={styles.backBtn}
          >
            Назад
          </Button>
          <span className={styles.logo}>AlgoLearn — Roadmap</span>
        </div>
        <ThemeToggle />
      </Layout.Header>

      <div className={styles.pageBody}>
        {/* Скролл отключён в React Flow (panOnScroll=false). Прокрутка — через wheel на контейнере и RAF (targetY/currentY). */}
        <div className={styles.flowContainer} ref={containerRef} style={{ opacity: ready ? 1 : 0 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={{ type: 'default' }}
            onInit={onInit}
            translateExtent={graphExtent}
            panOnScroll={false}
            panOnDrag={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            proOptions={{ hideAttribution: true }}
            style={{ background: 'transparent' }}
          >
            <SmoothProgressDriver />
          </ReactFlow>
        </div>
      </div>
    </Layout>
  );
}
