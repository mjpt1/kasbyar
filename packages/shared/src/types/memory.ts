export type MemorySourceType =
  | 'FILE'
  | 'NOTE'
  | 'INVOICE'
  | 'CONTRACT'
  | 'MEETING'
  | 'MESSAGE'
  | 'MANUAL';

export type MemoryDocumentStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED';

export interface MemoryCitation {
  documentId: string;
  chunkId: string;
  title: string;
  excerpt: string;
  sourceType: MemorySourceType;
  sourceId?: string | null;
}

export interface MemorySearchRequest {
  query: string;
  limit?: number;
  sourceType?: MemorySourceType;
}

export interface MemorySearchResult {
  citations: MemoryCitation[];
  total: number;
}

export interface MemoryIngestRequest {
  sourceType: MemorySourceType;
  sourceId?: string;
  title: string;
  mimeType?: string;
  storagePath?: string;
  rawText?: string;
}

export interface MemoryTimelineEntry {
  id: string;
  type: string;
  title: string;
  summary: string;
  occurredAt: string;
  entityType?: string;
  entityId?: string;
}
