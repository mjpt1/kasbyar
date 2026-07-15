import fs from 'node:fs/promises';
import path from 'node:path';

import {
  PROVIDER_IDS,
  resolveProviderId,
  type FileStorageAdapter,
  type FileStorageWriteRequest,
} from '@kesbyar/shared';

import { getUploadDir, sanitizeStorageFileName } from '@/lib/uploads';

class LocalFileStorageAdapter implements FileStorageAdapter {
  readonly id = PROVIDER_IDS.STORAGE_LOCAL;

  async write({ organizationId, fileName, bytes }: FileStorageWriteRequest) {
    const safeFileName = sanitizeStorageFileName(fileName);
    const orgDir = path.join(getUploadDir(), organizationId);
    const storagePath = path.join(orgDir, safeFileName);
    const resolvedOrg = path.resolve(orgDir);
    const resolvedPath = path.resolve(storagePath);
    if (
      resolvedPath !== resolvedOrg &&
      !resolvedPath.startsWith(resolvedOrg + path.sep)
    ) {
      throw new Error('مسیر ذخیره‌سازی فایل نامعتبر است');
    }
    await fs.mkdir(orgDir, { recursive: true });
    await fs.writeFile(resolvedPath, bytes);
    return { storagePath: resolvedPath };
  }

  async remove(storagePath: string) {
    try {
      await fs.unlink(storagePath);
    } catch {
      // فایل فیزیکی ممکن است قبلاً حذف شده باشد
    }
  }
}

let cached: FileStorageAdapter | null = null;

const ALLOWED_STORAGE_PROVIDERS = [PROVIDER_IDS.STORAGE_LOCAL, PROVIDER_IDS.STORAGE_S3] as const;

export function getFileStorageAdapter(): FileStorageAdapter {
  if (!cached) {
    const id = resolveProviderId(
      null,
      process.env.STORAGE_PROVIDER,
      PROVIDER_IDS.STORAGE_LOCAL,
      ALLOWED_STORAGE_PROVIDERS,
    );
    if (id === PROVIDER_IDS.STORAGE_S3) {
      // post-V1: S3FileStorageAdapter
      cached = new LocalFileStorageAdapter();
    } else {
      cached = new LocalFileStorageAdapter();
    }
  }
  return cached;
}

/** @deprecated use FileStorageAdapter from @kesbyar/shared */
export type { FileStorageAdapter };
