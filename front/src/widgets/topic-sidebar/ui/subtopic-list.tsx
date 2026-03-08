import type { RoadmapTopic } from '@/entities/roadmap';
import styles from './task-list.module.css';

interface SubtopicListProps {
  topic: RoadmapTopic;
  onClose: () => void;
}

export function SubtopicList({ topic }: SubtopicListProps) {
  return (
    <div className={styles.container}>
      {topic.subtopics.map((subtopic) => (
        <div key={subtopic.id} className={styles.taskItem}>
          <span className={styles.taskTitle}>{subtopic.title}</span>
        </div>
      ))}
    </div>
  );
}
