import { Routes, Route } from 'react-router-dom';
import { ReactFlowRoadmapPage } from '@/pages/react-flow-roadmap';
import { TaskPage } from '@/pages/task';
import { TasksPage } from '@/pages/tasks';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<ReactFlowRoadmapPage />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/task/:taskId" element={<TaskPage />} />
    </Routes>
  );
}
