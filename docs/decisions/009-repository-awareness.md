# ADR-009: Repository Awareness Layer

**Status:** Accepted  
**Date:** 2026-07

## Context

مخزن V1 کامل است. ریسک اصلی توسعه آینده: rewrite ناخواسته، architecture churn، و شکستن tenant/auth/billing.

## Decision

لایه مستندات engineering اضافه شد:

- `docs/repository-audit.md` — ممیزی و risk map
- `docs/architecture/current-state-map.md` — نقشه وضعیت فعلی
- `docs/engineering/*` — conventions، safe extension، change impact، phase entry
- `docs/engineering/templates/new-module-checklist.md` — قالب ماژول جدید

قوانین:
- extend > refactor > rewrite
- change-impact checklist قبل از merge معنی‌دار
- ADR برای تصمیم‌های major (ادامه `docs/decisions/`)

## Consequences

- contributor جدید مسیر امن دارد
- PRها باید impact را explicit کنند
- ARCHITECTURE.md packs به‌روز شد (دیگر «آینده» نیست)

## Residual risks

- چک‌لیست‌ها خودکار enforce نمی‌شوند — نیاز به review انسانی
- نام پوشه `BizPilot` vs `kesbyar` هنوز rename نشده (عمدی — کم‌ریسک)
