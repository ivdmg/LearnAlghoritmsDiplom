import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '@/shared/lib/hooks/use-app-selector';
import { apiFetch } from '@/shared/api/api-client';
import { isApiConfigured } from '@/shared/config/api-url';

export type MyStats = {
  solvedTotal: number;
  byDifficulty: Record<string, number>;
  byTopic: Record<string, number>;
  lastSolved: Array<{
    taskId: string;
    difficulty: string;
    solvedAt: string;
    attemptsCount: number;
  }>;
  streakDays: number;
  longestStreak: number;
  firstSolvedAt: string | null;
  totalAttempts: number;
  firstAttemptRate: number;
  solvedLast7: number;
  solvedLast30: number;
  calendarData: Array<{ date: string; count: number }>;
};

export function useMyStats() {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const bootstrapDone = useAppSelector((s) => s.auth.bootstrapDone);
  const [stats, setStats] = useState<MyStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!isApiConfigured() || !accessToken) {
      setStats(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/me/stats', { accessToken });
      if (!res.ok) {
        setError('Не удалось загрузить статистику');
        setStats(null);
        return;
      }
      setStats((await res.json()) as MyStats);
    } catch {
      setError('Сеть недоступна');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!bootstrapDone) return;
    void reload();
  }, [bootstrapDone, reload]);

  return { stats, loading, error, reload };
}
