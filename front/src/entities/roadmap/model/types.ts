/**
 * Entity: Roadmap (topics & subtopics).
 * Domain types for the learning roadmap structure.
 */

export interface RoadmapSubtopic {
  id: string;
  title: string;
  position?: 'center' | 'left' | 'right';
  theory?: string;
  taskIds: string[];
}

export interface RoadmapTopic {
  id: string;
  title: string;
  subtopics: RoadmapSubtopic[];
}

/** Selection context for sidebar: either a topic or a subtopic within a topic */
export type RoadmapNode =
  | { type: 'topic'; topic: RoadmapTopic }
  | { type: 'subtopic'; topic: RoadmapTopic; subtopic: RoadmapSubtopic };
