import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  assertAllowedUploadMime,
  assertStoragePathInOrg,
  buildUniqueStorageFileName,
  sanitizeStorageFileName,
} from '@/lib/uploads';

describe('upload security helpers', () => {
  it('sanitizes path traversal in file names', () => {
    expect(sanitizeStorageFileName('../../etc/passwd')).toBe('passwd');
    expect(sanitizeStorageFileName('..')).toMatch(/^file-/);
  });

  it('builds unique storage names', () => {
    const name = buildUniqueStorageFileName('invoice.pdf');
    expect(name).toMatch(/^\d+-invoice\.pdf$/);
  });

  it('allows common business MIME types', () => {
    expect(() => assertAllowedUploadMime('application/pdf')).not.toThrow();
    expect(() => assertAllowedUploadMime('image/jpeg')).not.toThrow();
  });

  it('rejects disallowed MIME types', () => {
    expect(() => assertAllowedUploadMime('application/x-msdownload')).toThrow(
      /نوع فایل مجاز نیست/,
    );
  });

  it('assertStoragePathInOrg blocks escape from org directory', () => {
    const uploadRoot = path.resolve(process.cwd(), 'uploads-test');
    const orgId = 'org-1';
    const orgRoot = path.join(uploadRoot, orgId);
    const valid = path.join(orgRoot, 'file.pdf');
    const invalid = path.join(uploadRoot, 'org-2', 'secret.pdf');

    process.env.UPLOAD_DIR = uploadRoot;

    expect(() => assertStoragePathInOrg(valid, orgId)).not.toThrow();
    expect(() => assertStoragePathInOrg(invalid, orgId)).toThrow(/مسیر فایل نامعتبر/);

    delete process.env.UPLOAD_DIR;
  });
});
