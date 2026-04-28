import { Suspense, lazy } from 'react';

const TasksStatsSnippetInner = lazy(() => import('./ui/tasks-stats-snippet').then((m) => ({ default: m.TasksStatsSnippet })));

export function TasksStatsSnippet() {
  return (
    <Suspense fallback={<div style={{ padding: '16px', textAlign: 'center', opacity: 0.5 }}>Загрузка…</div>}>
      <TasksStatsSnippetInner />
    </Suspense>
  );
}
