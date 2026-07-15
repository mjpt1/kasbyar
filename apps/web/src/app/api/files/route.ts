import { readFile } from 'node:fs/promises';

import type { FileEntityType } from '@prisma/client';

import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { isApiError, requireApiSession } from '@/lib/api-auth';
import { fileUploadMetaSchema } from '@/lib/validators';
import {
  createFileAttachment,
  deleteFileAttachment,
  listFileAttachments,
} from '@/server/files/file.service';

export async function GET(request: Request) {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  const { searchParams } = new URL(request.url);
  const entityType = searchParams.get('entityType') as FileEntityType | null;
  const entityId = searchParams.get('entityId') ?? undefined;

  const files = await listFileAttachments(session.organizationId, {
    ...(entityType ? { entityType } : {}),
    ...(entityId ? { entityId } : {}),
  });

  return jsonResponse(apiSuccess(files));
}

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  const formData = await request.formData();
  const file = formData.get('file');
  const entityType = formData.get('entityType');
  const entityId = formData.get('entityId');

  const parsed = fileUploadMetaSchema.safeParse({
    entityType,
    entityId,
  });

  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message ?? 'متادیتای نامعتبر', 400);
  }

  if (!(file instanceof File) || file.size === 0) {
    return errorResponse('فایل الزامی است', 400);
  }

  try {
    const attachment = await createFileAttachment(
      session.organizationId,
      session.user.id,
      {
        entityType: parsed.data.entityType,
        entityId: parsed.data.entityId,
        file,
      },
    );
    return jsonResponse(apiSuccess(attachment), 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'آپلود ناموفق بود';
    return errorResponse(message, 400);
  }
}

export async function DELETE(request: Request) {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return errorResponse('شناسه فایل الزامی است', 400);

  const deleted = await deleteFileAttachment(session.organizationId, id);
  if (!deleted) return errorResponse('فایل یافت نشد', 404, 'NOT_FOUND');

  return jsonResponse(apiSuccess({ deleted: true }));
}
