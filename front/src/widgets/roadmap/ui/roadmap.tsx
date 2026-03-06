import { useRef, useLayoutEffect, useState, useCallback, useMemo } from 'react';
import type { RoadmapTopic, RoadmapSubtopic } from '@/shared/config/roadmap-data';
import styles from './roadmap.module.css';

export type RoadmapNode =
  | { type: 'topic'; topic: RoadmapTopic }
  | { type: 'subtopic'; topic: RoadmapTopic; subtopic: RoadmapSubtopic };

interface RoadmapProps {
  topics: RoadmapTopic[];
  onNodeClick: (node: RoadmapNode) => void;
}

interface Point {
  x: number;
  y: number;
}

function verticalPath(A: Point, B: Point): string {
  return `M ${A.x} ${A.y} L ${B.x} ${B.y}`;
}

function x3curvePath(A: Point, B: Point): string {
  const dy = B.y - A.y;
  const c1 = { x: A.x, y: A.y + dy * 0.5 };
  const c2 = { x: B.x, y: B.y - dy * 0.5 };
  return `M ${A.x} ${A.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${B.x} ${B.y}`;
}

interface FlatNode {
  id: string;
  title: string;
  position: 'center' | 'side-left' | 'side-right';
  node: RoadmapNode;
  rowGroup: number;
  flatIndex: number;
}

function buildFlatNodes(topics: RoadmapTopic[]): FlatNode[] {
  const nodes: FlatNode[] = [];
  let rowGroup = 0;
  let flatIndex = 0;

  for (const topic of topics) {
    nodes.push({
      id: topic.id,
      title: topic.title,
      position: 'center',
      node: { type: 'topic', topic },
      rowGroup: rowGroup++,
      flatIndex: flatIndex++,
    });

    let i = 0;
    while (i < topic.subtopics.length) {
      const curr = topic.subtopics[i];
      const next = topic.subtopics[i + 1];
      const currPos = curr.position ?? 'center';
      const nextPos = next?.position ?? 'center';

      if (currPos === 'left' && nextPos === 'right') {
        nodes.push({
          id: curr.id,
          title: curr.title,
          position: 'side-left',
          node: { type: 'subtopic', topic, subtopic: curr },
          rowGroup,
          flatIndex: flatIndex++,
        });
        nodes.push({
          id: next!.id,
          title: next!.title,
          position: 'side-right',
          node: { type: 'subtopic', topic, subtopic: next! },
          rowGroup,
          flatIndex: flatIndex++,
        });
        rowGroup++;
        i += 2;
      } else if (currPos === 'right' && nextPos === 'left') {
        nodes.push({
          id: curr.id,
          title: curr.title,
          position: 'side-right',
          node: { type: 'subtopic', topic, subtopic: curr },
          rowGroup,
          flatIndex: flatIndex++,
        });
        nodes.push({
          id: next!.id,
          title: next!.title,
          position: 'side-left',
          node: { type: 'subtopic', topic, subtopic: next! },
          rowGroup,
          flatIndex: flatIndex++,
        });
        rowGroup++;
        i += 2;
      } else {
        const pos: 'center' | 'side-left' | 'side-right' =
          currPos === 'left' ? 'side-left' : currPos === 'right' ? 'side-right' : 'center';
        nodes.push({
          id: curr.id,
          title: curr.title,
          position: pos,
          node: { type: 'subtopic', topic, subtopic: curr },
          rowGroup: rowGroup++,
          flatIndex: flatIndex++,
        });
        i++;
      }
    }
  }

  return nodes;
}

function buildConnections(nodes: FlatNode[]): { from: number; to: number; type: 'vertical' | 'x3curve' }[] {
  const conns: { from: number; to: number; type: 'vertical' | 'x3curve' }[] = [];

  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i];
    const b = nodes[i + 1];

    // если оба — темы, вертикальная линия
    if (a.node.type === 'topic' && b.node.type === 'topic') {
      conns.push({ from: i, to: i + 1, type: 'vertical' });
    } 
    // если хотя бы один — подтема, рисуем кривую x³
    else {
      conns.push({ from: i, to: i + 1, type: 'x3curve' });
    }
  }

  return conns;
}

export function Roadmap({ topics, onNodeClick }: RoadmapProps) {
  const roadmapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const anchorRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [paths, setPaths] = useState<{ d: string; key: string }[]>([]);

  // ✅ Мемоизация flatNodes и connections
  const flatNodes = useMemo(() => buildFlatNodes(topics), [topics]);
  const connections = useMemo(() => buildConnections(flatNodes), [flatNodes]);

  const drawConnections = useCallback(() => {
    const roadmap = roadmapRef.current;
    const svg = svgRef.current;
    if (!roadmap || !svg) return;

    svg.setAttribute('width', String(roadmap.offsetWidth));
    svg.setAttribute('height', String(roadmap.offsetHeight));

    const rect = roadmap.getBoundingClientRect();
    const newPaths: { d: string; key: string }[] = [];

    for (let c = 0; c < connections.length; c++) {
      const conn = connections[c];
      const fromEl = anchorRefs.current[conn.from];
      const toEl = anchorRefs.current[conn.to];
      if (!fromEl || !toEl) continue;

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();
      const A: Point = {
        x: fromRect.left + fromRect.width / 2 - rect.left,
        y: fromRect.top + fromRect.height / 2 - rect.top,
      };
      const B: Point = {
        x: toRect.left + toRect.width / 2 - rect.left,
        y: toRect.top + toRect.height / 2 - rect.top,
      };

      const d = conn.type === 'vertical' ? verticalPath(A, B) : x3curvePath(A, B);
      newPaths.push({ d, key: `path-${c}` });
    }

    setPaths(newPaths);
  }, [connections]);

  useLayoutEffect(() => {
    drawConnections();
    const raf = requestAnimationFrame(() => drawConnections());
    return () => cancelAnimationFrame(raf);
  }, [drawConnections]);

  useLayoutEffect(() => {
    const roadmap = roadmapRef.current;
    if (!roadmap) return;
    const resizeObserver = new ResizeObserver(() => drawConnections());
    resizeObserver.observe(roadmap);
    return () => resizeObserver.disconnect();
  }, [drawConnections]);

  useLayoutEffect(() => {
    let rafId: number;
    const handleResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => drawConnections());
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
    };
  }, [drawConnections]);

  // Группировка по рядам
  const rows = useMemo(() => {
    const map = new Map<number, FlatNode[]>();
    for (const node of flatNodes) {
      const list = map.get(node.rowGroup) ?? [];
      list.push(node);
      map.set(node.rowGroup, list);
    }
    return map;
  }, [flatNodes]);

  const sortedRowGroups = useMemo(() => Array.from(rows.keys()).sort((a, b) => a - b), [rows]);

  return (
    <div className={styles.roadmapWrapper}>
      <h1 className={styles.title}>Алгоритмы и структуры данных</h1>
      <p className={styles.subtitle}>Выберите тему для изучения</p>

      <div ref={roadmapRef} className={styles.roadmap}>
        <svg ref={svgRef} className={styles.linesSvg} aria-hidden>
          {paths.map((p) => (
            <path key={p.key} d={p.d} className={styles.connectorPath} />
          ))}
        </svg>

        <div className={styles.topicsList}>
          {sortedRowGroups.map((rg) => {
            const rowNodes = rows.get(rg)!;
            return (
              <div key={rg} className={styles.row}>
                {rowNodes.map((node) => {
                  const positionClass =
                    node.position === 'side-left'
                      ? styles.taskSideLeft
                      : node.position === 'side-right'
                      ? styles.taskSideRight
                      : styles.taskCenter;
                  return (
                    <div
                      key={node.id}
                      role="button"
                      tabIndex={0}
                      className={`${styles.task} ${positionClass}`}
                      onClick={() => onNodeClick(node.node)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onNodeClick(node.node);
                        }
                      }}
                    >
                      <div
                        ref={(el) => {
                          anchorRefs.current[node.flatIndex] = el;
                        }}
                        className={styles.anchor}
                      />
                      <h3 className={styles.taskTitle}>{node.title}</h3>
                      <span className={styles.taskType}>
                        {node.node.type === 'topic' ? 'тема' : 'подтема'}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}