import type { ApiError, ApiSuccess } from '@platform/shared';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

function getCsrfToken() {
  const match = document.cookie.match(/(?:^|; )csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1] ?? '') : '';
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = init.method?.toUpperCase() ?? 'GET';
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body && !(init.body instanceof FormData))
    headers.set('Content-Type', 'application/json');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrf = getCsrfToken();
    if (csrf) headers.set('X-CSRF-Token', csrf);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });
  const payload = (await response.json()) as ApiSuccess<T> | ApiError;
  if (!response.ok || !payload.ok) {
    const error = payload as ApiError;
    throw new ApiClientError(
      error.error?.message ?? 'The request could not be completed.',
      error.error?.code ?? 'REQUEST_FAILED',
      response.status,
      error.error?.fieldErrors,
    );
  }
  return (payload as ApiSuccess<T>).data;
}
