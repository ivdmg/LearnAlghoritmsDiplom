/**
 * Shared config. Domain data re-exported from entities for backward compatibility.
 * Prefer importing from @/entities/roadmap and @/entities/task directly.
 */
export { ROADMAP } from '@/entities/roadmap';
export { TASKS, THEORIES, getOrderedTaskIds, ROADMAP_TOPICS } from '@/entities/task';
export type { RoadmapTopic, RoadmapSubtopic, RoadmapNode } from '@/entities/roadmap';
export type { Task } from '@/entities/task';
