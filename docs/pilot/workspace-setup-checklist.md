# Workspace Setup Checklist — Pilot

**Owner:** Ops / Engineering  
**When:** 24–48 hours before customer onboarding session

---

## Environment

- [ ] Production or dedicated pilot staging URL confirmed
- [ ] `DEMO_MODE=false` on pilot production workspace
- [ ] `ALLOW_SEED=false` in production
- [ ] SSL valid؛ `NEXT_PUBLIC_APP_URL` correct

---

## Organization

- [ ] Organization created (real company name)
- [ ] `industryPack` set (clinic / retail / default)
- [ ] Timezone / locale Persian verified
- [ ] `slug` unique and professional

---

## Subscription

- [ ] Plan set: `BUSINESS` or higher if AI required
- [ ] Trial dates if applicable (`trialEndsAt`)
- [ ] `subscription.service` — verify in `/settings/billing`

---

## Users

- [ ] OWNER account — customer primary contact
- [ ] Optional ADMIN for IT counterpart
- [ ] STAFF demo user only if customer requested
- [ ] Passwords reset / invite flow tested

---

## Data hygiene

- [ ] No demo seed data in pilot org
- [ ] No test customers named "Test"
- [ ] Audit log empty or only setup events

---

## Integrations (V1)

- [ ] `AI_SERVICE_URL` reachable if assistant sold
- [ ] `BILLING_PROVIDER=manual` documented to customer
- [ ] `NOTIFICATION_PROVIDER=noop` — SMS expectations set

---

## Monitoring

- [ ] Health checks green: `/api/health/ready`
- [ ] On-call aware of pilot start date
- [ ] Kill switches documented — all off unless incident

---

## Handoff

- [ ] Workspace URL + ADMIN login method to CS
- [ ] `organizationId` recorded in internal pilot tracker
