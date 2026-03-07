import { useState, useCallback, useMemo } from 'react';
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Layout } from 'antd';
import type { Node } from '@xyflow/react';
import type { RoadmapNode } from '@/entities/roadmap';
import { AppHeader } from '@/widgets/app-header';
import { TopicSidebar } from '@/widgets/topic-sidebar/ui/topic-sidebar';
import { getSmoothProgress, SmoothProgressDriver } from './model/smooth-progress';
import { getRoadmapNodeFromFlowNode, isNodeReached } from './model/node-helpers';
import { SubtopicReachedDriver } from './model/subtopic-reached';
import { buildGraph } from './model/build-graph';
import { nodeTypes } from './ui/node-types';
import { edgeTypes } from './ui/edge-types';
import { useFlowViewport } from './hooks/use-flow-viewport';
import styles from './react-flow-roadmap.module.css';

export function ReactFlowRoadmapPage() {
  const { nodes, edges } = useMemo(buildGraph, []);
  const { containerRef, onInit, graphExtent, ready } = useFlowViewport();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);

  const handleNodeClick = useCallback((_: unknown, node: Node) => {
    const gp = getSmoothProgress();
    if (!isNodeReached(node, gp)) return;
    const roadmapNode = getRoadmapNodeFromFlowNode(node);
    if (roadmapNode) {
      setSelectedNode(roadmapNode);
      setSidebarOpen(true);
    }
  }, []);

  return (
    <Layout className={styles.layout}>
      <AppHeader variant="back" title="AlgoLearn — Roadmap" backTo="/" />

      <div className={styles.pageBody}>
        <div
          className={styles.flowContainer}
          ref={containerRef}
          style={{ opacity: ready ? 1 : 0 }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={{ type: 'default' }}
            onInit={onInit}
            onNodeClick={handleNodeClick}
            translateExtent={graphExtent}
            panOnScroll={false}
            panOnDrag={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            proOptions={{ hideAttribution: true }}
            style={{ background: 'transparent' }}
          >
            <SmoothProgressDriver />
            <SubtopicReachedDriver />
          </ReactFlow>
        </div>
      </div>

      <TopicSidebar
        open={sidebarOpen}
        node={selectedNode}
        onClose={() => setSidebarOpen(false)}
      />
    </Layout>
  );
}
