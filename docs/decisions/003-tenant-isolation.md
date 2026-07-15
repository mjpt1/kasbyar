# ADR-003: Tenant Isolation

**Status:** Accepted

## Context

داده چند سازمانی نباید در API یا query نشت کند.

## Decision

1. همه service functions اولین آرگومان `organizationId` از session
2. `tenant-scope.ts`: اعتبارسنجی FK قبل از create/update (customer، invoice، payment، lead، task، file)
3. `ACTIVE_RECORD_FILTER` (`deletedAt: null`) برای بایگانی نرم
4. بدون Prisma middleware سراسری — انضباط در لایه service

## Consequences

- هر route جدید باید `requireSession()` + pass orgId
- cross-tenant ID در URL → 404/not found

## Residual risks

- فراموشی scope در route جدید — mitigated با tests در `tenant-scope.test.ts` و code review
- raw SQL آینده باید org filter داشته باشد
