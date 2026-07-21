import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiRole, requireApiSession } from '@/lib/api-auth';
import { meetingCreateSchema, meetingTranscriptSchema } from '@/lib/validators';
import { parseBody } from '@/lib/validators/parse';
import {
  createMeeting,
  getMeeting,
  listMeetings,
  processMeetingTranscript,
} from '@/server/meetings/meeting.service';

export async function GET(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const denied = requireApiRole(session, 'STAFF');
    if (denied) return denied;
    const id = new URL(request.url).searchParams.get('id');
    if (id) {
      const meeting = await getMeeting(session.organizationId, id);
      if (!meeting) {
        return jsonResponse(
          { success: false, error: { code: 'NOT_FOUND', message: 'جلسه یافت نشد' } },
          404,
        );
      }
      return jsonResponse(apiSuccess(meeting));
    }
    return jsonResponse(apiSuccess(await listMeetings(session.organizationId)));
  } catch (error) {
    return handleApiError(error, 'meetings.GET');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const denied = requireApiRole(session, 'STAFF');
    if (denied) return denied;
    const body = await request.json();

    if (body.meetingId && body.transcript && !body.title) {
      const parsed = parseBody(meetingTranscriptSchema, body);
      if (!parsed.ok) return parsed.response;
      const transcript = await processMeetingTranscript(
        session.organizationId,
        session.user.id,
        parsed.data.meetingId,
        parsed.data.transcript,
      );
      return jsonResponse(apiSuccess({ transcript }));
    }

    const parsed = parseBody(meetingCreateSchema, body);
    if (!parsed.ok) return parsed.response;

    const meeting = await createMeeting(session.organizationId, session.user.id, parsed.data);

    if (parsed.data.transcript) {
      const transcript = await processMeetingTranscript(
        session.organizationId,
        session.user.id,
        meeting.id,
        parsed.data.transcript,
      );
      return jsonResponse(apiSuccess({ meeting, transcript }));
    }

    return jsonResponse(apiSuccess({ meeting }));
  } catch (error) {
    return handleApiError(error, 'meetings.POST');
  }
}
