import type { AssistantAskResponse } from '@kesbyar/shared/ai';

import {
  askAssistant,
  fetchOperationalSummary,
  getAiHealth,
} from '@/lib/ai';
import { APP_LOG_EVENTS, METRIC_EVENTS, logger, recordMetric } from '@/lib/logger';

import {
  buildLocalAssistantAnswer,
  buildLocalOperationalSummary,
} from './local-fallback';
import { buildOperationalContext } from './operational-context';

export { buildLocalOperationalSummary, buildLocalAssistantAnswer } from './local-fallback';

export async function getOperationalInsight(organizationId: string) {
  const context = await buildOperationalContext(organizationId);
  const aiResult = await fetchOperationalSummary({ organization_id: organizationId, context });

  if (aiResult.ok) {
    return {
      ...aiResult.data,
      source: 'ai-service' as const,
      degraded: false,
    };
  }

  logger.warn(APP_LOG_EVENTS.INTELLIGENCE_SUMMARY_FALLBACK, {
    organizationId,
    error: aiResult.error.message,
  });
  recordMetric(METRIC_EVENTS.ASSISTANT_FALLBACK, { organizationId, source: 'web' });

  const local = buildLocalOperationalSummary(context);
  return {
    ...local,
    source: 'local-fallback' as const,
    degraded: true,
  };
}

export async function askBusinessAssistant(
  organizationId: string,
  question: string,
): Promise<AssistantAskResponse> {
  const context = await buildOperationalContext(organizationId);
  const aiResult = await askAssistant({
    organization_id: organizationId,
    question,
    context,
  });

  if (aiResult.ok) {
    return aiResult.data;
  }

  logger.warn(APP_LOG_EVENTS.INTELLIGENCE_ASSISTANT_FALLBACK, {
    organizationId,
    error: aiResult.error.message,
  });
  recordMetric(METRIC_EVENTS.ASSISTANT_FALLBACK, { organizationId, source: 'web' });

  return buildLocalAssistantAnswer(question, context);
}

export async function getIntelligenceServiceStatus() {
  const health = await getAiHealth();
  if (!health.ok) {
    return { status: 'unavailable' as const, version: 'unknown', latencyMs: 0 };
  }
  return health.data;
}
