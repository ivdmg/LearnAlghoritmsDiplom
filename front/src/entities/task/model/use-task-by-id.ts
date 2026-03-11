import { useEffect, useState } from 'react';
import type { Task } from './types';

interface UseTaskByIdResult {
  task: Task | null;
  loading: boolean;
  error: Error | null;
}

const API_BASE = 'http://localhost:3001';

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
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set('id', taskId);
        const res = await fetch(`${API_BASE}/tasks?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Failed to load task (status ${res.status})`);
        }
        const data = (await res.json()) as Task[];
        if (!cancelled) {
          setTask(data[0] ?? null);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [taskId]);

  return { task, loading, error };
}

