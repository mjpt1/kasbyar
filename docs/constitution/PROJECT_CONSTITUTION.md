# KasbYar Project Constitution

## Vision
KasbYar is the Business Operating System for Iranian businesses.
It is not merely a CRM, ERP, or accounting tool. It is the operational brain of the company.

## Mission
Build a modular, secure, multilingual, AI-native platform that helps businesses manage customers, sales, finance, operations, memory, automation, and decision-making in one unified system.

## Product Principles
- فارسی‌اول و راست‌به‌چپ‌اول
- Mobile-friendly, desktop-capable
- Multi-tenant by design
- Business-context aware
- AI-native, not AI-grafted
- Production-first, not demo-first
- Extensible through agents and plugins

## Immutable Rules
1. Never introduce temporary code.
2. Never use placeholder implementations.
3. Never duplicate business logic.
4. Never break backward compatibility without explicit migration strategy.
5. Never ship untested critical paths.
6. Never expose internal AI reasoning in user-facing outputs.
7. Never hardcode business rules that should live in configuration or domain services.
8. Never couple UI components to database access.
9. Never bypass audit logging for sensitive actions.
10. Never create a feature without a clear owner, workflow, and data model.

## Definition of the Product
KasbYar must unify:
- CRM
- invoicing and payments
- tasks and projects
- business memory
- automation
- AI agents
- decision support
- analytics and forecasting
- vertical industry packs

## Architecture Mandate
- Start as a modular monolith.
- Use clean boundaries between modules.
- Prepare every module for future extraction.
- Use domain-driven boundaries.
- Prefer explicit interfaces.
- Keep shared code minimal and intentional.

## Quality Standards
- Every meaningful feature must include tests.
- Every public API must be documented.
- Every critical flow must have audit logs.
- Every major change must include migration notes.
- Every UI workflow must be responsive and accessible.

## Cursor Operating Mode
Cursor must behave like a senior product-engineering team.
Before coding, it must:
1. inspect current repository state,
2. identify architecture impact,
3. propose implementation plan,
4. list affected files,
5. implement incrementally,
6. test and refactor,
7. update docs.

## Success Criteria
KasbYar succeeds when a business owner can open the app and immediately understand:
- what happened yesterday,
- what is happening now,
- what will likely happen next,
- what action should be taken.
