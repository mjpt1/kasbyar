# ADR-001: Monorepo Structure

**Status:** Accepted  
**Date:** 2025 (V1 foundation)

## Context

KesbYar نیاز به وب، سرویس AI، پکیج‌های مشترک فارسی/RTL، و schema واحد دارد.

## Decision

npm workspaces با ساختار:

- `apps/web` — Next.js 15
- `apps/ai-service` — FastAPI
- `packages/shared` — جلالی، billing، packs، demo، audit constants
- `packages/ui` — DataTable
- `packages/config` — tsconfig/eslint/prettier
- `prisma/` — schema مرکزی

`packages/core`/`types`/`utils` جدا نشد؛ منطق مشترک در `shared` متمرکز است.

## Consequences

- import از `@kesbyar/shared` در web و seed
- یک `prisma generate` در root
- CI یک‌پارچه با `npm run ci`

## Residual risks

- رشد `shared` بدون مرز — در صورت نیاز split در post-V1

## Related

- [ADR-012](./012-vertical-pack-extension.md) — packs in shared
- [ADR-015](./015-application-ai-split.md) — web vs ai-service boundaries
- [index.md](./index.md)
