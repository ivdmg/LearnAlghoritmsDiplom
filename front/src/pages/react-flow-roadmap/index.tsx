import { useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Handle,
  Position,
  PanOnScrollMode,
  type Node,
  type Edge,
  type NodeTypes,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Layout, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { ThemeToggle } from '@/widgets/theme-toggle/ui/theme-toggle';
import { ROADMAP } from '@/shared/config/roadmap-data';
import styles from './react-flow-roadmap.module.css';

/* ── colour palette per topic (difficulty gradient) ── */

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

/* ── manual layout ── */

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

/* ── graph builder ── */

function buildGraph(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  for (const layout of LAYOUT) {
    const topic = ROADMAP.find((t) => t.id === layout.id);
    if (!topic) continue;

    const color = TOPIC_COLORS[topic.id] ?? '#64748b';

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
        type: 'default',
        style: { stroke: color, strokeWidth: 1.5, opacity: 0.45 },
      });
    });
  }

  for (const [src, tgt] of MAIN_CONNECTIONS) {
    edges.push({
      id: `e-main-${src}-${tgt}`,
      source: src,
      target: tgt,
      sourceHandle: 'bottom',
      targetHandle: 'top',
      type: 'default',
      style: { stroke: '#64748b', strokeWidth: 2.5 },
    });
  }

  return { nodes, edges };
}

/* ── page component ── */

export function ReactFlowRoadmapPage() {
  const navigate = useNavigate();
  const { nodes, edges } = useMemo(buildGraph, []);
  const [ready, setReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const graphExtent = useMemo((): [[number, number], [number, number]] => {
    let minY = Infinity;
    let maxY = -Infinity;
    for (const n of nodes) {
      minY = Math.min(minY, n.position.y);
      maxY = Math.max(maxY, n.position.y + 50);
    }
    const pad = 20;
    return [[-Infinity, minY - pad], [Infinity, maxY + pad]];
  }, [nodes]);

  const onInit = useCallback((instance: ReactFlowInstance) => {
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
      const padX = 20;
      const padTop = 30;
      const graphWidth = maxX - minX;
      const zoom = (cw - padX * 2) / graphWidth;
      const graphCenterX = (minX + maxX) / 2;

      instance.setViewport({
        x: cw / 2 - graphCenterX * zoom,
        y: -minY * zoom + padTop,
        zoom,
      });
      setReady(true);
    };

    setTimeout(adjust, 50);
  }, []);

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
        <div className={styles.flowContainer} ref={containerRef} style={{ opacity: ready ? 1 : 0 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={{ type: 'default' }}
            onInit={onInit}
            translateExtent={graphExtent}
            panOnScroll
            panOnScrollMode={PanOnScrollMode.Vertical}
            panOnDrag={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            proOptions={{ hideAttribution: true }}
            style={{ background: 'transparent' }}
          />
        </div>
      </div>
    </Layout>
  );
}
