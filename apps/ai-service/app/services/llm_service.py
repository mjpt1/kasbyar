"""OpenAI-compatible LLM and embedding service."""

from __future__ import annotations

import logging
from typing import Any

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class LlmService:
    def __init__(self) -> None:
        self.settings = get_settings()

    @property
    def is_configured(self) -> bool:
        return bool(self.settings.llm_api_url and self.settings.llm_api_key)

    async def chat(
        self,
        messages: list[dict[str, str]],
        *,
        system_prompt: str | None = None,
        temperature: float = 0.3,
        max_tokens: int = 1500,
    ) -> dict[str, Any]:
        if not self.is_configured:
            raise RuntimeError("LLM not configured")

        payload_messages: list[dict[str, str]] = []
        if system_prompt:
            payload_messages.append({"role": "system", "content": system_prompt})
        payload_messages.extend(messages)

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.settings.llm_api_url.rstrip('/')}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.settings.llm_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.settings.llm_model,
                    "messages": payload_messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                },
            )
            response.raise_for_status()
            data = response.json()

        content = data["choices"][0]["message"]["content"]
        return {
            "content": content.strip(),
            "model": data.get("model", self.settings.llm_model),
            "usage": data.get("usage", {}),
        }

    async def embed(self, texts: list[str]) -> dict[str, Any]:
        if not self.is_configured:
            raise RuntimeError("LLM not configured")
        if not texts:
            return {"embeddings": [], "model": self.settings.embedding_model, "dimensions": 0}

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.settings.llm_api_url.rstrip('/')}/embeddings",
                headers={
                    "Authorization": f"Bearer {self.settings.llm_api_key}",
                    "Content-Type": "application/json",
                },
                json={"model": self.settings.embedding_model, "input": texts},
            )
            response.raise_for_status()
            data = response.json()

        embeddings = [item["embedding"] for item in data["data"]]
        dimensions = len(embeddings[0]) if embeddings else 0
        return {
            "embeddings": embeddings,
            "model": data.get("model", self.settings.embedding_model),
            "dimensions": dimensions,
        }
