from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field


class WalkthroughSectionResponse(BaseModel):
    id: UUID
    section_type: str # OVERVIEW, CRITICAL_PATH, DANGER_ZONE, DATA_FLOW, SETUP_GUIDE
    title: str
    content_markdown: str
    risk_level: Optional[str] = None
    referenced_files: List[Dict[str, Any]] = []
    display_order: int

    class Config:
        from_attributes = True


class OnboardingResponse(BaseModel):
    id: UUID
    repo_id: UUID
    commit_sha: str
    status: str
    summary: Optional[str] = None
    system_diagram_mermaid: Optional[str] = None
    sections: List[WalkthroughSectionResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True


class OnboardingGenerateRequest(BaseModel):
    commit_sha: Optional[str] = Field(default=None, description="Optional specific commit SHA to analyze, defaults to HEAD")
    force_regenerate: bool = Field(default=False)
