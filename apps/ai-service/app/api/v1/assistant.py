from fastapi import APIRouter, Depends

from app.core.security import verify_internal_token
from app.schemas.insights import InsightRequest, InsightResponse
from app.services.orchestration_service import OrchestrationService

router = APIRouter(
    prefix="/assistant",
    tags=["assistant"],
    dependencies=[Depends(verify_internal_token)],
)

orchestrator = OrchestrationService()


@router.post("/ask", response_model=InsightResponse)
async def ask_assistant(request: InsightRequest) -> InsightResponse:
    return await orchestrator.handle_question(request)
