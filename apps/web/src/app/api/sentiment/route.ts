import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { sentimentAnalyzeSchema } from '@/lib/validators';
import { parseBody } from '@/lib/validators/parse';
import {
  analyzeCustomerSentiment,
  analyzeFollowUpLogs,
  getSentimentSummary,
  listSentiments,
} from '@/server/sentiment/sentiment.service';

export async function GET(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const action = new URL(request.url).searchParams.get('action');
    if (action === 'summary') {
      return jsonResponse(apiSuccess(await getSentimentSummary(session.organizationId)));
    }
    return jsonResponse(apiSuccess(await listSentiments(session.organizationId)));
  } catch (error) {
    return handleApiError(error, 'sentiment.GET');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const body = await request.json();

    if (body.action === 'scan-followups') {
      const rows = await analyzeFollowUpLogs(session.organizationId);
      return jsonResponse(apiSuccess(rows));
    }

    const parsed = parseBody(sentimentAnalyzeSchema, body);
    if (!parsed.ok) return parsed.response;
    const row = await analyzeCustomerSentiment(
      session.organizationId,
      parsed.data.customerId,
      parsed.data.content,
      parsed.data.sourceType,
      parsed.data.sourceId,
    );
    return jsonResponse(apiSuccess(row));
  } catch (error) {
    return handleApiError(error, 'sentiment.POST');
  }
}
