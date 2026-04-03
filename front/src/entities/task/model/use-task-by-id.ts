import { useEffect, useState } from 'react';
import type { Task } from './types';
import { TASKS } from './data';
import { getContentApiBaseUrl } from '@/shared/config/content-api-url';

interface UseTaskByIdResult {
  task: Task | null;
  loading: boolean;
  error: Error | null;
}

export function useTaskById(taskId?: string): UseTaskByIdResult {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!taskId) {
      setTask(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function load() {
      const id = taskId;
      if (!id) return;

      setLoading(true);
      setError(null);

      const base = getContentApiBaseUrl();
      if (base) {
        try {
          const params = new URLSearchParams();
          params.set('id', id);
          const res = await fetch(`${base}/tasks?${params.toString()}`);
          if (res.ok) {
            const data = (await res.json()) as Task[];
            const remote = data[0];
            if (remote && !cancelled) {
              setTask(remote);
              setLoading(false);
              return;
            }
          }
        } catch {
          /* fallback на локальный TASKS */
        }
      }

      if (!cancelled) {
        const local = TASKS.find((t) => t.id === id) ?? null;
        setTask(local);
        setLoading(false);
        setError(null);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [taskId]);

  return { task, loading, error };
}
