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

        # sales_trend — uses v2 context when available
        week_sales = ctx.week_sales if ctx.week_sales is not None else ctx.today_sales
        change = ctx.week_sales_change_pct
        amount = f"{week_sales:,.0f}".replace(",", "٬")
        if change is not None:
            direction = "افزایش" if change >= 0 else "کاهش"
            summary = (
                f"فروش هفتگی {amount} ریال — {direction} {abs(change):.1f}٪ نسبت به هفته قبل"
            )
        else:
            today = f"{ctx.today_sales:,.0f}".replace(",", "٬")
            summary = f"فروش امروز {today} ریال؛ فروش هفتگی {amount} ریال"
        return AnalyticsHelperResponse(
            metric=metric,
            summary=summary,
            data_points={
                "today_sales": ctx.today_sales,
                "week_sales": week_sales,
                "week_sales_change_pct": change,
                "days": days,
            },
            status="ok",
        )
