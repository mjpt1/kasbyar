import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { z } from 'zod';
import { parseBody } from '@/lib/validators/parse';
import { ingestMemoryDocument } from '@/server/memory/memory.ingest';

const ingestSchema = z.object({
  sourceType: z.enum(['FILE', 'NOTE', 'INVOICE', 'CONTRACT', 'MEETING', 'MESSAGE', 'MANUAL']),
  sourceId: z.string().optional(),
  title: z.string().min(1),
  mimeType: z.string().optional(),
  storagePath: z.string().optional(),
  rawText: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const body = await request.json();
    const parsed = parseBody(ingestSchema, body);
    if (!parsed.ok) return parsed.response;

    const doc = await ingestMemoryDocument(
      session.organizationId,
      session.user.id,
      parsed.data,
    );

    return jsonResponse(apiSuccess(doc));
  } catch (error) {
    return handleApiError(error, 'memory.ingest.POST');
  }
}
