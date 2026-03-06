import { Routes, Route } from 'react-router-dom';
import { RoadmapPage } from '@/pages/roadmap';
import { TaskPage } from '@/pages/task';
import { AnimationPage } from '@/pages/animation';
import { ReactFlowRoadmapPage } from '@/pages/react-flow-roadmap';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RoadmapPage />} />
      <Route path="/task/:taskId" element={<TaskPage />} />
      <Route path="/animation" element={<AnimationPage />} />
      <Route path="/react-flow" element={<ReactFlowRoadmapPage />} />
    </Routes>
  );
}
