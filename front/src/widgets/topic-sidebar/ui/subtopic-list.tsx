import type { RoadmapTopic } from '@/entities/roadmap';
import styles from './task-list.module.css';

interface SubtopicListProps {
  topic: RoadmapTopic;
  activeSubtopicId?: string;
  onSelectSubtopic: (subtopicId: string) => void;
  onClose: () => void;
}

export function SubtopicList({
  topic,
  activeSubtopicId,
  onSelectSubtopic,
}: SubtopicListProps) {
  return (
    <div className={styles.container}>
      {topic.subtopics.map((subtopic) => {
        const isActive = subtopic.id === activeSubtopicId;
        return (
          <button
            key={subtopic.id}
            type="button"
            className={styles.taskItem}
            onClick={() => onSelectSubtopic(subtopic.id)}
          >
            <span
              className={styles.taskTitle}
              style={isActive ? { textDecoration: 'underline' } : undefined}
            >
              {subtopic.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}
