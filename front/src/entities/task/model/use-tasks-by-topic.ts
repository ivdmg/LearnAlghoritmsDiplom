import { useEffect, useState } from 'react';
import type { Task } from './types';
import { TASKS } from './data';
import { getContentApiBaseUrl } from '@/shared/config/content-api-url';
import { selectTasksForRoadmapSidebar } from './filter-tasks-for-roadmap';

interface UseTasksByTopicArgs {
  topicId?: string;
  effectiveSubtopicId?: string;
  /** Для узла type=subtopic и «корневого» слайда (без effective subtopic) — id открытой подтемы */
  openedSubtopicId?: string;
}

interface UseTasksByTopicResult {
  tasks: Task[];
}

export function useTasksByTopic({
  topicId,
  effectiveSubtopicId,
  openedSubtopicId,
}: UseTasksByTopicArgs): UseTasksByTopicResult {
  const [remoteList, setRemoteList] = useState<Task[] | null>(null);

  const staticFiltered =
    topicId !== undefined
      ? selectTasksForRoadmapSidebar(TASKS, topicId, effectiveSubtopicId, openedSubtopicId)
      : [];

  useEffect(() => {
    if (!topicId) {
      setRemoteList(null);
      return;
    }

    const base = getContentApiBaseUrl();
    if (!base) {
      setRemoteList(null);
      return;
    }

    let cancelled = false;
    const params = new URLSearchParams();
    params.set('topicId', topicId);

    void (async () => {
      try {
        const res = await fetch(`${base}/tasks?${params.toString()}`);
        if (!res.ok) {
          if (!cancelled) setRemoteList(null);
          return;
        }
        const data = (await res.json()) as Task[];
        if (!cancelled) {
          setRemoteList(
            selectTasksForRoadmapSidebar(data, topicId, effectiveSubtopicId, openedSubtopicId)
          );
        }
      } catch {
        if (!cancelled) setRemoteList(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [topicId, effectiveSubtopicId, openedSubtopicId]);

  return {
    tasks: remoteList !== null ? remoteList : staticFiltered,
  };
}
