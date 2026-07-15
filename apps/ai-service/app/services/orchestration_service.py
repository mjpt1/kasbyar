"""Assistant orchestration foundation."""

from app.core.logging import get_logger
from app.schemas.insights import InsightRequest, InsightResponse
from app.services.insight_service import InsightService

logger = get_logger(__name__)


class OrchestrationService:
    def __init__(self) -> None:
        self._insights = InsightService()

    async def handle_question(self, request: InsightRequest) -> InsightResponse:
        logger.info(
            "orchestration.question org=%s len=%s",
            request.organization_id,
            len(request.question),
        )
        return await self._insights.generate(request)

    async def plan_workflow(self, organization_id: str, intent: str) -> dict:
        logger.info("orchestration.plan org=%s intent=%s", organization_id, intent)
        return {
            "organization_id": organization_id,
            "intent": intent,
            "steps": [],
            "status": "planned",
        }
