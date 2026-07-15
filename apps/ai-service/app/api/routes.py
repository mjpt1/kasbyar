from fastapi import APIRouter, Depends

from app.core.security import verify_internal_token
from app.schemas.insights import (
    AnalyticsHelperRequest,
    AnalyticsHelperResponse,
    DocumentParseRequest,
    DocumentParseResponse,
    InsightRequest,
    InsightResponse,
    OperationalSummaryRequest,
    OperationalSummaryResponse,
)
from app.services.analytics_service import AnalyticsService
from app.services.document_service import DocumentService
from app.services.insight_service import InsightService
from app.services.summary_service import SummaryService

router = APIRouter(tags=["intelligence"], dependencies=[Depends(verify_internal_token)])

insight_service = InsightService()
document_service = DocumentService()
summary_service = SummaryService()
analytics_service = AnalyticsService()


@router.post("/insights", response_model=InsightResponse)
async def generate_insight(request: InsightRequest) -> InsightResponse:
    return await insight_service.generate(request)


@router.post("/summary/operational", response_model=OperationalSummaryResponse)
async def operational_summary(
    request: OperationalSummaryRequest,
) -> OperationalSummaryResponse:
    return await summary_service.operational(request)


@router.post("/analytics/helper", response_model=AnalyticsHelperResponse)
async def analytics_helper(request: AnalyticsHelperRequest) -> AnalyticsHelperResponse:
    return await analytics_service.helper(request)


@router.post("/documents/parse", response_model=DocumentParseResponse)
async def parse_document(request: DocumentParseRequest) -> DocumentParseResponse:
    return await document_service.parse(request)
