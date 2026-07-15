# Threat and Abuse Paths — KesbYar

مدل تهدید **عملی** برای محصول B2B فارسی‌اول — نه تئوری enterprise. هر مسیر به کد یا runbook لینک دارد.

---

## 1. دسته‌بندی مهاجم / سوءاستفاده‌کننده

| دسته | انگیزه | واقع‌بینانه برای V1؟ |
|------|--------|----------------------|
| **کاربر هم‌سازمان مخرب** | دیدن/تغییر داده colleagues | بله — RBAC اصلی |
| **کاربر org دیگر (IDOR)** | دسترسی به invoice/customer رقیب | بله — tenant scope اصلی |
| **مهاجم خارجی بدون حساب** | brute login، API scrape | متوسط — session required |
| **مهاجم با حساب دمو** | abuse reset، spam API | بله در محیط demo |
| **اپراتور / deploy اشتباه** | `ALLOW_SEED` در prod | بله — پرریسک |
| **Prompt injection به AI** | استخراج context یا social eng. | متوسط — read-only AI |

**خارج از scope V1:** nation-state، supply-chain npm پیشرفته، DDoS لایه ۷ (فقط توصیه ingress).

---

## 2. مسیرهای سوءاستفاده — Auth & Session

| مسیر | سناریو | Impact | Mitigation فعلی | Gap |
|------|---------|--------|-------------------|-----|
| A1 | Brute-force `/api/auth/login` | account takeover | پیام خطای عمومی | rate limit در app نیست — **ingress** |
| A2 | Session cookie theft (XSS) | hijack session | httpOnly cookie | CSP hardening partial |
| A3 | Manipulate `kesbyar_org` cookie | cross-org access | membership validated server-side | — |
| A4 | Inactive user / expired session | stale access | `expiresAt` + `isActive` | — |

**Manual test:** login org A؛ عوض کردن cookie org B → باید reject یا org معتبر user.

---

## 3. Tenant isolation

| مسیر | سناریو | Impact | Mitigation | Gap |
|------|---------|--------|------------|-----|
| T1 | Guess UUID در `/api/invoices/[id]` | read/write cross-org | `organizationId` in query | new routes must follow |
| T2 | POST payment با `invoiceId` org دیگر | financial mis-attachment | `tenant-scope` | extend for new FKs |
| T3 | List بدون org filter | mass leak | service discipline | no global middleware |
| T4 | Soft-deleted record access | stale data | `ACTIVE_RECORD_FILTER` | per-entity coverage |
| T5 | Audit log another org | compliance breach | `listAuditEvents(orgId)` | — |

**Manual test:** [tenant-safety-checklist.md](./tenant-safety-checklist.md)

---

## 4. File upload / import

| مسیر | سناریو | Impact | Mitigation | Gap |
|------|---------|--------|------------|-----|
| U1 | فایل بسیار بزرگ | DoS disk/memory | `MAX_UPLOAD_SIZE_MB` | — |
| U2 | Path traversal در نام فایل | read/write خارج org dir | `sanitizeStorageFileName` + path resolve check | verify in code |
| U3 | Upload به entity دیگر org | attach malware to victim record | `assertAttachmentEntityInOrg` | — |
| U4 | MIME مخرب (executable) | malware hosting | MIME allowlist | no AV scan V1 |
| U5 | Download فایل با path دستکاری‌شده در DB | arbitrary file read | path must stay under org root | DB integrity assumed |

---

## 5. AI assistant

| مسیر | سناریو | Impact | Mitigation | Gap |
|------|---------|--------|------------|-----|
| AI1 | Prompt: «همه مشتریان را export کن» | exfil via response | context bounded؛ no export tool | user may copy text |
| AI2 | Prompt injection in customer notes reflected in context | manipulate answer | context size limits | not fully sanitized |
| AI3 | Call FastAPI without token | free inference abuse | `AI_SERVICE_TOKEN` | network ACL prod |
| AI4 | AI triggers payment/invoice | financial fraud | **not implemented** — read/summarize only | keep disabled |
| AI5 | FREE plan uses assistant | plan abuse | `assertFeature('aiAssistant')` on conversation | summary route must match |

**اصل:** AI هیچ mutation مستقیم روی DB ندارد — [ADR-015](../decisions/015-application-ai-split.md).

---

## 6. Billing / plan abuse

| مسیر | سناریو | Impact | Mitigation | Gap |
|------|---------|--------|------------|-----|
| B1 | Staff upgrades to ENTERPRISE | revenue loss | `canManageBilling` role gate | manual provider — no payment |
| B2 | Client-side hide only for locked feature | API bypass | `assertFeature` server-side | audit all routes |
| B3 | Quota exhaustion automation | DoS internal | `assertQuota` on automation | not all features metered |

---

## 7. Demo / admin misuse

| مسیر | سناریو | Impact | Mitigation | Gap |
|------|---------|--------|-----|-----|
| D1 | `POST /api/demo/reset` in production | wipe prod data | `canResetDemoData()` + guards | misconfig ALLOW_SEED |
| D2 | Demo user accesses real org | data leak | demo users only in seed slugs | — |
| D3 | Staff views audit | privacy | ADMIN+ only | — |
| D4 | Quick-login on prod marketing site | weak creds exposed | `NEXT_PUBLIC_DEMO_MODE` intentional | turn off in prod |

---

## 8. Secrets & env misconfiguration

| مسیر | سناریو | Impact | Mitigation | Gap |
|------|---------|--------|------------|-----|
| E1 | Commit `.env` | full compromise | `.gitignore` | review PR |
| E2 | Weak `SESSION_SECRET` | forge sessions | min 16 chars； prod required | startup validation |
| E3 | `ALLOW_SEED=true` in prod | reseed wipe | destructive-guard | ops checklist |
| E4 | Error logs contain PII | leak via log aggregator | audit sanitize； logger redact | manual log review |
| E5 | `AI_SERVICE_TOKEN` default in prod | AI abuse | env required in prod config | document |

---

## 9. Destructive operations

| مسیر | Impact | Guard |
|------|--------|-------|
| `db:reseed` / `db:reset` | total data loss | `requireDestructiveDbAllowed` |
| `db:restore` | overwrite DB | `CONFIRM_RESTORE` / `ALLOW_RESTORE` |
| `db:migrate:deploy` | schema break | `CONFIRM_MIGRATE_DEPLOY` |
| Invoice cancel / customer archive | business data loss | UI confirm؛ soft delete |

---

## 10. Production vs staging

| Control | Staging | Production |
|---------|---------|------------|
| `ALLOW_SEED` | often `true` | **must be false** |
| `DEMO_MODE` | optional for sales | usually false |
| `SESSION_SECRET` | can be dev-like | strong unique |
| Rate limiting | relaxed | ingress/WAF |
| HTTPS / Secure cookie | optional | required |
| Backup before migrate | recommended | **required** |

---

## 11. اولویت بازبینی (ROI)

1. Tenant IDOR on invoices/customers/payments  
2. Demo reset / seed in production  
3. Upload path + entity ownership  
4. AI entitlement bypass on any route  
5. Billing change without role check  
6. Missing audit on sensitive mutation  

---

## 12. مستندات مرتبط

- [review-gate.md](./review-gate.md)
- [assumptions-residual-risks.md](./assumptions-residual-risks.md)
- [SECURITY_REVIEW.md](../SECURITY_REVIEW.md)
