import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Button } from 'antd';
import { ThunderboltOutlined, NodeIndexOutlined } from '@ant-design/icons';
import { Roadmap } from '@/widgets/roadmap/ui/roadmap';
import type { RoadmapNode } from '@/widgets/roadmap/ui/roadmap';
import { TopicSidebar } from '@/widgets/topic-sidebar/ui/topic-sidebar';
import { ThemeToggle } from '@/widgets/theme-toggle/ui/theme-toggle';
import { ROADMAP } from '@/shared/config/roadmap-data';
import styles from './roadmap-page.module.css';

export function RoadmapPage() {
  const navigate = useNavigate();
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
    <Layout className={styles.layout}>
      <Layout.Header className={styles.header}>
        <span className={styles.logo}>AlgoLearn</span>
        <div className={styles.headerRight}>
          <Button
            type="link"
            icon={<ThunderboltOutlined />}
            onClick={() => navigate('/animation')}
            className={styles.animationBtn}
          >
            Animation
          </Button>
          <Button
            type="link"
            icon={<NodeIndexOutlined />}
            onClick={() => navigate('/react-flow')}
            className={styles.animationBtn}
          >
            React Flow
          </Button>
          <ThemeToggle />
        </div>
      </Layout.Header>
      <Layout.Content className={styles.content}>
        <Roadmap topics={ROADMAP} onNodeClick={handleNodeClick} />
      </Layout.Content>
      <TopicSidebar
        open={sidebarOpen}
        node={selectedNode}
        onClose={handleSidebarClose}
      />
    </Layout>
  );
}
