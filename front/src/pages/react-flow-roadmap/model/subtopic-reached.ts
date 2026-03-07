import { useLayoutEffect, useEffect, useSyncExternalStore } from 'react';
import { ROADMAP } from '@/entities/roadmap';
import { TOPIC_REACHED_AT, SUBTOPIC_FUSE_DUR, SUBTOPIC_STAGGER } from './constants';
import { useSmoothProgress } from './smooth-progress';

const _reachedSubtopicIds = new Set<string>();
const _subtopicListeners = new Set<() => void>();
const _subtopicTimeoutsByTopic = new Map<string, ReturnType<typeof setTimeout>[]>();

function _notifySubtopicReached() {
  for (const fn of _subtopicListeners) fn();
}

export function updateSubtopicReached(gp: number) {
  for (const topic of ROADMAP) {
    const reachedAt = TOPIC_REACHED_AT[topic.id] ?? 1;
    const subs = topic.subtopics;
    if (subs.length === 0) continue;

    if (gp >= reachedAt - 0.002) {
      const existing = _subtopicTimeoutsByTopic.get(topic.id);
      if (existing) continue;
      const timeouts: ReturnType<typeof setTimeout>[] = [];
      subs.forEach((sub, i) => {
        const delayMs = (SUBTOPIC_FUSE_DUR + i * SUBTOPIC_STAGGER) * 1000;
        const id = setTimeout(() => {
          _reachedSubtopicIds.add(sub.id);
          _notifySubtopicReached();
        }, delayMs);
        timeouts.push(id);
      });
      _subtopicTimeoutsByTopic.set(topic.id, timeouts);
    } else {
      const timeouts = _subtopicTimeoutsByTopic.get(topic.id);
      if (timeouts) {
        timeouts.forEach(clearTimeout);
        _subtopicTimeoutsByTopic.delete(topic.id);
        subs.forEach((sub) => _reachedSubtopicIds.delete(sub.id));
        _notifySubtopicReached();
      }
    }
  }
}

export function useSubtopicReached(subtopicId: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      _subtopicListeners.add(cb);
      return () => {
        _subtopicListeners.delete(cb);
      };
    },
    () => _reachedSubtopicIds.has(subtopicId),
    () => _reachedSubtopicIds.has(subtopicId),
  );
}

export function isSubtopicReached(subtopicId: string): boolean {
  return _reachedSubtopicIds.has(subtopicId);
}

/** Драйвер: обновляет набор достигнутых подтем по сглаженному прогрессу. Рендерить внутри ReactFlow. */
export function SubtopicReachedDriver() {
  const gp = useSmoothProgress();
  useLayoutEffect(() => {
    updateSubtopicReached(gp);
  }, [gp]);
  useEffect(
    () => () => {
      _subtopicTimeoutsByTopic.forEach((ids) => ids.forEach(clearTimeout));
      _subtopicTimeoutsByTopic.clear();
      _reachedSubtopicIds.clear();
      _notifySubtopicReached();
    },
    [],
  );
  return null;
}
