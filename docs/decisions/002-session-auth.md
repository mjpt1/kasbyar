# ADR-002: Session Auth Model

**Status:** Accepted

## Context

محصول B2B چند سازمانی با نقش‌های OWNER/ADMIN/MANAGER/STAFF.

## Decision

- Session token در کوکی httpOnly (`SESSION_COOKIE`)
- سازمان فعال در کوکی جدا (`kesbyar_org`)
- `prisma.session` با expiry
- `requireSession()` در server components و API routes
- bcrypt برای hash رمز

ورود: `/api/auth/login` — خروج: `/api/auth/logout`  
انتخاب workspace: `/workspace/select`

## Consequences

- stateful sessions (نه JWT client-side)
- هر درخواست server-side session + org resolve می‌شود
- `SESSION_SECRET` در production الزامی (≥۱۶ کاراکتر)

## Residual risks

- session fixation — mitigated با token تصادفی per login
- کوکی بدون `Secure` در dev — production باید HTTPS + Secure cookie داشته باشد
