# Pilot Onboarding Package — KesbYar

بسته عملی برای onboard کردن مشتریان پایلوت با **کمترین آشوب** — از آماده‌سازی workspace تا go-live و پشتیبانی.

**Audience:** Customer Success، Sales engineering، On-call support  
**Timeline:** 1–2 هفته قبل از دعوت → روز onboarding → هفته 1–2 پایلوت

---

## Package contents

| # | Document | When to use |
|---|----------|-------------|
| 1 | [go-live-readiness.md](./go-live-readiness.md) | قبل از هر pilot جدید |
| 2 | [workspace-setup-checklist.md](./workspace-setup-checklist.md) | ۲۴–۴۸h قبل از جلسه |
| 3 | [onboarding-checklist.md](./onboarding-checklist.md) | حین و بعد جلسه |
| 4 | [operator-quickstart.md](./operator-quickstart.md) | handoff به ADMIN مشتری |
| 5 | [sample-first-workflows.md](./sample-first-workflows.md) | script جلسه ۳۰–۴۵ دقیقه |
| 6 | [pilot-known-limitations.md](./pilot-known-limitations.md) | ایمیل welcome + شفاف‌سازی |
| 7 | [support-escalation.md](./support-escalation.md) | وقتی مشکل پیش آمد |

---

## Pilot definition (KesbYar V1)

| Attribute | Criteria |
|-----------|----------|
| Workspace | real org — not `DEMO_MODE` production |
| Plan | `BUSINESS`+ if assistant needed |
| Users | 1 OWNER + 1–3 STAFF typical |
| Duration | 4–8 weeks evaluation |
| Success | invoice + payment flow without hand-holding |

---

## Roles

| Role | Responsibility |
|------|----------------|
| **CS lead** | checklist owner، ارتباط با مشتری |
| **Ops** | staging/prod workspace، plan، pack |
| **Engineering** | blocker bugs، kill switches |
| **Pilot ADMIN** | مشتری — owner workspace |

---

## Metrics to track

Emit / record when milestones hit:

| Milestone | Metric |
|-----------|--------|
| Workspace ready | manual until API: `metric.workspace.pilot_activated` |
| First invoice | `metric.invoice.created` |
| First payment | `metric.payment.recorded` |
| Assistant used | `metric.assistant.request` |
| Demo → pilot | `metric.pilot.demo_conversion` |

→ [business-metrics-foundation.md](../metrics/business-metrics-foundation.md)

---

## Communication templates

### Welcome (Persian sketch)

> به پایلوت کسب‌یار خوش آمدید. محیط شما آماده است. محدودیت‌های فاز پایلوت: [pilot-known-limitations.md](./pilot-known-limitations.md). پشتیبانی: [support-escalation.md](./support-escalation.md).

### Week 2 check-in

- آیا فاکتور بدون کمک صادر شد؟
- آیا دستیار (در صورت فعال) استفاده شد؟
- بازخورد → `POST_LAUNCH_PRIORITIES.md`

---

## Exit criteria

**Graduate pilot** if:

- [ ] 2+ users active weekly
- [ ] 5+ invoices or equivalent core workflow volume
- [ ] No SEV1 open > 48h
- [ ] Customer confirms value statement

**Pause pilot** if:

- Data loss scare
- Repeated tenant isolation concern
- Customer ghosting 2 weeks — document learnings

---

## Related

- [KNOWN_LIMITATIONS.md](../KNOWN_LIMITATIONS.md)
- [DATA_SAFETY.md](../DATA_SAFETY.md)
- [reliability/operator-response-guide.md](../reliability/operator-response-guide.md)
