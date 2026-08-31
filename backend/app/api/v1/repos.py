import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.repo import Organization, Repository
from app.models.commit import Commit
from app.models.embedding import CodeEmbedding
from app.schemas.repo import RepoConnectRequest, RepoResponse, IndexStatusResponse
from app.core.security import encrypt_token
from app.workers.tasks import index_repository_task

router = APIRouter(prefix="/repos", tags=["Repositories"])


@router.post("/connect", response_model=RepoResponse, status_code=status.HTTP_202_ACCEPTED)
async def connect_repository(
    payload: RepoConnectRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Connect a GitHub repository and initiate background indexing.
    """
    # Find or create default organization
    org_res = await db.execute(select(Organization).limit(1))
    org = org_res.scalar_one_or_none()
    if not org:
        org = Organization(name="Default Organization")
        db.add(org)
        await db.flush()

    # Check if repo already connected
    existing_repo = await db.execute(
        select(Repository).where(Repository.github_repo_id == payload.github_repo_id)
    )
    repo = existing_repo.scalar_one_or_none()

    if not repo:
        repo = Repository(
            org_id=org.id,
            github_repo_id=payload.github_repo_id,
            full_name=payload.full_name,
            default_branch=payload.default_branch,
            is_private=payload.is_private,
            encrypted_access_token=encrypt_token(payload.access_token) if payload.access_token else None,
            indexing_status="PENDING"
        )
        db.add(repo)
        await db.commit()
        await db.refresh(repo)
    else:
        # Update token if provided
        if payload.access_token:
            repo.encrypted_access_token = encrypt_token(payload.access_token)
            await db.commit()

    # Enqueue indexing task
    try:
        index_repository_task.delay(str(repo.id))
    except Exception:
        # Fallback to FastAPI background task if Celery broker is not running in test mode
        from app.workers.tasks import _async_index_repository
        background_tasks.add_task(_async_index_repository, repo.id)

    return repo


@router.get("", response_model=List[RepoResponse])
async def list_repositories(db: AsyncSession = Depends(get_db)):
    """List all connected repositories."""
    result = await db.execute(select(Repository).order_by(Repository.created_at.desc()))
    return list(result.scalars().all())


@router.get("/{repo_id}/index-status", response_model=IndexStatusResponse)
async def get_repository_index_status(repo_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Get the current AST & vector indexing progress for a repository."""
    repo = await db.get(Repository, repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    commits_count = await db.scalar(
        select(func.count(Commit.id)).where(Commit.repo_id == repo.id)
    ) or 0

    embeddings_count = await db.scalar(
        select(func.count(CodeEmbedding.id)).where(CodeEmbedding.repo_id == repo.id)
    ) or 0

    return IndexStatusResponse(
        repo_id=repo.id,
        full_name=repo.full_name,
        indexing_status=repo.indexing_status or "PENDING",
        indexed_commits_count=commits_count,
        embeddings_count=embeddings_count,
        last_indexed_sha=repo.last_indexed_sha,
        last_indexed_at=repo.last_indexed_at
    )
