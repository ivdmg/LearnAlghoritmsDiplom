import { Drawer, Tabs } from 'antd';
import type { RoadmapNode } from '@/widgets/roadmap/ui/roadmap';
import { THEORIES } from '@/shared/config/roadmap-data';
import { TASKS } from '@/shared/config/roadmap-data';
import { TheoryContent } from './theory-content';
import { TaskList } from './task-list';
import { SubtopicList } from './subtopic-list';
import styles from './topic-sidebar.module.css';

interface TopicSidebarProps {
  open: boolean;
  node: RoadmapNode | null;
  onClose: () => void;
}

export function TopicSidebar({ open, node, onClose }: TopicSidebarProps) {
  if (!node) return null;

  if (node.type === 'topic') {
    const theoryContent = THEORIES[`theory-${node.topic.id}`] ?? `# ${node.topic.title}\n\nВыберите подтему для изучения.`;
    const tasks = TASKS.filter((t) => t.topicId === node.topic.id && !t.subtopicId);

    const tabItems = [
      {
        key: 'subtopics',
        label: 'Подтемы',
        children: <SubtopicList topic={node.topic} onClose={onClose} />,
      },
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
        title={node.topic.title}
        placement="right"
        width="50%"
        open={open}
        onClose={onClose}
        className={styles.drawer}
        styles={{ body: { paddingTop: 0 } }}
      >
        <Tabs items={tabItems} className={styles.tabs} />
      </Drawer>
    );
  }

  const { topic, subtopic } = node;
  const theoryContent = subtopic.theory
    ? THEORIES[subtopic.theory]
    : THEORIES[`theory-${topic.id}`] ?? `# ${subtopic.title}`;
  const tasks = TASKS.filter(
    (t) => t.topicId === topic.id && (t.subtopicId === subtopic.id || !t.subtopicId)
  );

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
      title={`${topic.title}: ${subtopic.title}`}
      placement="right"
      width="50%"
      open={open}
      onClose={onClose}
      className={styles.drawer}
      styles={{ body: { paddingTop: 0 } }}
    >
      <Tabs items={tabItems} className={styles.tabs} />
    </Drawer>
  );
}
