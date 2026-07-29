import { NextResponse } from 'next/server';
import { z } from 'zod';

import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/api-auth';
import { parseBody } from '@/lib/validators/parse';
import { requestPortalMagicLink } from '@/server/portal/customer-portal.service';

const schema = z
  .object({
    organizationSlug: z.string().min(2).max(80),
    email: z.string().email().optional(),
    phone: z.string().min(8).max(20).optional(),
  })
  .refine((v) => Boolean(v.email || v.phone), {
    message: 'ایمیل یا شماره موبایل الزامی است',
  });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = parseBody(schema, body);
    if (!parsed.ok) return parsed.response;

    const result = await requestPortalMagicLink(parsed.data);
    return jsonResponse(apiSuccess(result));
  } catch (error) {
    return handleApiError(error, 'portal.magic-link');
  }
}
