/** Без VITE_API_URL приложение работает как раньше: без ЛК и синхронизации прогресса. */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  if (raw == null || String(raw).trim() === '') return '';
  return String(raw).replace(/\/$/, '');
}

export function isApiConfigured(): boolean {
  return getApiBaseUrl().length > 0;
}
