import { useState, useEffect } from 'react';
import type { RoadmapNode } from '@/entities/roadmap';
import { THEORIES, useTasksByTopic } from '@/entities/task';
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
  const [navIndex, setNavIndex] = useState<number | null>(null);

  const subtopicIdFromNode = node?.type === 'subtopic' ? node.subtopic.id : undefined;
  // Общая последовательность для навигации по теме: [основная тема, ...подтемы]
  const topicForSequence = node?.topic;
  const subtopicsForSequence = topicForSequence?.subtopics ?? [];
  const totalEntries = 1 + subtopicsForSequence.length;

  let currentIndex: number;
  if (navIndex !== null) {
    currentIndex = Math.min(Math.max(navIndex, 0), totalEntries - 1);
  } else if (!node || node.type === 'topic') {
    currentIndex = 0;
  } else {
    const initial = subtopicsForSequence.findIndex((s) => s.id === subtopicIdFromNode);
    currentIndex = initial === -1 ? 0 : 1 + initial;
  }

  const effectiveSubtopicId =
    currentIndex === 0 ? undefined : subtopicsForSequence[currentIndex - 1]?.id;

  const topicId = node?.topic.id;
  const {
    article,
    loading: articleLoading,
    error: articleError,
  } = useArticleByTopic(topicId, effectiveSubtopicId);

  const openedSubtopicIdForTasks =
    node?.type === 'subtopic' ? node.subtopic.id : undefined;
  const { tasks: tasksFromApi } = useTasksByTopic({
    topicId,
    effectiveSubtopicId,
    openedSubtopicId: openedSubtopicIdForTasks,
  });

  // Сбрасываем активную вкладку при смене узла
  useEffect(() => {
    if (!node) return;
    // При открытии любой темы/подтемы всегда начинаем с теории
    setActiveTab('theory');
    // При смене узла сбрасываем внутренний выбор индекса навигации.
    setNavIndex(null);
  }, [node]);

  if (!node) return null;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < totalEntries - 1;

  const goToIndex = (index: number) => {
    const clamped = Math.min(Math.max(index, 0), totalEntries - 1);
    setNavIndex(clamped);
    setActiveTab('theory');
  };

  const handlePrev = () => {
    if (!hasPrev) return;
    goToIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (!hasNext) return;
    goToIndex(currentIndex + 1);
  };

  if (node.type === 'topic') {
    const theoryContent = THEORIES[`theory-${node.topic.id}`] ?? `# ${node.topic.title}\n\nВыберите подтему для изучения.`;

    const hasArticle = !articleLoading && !articleError && article && article.blocks.length > 0;
    const activeSubtopic =
      effectiveSubtopicId && node.topic.subtopics.find((s) => s.id === effectiveSubtopicId);
    const sidebarTitle = activeSubtopic
      ? `${node.topic.title}: ${activeSubtopic.title}`
      : node.topic.title;

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
        children: <TaskList tasks={tasksFromApi} onClose={onClose} />,
      },
      {
        key: 'subtopics',
        label: 'Подтемы',
        children: (
          <SubtopicList
            topic={node.topic}
            activeSubtopicId={effectiveSubtopicId}
            onSelectSubtopic={(id) => {
              const idx = subtopicsForSequence.findIndex((s) => s.id === id);
              if (idx !== -1) {
                setNavIndex(1 + idx);
                setActiveTab('theory');
              }
            }}
            onClose={onClose}
          />
        ),
      },
      {
        key: 'prev',
        icon: '←',
        variant: 'icon' as const,
        children: null,
      },
      {
        key: 'next',
        icon: '→',
        variant: 'icon' as const,
        children: null,
      },
    ];

    const handleTabChange = (key: string) => {
      if (key === 'prev') {
        handlePrev();
        return;
      }
      if (key === 'next') {
        handleNext();
        return;
      }
      setActiveTab(key);
    };

    return (
      <GlassSidebar
        open={open}
        title={sidebarTitle}
        tabs={tabItems.map((t) => ({
          key: t.key,
          label: t.label,
          icon: (t as any).icon,
          disabled: t.key === 'prev' ? !hasPrev : t.key === 'next' ? !hasNext : undefined,
          variant: (t as any).variant,
        }))}
        activeTab={activeTab}
        onTabChange={handleTabChange}
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

  const hasArticle = !articleLoading && !articleError && article && article.blocks.length > 0;
  const activeSubtopic =
    currentIndex === 0
      ? undefined
      : topic.subtopics.find((s) => s.id === effectiveSubtopicId) || subtopic;
  const sidebarTitle = activeSubtopic ? `${topic.title}: ${activeSubtopic.title}` : topic.title;

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
      children: <TaskList tasks={tasksFromApi} onClose={onClose} />,
    },
    {
      key: 'subtopics',
      label: 'Подтемы',
      children: (
        <SubtopicList
          topic={topic}
          activeSubtopicId={effectiveSubtopicId ?? subtopic.id}
          onSelectSubtopic={(id) => {
            const idx = subtopicsForSequence.findIndex((s) => s.id === id);
            if (idx !== -1) {
              setNavIndex(1 + idx);
              setActiveTab('theory');
            }
          }}
          onClose={onClose}
        />
      ),
    },
    {
      key: 'prev',
      icon: '←',
      variant: 'icon' as const,
      children: null,
    },
    {
      key: 'next',
      icon: '→',
      variant: 'icon' as const,
      children: null,
    },
  ];

  const handleTabChange = (key: string) => {
    if (key === 'prev') {
      handlePrev();
      return;
    }
    if (key === 'next') {
      handleNext();
      return;
    }
    setActiveTab(key);
  };

  return (
    <GlassSidebar
      open={open}
      title={sidebarTitle}
      tabs={tabItems.map((t) => ({
        key: t.key,
        label: t.label,
        icon: (t as any).icon,
        disabled: t.key === 'prev' ? !hasPrev : t.key === 'next' ? !hasNext : undefined,
        variant: (t as any).variant,
      }))}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onClose={onClose}
    >
      {tabItems.find((t) => t.key === activeTab)?.children ?? tabItems[0].children}
    </GlassSidebar>
  );
}
