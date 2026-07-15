"""Internal service authentication."""

from fastapi import Header, HTTPException, status

from app.core.config import get_settings


async def verify_internal_token(
    authorization: str | None = Header(default=None),
    x_internal_token: str | None = Header(default=None, alias="X-Internal-Token"),
) -> None:
    settings = get_settings()
    token = None

    if authorization and authorization.startswith("Bearer "):
        token = authorization.removeprefix("Bearer ")
    elif x_internal_token:
        token = x_internal_token

    if not token or token != settings.ai_service_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="توکن سرویس داخلی نامعتبر است",
        )
