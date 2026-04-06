import { getApiBaseUrl } from '@/shared/config/api-url';

export class ApiNotConfiguredError extends Error {
  constructor() {
    super('API не настроен');
    this.name = 'ApiNotConfiguredError';
  }
}

export class ApiServerError extends Error {
  public readonly status: number;
  constructor(status: number) {
    super('Сервер недоступен');
    this.name = 'ApiServerError';
    this.status = status;
  }
}

export class ApiNetworkError extends Error {
  constructor() {
    super('Проверьте соединение');
    this.name = 'ApiNetworkError';
  }
}

/**
 * Централизованный wrapper для вызовов API.
 * - Network error → ApiNetworkError
 * - 5xx → ApiServerError
 * - Остальное (401, 400, 422 и т.д.) → Response для обработки вызывающим
 *
 * 401 НЕ бросает ошибку — это ожидаемый ответ (например, при истёкшем access token),
 * вызывающий сам решает: refresh-ить или logout.
 */
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

  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch {
    throw new ApiNetworkError();
  }

  if (response.status >= 500) {
    throw new ApiServerError(response.status);
  }

  return response;
}
