/**
 * Entity: Task
 * Public API. Import from @/entities/task only.
 */
export { TASKS, THEORIES, getOrderedTaskIds, ROADMAP_TOPICS } from './model/data';
export type { Task } from './model/types';
export { useTaskById } from './model/use-task-by-id';
export { useTasksByTopic } from './model/use-tasks-by-topic';
