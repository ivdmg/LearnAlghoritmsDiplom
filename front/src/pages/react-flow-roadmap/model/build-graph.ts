import type { Node, Edge } from '@xyflow/react';
import { ROADMAP } from '@/entities/roadmap';
import {
  LAYOUT,
  MAIN_CONNECTIONS,
  TOPIC_COLORS,
  TOPIC_REACHED_AT,
  SUBTOPIC_SPACING_Y,
  SUBTOPIC_OFFSET_RIGHT,
  SUBTOPIC_OFFSET_LEFT,
  fuseRange,
} from './constants';

let cachedGraph: { nodes: Node[]; edges: Edge[] } | null = null;

export function buildGraph(): { nodes: Node[]; edges: Edge[] } {
  if (cachedGraph) return cachedGraph;

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
        data: { label: sub.title, color, side: layout.subtopicSide, topicId: topic.id },
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

  cachedGraph = { nodes, edges };
  return cachedGraph;
}
