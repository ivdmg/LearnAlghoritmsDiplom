import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const ReactFlowRoadmapPage = lazy(() => import('@/pages/react-flow-roadmap').then((m) => ({ default: m.ReactFlowRoadmapPage })));
const TaskPage = lazy(() => import('@/pages/task').then((m) => ({ default: m.TaskPage })));
const TasksPage = lazy(() => import('@/pages/tasks').then((m) => ({ default: m.TasksPage })));
const AccountPage = lazy(() => import('@/pages/account').then((m) => ({ default: m.AccountPage })));

function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#050607',
      color: '#e5e7eb',
      fontSize: '1rem',
    }}>
      Загрузка…
    </div>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Suspense fallback={<PageLoader />}><ReactFlowRoadmapPage /></Suspense>} />
      <Route path="/tasks" element={<Suspense fallback={<PageLoader />}><TasksPage /></Suspense>} />
      <Route path="/task/:taskId" element={<Suspense fallback={<PageLoader />}><TaskPage /></Suspense>} />
      <Route path="/account" element={<Suspense fallback={<PageLoader />}><AccountPage /></Suspense>} />
    </Routes>
  );
}
