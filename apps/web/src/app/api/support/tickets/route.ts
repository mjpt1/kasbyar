import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { parseBody } from '@/lib/validators/parse';
import { supportTicketSchema, ticketMessageSchema } from '@/lib/validators/chat-support';
import {
  addOrgTicketMessage,
  createTicket,
  getOrgTicket,
  listOrgTickets,
} from '@/server/support/support-ticket.service';

export async function GET(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      const ticket = await getOrgTicket(session.organizationId, session.user.id, id);
      return jsonResponse(apiSuccess(ticket));
    }

    const tickets = await listOrgTickets(session.organizationId, session.user.id);
    return jsonResponse(apiSuccess(tickets));
  } catch (error) {
    return handleApiError(error, 'support.tickets.GET');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const body = await request.json();
    const parsed = parseBody(supportTicketSchema, body);
    if (!parsed.ok) return parsed.response;

    const ticket = await createTicket(session.organizationId, session.user.id, parsed.data);
    return jsonResponse(apiSuccess(ticket), 201);
  } catch (error) {
    return handleApiError(error, 'support.tickets.POST');
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const body = await request.json();
    const ticketId = body.ticketId as string | undefined;
    if (!ticketId) {
      return errorResponse('شناسه تیکت الزامی است', 400);
    }

    const parsed = parseBody(ticketMessageSchema, body);
    if (!parsed.ok) return parsed.response;

    const message = await addOrgTicketMessage(
      session.organizationId,
      session.user.id,
      ticketId,
      parsed.data.body,
    );
    return jsonResponse(apiSuccess(message), 201);
  } catch (error) {
    return handleApiError(error, 'support.tickets.PATCH');
  }
}
