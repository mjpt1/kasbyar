import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { listUserWorkspaces } from '@/server/workspace/workspace.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const workspaces = await listUserWorkspaces(session.user.id);

    return jsonResponse(
      apiSuccess({
        session,
        workspaces,
      }),
    );
  } catch (error) {
    return handleApiError(error, 'auth.session.GET');
  }
}
