from fastapi import APIRouter

from app.api.routes import router as legacy_router
from app.api.v1.assistant import router as assistant_router

api_v1 = APIRouter(prefix="/api/v1")
api_v1.include_router(legacy_router)
api_v1.include_router(assistant_router)
