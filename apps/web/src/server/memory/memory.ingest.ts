import type { MemoryIngestRequest, MemorySourceType } from '@kesbyar/shared';

import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';
import { logAudit } from '@/server/audit/audit.service';
import { publishDomainEvent } from '@/server/events/domain-event.service';

import { chunkText } from './memory.chunk';
import { embedTexts } from './memory.embed';

export async function ingestMemoryDocument(
  organizationId: string,
  userId: string,
  input: MemoryIngestRequest,
) {
  const doc = await prisma.memoryDocument.create({
    data: {
      organizationId,
      sourceType: input.sourceType as MemorySourceType,
      sourceId: input.sourceId,
      title: input.title,
      mimeType: input.mimeType,
      storagePath: input.storagePath,
      rawText: input.rawText,
      status: 'PROCESSING',
    },
  });

  try {
    const text = input.rawText?.trim() ?? '';
    const chunks = chunkText(text);
    const embeddings = chunks.length > 0 ? await embedTexts(chunks) : null;

    if (chunks.length > 0) {
      await prisma.memoryChunk.createMany({
        data: chunks.map((content, index) => ({
          documentId: doc.id,
          content,
          chunkIndex: index,
          embedding: embeddings?.[index] ?? undefined,
          metadata: { sourceType: input.sourceType, sourceId: input.sourceId },
        })),
      });
    }

    const updated = await prisma.memoryDocument.update({
      where: { id: doc.id },
      data: {
        status: chunks.length > 0 ? 'READY' : 'FAILED',
        processedAt: new Date(),
      },
    });

    await publishDomainEvent({
      organizationId,
      eventType: 'MEMORY_INGESTED',
      entityType: 'MemoryDocument',
      entityId: doc.id,
      payload: { title: input.title, chunkCount: chunks.length },
    });

    await logAudit({
      organizationId,
      userId,
      action: 'MEMORY_INGEST',
      entityType: 'MemoryDocument',
      entityId: doc.id,
      metadata: { sourceType: input.sourceType, chunkCount: chunks.length },
    });

    return updated;
  } catch (error) {
    await prisma.memoryDocument.update({
      where: { id: doc.id },
      data: { status: 'FAILED' },
    });
    throw error;
  }
}

export async function ingestFromNote(organizationId: string, userId: string, noteId: string) {
  const note = await prisma.note.findFirst({
    where: { id: noteId, organizationId },
  });
  if (!note) throw new NotFoundError('یادداشت یافت نشد');

  return ingestMemoryDocument(organizationId, userId, {
    sourceType: 'NOTE',
    sourceId: note.id,
    title: note.title ?? `یادداشت ${note.id.slice(0, 6)}`,
    rawText: note.content,
  });
}
