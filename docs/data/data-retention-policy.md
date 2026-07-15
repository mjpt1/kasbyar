# Data Retention Policy — KesbYar

**وضعیت:** V1 operational policy  
**مالک:** Product + Engineering + Customer Success  
**مرتبط:** [DATA_SAFETY.md](../DATA_SAFETY.md) · [ADR-014](../decisions/014-audit-data-safety.md)

---

## 1. هدف

تعریف عملی **چه داده‌ای چقدر نگه داشته می‌شود**، **چه کسی دسترسی دارد**، و **چه چیزی قابل حذف است** — قبل از رشد پایلوت و الزامات حقوقی سنگین‌تر.

---

## 2. طبقه‌بندی داده

| کلاس | مثال | حساسیت |
|------|------|--------|
| **A — Tenant business** | مشتری، فاکتور، پرداخت | بالا — مالک tenant |
| **B — Security/audit** | `AuditEvent` | بالا — compliance سبک |
| **C — Operational** | app logs، metrics | متوسط |
| **D — Ephemeral** | مکالمه UI، temp export | پایین |
| **E — Demo** | seed data | پایین — قابل reset |

---

## 3. جدول نگهداری

### Audit logs (`AuditEvent`)

| | |
|--|--|
| **Why retained** | accountability، dispute resolution، security investigation |
| **Who accesses** | OWNER/ADMIN org؛ KesbYar ops با دلیل documented |
| **Retention** | **۳۶ ماه** minimum (product default)؛ extend for enterprise pilot by contract |
| **Deletion** | no casual delete؛ archive/export post-V1 |
| **Must not remove** | payment، subscription، auth، demo reset audit without legal review |

### App logs (stdout / aggregator)

| | |
|--|--|
| **Why retained** | debugging، reliability، security triage |
| **Who accesses** | Engineering، on-call |
| **Retention** | **۳۰–۹۰ روز** (hosting default)؛ PII minimized per [logging-policy](../observability/logging-policy.md) |
| **Deletion** | auto TTL by provider |
| **Must not remove** | incident logs until post-mortem closed |

### Assistant conversations

| | |
|--|--|
| **Why retained** | V1: **not persisted** — UX only per session |
| **Who accesses** | n/a V1 |
| **Retention** | **session-only** (refresh clears) |
| **Future** | if persisted: **۹۰ روز** default + tenant export right |
| **Must not remove** | n/a until persistence ships |

### Imports & temp files

| | |
|--|--|
| **Why retained** | troubleshooting failed imports |
| **Who accesses** | ADMIN + ops |
| **Retention** | temp upload: **۷ روز**؛ error reports: **۳۰ روز** (post-V1 import pipeline) |
| **Deletion** | safe after job complete + user notified |
| **V1** | bulk import not shipped — policy pre-defined |

### Generated exports

| | |
|--|--|
| **Why retained** | user-requested data portability |
| **Who accesses** | requesting user + ADMIN |
| **Retention** | **۷۲ ساعت** download link (future)؛ file deleted after expiry |
| **Deletion** | automatic |
| **V1** | self-service export not shipped |

### Demo data

| | |
|--|--|
| **Why retained** | sales demos، training |
| **Who accesses** | demo env users؛ `DEMO_MODE` guard |
| **Retention** | until `demo reset` or env teardown |
| **Deletion** | `resetDemoEnvironment` — full reseed |
| **Must not remove** | production data via demo APIs — guards in [demo-reset.service](../../apps/web/src/server/demo/demo-reset.service.ts) |

### Archived business entities

| | |
|--|--|
| **Why retained** | business continuity؛ گزارش مالی |
| **Who accesses** | tenant users per RBAC |
| **Retention** | **until tenant requests hard delete** (post-V1) |
| **Deletion** | soft delete (`deletedAt`) V1 — hard delete by ops request only |
| **Must not remove** | PAID invoices / payments without archive policy + audit |

### Failed job records

| | |
|--|--|
| **Why retained** | retry automation / notifications |
| **Who accesses** | ops |
| **Retention** | **۳۰ روز** (future queue) |
| **V1** | `automation.rule.failed` logs only — no DLQ table |

### File attachments (`FileAttachment`)

| | |
|--|--|
| **Why retained** | business records attached to entities |
| **Who accesses** | tenant per entity permissions |
| **Retention** | life of entity + **۳۶ ماه** after entity archive (default) |
| **Deletion** | `deleteFileAttachment` + storage adapter remove |
| **Must not remove** | attachments on non-archived invoices without user action |

### Activity log (`ActivityLog`)

| | |
|--|--|
| **Why retained** | CRM timeline UX |
| **Who accesses** | tenant members |
| **Retention** | **۲۴ ماه** rolling (default)؛ purge job post-V1 |
| **Deletion** | batch purge of old rows — not user-facing delete |

---

## 4. دسترسی (access matrix)

| Data | OWNER | ADMIN | STAFF | KesbYar ops |
|------|-------|-------|-------|-------------|
| Business entities | RW | RW | R limited | support with ticket |
| Audit UI | R | R | — | incident only |
| App logs | — | — | — | yes |
| Demo reset | ADMIN+ | ADMIN+ | — | staging only |

---

## 5. حذف امن

| Action | Allowed when |
|--------|--------------|
| Soft archive customer/lead/invoice | user with permission |
| Hard delete tenant | contract termination + ops runbook (post-V1) |
| DB restore | [BACKUP_RESTORE.md](../BACKUP_RESTORE.md) guards |
| Log purge | TTL / legal hold exception |

**هرگز:** `DELETE FROM` production بدون backup + destructive guards.

---

## 6. فرضیات حقوقی / تجاری (باز)

| موضوع | وضعیت V1 |
|--------|----------|
| GDPR / data residency EU | not claimed — Iran-first pilot |
| Right to erasure | manual ops process — no self-service |
| DPA template | post-pilot legal |
| Tax record retention (فاکتور) | **۷ سال** recommended — tenant responsibility؛ product retains per archive policy |
| Cookie consent analytics | post-V1 analytics vendor |

**Action:** قبل از مشتری enterprise خارج ایران — legal review این بخش.

---

## 7. پیاده‌سازی و automation (roadmap)

| Job | Priority |
|-----|----------|
| Audit export for ADMIN | medium |
| ActivityLog purge > 24mo | low |
| Conversation persistence + TTL | when feature ships |
| Tenant data export ZIP | medium |

---

## 8. Checklist pilot

- [ ] Pilot contract mentions data hosted location
- [ ] `ALLOW_SEED=false` in prod
- [ ] Backup schedule documented
- [ ] Support knows audit retention (36mo)
- [ ] KNOWN_LIMITATIONS shared with pilot
