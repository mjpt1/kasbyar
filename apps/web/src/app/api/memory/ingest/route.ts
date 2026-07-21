import { z } from 'zod';

import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiRole, requireApiSession } from '@/lib/api-auth';
import { memoryIngestSchema } from '@/lib/validators';
import { parseBody } from '@/lib/validators/parse';
import { ingestMemoryDocument } from '@/server/memory/memory.ingest';

const ingestSchema = memoryIngestSchema.extend({
  storagePath: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const denied = requireApiRole(session, 'STAFF');
    if (denied) return denied;

    const body = await request.json();
    const parsed = parseBody(ingestSchema, body);
    if (!parsed.ok) return parsed.response;

    const doc = await ingestMemoryDocument(session.organizationId, session.user.id, {
      ...parsed.data,
      sourceType: parsed.data.sourceType ?? 'NOTE',
    });

    return jsonResponse(apiSuccess(doc));
  } catch (error) {
    return handleApiError(error, 'memory.ingest.POST');
  }
}
