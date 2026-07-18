import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/api-auth';
import { createPrintOrder, listPrintOrders } from '@/server/packs/printing/printing.service';
import { requireApiPack } from '@/server/packs/require-api-pack';

export async function GET(request: Request) {
  try {
    const auth = await requireApiPack('PRINTING');
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') ?? undefined;
    const page = Number(searchParams.get('page') ?? 1);

    const data = await listPrintOrders(auth.session.organizationId, { status, page });
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'printing.GET');
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiPack('PRINTING');
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

    const item = await createPrintOrder(auth.session.organizationId, {
      customerId: body.customerId,
      title: body.title,
      quantity: body.quantity ?? 1,
      status: body.status ?? 'PLANNED',
      dueAt: body.dueAt ? new Date(body.dueAt) : undefined,
      totalAmount: body.totalAmount,
      notes: body.notes,
    });

    return jsonResponse(apiSuccess(item), 201);
  } catch (error) {
    return handleApiError(error, 'printing.POST');
  }
}
