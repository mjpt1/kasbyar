# AI Business OS — Feature Registry

مرجع حاکم: [PROJECT_CONSTITUTION.md](../constitution/PROJECT_CONSTITUTION.md)

| # | قابلیت | فاز | مالک دامنه | مدل داده | API | تست | Audit |
|---|--------|-----|------------|----------|-----|-----|-------|
| 1 | AI CEO | 1 | `briefing/` | HealthScoreSnapshot, AgentRun | `/api/briefing` | unit + integration | yes |
| 2 | Digital Twin | 1–2 | domain graph | Task FKs, MessageThread, DomainEvent | `/api/twin` | unit | yes |
| 3 | Business Memory | 1 | `memory/` | MemoryDocument, MemoryChunk | `/api/memory` | unit + integration | yes |
| 4 | پیش‌بینی | 2 | `forecast/` | ForecastSnapshot | `/api/forecast` | unit | no |
| 5 | AI کارکنان | 2 | `intelligence/agents/` | AgentRun | `/api/conversation` | integration | yes |
| 6 | اتوماسیون | 2 | `automation/` | AutomationRule, DomainEvent | `/api/automation` | unit | yes |
| 7 | احساسات | 2 | `sentiment/` | CustomerSentiment | internal | unit | no |
| 8 | موتور استراتژی | 3 | `strategy/` | StrategyPlan | `/api/strategy` | unit | yes |
| 9 | شبیه‌سازی | 3 | `simulation/` | SimulationRun | `/api/simulation` | unit | no |
| 10 | اتاق فرمان | 1 | `briefing/` | HealthScoreSnapshot | `/api/briefing` | e2e | no |
| 11 | AI رقبا | 4 | `competitors/` | CompetitorSnapshot | `/api/competitors` | unit | no |
| 12 | هوش بازار | 4 | `market/` | MarketSignal | `/api/market` | unit | no |
| 13 | تولید محتوا | 4 | `content/` | ContentDraft | `/api/content` | unit | yes |
| 14 | AI SEO | 4 | `seo/` | SeoTask | `/api/seo` | unit | yes |
| 15 | دستیار جلسه | 2 | `meetings/` | Meeting, MeetingTranscript | `/api/meetings` | integration | yes |
| 16 | امتیاز سلامت | 1 | `health/` | HealthScoreSnapshot | `/api/health` | unit | no |
| 17 | چت با شرکت | 1 | `intelligence/` | ConversationSession/Message | `/api/conversation` | integration | yes |
| 18 | Marketplace | 5 | `marketplace/` | PluginManifest | `/api/marketplace` | integration | yes |
| 19 | Agent SDK | 5 | `packages/agent-sdk` | — | SDK | unit | n/a |
| 20 | یادگیری شرکت | 5 | `learning/` | AgentFeedback | internal | unit | yes |

## معیار پذیرش فاز ۱

1. پاسخ حافظه با citation
2. اتاق فرمان روزانه
3. نمره سلامت ۵ بعدی
4. ایجاد وظیفه از چت با تأیید
5. fallback بدون crash در outage LLM
