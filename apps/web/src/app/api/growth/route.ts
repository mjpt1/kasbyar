import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiRole, requireApiSession } from '@/lib/api-auth';
import {
  competitorSchema,
  contentDraftSchema,
  marketSignalSchema,
  seoTaskSchema,
} from '@/lib/validators';
import { parseBody } from '@/lib/validators/parse';
import {
  captureCompetitorSnapshot,
  createContentDraft,
  createSeoTask,
  ingestMarketSignal,
  listCompetitorSnapshots,
  listContentDrafts,
  listMarketSignals,
  listSeoTasks,
  markSeoStep,
} from '@/server/growth/growth.service';
import { z } from 'zod';

export async function GET(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const denied = requireApiRole(session, 'STAFF');
    if (denied) return denied;
    const type = new URL(request.url).searchParams.get('type') ?? 'competitors';
    if (type === 'market') {
      return jsonResponse(apiSuccess(await listMarketSignals(session.organizationId)));
    }
    if (type === 'content') {
      return jsonResponse(apiSuccess(await listContentDrafts(session.organizationId)));
    }
    if (type === 'seo') {
      return jsonResponse(apiSuccess(await listSeoTasks(session.organizationId)));
    }
    return jsonResponse(apiSuccess(await listCompetitorSnapshots(session.organizationId)));
  } catch (error) {
    return handleApiError(error, 'growth.GET');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const denied = requireApiRole(session, 'STAFF');
    if (denied) return denied;
    const body = await request.json();
    const type = body.type as string;

    if (type === 'competitor') {
      const parsed = parseBody(competitorSchema, body);
      if (!parsed.ok) return parsed.response;
      const row = await captureCompetitorSnapshot(
        session.organizationId,
        parsed.data.competitorName,
        {
          ...(parsed.data.data ?? {}),
          url: parsed.data.url || undefined,
          notes: parsed.data.notes,
        },
      );
      return jsonResponse(apiSuccess(row));
    }
    if (type === 'market') {
      const parsed = parseBody(marketSignalSchema, body);
      if (!parsed.ok) return parsed.response;
      const row = await ingestMarketSignal(session.organizationId, parsed.data);
      return jsonResponse(apiSuccess(row));
    }
    if (type === 'content') {
      const parsed = parseBody(contentDraftSchema, body);
      if (!parsed.ok) return parsed.response;
      const row = await createContentDraft(session.organizationId, parsed.data);
      return jsonResponse(apiSuccess(row));
    }
    if (type === 'seo') {
      const parsed = parseBody(seoTaskSchema, body);
      if (!parsed.ok) return parsed.response;
      const row = await createSeoTask(
        session.organizationId,
        parsed.data.keyword,
        parsed.data.topic,
      );
      return jsonResponse(apiSuccess(row));
    }
    if (type === 'seo-step') {
      const stepSchema = z.object({
        type: z.literal('seo-step'),
        taskId: z.string().min(1),
        step: z.string().min(1),
        status: z.enum(['pending', 'done', 'skipped']).optional(),
      });
      const parsed = parseBody(stepSchema, body);
      if (!parsed.ok) return parsed.response;
      const row = await markSeoStep(
        session.organizationId,
        parsed.data.taskId,
        parsed.data.step,
        parsed.data.status,
      );
      return jsonResponse(apiSuccess(row));
    }

    return jsonResponse(
      { success: false, error: { code: 'INVALID_TYPE', message: 'نوع نامعتبر' } },
      400,
    );
  } catch (error) {
    return handleApiError(error, 'growth.POST');
  }
}
