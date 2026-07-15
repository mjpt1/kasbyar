"""Analytics helpers — context-grounded summaries."""

from app.core.logging import get_logger
from app.schemas.insights import AnalyticsHelperRequest, AnalyticsHelperResponse

logger = get_logger(__name__)


class AnalyticsService:
    async def helper(self, request: AnalyticsHelperRequest) -> AnalyticsHelperResponse:
        ctx = request.context
        metric = request.metric
        days = request.days

        logger.info(
            "analytics.helper org=%s metric=%s days=%s",
            request.organization_id,
            metric,
            days,
        )

        if metric == "receivables":
            amount = f"{ctx.overdue_receivables:,.0f}".replace(",", "٬")
            return AnalyticsHelperResponse(
                metric=metric,
                summary=(
                    f"مطالبات سررسید گذشته: {amount} ریال در "
                    f"{ctx.overdue_invoice_count} فاکتور"
                ),
                data_points={
                    "overdue_receivables": ctx.overdue_receivables,
                    "overdue_invoice_count": ctx.overdue_invoice_count,
                    "top_customers": ctx.top_overdue_customers[:5],
                },
                status="ok",
            )

        if metric == "pipeline":
            return AnalyticsHelperResponse(
                metric=metric,
                summary=(
                    f"{ctx.active_leads} لید فعال؛ "
                    f"{ctx.stale_lead_count} لید بدون پیگیری اخیر"
                ),
                data_points={
                    "active_leads": ctx.active_leads,
                    "stale_lead_count": ctx.stale_lead_count,
                    "top_stale_leads": ctx.top_stale_leads[:5],
                },
                status="ok",
            )

        if metric == "tasks":
            return AnalyticsHelperResponse(
                metric=metric,
                summary=(
                    f"{ctx.pending_tasks} وظیفه باز؛ "
                    f"{ctx.tasks_due_today} مورد سررسید امروز"
                ),
                data_points={
                    "pending_tasks": ctx.pending_tasks,
                    "tasks_due_today": ctx.tasks_due_today,
                    "titles": ctx.tasks_due_today_titles[:5],
                },
                status="ok",
            )

        # sales_trend placeholder — trend data supplied by web in future
        amount = f"{ctx.today_sales:,.0f}".replace(",", "٬")
        return AnalyticsHelperResponse(
            metric=metric,
            summary=f"فروش امروز {amount} ریال — روند {days} روزه از وب ارسال می‌شود",
            data_points={"today_sales": ctx.today_sales, "days": days},
            status="placeholder",
        )
