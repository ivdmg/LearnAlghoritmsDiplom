import { useState } from 'react';
import { Roadmap } from '@/widgets/roadmap/ui/roadmap';
import type { RoadmapNode } from '@/entities/roadmap';
import { TopicSidebar } from '@/widgets/topic-sidebar/ui/topic-sidebar';
import { AppHeader } from '@/widgets/app-header';
import { ROADMAP } from '@/entities/roadmap';
import styles from './roadmap-page.module.css';

export function RoadmapPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);

  const handleNodeClick = (node: RoadmapNode) => {
    setSelectedNode(node);
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={styles.layout}>
      <AppHeader />
      <div className={styles.content}>
        <Roadmap topics={ROADMAP} onNodeClick={handleNodeClick} />
      </div>
      <TopicSidebar
        open={sidebarOpen}
        node={selectedNode}
        onClose={handleSidebarClose}
      />
    </div>
  );
}
