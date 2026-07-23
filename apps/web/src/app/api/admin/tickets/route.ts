import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiPlatformAdmin } from '@/lib/api-auth';
import { parseBody } from '@/lib/validators/parse';
import { ticketMessageSchema, ticketStatusSchema } from '@/lib/validators/chat-support';
import {
  adminReplyToTicket,
  adminUpdateTicketStatus,
  getTicketForAdmin,
  listAllTicketsForAdmin,
} from '@/server/support/support-ticket.service';

export async function GET(request: Request) {
  try {
    const session = await requireApiPlatformAdmin();
    if (session instanceof Response) return session;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      const ticket = await getTicketForAdmin(id);
      return jsonResponse(apiSuccess(ticket));
    }

    const status = searchParams.get('status') as
      | 'OPEN'
      | 'IN_PROGRESS'
      | 'RESOLVED'
      | 'CLOSED'
      | null;
    const page = Number(searchParams.get('page') ?? '1');
    const data = await listAllTicketsForAdmin({
      status: status ?? undefined,
      page: Number.isFinite(page) ? page : 1,
    });
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'admin.tickets.GET');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApiPlatformAdmin();
    if (session instanceof Response) return session;

    const body = await request.json();
    const ticketId = body.ticketId as string | undefined;
    if (!ticketId) {
      return errorResponse('شناسه تیکت الزامی است', 400);
    }

    if (body.action === 'status') {
      const parsed = parseBody(ticketStatusSchema, body);
      if (!parsed.ok) return parsed.response;
      const updated = await adminUpdateTicketStatus(ticketId, parsed.data.status);
      return jsonResponse(apiSuccess(updated));
    }

    const parsed = parseBody(ticketMessageSchema, body);
    if (!parsed.ok) return parsed.response;

    const message = await adminReplyToTicket(
      session.user.id,
      ticketId,
      parsed.data.body,
      body.status,
    );
    return jsonResponse(apiSuccess(message), 201);
  } catch (error) {
    return handleApiError(error, 'admin.tickets.POST');
  }
}
