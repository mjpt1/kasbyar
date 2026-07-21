import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiRole, requireApiSession } from '@/lib/api-auth';
import {
  agentFeedbackSchema,
  pluginRegisterSchema,
  pluginToggleSchema,
} from '@/lib/validators';
import { parseBody } from '@/lib/validators/parse';
import {
  getLearningInsights,
  listAgentFeedback,
  listPlugins,
  recordAgentFeedback,
  registerPlugin,
  setPluginEnabled,
} from '@/server/platform/platform.service';

export async function GET(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const denied = requireApiRole(session, 'STAFF');
    if (denied) return denied;
    const view = new URL(request.url).searchParams.get('view') ?? 'plugins';
    if (view === 'learning') {
      const [insights, feedback] = await Promise.all([
        getLearningInsights(session.organizationId),
        listAgentFeedback(session.organizationId),
      ]);
      return jsonResponse(apiSuccess({ insights, feedback }));
    }
    const plugins = await listPlugins(session.organizationId);
    return jsonResponse(apiSuccess(plugins));
  } catch (error) {
    return handleApiError(error, 'platform.GET');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const body = await request.json();

    if (body.action === 'feedback') {
      const staffDenied = requireApiRole(session, 'STAFF');
      if (staffDenied) return staffDenied;
      const parsed = parseBody(agentFeedbackSchema, body);
      if (!parsed.ok) return parsed.response;
      const row = await recordAgentFeedback(session.organizationId, {
        userId: session.user.id,
        feedbackType: parsed.data.feedbackType,
        agentType: parsed.data.agentType,
        referenceId: parsed.data.referenceId,
        metadata: parsed.data.metadata,
      });
      return jsonResponse(apiSuccess(row));
    }

    if (body.action === 'toggle') {
      const adminDenied = requireApiRole(session, 'ADMIN');
      if (adminDenied) return adminDenied;
      const parsed = parseBody(pluginToggleSchema, body);
      if (!parsed.ok) return parsed.response;
      const row = await setPluginEnabled(
        session.organizationId,
        parsed.data.pluginId,
        parsed.data.enabled,
      );
      return jsonResponse(apiSuccess(row));
    }

    const adminDenied = requireApiRole(session, 'ADMIN');
    if (adminDenied) return adminDenied;

    const parsed = parseBody(pluginRegisterSchema, body);
    if (!parsed.ok) return parsed.response;
    const plugin = await registerPlugin({
      ...parsed.data,
      manifest: parsed.data.manifest ?? {},
      organizationId: session.organizationId,
    });
    return jsonResponse(apiSuccess(plugin));
  } catch (error) {
    return handleApiError(error, 'platform.POST');
  }
}
