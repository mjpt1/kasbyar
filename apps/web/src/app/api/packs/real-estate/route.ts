import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/api-auth';
import {
  createPropertyListing,
  createPropertyShowing,
  listPropertyListings,
  listPropertyShowings,
} from '@/server/packs/real-estate/real-estate.service';
import { requireApiPack } from '@/server/packs/require-api-pack';

export async function GET(request: Request) {
  try {
    const auth = await requireApiPack('REAL_ESTATE');
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') ?? 'listings';
    const page = Number(searchParams.get('page') ?? 1);

    if (mode === 'showings') {
      const data = await listPropertyShowings(auth.session.organizationId, { page });
      return jsonResponse(apiSuccess(data));
    }

    const status = searchParams.get('status') ?? undefined;
    const data = await listPropertyListings(auth.session.organizationId, { status, page });
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'real-estate.GET');
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiPack('REAL_ESTATE');
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const mode = body.mode ?? 'listing';

    if (mode === 'showing') {
      if (!body.listingId || !body.customerId || !body.scheduledAt) {
        return jsonResponse(
          {
            success: false,
            error: { code: 'VALIDATION', message: 'listingId, customerId, scheduledAt الزامی است' },
          },
          400,
        );
      }
      const showing = await createPropertyShowing(auth.session.organizationId, {
        listingId: body.listingId,
        customerId: body.customerId,
        scheduledAt: new Date(body.scheduledAt),
        notes: body.notes,
      });
      return jsonResponse(apiSuccess(showing), 201);
    }

    if (!body.title || body.price == null) {
      return jsonResponse(
        { success: false, error: { code: 'VALIDATION', message: 'title و price الزامی است' } },
        400,
      );
    }

    const listing = await createPropertyListing(auth.session.organizationId, {
      title: body.title,
      address: body.address,
      listingType: body.listingType ?? 'SALE',
      status: body.status ?? 'AVAILABLE',
      price: body.price,
      areaSqm: body.areaSqm,
      bedrooms: body.bedrooms,
      notes: body.notes,
    });

    return jsonResponse(apiSuccess(listing), 201);
  } catch (error) {
    return handleApiError(error, 'real-estate.POST');
  }
}
