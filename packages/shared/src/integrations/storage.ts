/**
 * File storage adapter contract — normalized paths at boundary.
 */
import type { ProviderId } from './categories';
import type { IntegrationFailure } from './errors';

export interface FileStorageWriteRequest {
  organizationId: string;
  fileName: string;
  bytes: Uint8Array;
  mimeType?: string;
}

export interface FileStorageWriteResult {
  /** Opaque storage key/path — interpreted only by adapter */
  storagePath: string;
}

export interface FileStorageAdapter {
  readonly id: ProviderId | string;
  write(params: FileStorageWriteRequest): Promise<FileStorageWriteResult>;
  remove(storagePath: string): Promise<void>;
  /** Optional signed URL for download — post-V1 cloud */
  getReadUrl?(storagePath: string, expiresInSeconds?: number): Promise<string | null>;
}

export type FileStorageOutcome =
  | { ok: true; result: FileStorageWriteResult }
  | { ok: false; failure: IntegrationFailure };
