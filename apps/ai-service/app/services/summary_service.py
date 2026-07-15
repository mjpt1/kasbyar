"""Operational summary generation from workspace context snapshots."""

from app.schemas.insights import (
    OperationalContextSnapshot,
    OperationalSummaryRequest,
    OperationalSummaryResponse,
)


def _format_rial(amount: float) -> str:
    return f"{amount:,.0f}".replace(",", "٬") + " ریال"


class SummaryService:
    async def operational(
        self, request: OperationalSummaryRequest
    ) -> OperationalSummaryResponse:
        ctx = request.context
        highlights: list[str] = []
        lines = ["خلاصه وضعیت عملیات امروز:"]

        lines.append(f"• فروش امروز: {_format_rial(ctx.today_sales)}")
        highlights.append(f"فروش امروز {_format_rial(ctx.today_sales)}")

        if ctx.overdue_receivables > 0:
            lines.append(
                f"• مطالبات سررسید گذشته: {_format_rial(ctx.overdue_receivables)} "
                f"({ctx.overdue_invoice_count} فاکتور)"
            )
            highlights.append("پیگیری مطالبات معوق")
            if ctx.top_overdue_customers:
                names = "، ".join(ctx.top_overdue_customers[:3])
                lines.append(f"  مشتریان: {names}")
        else:
            lines.append("• فاکتور سررسید گذشته‌ای ثبت نشده است.")

        if ctx.stale_lead_count > 0:
            lines.append(f"• {ctx.stale_lead_count} لید بدون پیگیری اخیر")
            highlights.append("پیگیری لیدهای عقب‌افتاده")
            if ctx.top_stale_leads:
                lines.append(f"  نمونه: {'، '.join(ctx.top_stale_leads[:3])}")

        if ctx.tasks_due_today > 0:
            lines.append(f"• {ctx.tasks_due_today} وظیفه با سررسید امروز")
            if ctx.tasks_due_today_titles:
                lines.append(f"  {'؛ '.join(ctx.tasks_due_today_titles[:3])}")

        lines.append(
            f"• {ctx.open_invoices} فاکتور باز و {ctx.active_leads} لید فعال"
        )

        return OperationalSummaryResponse(
            summary="\n".join(lines),
            highlights=highlights,
            confidence=0.88,
        )
