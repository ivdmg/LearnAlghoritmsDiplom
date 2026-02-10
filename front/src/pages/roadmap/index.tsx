import { useState } from 'react';
import { Layout } from 'antd';
import { Roadmap } from '@/widgets/roadmap/ui/roadmap';
import { TopicSidebar } from '@/widgets/topic-sidebar/ui/topic-sidebar';
import { ThemeToggle } from '@/widgets/theme-toggle/ui/theme-toggle';
import { ROADMAP_TOPICS } from '@/shared/config/roadmap-data';
import type { RoadmapTopic } from '@/shared/config/roadmap-data';
import styles from './roadmap-page.module.css';

export function RoadmapPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<RoadmapTopic | null>(null);

  const handleTopicClick = (topic: RoadmapTopic) => {
    setSelectedTopic(topic);
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <Layout className={styles.layout}>
      <Layout.Header className={styles.header}>
        <span className={styles.logo}>AlgoLearn</span>
        <ThemeToggle />
      </Layout.Header>
      <Layout.Content className={styles.content}>
        <Roadmap topics={ROADMAP_TOPICS} onTopicClick={handleTopicClick} />
      </Layout.Content>
      <TopicSidebar
        open={sidebarOpen}
        topic={selectedTopic}
        onClose={handleSidebarClose}
      />
    </Layout>
  );
}
