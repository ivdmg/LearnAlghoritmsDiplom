import { Routes, Route } from 'react-router-dom';
import { RoadmapPage } from '@/pages/roadmap';
import { TaskPage } from '@/pages/task';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RoadmapPage />} />
      <Route path="/task/:taskId" element={<TaskPage />} />
    </Routes>
  );
}
