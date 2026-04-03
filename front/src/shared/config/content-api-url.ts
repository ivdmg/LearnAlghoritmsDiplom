/**
 * API контента (json-server + db.json): статьи и полные задачи с тестами.
 *
 * - В dev по умолчанию `/content-api` — прокси в vite.config → localhost:3001 (без CORS).
 * - В production-сборке по умолчанию `http://localhost:3001` (или задайте URL в env).
 * - Пустая строка VITE_CONTENT_API_URL = не ходить в API, только статика (TASKS/THEORIES).
 */
export function getContentApiBaseUrl(): string | null {
  const raw = import.meta.env.VITE_CONTENT_API_URL as string | undefined;
  if (raw === '') return null;
  const s = raw?.trim();
  if (s !== undefined && s !== '') {
    return s.replace(/\/$/, '');
  }
  if (import.meta.env.DEV) {
    return '/content-api';
  }
  return 'http://localhost:3001';
}
