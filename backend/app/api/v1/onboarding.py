import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.repo import Repository
from app.models.onboarding import OnboardingWalkthrough, WalkthroughSection
from app.schemas.onboarding import (
    OnboardingResponse,
    WalkthroughSectionResponse,
    OnboardingGenerateRequest
)
from app.services.onboarding_engine import OnboardingEngine
from app.workers.tasks import generate_onboarding_task

router = APIRouter(prefix="/onboarding", tags=["Onboarding Assistant"])


@router.post("/{repo_id}/generate", response_model=OnboardingResponse, status_code=status.HTTP_202_ACCEPTED)
async def generate_onboarding_walkthrough(
    repo_id: uuid.UUID,
    payload: OnboardingGenerateRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Generate an AI onboarding walkthrough for the repository (System Overview, Critical Paths, Danger Zones).
    """
    repo = await db.get(Repository, repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    # Run engine directly or queue
    engine = OnboardingEngine()
    walkthrough = await engine.generate_walkthrough(db, repo, payload.commit_sha)

    return await _format_onboarding_response(db, walkthrough.id)


@router.get("/{repo_id}", response_model=OnboardingResponse)
async def get_latest_onboarding_walkthrough(
    repo_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve the most recent onboarding walkthrough and sections for a repository.
    """
    query = (
        select(OnboardingWalkthrough)
        .where(OnboardingWalkthrough.repo_id == repo_id)
        .order_by(OnboardingWalkthrough.created_at.desc())
        .limit(1)
    )
    result = await db.execute(query)
    walkthrough = result.scalar_one_or_none()

    if not walkthrough:
        raise HTTPException(status_code=404, detail="No onboarding walkthrough found. Please generate one.")

    return await _format_onboarding_response(db, walkthrough.id)


async def _format_onboarding_response(db: AsyncSession, walkthrough_id: uuid.UUID) -> OnboardingResponse:
    query = (
        select(OnboardingWalkthrough)
        .options(selectinload(OnboardingWalkthrough.sections))
        .where(OnboardingWalkthrough.id == walkthrough_id)
    )
    res = await db.execute(query)
    walkthrough = res.scalar_one_or_none()

    if not walkthrough:
        raise HTTPException(status_code=404, detail="Walkthrough not found")

    sections_response = [
        WalkthroughSectionResponse(
            id=s.id,
            section_type=s.section_type,
            title=s.title,
            content_markdown=s.content_markdown,
            risk_level=s.risk_level,
            referenced_files=s.referenced_files or [],
            display_order=s.display_order
        )
        for s in walkthrough.sections
    ]

    return OnboardingResponse(
        id=walkthrough.id,
        repo_id=walkthrough.repo_id,
        commit_sha=walkthrough.commit_sha,
        status=walkthrough.status,
        summary=walkthrough.summary,
        system_diagram_mermaid=walkthrough.system_diagram_mermaid,
        sections=sections_response,
        created_at=walkthrough.created_at
    )
