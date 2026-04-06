import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/shared/lib/hooks/use-app-selector';
import { apiFetch, ApiNotConfiguredError } from '@/shared/api/api-client';
import { isApiConfigured } from '@/shared/config/api-url';
import { setSession } from '@/shared/store/slices/auth-slice';

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

/** Пытается обновить access через refresh-куку. Возвращает новый токен или null */
async function tryRefreshToken(): Promise<{ accessToken: string; user: any } | null> {
  try {
    const res = await apiFetch('/auth/refresh', { method: 'POST' });
    if (!res.ok) return null;
    return (await res.json()) as { accessToken: string; user: any };
  } catch {
    return null;
  }
}

export function useMyStats() {
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const bootstrapDone = useAppSelector((s) => s.auth.bootstrapDone);
  const dispatch = useAppDispatch();
  const [stats, setStats] = useState<MyStats | null>(null);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!isApiConfigured() || !accessToken) {
      setStats(null);
      return;
    }

    setLoading(true);
    try {
      let response = await apiFetch('/me/stats', { accessToken });

      // Если токен истёк — пробуем обновить, повторяем запрос
      if (response.status === 401) {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          dispatch(setSession({ accessToken: refreshed.accessToken, user: refreshed.user }));
          response = await apiFetch('/me/stats', { accessToken: refreshed.accessToken });
        } else {
          // Refresh не удался — очищаем
          setStats(null);
          return;
        }
      }

      if (!response.ok) {
        setStats(null);
        return;
      }
      setStats((await response.json()) as MyStats);
    } catch (err) {
      if (err instanceof ApiNotConfiguredError) {
        setStats(null);
      }
      // ApiServerError / ApiNetworkError — просто очищаем графики
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, dispatch]);

  useEffect(() => {
    if (!bootstrapDone) return;
    void reload();
  }, [bootstrapDone, reload]);

  return { stats, loading, reload };
}
