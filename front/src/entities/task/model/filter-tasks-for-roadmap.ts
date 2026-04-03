import type { Task } from './types';

/**
 * Та же логика отбора, что в TopicSidebar: вводная тема vs подтема vs навигация.
 */
export function selectTasksForRoadmapSidebar(
  tasks: Task[],
  topicId: string,
  effectiveSubtopicId: string | undefined,
  openedSubtopicId: string | undefined
): Task[] {
  if (openedSubtopicId && !effectiveSubtopicId) {
    return tasks.filter(
      (t) => t.topicId === topicId && (t.subtopicId === openedSubtopicId || !t.subtopicId)
    );
  }
  if (effectiveSubtopicId) {
    return tasks.filter(
      (t) => t.topicId === topicId && (t.subtopicId === effectiveSubtopicId || !t.subtopicId)
    );
  }
  return tasks.filter((t) => t.topicId === topicId && !t.subtopicId);
}
