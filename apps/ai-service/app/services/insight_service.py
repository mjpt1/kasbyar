"""Business insight generation — grounded in operational context when provided."""

from app.schemas.insights import (
    InsightRequest,
    InsightResponse,
    OperationalContextSnapshot,
    OperationalSummaryRequest,
)
from app.services.summary_service import SummaryService


def _coerce_context(raw: OperationalContextSnapshot | dict) -> OperationalContextSnapshot | None:
    if isinstance(raw, OperationalContextSnapshot):
        return raw
    if isinstance(raw, dict) and "today_sales" in raw:
        return OperationalContextSnapshot.model_validate(raw)
    return None


class InsightService:
    def __init__(self) -> None:
        self._summary = SummaryService()

    async def generate(self, request: InsightRequest) -> InsightResponse:
        question = request.question.strip()
        ctx = _coerce_context(request.context)

        if ctx is not None:
            return await self._answer_with_context(question, ctx)

        return InsightResponse(
            answer=(
                "برای پاسخ دقیق‌تر، زمینهٔ عملیاتی سازمان ارسال نشده است. "
                "لطفاً از طریق برنامهٔ وب سؤال خود را مطرح کنید."
            ),
            confidence=0.3,
            sources=[],
            degraded=True,
        )

    async def _answer_with_context(
        self, question: str, ctx: OperationalContextSnapshot
    ) -> InsightResponse:
        if "فروش" in question and "امروز" in question:
            amount = f"{ctx.today_sales:,.0f}".replace(",", "٬")
            return InsightResponse(
                answer=f"فروش امروز شما {amount} ریال است.",
                confidence=0.92,
                sources=["dashboard", "context"],
            )

        if "بدهکار" in question or "مطالبات" in question or "سررسید" in question:
            if ctx.overdue_invoice_count == 0:
                return InsightResponse(
                    answer="در حال حاضر فاکتور سررسید گذشته‌ای ندارید.",
                    confidence=0.9,
                    sources=["invoices", "context"],
                )
            names = "\n".join(f"• {n}" for n in ctx.top_overdue_customers[:5])
            amount = f"{ctx.overdue_receivables:,.0f}".replace(",", "٬")
            return InsightResponse(
                answer=(
                    f"{ctx.overdue_invoice_count} فاکتور سررسید گذشته "
                    f"به مبلغ {amount} ریال:\n{names}"
                ),
                confidence=0.88,
                sources=["invoices", "reports", "context"],
            )

        if "لید" in question or "پیگیری" in question:
            if ctx.stale_lead_count == 0:
                return InsightResponse(
                    answer="لید بدون پیگیری در هفتهٔ اخیر ندارید.",
                    confidence=0.9,
                    sources=["leads", "context"],
                )
            titles = "\n".join(f"• {t}" for t in ctx.top_stale_leads[:5])
            return InsightResponse(
                answer=f"{ctx.stale_lead_count} لید نیاز به پیگیری دارند:\n{titles}",
                confidence=0.88,
                sources=["leads", "context"],
            )

        if "وظیفه" in question or "کار" in question:
            if ctx.tasks_due_today == 0:
                return InsightResponse(
                    answer="وظیفه‌ای با سررسید امروز ندارید.",
                    confidence=0.85,
                    sources=["tasks", "context"],
                )
            titles = "\n".join(f"• {t}" for t in ctx.tasks_due_today_titles[:5])
            return InsightResponse(
                answer=f"{ctx.tasks_due_today} وظیفه برای امروز:\n{titles}",
                confidence=0.85,
                sources=["tasks", "context"],
            )

        if "خلاصه" in question or "وضعیت" in question:
            summary = await self._summary.operational(
                OperationalSummaryRequest(organization_id="", context=ctx)
            )
            return InsightResponse(
                answer=summary.summary,
                confidence=summary.confidence,
                sources=["summary", "context"],
            )

        return InsightResponse(
            answer=(
                "سؤال شما دریافت شد. برای جزئیات بیشتر از داشبورد، "
                "گزارش‌ها یا ماژول‌های مربوطه استفاده کنید."
            ),
            confidence=0.55,
            sources=["context"],
        )
