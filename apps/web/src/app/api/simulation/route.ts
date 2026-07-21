import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiRole, requireApiSession } from '@/lib/api-auth';
import { simulationSchema } from '@/lib/validators';
import { parseBody } from '@/lib/validators/parse';
import { listSimulations, runSimulation } from '@/server/simulation/simulation.service';

export async function GET() {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const denied = requireApiRole(session, 'STAFF');
    if (denied) return denied;
    return jsonResponse(apiSuccess(await listSimulations(session.organizationId)));
  } catch (error) {
    return handleApiError(error, 'simulation.GET');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const denied = requireApiRole(session, 'STAFF');
    if (denied) return denied;
    const body = await request.json();
    const parsed = parseBody(simulationSchema, body);
    if (!parsed.ok) return parsed.response;
    const result = await runSimulation(
      session.organizationId,
      parsed.data.scenario,
      parsed.data.variables,
    );
    return jsonResponse(apiSuccess(result));
  } catch (error) {
    return handleApiError(error, 'simulation.POST');
  }
}
