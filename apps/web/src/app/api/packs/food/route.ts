import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/api-auth';
import {
  createFoodOrder,
  createMenuItem,
  listFoodOrders,
  listMenuItems,
} from '@/server/packs/food/food.service';
import { requireApiPack } from '@/server/packs/require-api-pack';

export async function GET(request: Request) {
  try {
    const auth = await requireApiPack('FOOD_SERVICE');
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') ?? 'orders';
    const page = Number(searchParams.get('page') ?? 1);

    if (mode === 'menu') {
      const data = await listMenuItems(auth.session.organizationId, { page });
      return jsonResponse(apiSuccess(data));
    }

    const status = searchParams.get('status') ?? undefined;
    const data = await listFoodOrders(auth.session.organizationId, { status, page });
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'food.GET');
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiPack('FOOD_SERVICE');
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const mode = body.mode ?? 'order';

    if (mode === 'menu') {
      if (!body.name || body.price == null) {
        return jsonResponse(
          { success: false, error: { code: 'VALIDATION', message: 'name و price الزامی است' } },
          400,
        );
      }
      const item = await createMenuItem(auth.session.organizationId, {
        name: body.name,
        price: body.price,
        category: body.category,
        isAvailable: body.isAvailable ?? true,
      });
      return jsonResponse(apiSuccess(item), 201);
    }

    if (body.totalAmount == null) {
      return jsonResponse(
        { success: false, error: { code: 'VALIDATION', message: 'totalAmount الزامی است' } },
        400,
      );
    }

    const order = await createFoodOrder(auth.session.organizationId, {
      customerId: body.customerId,
      tableLabel: body.tableLabel,
      status: body.status ?? 'OPEN',
      totalAmount: body.totalAmount,
      itemsSummary: body.itemsSummary,
    });

    return jsonResponse(apiSuccess(order), 201);
  } catch (error) {
    return handleApiError(error, 'food.POST');
  }
}
