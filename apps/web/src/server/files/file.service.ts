import type { FileEntityType } from '@prisma/client';

import { getMaxUploadBytes, assertAllowedUploadMime, buildUniqueStorageFileName, assertStoragePathInOrg } from '@/lib/uploads';
import { APP_LOG_EVENTS, logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/server/audit/audit.service';
import { assertAttachmentEntityInOrg } from '@/server/tenant/tenant-scope';
import { getFileStorageAdapter } from '@/server/files/storage.adapter';

export async function listFileAttachments(
  organizationId: string,
  params?: { entityType?: FileEntityType; entityId?: string },
) {
  return prisma.fileAttachment.findMany({
    where: {
      organizationId,
      ...(params?.entityType ? { entityType: params.entityType } : {}),
      ...(params?.entityId ? { entityId: params.entityId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

export async function getFileAttachment(organizationId: string, id: string) {
  return prisma.fileAttachment.findFirst({
    where: { id, organizationId },
  });
}

export async function createFileAttachment(
  organizationId: string,
  userId: string,
  data: {
    entityType: FileEntityType;
    entityId: string;
    file: File;
  },
) {
  const maxBytes = getMaxUploadBytes();
  if (data.file.size > maxBytes) {
    throw new Error(`حجم فایل بیش از ${Math.round(maxBytes / 1024 / 1024)} مگابایت است`);
  }

  const mimeType = data.file.type || 'application/octet-stream';
  try {
    assertAllowedUploadMime(mimeType);
  } catch (err) {
    logger.warn(APP_LOG_EVENTS.FILE_UPLOAD_REJECTED, {
      organizationId,
      userId,
      reason: err instanceof Error ? err.message : 'mime_rejected',
      mimeType,
    });
    throw err;
  }

  await assertAttachmentEntityInOrg(organizationId, data.entityType, data.entityId);

  const uniqueName = buildUniqueStorageFileName(data.file.name);
  const buffer = Buffer.from(await data.file.arrayBuffer());
  const storage = getFileStorageAdapter();
  const storagePath = (
    await storage.write({
      organizationId,
      fileName: uniqueName,
      bytes: buffer,
      mimeType,
    })
  ).storagePath;

  const attachment = await prisma.fileAttachment.create({
    data: {
      organizationId,
      entityType: data.entityType,
      entityId: data.entityId,
      fileName: data.file.name,
      mimeType,
      sizeBytes: data.file.size,
      storagePath,
      uploadedById: userId,
    },
  });

  await logActivity({
    organizationId,
    userId,
    type: 'SYSTEM',
    title: 'فایل پیوست شد',
    description: data.file.name,
    ...(data.entityType === 'CUSTOMER' ? { customerId: data.entityId } : {}),
    ...(data.entityType === 'LEAD' ? { leadId: data.entityId } : {}),
    ...(data.entityType === 'INVOICE' ? { invoiceId: data.entityId } : {}),
    ...(data.entityType === 'TASK' ? { taskId: data.entityId } : {}),
  });

  return attachment;
}

export async function deleteFileAttachment(organizationId: string, id: string) {
  const file = await getFileAttachment(organizationId, id);
  if (!file) return null;

  assertStoragePathInOrg(file.storagePath, organizationId);
  await getFileStorageAdapter().remove(file.storagePath);

  await prisma.fileAttachment.delete({ where: { id } });
  return file;
}
