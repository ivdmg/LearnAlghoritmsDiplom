import { Routes, Route } from 'react-router-dom';
import { ReactFlowRoadmapPage } from '@/pages/react-flow-roadmap';
import { TaskPage } from '@/pages/task';
import { AnimationPage } from '@/pages/animation';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<ReactFlowRoadmapPage />} />
      <Route path="/task/:taskId" element={<TaskPage />} />
      <Route path="/animation" element={<AnimationPage />} />
    </Routes>
  );
}
