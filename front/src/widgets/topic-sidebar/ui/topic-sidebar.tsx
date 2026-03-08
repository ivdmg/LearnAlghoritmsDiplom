import { useState, useEffect } from 'react';
import type { RoadmapNode } from '@/entities/roadmap';
import { THEORIES, TASKS } from '@/entities/task';
import { useArticleByTopic } from '@/entities/article';
import { GlassSidebar, ContentRenderer } from '@/shared/ui';
import { TheoryContent } from './theory-content';
import { TaskList } from './task-list';
import { SubtopicList } from './subtopic-list';

interface TopicSidebarProps {
  open: boolean;
  node: RoadmapNode | null;
  onClose: () => void;
}

export function TopicSidebar({ open, node, onClose }: TopicSidebarProps) {
  const [activeTab, setActiveTab] = useState<string>('theory');

  const topicId = node?.topic.id;
  const subtopicId = node?.type === 'subtopic' ? node.subtopic.id : undefined;
  const {
    article,
    loading: articleLoading,
    error: articleError,
  } = useArticleByTopic(topicId, subtopicId);

  // Сбрасываем активную вкладку при смене узла
  useEffect(() => {
    if (!node) return;
    setActiveTab(node.type === 'topic' ? 'subtopics' : 'theory');
  }, [node]);

  if (!node) return null;

  if (node.type === 'topic') {
    const theoryContent = THEORIES[`theory-${node.topic.id}`] ?? `# ${node.topic.title}\n\nВыберите подтему для изучения.`;
    const tasks = TASKS.filter((t) => t.topicId === node.topic.id && !t.subtopicId);

    const hasArticle = !articleLoading && !articleError && article && article.blocks.length > 0;

    const tabItems = [
      {
        key: 'subtopics',
        label: 'Подтемы',
        children: <SubtopicList topic={node.topic} onClose={onClose} />,
      },
      {
        key: 'theory',
        label: 'Теория',
        children: hasArticle
          ? <ContentRenderer blocks={article.blocks} />
          : <TheoryContent content={theoryContent} />,
      },
      {
        key: 'tasks',
        label: 'Задачи',
        children: <TaskList tasks={tasks} onClose={onClose} />,
      },
    ];

    return (
      <GlassSidebar
        open={open}
        title={node.topic.title}
        tabs={tabItems.map((t) => ({ key: t.key, label: t.label }))}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onClose={onClose}
      >
        {tabItems.find((t) => t.key === activeTab)?.children ?? tabItems[0].children}
      </GlassSidebar>
    );
  }

  const { topic, subtopic } = node;
  const theoryContent = subtopic.theory
    ? THEORIES[subtopic.theory]
    : THEORIES[`theory-${topic.id}`] ?? `# ${subtopic.title}`;
  const tasks = TASKS.filter(
    (t) => t.topicId === topic.id && (t.subtopicId === subtopic.id || !t.subtopicId)
  );

  const hasArticle = !articleLoading && !articleError && article && article.blocks.length > 0;

  const tabItems = [
    {
      key: 'theory',
      label: 'Теория',
      children: hasArticle
        ? <ContentRenderer blocks={article.blocks} />
        : <TheoryContent content={theoryContent} />,
    },
    {
      key: 'tasks',
      label: 'Задачи',
      children: <TaskList tasks={tasks} onClose={onClose} />,
    },
  ];

  return (
    <GlassSidebar
      open={open}
      title={`${topic.title}: ${subtopic.title}`}
      tabs={tabItems.map((t) => ({ key: t.key, label: t.label }))}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onClose={onClose}
    >
      {tabItems.find((t) => t.key === activeTab)?.children ?? tabItems[0].children}
    </GlassSidebar>
  );
}
