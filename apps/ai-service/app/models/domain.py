"""Domain placeholders for future persistence layer."""

from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class OrganizationContext:
    organization_id: str
    workspace_id: str | None = None
    industry_pack: str = "GENERAL"


@dataclass
class InsightContext:
    organization: OrganizationContext
    question: str
    metadata: dict = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.utcnow)
