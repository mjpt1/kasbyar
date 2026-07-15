import { readFile } from 'node:fs/promises';

import { errorResponse } from '@/lib/api-response';
import { isApiError, requireApiSession } from '@/lib/api-auth';
import { assertStoragePathInOrg } from '@/lib/uploads';
import { getFileAttachment } from '@/server/files/file.service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  const { id } = await params;
  const file = await getFileAttachment(session.organizationId, id);
  if (!file) return errorResponse('فایل یافت نشد', 404, 'NOT_FOUND');

  try {
    assertStoragePathInOrg(file.storagePath, session.organizationId);
    const buffer = await readFile(file.storagePath);
    return new Response(buffer, {
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(file.fileName)}"`,
        'Content-Length': String(file.sizeBytes),
      },
    });
  } catch {
    return errorResponse('فایل در دیسک یافت نشد', 404, 'NOT_FOUND');
  }
}
