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
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<string | undefined>(undefined);

  const topicId = node?.topic.id;
  const subtopicIdFromNode = node?.type === 'subtopic' ? node.subtopic.id : undefined;
  const effectiveSubtopicId = selectedSubtopicId ?? subtopicIdFromNode;
  const {
    article,
    loading: articleLoading,
    error: articleError,
  } = useArticleByTopic(topicId, effectiveSubtopicId);

  // Сбрасываем активную вкладку при смене узла
  useEffect(() => {
    if (!node) return;
    // При открытии любой темы/подтемы всегда начинаем с теории
    setActiveTab('theory');
    // При смене узла сбрасываем внутренний выбор подтемы,
    // чтобы не тащить subtopic между топиками.
    setSelectedSubtopicId(undefined);
  }, [node]);

  if (!node) return null;

  // Общая последовательность для навигации по теме: [основная тема, ...подтемы]
  const topicForSequence = node.type === 'topic' ? node.topic : node.topic;
  const subtopicsForSequence = topicForSequence.subtopics;
  const navSequence: (string | undefined)[] = [
    undefined,
    ...subtopicsForSequence.map((s) => s.id),
  ];
  const currentIndex = navSequence.findIndex((id) => id === effectiveSubtopicId);
  const safeCurrentIndex = currentIndex === -1 ? 0 : currentIndex;
  const hasPrev = safeCurrentIndex > 0;
  const hasNext = safeCurrentIndex < navSequence.length - 1;

  const goToIndex = (index: number) => {
    const clamped = Math.min(Math.max(index, 0), navSequence.length - 1);
    const targetId = navSequence[clamped];
    setSelectedSubtopicId(targetId);
    setActiveTab('theory');
  };

  const handlePrev = () => {
    if (!hasPrev) return;
    goToIndex(safeCurrentIndex - 1);
  };

  const handleNext = () => {
    if (!hasNext) return;
    goToIndex(safeCurrentIndex + 1);
  };

  if (node.type === 'topic') {
    const theoryContent = THEORIES[`theory-${node.topic.id}`] ?? `# ${node.topic.title}\n\nВыберите подтему для изучения.`;
    const tasks = effectiveSubtopicId
      ? TASKS.filter(
          (t) => t.topicId === node.topic.id && (t.subtopicId === effectiveSubtopicId || !t.subtopicId)
        )
      : TASKS.filter((t) => t.topicId === node.topic.id && !t.subtopicId);

    const hasArticle = !articleLoading && !articleError && article && article.blocks.length > 0;
    const activeSubtopic =
      effectiveSubtopicId && node.topic.subtopics.find((s) => s.id === effectiveSubtopicId);
    const sidebarTitle = activeSubtopic
      ? `${node.topic.title}: ${activeSubtopic.title}`
      : node.topic.title;

    const tabItems = [
      {
        key: 'prev',
        icon: '←',
        variant: 'icon' as const,
        children: null,
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
      {
        key: 'subtopics',
        label: 'Подтемы',
        children: (
          <SubtopicList
            topic={node.topic}
            activeSubtopicId={effectiveSubtopicId}
            onSelectSubtopic={(id) => {
              setSelectedSubtopicId(id);
              setActiveTab('theory');
            }}
            onClose={onClose}
          />
        ),
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
  const tasks = effectiveSubtopicId
    ? TASKS.filter(
        (t) => t.topicId === topic.id && (t.subtopicId === effectiveSubtopicId || !t.subtopicId)
      )
    : TASKS.filter(
        (t) => t.topicId === topic.id && (t.subtopicId === subtopic.id || !t.subtopicId)
      );

  const hasArticle = !articleLoading && !articleError && article && article.blocks.length > 0;
  const activeSubtopic =
    (effectiveSubtopicId && topic.subtopics.find((s) => s.id === effectiveSubtopicId)) || subtopic;
  const sidebarTitle = activeSubtopic ? `${topic.title}: ${activeSubtopic.title}` : topic.title;

  const tabItems = [
    {
      key: 'prev',
      icon: '←',
      variant: 'icon' as const,
      children: null,
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
    {
      key: 'subtopics',
      label: 'Подтемы',
      children: (
        <SubtopicList
          topic={topic}
          activeSubtopicId={effectiveSubtopicId ?? subtopic.id}
          onSelectSubtopic={(id) => {
            setSelectedSubtopicId(id);
            setActiveTab('theory');
          }}
          onClose={onClose}
        />
      ),
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
