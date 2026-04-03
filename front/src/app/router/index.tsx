import { Routes, Route } from 'react-router-dom';
import { ReactFlowRoadmapPage } from '@/pages/react-flow-roadmap';
import { TaskPage } from '@/pages/task';
import { TasksPage } from '@/pages/tasks';
import { AccountPage } from '@/pages/account';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<ReactFlowRoadmapPage />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/task/:taskId" element={<TaskPage />} />
      <Route path="/account" element={<AccountPage />} />
    </Routes>
  );
}
