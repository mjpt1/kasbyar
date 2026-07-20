from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_v1
from app.core.config import get_settings
from app.core.logging import setup_logging
from app.schemas.insights import HealthResponse
from app.services.llm_service import LlmService

settings = get_settings()
setup_logging(settings.log_level)

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse, tags=["ops"])
async def health() -> HealthResponse:
    """Liveness — process is running (and core AI dependencies are ready)."""
    llm = LlmService()
    if llm.is_configured:
        return HealthResponse(status="ok")
    # LLM endpoints (/api/v1/llm/*) will return 503 when not configured.
    return HealthResponse(status="degraded")


@app.get("/ready", response_model=HealthResponse, tags=["ops"])
async def ready() -> HealthResponse:
    """Readiness — service can accept traffic (extend with DB checks later)."""
    llm = LlmService()
    status = "ok" if llm.is_configured else "degraded"
    return HealthResponse(status=status, service="kesbyar-ai", version="0.1.0")


app.include_router(api_v1)
