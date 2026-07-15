import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/api-auth';
import { travelBookingSchema } from '@/lib/validators';
import { parseBody } from '@/lib/validators/parse';
import { createTravelBooking, listTravelBookings } from '@/server/packs/travel/travel.service';
import { requireApiPack } from '@/server/packs/require-api-pack';

export async function GET(request: Request) {
  try {
    const auth = await requireApiPack('TRAVEL_AGENCY');
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') ?? undefined;
    const page = Number(searchParams.get('page') ?? 1);

    const data = await listTravelBookings(auth.session.organizationId, { status, page });
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'travel.bookings.GET');
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireApiPack('TRAVEL_AGENCY');
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const parsed = parseBody(travelBookingSchema, body);
    if (!parsed.ok) return parsed.response;

    const booking = await createTravelBooking(auth.session.organizationId, {
      customerId: parsed.data.customerId,
      title: parsed.data.title,
      destination: parsed.data.destination,
      departureDate: parsed.data.departureDate,
      returnDate: parsed.data.returnDate ?? undefined,
      travelersCount: parsed.data.travelersCount ?? 1,
      status: parsed.data.status ?? 'INQUIRY',
      quotedAmount: parsed.data.quotedAmount ?? undefined,
      notes: parsed.data.notes,
      followUpAt: parsed.data.followUpAt ?? undefined,
    });

    return jsonResponse(apiSuccess(booking), 201);
  } catch (error) {
    return handleApiError(error, 'travel.bookings.POST');
  }
}
