import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import {
  handleApiError,
  isApiError,
  requireApiRole,
  requireApiSession,
} from '@/lib/api-auth';
import { moadianSubmitSchema } from '@/lib/validators';
import { parseBody } from '@/lib/validators/parse';
import {
  getMoadianModeForOrg,
  markMoadianSubmitted,
  prepareInvoiceForMoadian,
  updateMoadianOutcome,
} from '@/server/moadian/moadian.service';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const { id } = await context.params;

    const result = await prepareInvoiceForMoadian(session.organizationId, id);
    return jsonResponse(
      apiSuccess({
        readiness: result.readiness,
        payload: result.payload,
        mode: result.mode,
        moadianStatus: result.invoice.moadianStatus,
        modeLabelFa:
          result.mode === 'intermediary'
            ? 'ارسال از طریق واسط پیکربندی‌شده در تنظیمات سازمان'
            : 'حالت خروجی/بارگذاری دستی (بدون اتصال مستقیم به سازمان امور مالیاتی)',
      }),
    );
  } catch (error) {
    return handleApiError(error, 'invoices.moadian.GET');
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const denied = requireApiRole(session, 'MANAGER');
    if (denied) return denied;

    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const parsed = parseBody(moadianSubmitSchema, body);
    if (!parsed.ok) return parsed.response;

    const mode = await getMoadianModeForOrg(session.organizationId);

    if (parsed.data.outcome) {
      await updateMoadianOutcome(
        session.organizationId,
        id,
        parsed.data.outcome,
        parsed.data.errorMessage,
      );
      return jsonResponse(apiSuccess({ ok: true, mode }));
    }

    // Ensure prepared
    await prepareInvoiceForMoadian(session.organizationId, id);
    const invoice = await markMoadianSubmitted(session.organizationId, id, {
      manualUpload: parsed.data.manualUpload ?? true,
      uid: parsed.data.uid,
      taxId: parsed.data.taxId,
    });

    return jsonResponse(
      apiSuccess({
        invoice,
        mode,
        noticeFa:
          mode === 'intermediary'
            ? 'برای واسط پیکربندی‌شده در تنظیمات سازمان ارسال شد'
            : 'وضعیت «ارسال‌شده» یعنی خروجی آماده/بارگذاری دستی ثبت شد — برای ارسال زنده، URL و کلید واسط را در تنظیمات وارد کنید (اتصال مستقیم به سازمان امور مالیاتی نیست)',
      }),
    );
  } catch (error) {
    if (error instanceof Error) return errorResponse(error.message, 400);
    return handleApiError(error, 'invoices.moadian.POST');
  }
}
