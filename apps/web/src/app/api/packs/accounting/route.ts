import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/api-auth';
import { createAccountingMatter, listAccountingMatters } from '@/server/packs/accounting/accounting.service';
import { requireApiPack } from '@/server/packs/require-api-pack';

export async function GET(request: Request) {
  try {
    const auth = await requireApiPack('ACCOUNTING_FIRM');
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') ?? undefined;
    const page = Number(searchParams.get('page') ?? 1);

    const data = await listAccountingMatters(auth.session.organizationId, { status, page });
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'accounting.GET');
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiPack('ACCOUNTING_FIRM');
    if (auth instanceof Response) return auth;

    const body = await request.json();
    if (!body.customerId || !body.title) {
      return jsonResponse(
        {
          success: false,
          error: { code: 'VALIDATION', message: 'customerId و title الزامی است' },
        },
        400,
      );
    }

    const item = await createAccountingMatter(auth.session.organizationId, {
      customerId: body.customerId,
      title: body.title,
      status: body.status ?? 'OPEN',
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      notes: body.notes,
    });

    return jsonResponse(apiSuccess(item), 201);
  } catch (error) {
    return handleApiError(error, 'accounting.POST');
  }
}
