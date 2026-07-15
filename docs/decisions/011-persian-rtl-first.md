# ADR-011: Persian-First and RTL-First Product Stance

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2025 (V1 foundation) |
| **Domains** | product, architecture |

## Context

KesbYar targets Iranian SMBs. English-first or LTR-default SaaS patterns create friction: Jalali dates, Toman/Rial formatting, RTL navigation, and natural Farsi copy are product requirements—not localization afterthoughts.

Alternatives considered: i18n framework with `fa` as one locale among many; English admin with Farsi skin. Rejected for V1 scope: adds abstraction without second locale roadmap.

## Decision

1. **Primary UI language:** Persian (Farsi) for all user-facing strings in V1
2. **Layout default:** RTL (`dir="rtl"`) on app shell; LTR only where data requires it (email, phone, URLs, codes)
3. **Shared formatting in `@kesbyar/shared`:**
   - Jalali dates (`jalali.ts`)
   - Currency/number formatting for Iran (`format.ts`)
4. **Error and empty states:** Persian messages; API errors via `handleApiError` in Farsi
5. **No English-first dev shortcuts** in shipped UI (internal code/comments may be English)
6. **Future i18n:** if added post-V1, `fa` remains default locale; structure should not assume LTR

## Consequences

- New pages must be reviewed for RTL (sidebar, tables, forms, modals)
- Date pickers and reports use Jalali unless explicitly Gregorian for compliance
- QA checklist includes RTL + copy review ([quality/review-checklists.md](../quality/review-checklists.md))
- Third-party widgets must be RTL-safe or wrapped

## Related

- [POLISH_PRINCIPLES.md](../POLISH_PRINCIPLES.md)
- [ADR-012](./012-vertical-pack-extension.md) — pack UI also RTL Persian
- Code: `packages/shared/src/jalali.ts`, `packages/shared/src/format.ts`

## Residual risks

- Mixed-direction bugs in complex tables/charts — manual QA still required
- AI assistant responses may mix English technical terms — acceptable if user-facing shell is Persian
- No automated RTL regression tests in CI yet
