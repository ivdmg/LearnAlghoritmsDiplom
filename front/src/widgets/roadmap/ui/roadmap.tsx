import { Button } from 'antd';
import type { RoadmapTopic } from '@/shared/config/roadmap-data';
import styles from './roadmap.module.css';

interface RoadmapProps {
  topics: RoadmapTopic[];
  onTopicClick: (topic: RoadmapTopic) => void;
}

export function Roadmap({ topics, onTopicClick }: RoadmapProps) {
  return (
    <div className={styles.roadmapWrapper}>
      <h1 className={styles.title}>Алгоритмы и структуры данных</h1>
      <p className={styles.subtitle}>Выберите тему для изучения</p>

      <div className={styles.roadmapContainer}>
        <div className={styles.timelineLine} />

        <div className={styles.topicsList}>
          {topics.map((topic, index) => (
            <div key={topic.id} className={styles.topicItem}>
              <div className={styles.topicNode}>
                <span className={styles.nodeNumber}>{index + 1}</span>
              </div>
              <Button
                type="primary"
                size="large"
                className={styles.topicButton}
                onClick={() => onTopicClick(topic)}
              >
                {topic.title}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
