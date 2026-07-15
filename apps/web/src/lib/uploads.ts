import path from 'node:path';

/** MIME types allowed for business attachments in V1 */
export const ALLOWED_UPLOAD_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'text/plain',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream', // generic fallback when browser sends empty type
]);

export function getUploadDir(): string {
  const dir = process.env.UPLOAD_DIR ?? './uploads';
  return path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir);
}

export function getMaxUploadBytes(): number {
  const mb = Number(process.env.MAX_UPLOAD_SIZE_MB ?? 10);
  return mb * 1024 * 1024;
}

/** Strip path segments and risky characters from stored file names */
export function sanitizeStorageFileName(originalName: string): string {
  const base = path.basename(originalName).replace(/[^\w.\-آ-ی\s]/gi, '_');
  const collapsed = base.replace(/\.{2,}/g, '.').trim();
  if (!collapsed || collapsed === '.' || collapsed === '..') {
    return `file-${Date.now()}`;
  }
  return collapsed.slice(0, 200);
}

export function buildUniqueStorageFileName(originalName: string): string {
  return `${Date.now()}-${sanitizeStorageFileName(originalName)}`;
}

export function assertAllowedUploadMime(mimeType: string): void {
  const normalized = mimeType.toLowerCase().split(';')[0]?.trim() ?? '';
  if (!normalized || !ALLOWED_UPLOAD_MIME_TYPES.has(normalized)) {
    throw new Error(
      'نوع فایل مجاز نیست. فرمت‌های پذیرفته‌شده: PDF، تصویر، Word، Excel، CSV و متن ساده',
    );
  }
}

/** Ensure a stored path cannot escape the organization's upload directory */
export function assertStoragePathInOrg(storagePath: string, organizationId: string): void {
  const uploadRoot = path.resolve(getUploadDir());
  const orgRoot = path.resolve(path.join(uploadRoot, organizationId));
  const resolved = path.resolve(storagePath);

  const underOrg =
    resolved === orgRoot ||
    resolved.startsWith(orgRoot + path.sep);

  if (!underOrg) {
    throw new Error('مسیر فایل نامعتبر است');
  }
}
