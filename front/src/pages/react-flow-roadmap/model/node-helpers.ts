import type { Node } from '@xyflow/react';
import type { RoadmapNode } from '@/entities/roadmap';
import { ROADMAP } from '@/entities/roadmap';
import { TOPIC_REACHED_AT } from './constants';
import { isSubtopicReached } from './subtopic-reached';

/** Строит RoadmapNode для TopicSidebar по ноде React Flow */
export function getRoadmapNodeFromFlowNode(node: Node): RoadmapNode | null {
  if (node.type === 'topicNode') {
    const topic = ROADMAP.find((t) => t.id === node.id);
    return topic ? { type: 'topic', topic } : null;
  }
  if (node.type === 'subtopicNode') {
    const topicId = node.data?.topicId as string | undefined;
    if (!topicId) return null;
    const topic = ROADMAP.find((t) => t.id === topicId);
    if (!topic) return null;
    const subtopic = topic.subtopics.find((s) => s.id === node.id);
    return subtopic ? { type: 'subtopic', topic, subtopic } : null;
  }
  return null;
}

/** Нода достигнута фитилём (можно открывать попап) */
export function isNodeReached(node: Node, gp: number): boolean {
  if (node.type === 'topicNode') {
    return node.id === 'osnovy' || gp >= (TOPIC_REACHED_AT[node.id] ?? 0) - 0.002;
  }
  if (node.type === 'subtopicNode') {
    const topicId = node.data?.topicId as string | undefined;
    return topicId === 'osnovy' || isSubtopicReached(node.id);
  }
  return false;
}
