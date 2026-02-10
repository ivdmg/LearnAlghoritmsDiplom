import { Drawer, Tabs } from 'antd';
import type { RoadmapTopic } from '@/shared/config/roadmap-data';
import { THEORIES } from '@/shared/config/roadmap-data';
import { TASKS } from '@/shared/config/roadmap-data';
import { TheoryContent } from './theory-content';
import { TaskList } from './task-list';
import styles from './topic-sidebar.module.css';

interface TopicSidebarProps {
  open: boolean;
  topic: RoadmapTopic | null;
  onClose: () => void;
}

export function TopicSidebar({ open, topic, onClose }: TopicSidebarProps) {
  if (!topic) return null;

  const theoryContent = topic.theory ? THEORIES[topic.theory] : 'Нет теории';
  const tasks = TASKS.filter((t) => topic.taskIds.includes(t.id));

  const tabItems = [
    {
      key: 'theory',
      label: 'Теория',
      children: <TheoryContent content={theoryContent} />,
    },
    {
      key: 'tasks',
      label: 'Задачи',
      children: <TaskList tasks={tasks} onClose={onClose} />,
    },
  ];

  return (
    <Drawer
      title={topic.title}
      placement="right"
      width="50%"
      open={open}
      onClose={onClose}
      className={styles.drawer}
      styles={{
        body: { paddingTop: 0 },
      }}
    >
      <Tabs items={tabItems} className={styles.tabs} />
    </Drawer>
  );
}
