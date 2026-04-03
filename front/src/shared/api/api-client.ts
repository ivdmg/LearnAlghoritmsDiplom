import { getApiBaseUrl } from '@/shared/config/api-url';

export class ApiNotConfiguredError extends Error {
  constructor() {
    super('API не настроен');
    this.name = 'ApiNotConfiguredError';
  }
}

export async function apiFetch(
  path: string,
  options: RequestInit & { accessToken?: string | null } = {},
): Promise<Response> {
  const base = getApiBaseUrl();
  if (!base) throw new ApiNotConfiguredError();

  const headers = new Headers(options.headers);
  if (options.accessToken) {
    headers.set('Authorization', `Bearer ${options.accessToken}`);
  }
  if (
    options.body != null &&
    typeof options.body === 'string' &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`${base}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });
}
