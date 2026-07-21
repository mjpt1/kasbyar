import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiRole, requireApiSession } from '@/lib/api-auth';
import { memorySearchSchema } from '@/lib/validators';
import { parseBody } from '@/lib/validators/parse';
import { searchMemory } from '@/server/memory/memory.search';
import { z } from 'zod';

const searchSchema = memorySearchSchema.extend({
  sourceType: z
    .enum(['FILE', 'NOTE', 'INVOICE', 'CONTRACT', 'MEETING', 'MESSAGE', 'MANUAL'])
    .optional(),
});

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const denied = requireApiRole(session, 'STAFF');
    if (denied) return denied;

    const body = await request.json();
    const parsed = parseBody(searchSchema, body);
    if (!parsed.ok) return parsed.response;

    const result = await searchMemory(session.organizationId, parsed.data);
    return jsonResponse(apiSuccess(result));
  } catch (error) {
    return handleApiError(error, 'memory.search.POST');
  }
}
