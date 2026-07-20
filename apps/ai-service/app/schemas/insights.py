"""Pydantic schemas for internal intelligence API."""

from datetime import datetime

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "kesbyar-ai"
    version: str = "0.1.0"


class OperationalContextSnapshot(BaseModel):
    today_sales: float = 0
    open_invoices: int = 0
    overdue_receivables: float = 0
    active_leads: int = 0
    pending_tasks: int = 0
    tasks_due_today: int = 0
    stale_lead_count: int = 0
    overdue_invoice_count: int = 0
    top_overdue_customers: list[str] = Field(default_factory=list)
    top_stale_leads: list[str] = Field(default_factory=list)
    tasks_due_today_titles: list[str] = Field(default_factory=list)
    week_sales: float | None = None
    month_sales: float | None = None
    week_sales_change_pct: float | None = None
    new_customers_month: int | None = None
    cash_received_month: float | None = None


class OperationalSummaryRequest(BaseModel):
    organization_id: str = Field(..., description="شناسه سازمان")
    context: OperationalContextSnapshot


class OperationalSummaryResponse(BaseModel):
    summary: str
    highlights: list[str] = Field(default_factory=list)
    confidence: float = 0.0
    generated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class InsightRequest(BaseModel):
    organization_id: str = Field(..., description="شناسه سازمان")
    question: str = Field(..., min_length=1, max_length=2000)
    context: OperationalContextSnapshot | dict = Field(default_factory=dict)


class InsightResponse(BaseModel):
    answer: str
    confidence: float = 0.0
    sources: list[str] = Field(default_factory=list)
    degraded: bool = False


class DocumentParseRequest(BaseModel):
    organization_id: str
    file_name: str
    mime_type: str
    content_base64: str | None = None


class DocumentParseResponse(BaseModel):
    extracted_text: str = ""
    fields: dict = Field(default_factory=dict)
    document_type: str | None = None
    status: str = "ready"
    message: str | None = None


class AnalyticsHelperRequest(BaseModel):
    organization_id: str
    metric: str = Field(..., pattern="^(sales_trend|receivables|pipeline|tasks)$")
    context: OperationalContextSnapshot
    days: int = Field(default=7, ge=1, le=90)


class AnalyticsHelperResponse(BaseModel):
    metric: str
    summary: str
    data_points: dict = Field(default_factory=dict)
    status: str = "ok"


class ServiceErrorResponse(BaseModel):
    code: str
    message: str
    detail: str | None = None
