import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import {
  exportCustomersCsv,
  exportInvoicesCsv,
  exportLeadsCsv,
} from '@/server/export/csv-export.service';

export const dynamic = 'force-dynamic';

type Entity = 'customers' | 'leads' | 'invoices';

const FILENAMES: Record<Entity, string> = {
  customers: 'customers',
  leads: 'leads',
  invoices: 'invoices',
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ entity: string }> },
) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const { entity: raw } = await context.params;
    if (raw !== 'customers' && raw !== 'leads' && raw !== 'invoices') {
      return new Response(JSON.stringify({ success: false, error: { message: 'موجودیت نامعتبر' } }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const entity = raw as Entity;

    let csv: string;
    if (entity === 'customers') {
      csv = await exportCustomersCsv(session.organizationId);
    } else if (entity === 'leads') {
      csv = await exportLeadsCsv(session.organizationId);
    } else {
      csv = await exportInvoicesCsv(session.organizationId);
    }

    const filename = `${FILENAMES[entity]}-${new Date().toISOString().slice(0, 10)}.csv`;
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return handleApiError(error, 'export.GET');
  }
}
