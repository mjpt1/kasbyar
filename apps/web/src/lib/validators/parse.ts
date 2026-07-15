import type { ZodSchema } from 'zod';

import { zodErrorResponse } from '@/lib/api-response';

export function parseBody<T>(schema: ZodSchema<T>, body: unknown) {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return { ok: false as const, response: zodErrorResponse(parsed.error) };
  }
  return { ok: true as const, data: parsed.data };
}

export const paginationQuerySchema = {
  parse(searchParams: URLSearchParams) {
    const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1);
    const rawSize = Number(searchParams.get('pageSize') ?? 20) || 20;
    const pageSize = Math.min(100, Math.max(1, rawSize));
    const search = searchParams.get('search')?.trim() || undefined;
    const status = searchParams.get('status')?.trim() || undefined;
    return { page, pageSize, search, status };
  },
};
