import type {
  AiHealthStatus,
  AnalyticsHelperRequest,
  AnalyticsHelperResponse,
  AssistantAskRequest,
  AssistantAskResponse,
  DocumentParseRequest,
  DocumentParseResponse,
  OperationalSummaryRequest,
  OperationalSummaryResponse,
} from '@kesbyar/shared/ai';

import { getAiServiceConfig } from './config';
import { AiServiceError, AiTimeoutError, AiUnavailableError } from './errors';

export type AiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: AiServiceError };

function authHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Internal-Token': token,
    Authorization: `Bearer ${token}`,
  };
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AiTimeoutError();
    }
    throw new AiUnavailableError();
  } finally {
    clearTimeout(timer);
  }
}

async function requestJson<T>(
  path: string,
  init: RequestInit,
): Promise<AiResult<T>> {
  const config = getAiServiceConfig();
  let lastError: AiServiceError = new AiUnavailableError();

  for (let attempt = 0; attempt <= config.retries; attempt += 1) {
    try {
      const res = await fetchWithTimeout(
        `${config.baseUrl}${path}`,
        {
          ...init,
          headers: { ...authHeaders(config.token), ...init.headers },
          cache: 'no-store',
        },
        config.timeoutMs,
      );

      if (!res.ok) {
        let message = 'خطا در ارتباط با سرویس هوشمند';
        try {
          const body = (await res.json()) as { detail?: string; message?: string };
          message = body.detail ?? body.message ?? message;
        } catch {
          // ignore parse errors
        }
        lastError = new AiServiceError(message, 'AI_HTTP_ERROR', res.status);
        if (res.status >= 500 && attempt < config.retries) continue;
        return { ok: false, error: lastError };
      }

      const data = (await res.json()) as T;
      return { ok: true, data };
    } catch (error) {
      if (error instanceof AiServiceError) {
        lastError = error;
        if (attempt < config.retries) continue;
        return { ok: false, error: lastError };
      }
      lastError = new AiUnavailableError();
      if (attempt < config.retries) continue;
      return { ok: false, error: lastError };
    }
  }

  return { ok: false, error: lastError };
}

export async function getAiHealth(): Promise<AiResult<AiHealthStatus>> {
  const config = getAiServiceConfig();
  const started = Date.now();

  try {
    const res = await fetchWithTimeout(
      `${config.baseUrl}/health`,
      { method: 'GET', cache: 'no-store' },
      config.timeoutMs,
    );
    if (!res.ok) {
      return {
        ok: true,
        data: {
          status: 'degraded',
          service: 'kesbyar-ai',
          version: 'unknown',
          latencyMs: Date.now() - started,
        },
      };
    }
    const body = (await res.json()) as {
      status: string;
      service: string;
      version: string;
    };
    return {
      ok: true,
      data: {
        status: body.status === 'ok' ? 'ok' : 'degraded',
        service: body.service,
        version: body.version,
        latencyMs: Date.now() - started,
      },
    };
  } catch {
    return {
      ok: true,
      data: {
        status: 'unavailable',
        service: 'kesbyar-ai',
        version: 'unknown',
        latencyMs: Date.now() - started,
      },
    };
  }
}

export async function fetchOperationalSummary(
  payload: OperationalSummaryRequest,
): Promise<AiResult<OperationalSummaryResponse>> {
  return requestJson<OperationalSummaryResponse>('/api/v1/summary/operational', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function askAssistant(
  payload: AssistantAskRequest,
): Promise<AiResult<AssistantAskResponse>> {
  return requestJson<AssistantAskResponse>('/api/v1/assistant/ask', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function parseDocument(
  payload: DocumentParseRequest,
): Promise<AiResult<DocumentParseResponse>> {
  return requestJson<DocumentParseResponse>('/api/v1/documents/parse', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchAnalyticsHelper(
  payload: AnalyticsHelperRequest,
): Promise<AiResult<AnalyticsHelperResponse>> {
  return requestJson<AnalyticsHelperResponse>('/api/v1/analytics/helper', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** سازگاری با کد قبلی */
export async function askInsight(
  request: { organization_id: string; question: string; context?: Record<string, unknown> },
): Promise<AssistantAskResponse | null> {
  const snapshot = request.context as AssistantAskRequest['context'] | undefined;
  if (!snapshot || typeof snapshot.today_sales !== 'number') {
    return null;
  }
  const result = await askAssistant({
    organization_id: request.organization_id,
    question: request.question,
    context: snapshot,
  });
  return result.ok ? result.data : null;
}

export async function checkAiServiceHealth(): Promise<boolean> {
  const health = await getAiHealth();
  return health.ok && health.data.status === 'ok';
}
