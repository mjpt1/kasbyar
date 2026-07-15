import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/api-auth';
import { stockMovementSchema } from '@/lib/validators';
import { parseBody } from '@/lib/validators/parse';
import {
  createStockMovement,
  listRetailProducts,
  listStockMovements,
} from '@/server/packs/retail/retail.service';
import { requireApiPack } from '@/server/packs/require-api-pack';

export async function GET(request: Request) {
  try {
    const auth = await requireApiPack('RETAIL');
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');
    const page = Number(searchParams.get('page') ?? 1);

    if (mode === 'movements') {
      const productId = searchParams.get('productId') ?? undefined;
      const data = await listStockMovements(auth.session.organizationId, { productId, page });
      return jsonResponse(apiSuccess(data));
    }

    const search = searchParams.get('search') ?? undefined;
    const lowStockOnly = searchParams.get('lowStock') === '1';
    const data = await listRetailProducts(auth.session.organizationId, {
      search,
      lowStockOnly,
      page,
    });
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'retail.GET');
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiPack('RETAIL');
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const parsed = parseBody(stockMovementSchema, body);
    if (!parsed.ok) return parsed.response;

    const movement = await createStockMovement(auth.session.organizationId, parsed.data);
    if (!movement) {
      return jsonResponse(
        { success: false, error: { code: 'NOT_FOUND', message: 'محصول یافت نشد' } },
        404,
      );
    }

    return jsonResponse(apiSuccess(movement), 201);
  } catch (error) {
    return handleApiError(error, 'retail.POST');
  }
}
