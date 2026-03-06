import { List } from 'antd';
import type { RoadmapTopic } from '@/shared/config/roadmap-data';
import styles from './task-list.module.css';

interface SubtopicListProps {
  topic: RoadmapTopic;
  onClose: () => void;
}

export function SubtopicList({ topic }: SubtopicListProps) {
  return (
    <div className={styles.container}>
      <List
        dataSource={topic.subtopics}
        renderItem={(subtopic) => (
          <List.Item>
            <div className={styles.taskItem}>
              <span className={styles.taskTitle}>{subtopic.title}</span>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
}
