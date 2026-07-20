import type { MemoryCitation, MemorySearchRequest, MemoryTimelineEntry } from '@kesbyar/shared';

import { prisma } from '@/lib/prisma';

import { cosineSimilarity } from './memory.chunk';
import { embedTexts } from './memory.embed';

function toCitation(
  chunk: {
    id: string;
    content: string;
    document: { id: string; title: string; sourceType: string; sourceId: string | null };
  },
): MemoryCitation {
  return {
    documentId: chunk.document.id,
    chunkId: chunk.id,
    title: chunk.document.title,
    excerpt: chunk.content.slice(0, 240),
    sourceType: chunk.document.sourceType as MemoryCitation['sourceType'],
    sourceId: chunk.document.sourceId,
  };
}

export async function searchMemory(
  organizationId: string,
  request: MemorySearchRequest,
): Promise<{ citations: MemoryCitation[]; total: number }> {
  const limit = Math.min(request.limit ?? 5, 20);
  const query = request.query.trim();
  if (!query) return { citations: [], total: 0 };

  const chunks = await prisma.memoryChunk.findMany({
    where: {
      document: {
        organizationId,
        status: 'READY',
        ...(request.sourceType ? { sourceType: request.sourceType } : {}),
      },
    },
    include: { document: true },
    take: 500,
  });

  const queryEmbedding = await embedTexts([query]);
  const queryVector = queryEmbedding?.[0];

  let ranked = chunks.map((chunk) => {
    const embedding = chunk.embedding as number[] | null;
    let score = 0;
    if (queryVector && embedding?.length) {
      score = cosineSimilarity(queryVector, embedding);
    } else if (chunk.content.includes(query)) {
      score = 0.5;
    } else {
      const terms = query.split(/\s+/).filter(Boolean);
      const hits = terms.filter((t) => chunk.content.includes(t)).length;
      score = terms.length > 0 ? hits / terms.length * 0.4 : 0;
    }
    return { chunk, score };
  });

  ranked = ranked.filter((r) => r.score > 0).sort((a, b) => b.score - a.score);

  const top = ranked.slice(0, limit).map((r) => toCitation(r.chunk));
  return { citations: top, total: ranked.length };
}

export async function getMemoryTimeline(
  organizationId: string,
  params: { entityType?: string; entityId?: string; limit?: number },
): Promise<MemoryTimelineEntry[]> {
  const limit = params.limit ?? 30;
  const entries: MemoryTimelineEntry[] = [];

  const docs = await prisma.memoryDocument.findMany({
    where: {
      organizationId,
      status: 'READY',
      ...(params.entityType && params.entityId
        ? { sourceType: params.entityType as never, sourceId: params.entityId }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  for (const doc of docs) {
    entries.push({
      id: doc.id,
      type: 'memory',
      title: doc.title,
      summary: doc.rawText?.slice(0, 120) ?? '',
      occurredAt: doc.createdAt.toISOString(),
      entityType: doc.sourceType,
      entityId: doc.sourceId ?? undefined,
    });
  }

  const events = await prisma.domainEvent.findMany({
    where: { organizationId },
    orderBy: { occurredAt: 'desc' },
    take: limit,
  });

  for (const event of events) {
    entries.push({
      id: event.id,
      type: 'event',
      title: event.eventType,
      summary: JSON.stringify(event.payload).slice(0, 120),
      occurredAt: event.occurredAt.toISOString(),
      entityType: event.entityType ?? undefined,
      entityId: event.entityId ?? undefined,
    });
  }

  return entries
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, limit);
}
