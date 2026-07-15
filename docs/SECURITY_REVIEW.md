# Security Review Gate — KesbYar V1

> **نسخه کامل:** [security/README.md](./security/README.md) — review gate، threat model، tenant checklist، assumptions.

بازبینی امنیتی فازهای مرتبط با auth، upload، billing، AI، admin، tenant access.

**آخرین بازبینی:** پس از پیاده‌سازی لایه `docs/security/`

---

## Quick links

| سند | کاربرد |
|-----|--------|
| [security/review-gate.md](./security/review-gate.md) | دروازه بازبینی ۸ سؤالی |
| [security/threat-abuse-paths.md](./security/threat-abuse-paths.md) | مسیرهای سوءاستفاده |
| [security/tenant-safety-checklist.md](./security/tenant-safety-checklist.md) | چک‌لیست tenant |
| [security/assumptions-residual-risks.md](./security/assumptions-residual-risks.md) | فرض‌ها و ریسک باقی‌مانده |
| [templates/sensitive-change-review.md](./templates/sensitive-change-review.md) | قالب PR |

---

## 1. Auth & Session

| مسیر سوءاستفاده | ریسک | mitigation |
|-----------------|------|------------|
| Brute-force login | متوسط | rate limit در ingress (توصیه prod)؛ پیام خطای عمومی |
| Session hijack | متوسط | httpOnly cookie؛ SESSION_SECRET قوی در prod |
| Cross-org access via cookie | بالا | org از membership validate می‌شود |
| Inactive user session | پایین | `isActive` + `expiresAt` check |

**Residual:** Secure/SameSite cookie flags در production — [ADR-002](./decisions/002-session-auth.md)

---

## 2. Tenant Data Access

| مسیر سوءاستفاده | ریسک | mitigation |
|-----------------|------|------------|
| IDOR (invoice/customer by UUID) | بالا | `organizationId` در every query |
| FK injection | بالا | `tenant-scope.ts` |
| Soft-deleted data leak | متوسط | `ACTIVE_RECORD_FILTER` |

**Tests:** `tenant-scope.test.ts` — **Checklist:** [tenant-safety-checklist.md](./security/tenant-safety-checklist.md)

---

## 3. File Upload

| مسیر سوءاستفاده | ریسک | mitigation |
|-----------------|------|------------|
| Oversized upload | متوسط | `MAX_UPLOAD_SIZE_MB` |
| Path traversal | بالا | `sanitizeStorageFileName` + org path resolve check |
| Upload به entity دیگر org | بالا | `assertAttachmentEntityInOrg` |
| Executable MIME | متوسط | MIME allowlist در `lib/uploads.ts` |

---

## 4. Billing & Admin

| مسیر سوءاستفاده | ریسک | mitigation |
|-----------------|------|------------|
| Self-upgrade بدون پرداخت | پایین | manual provider؛ `canManageBilling` |
| Demo reset در production | بالا | `canResetDemoData()` + ADMIN + env guards |
| Audit log tampering | متوسط | append-only؛ ADMIN+ read |

---

## 5. AI Actions

| مسیر سوءاستفاده | ریسک | mitigation |
|-----------------|------|------------|
| Prompt injection | متوسط | context bounded؛ no DB write from AI |
| Token bypass | بالا | `AI_SERVICE_TOKEN` |
| Plan bypass | متوسط | `assertFeature('aiAssistant')` on AI routes |

---

## 6. Destructive Operations

| عملیات | محافظ |
|--------|--------|
| db:reseed / reset | `destructive-guard.ts` |
| db:restore | `CONFIRM_RESTORE` + `ALLOW_RESTORE` |
| db:migrate:deploy | `CONFIRM_MIGRATE_DEPLOY` |

---

## 7. Data Leakage Vectors

| بردار | وضعیت |
|-------|--------|
| Error stack به client | عمومی فارسی |
| Health endpoint | بدون secret |
| Logger sensitive fields | redact در `lib/logger.ts` |
| `.env` commit | .gitignore |

---

## Manual Verification (Security Smoke)

- [ ] ورود org A — invoice org B با URL → 404
- [ ] staff نمی‌تواند audit ببیند (ADMIN+)
- [ ] demo reset در production بدون ALLOW_SEED → blocked
- [ ] آپلود فایل > MAX → خطا
- [ ] MIME غیرمجاز → خطا
- [ ] AI summary/assistant بدون plan → upgrade error
- [ ] AI بدون token → 401/503

---

## مستندات مرتبط

- [DATA_SAFETY.md](./DATA_SAFETY.md)
- [decisions/](./decisions/)
- [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md)
