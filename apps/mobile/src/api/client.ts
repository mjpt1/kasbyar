import type { ApiResponse } from '@kesbyar/shared';

import { apiUrl, MOBILE_HEADERS } from '@/config';

export class ApiClientError extends Error {
  code: string;
  status: number;

  constructor(message: string, code = 'ERROR', status = 400) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
  }
}

export type AuthCredentials = {
  token: string;
  organizationId: string | null;
};

async function parseJson<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    return (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError('پاسخ نامعتبر از سرور', 'INVALID_RESPONSE', response.status);
  }
}

export async function apiFetch<T>(
  path: string,
  auth: AuthCredentials | null,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set(MOBILE_HEADERS.client, MOBILE_HEADERS.clientValue);
  if (auth?.token) {
    headers.set('Authorization', `Bearer ${auth.token}`);
  }
  if (auth?.organizationId) {
    headers.set(MOBILE_HEADERS.orgId, auth.organizationId);
  }

  const response = await fetch(apiUrl(path), {
    ...init,
    headers,
  });

  const body = await parseJson<T>(response);
  if (!body.success) {
    throw new ApiClientError(
      body.error.message,
      body.error.code,
      response.status,
    );
  }
  return body.data;
}

export async function apiGet<T>(path: string, auth: AuthCredentials | null): Promise<T> {
  return apiFetch<T>(path, auth, { method: 'GET' });
}

export async function apiPost<T>(
  path: string,
  auth: AuthCredentials | null,
  payload?: unknown,
): Promise<T> {
  return apiFetch<T>(path, auth, {
    method: 'POST',
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
}

export async function apiPatch<T>(
  path: string,
  auth: AuthCredentials | null,
  payload: unknown,
): Promise<T> {
  return apiFetch<T>(path, auth, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function apiDelete<T>(path: string, auth: AuthCredentials | null): Promise<T> {
  return apiFetch<T>(path, auth, { method: 'DELETE' });
}
