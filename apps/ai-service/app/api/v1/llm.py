"""LLM chat and embedding endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.core.security import verify_internal_token
from app.services.llm_service import LlmService

router = APIRouter(prefix="/llm", tags=["llm"], dependencies=[Depends(verify_internal_token)])
llm_service = LlmService()


class ChatMessage(BaseModel):
    role: str
    content: str


class LlmChatRequest(BaseModel):
    messages: list[ChatMessage]
    system_prompt: str | None = None
    temperature: float = Field(default=0.3, ge=0, le=2)
    max_tokens: int = Field(default=1500, ge=1, le=8000)


class LlmChatResponse(BaseModel):
    content: str
    model: str
    usage: dict = Field(default_factory=dict)


class LlmEmbedRequest(BaseModel):
    texts: list[str] = Field(..., min_length=1, max_length=100)


class LlmEmbedResponse(BaseModel):
    embeddings: list[list[float]]
    model: str
    dimensions: int


@router.post("/chat", response_model=LlmChatResponse)
async def chat(request: LlmChatRequest) -> LlmChatResponse:
    if not llm_service.is_configured:
        raise HTTPException(status_code=503, detail="LLM not configured")
    result = await llm_service.chat(
        [m.model_dump() for m in request.messages],
        system_prompt=request.system_prompt,
        temperature=request.temperature,
        max_tokens=request.max_tokens,
    )
    return LlmChatResponse(**result)


@router.post("/embed", response_model=LlmEmbedResponse)
async def embed(request: LlmEmbedRequest) -> LlmEmbedResponse:
    if not llm_service.is_configured:
        raise HTTPException(status_code=503, detail="LLM not configured")
    result = await llm_service.embed(request.texts)
    return LlmEmbedResponse(**result)
