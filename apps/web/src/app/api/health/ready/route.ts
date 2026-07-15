import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { getAiHealth } from '@/lib/ai';
import { prisma } from '@/lib/prisma';

/** Readiness — DB (+ optional AI) available. Use for orchestration startup probes. */
export async function GET() {
  const checks: Record<string, string> = {
    database: 'unknown',
    ai_service: 'skipped',
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    checks.database = 'failed';
    return jsonResponse(
      apiSuccess({
        status: 'not_ready',
        service: 'kesbyar-web',
        probe: 'readiness',
        checks,
      }),
      503,
    );
  }

  if (process.env.AI_SERVICE_URL) {
    const ai = await getAiHealth();
    if (ai.ok && ai.data.status === 'ok') {
      checks.ai_service = 'ok';
    } else if (ai.ok && ai.data.status === 'unavailable') {
      checks.ai_service = 'degraded';
    } else {
      checks.ai_service = 'unavailable';
    }
  }

  const ready = checks.database === 'ok';
  const status = ready ? 'ready' : 'not_ready';

  return jsonResponse(
    apiSuccess({
      status,
      service: 'kesbyar-web',
      probe: 'readiness',
      checks,
    }),
    ready ? 200 : 503,
  );
}
