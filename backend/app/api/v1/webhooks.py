from fastapi import APIRouter, Request, HTTPException, Header, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_github_signature
from app.models.repo import Repository
from app.models.rca import StackTrace
from app.services.stack_trace_parser import StackTraceParser
from app.services.rca_engine import RCAEngine

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


@router.post("/github")
async def github_webhook(
    request: Request,
    x_hub_signature_256: str = Header(None),
    x_github_event: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Receive GitHub push events and trigger incremental indexing.
    """
    body = await request.body()
    if not verify_github_signature(body, x_hub_signature_256, settings.GITHUB_WEBHOOK_SECRET):
        raise HTTPException(status_code=401, detail="Invalid HMAC signature")

    if x_github_event != "push":
        return {"status": "ignored", "event": x_github_event}

    payload = await request.json()
    repo_github_id = payload.get("repository", {}).get("id")
    
    # Locate registered repo
    repo_res = await db.execute(
        select(Repository).where(Repository.github_repo_id == repo_github_id)
    )
    repo = repo_res.scalar_one_or_none()
    if not repo:
        return {"status": "repository_not_tracked"}

    # Update commit SHA and trigger indexing
    head_sha = payload.get("after")
    if head_sha:
        repo.last_indexed_sha = head_sha
        await db.commit()

    return {"status": "queued_incremental_sync", "head_sha": head_sha}


@router.post("/sentry")
async def sentry_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Receive Sentry issue webhook and automatically trigger Root-Cause Analysis.
    """
    payload = await request.json()
    event = payload.get("event", {})
    raw_message = event.get("title") or payload.get("message") or "Sentry Error"
    
    # Extract stacktrace from Sentry event format
    entries = event.get("entries", [])
    stack_text = raw_message
    for entry in entries:
        if entry.get("type") == "exception":
            values = entry.get("data", {}).get("values", [])
            for val in values:
                stack_text += f"\n{val.get('type')}: {val.get('value')}"
                for frame in val.get("stacktrace", {}).get("frames", []):
                    stack_text += f"\n  at {frame.get('function')} ({frame.get('filename')}:{frame.get('lineno')})"

    # Associate with first available repo for webhook ingestion
    repo_res = await db.execute(select(Repository).limit(1))
    repo = repo_res.scalar_one_or_none()
    if not repo:
        return {"status": "error", "message": "No repositories connected to analyze Sentry event."}

    parsed = StackTraceParser.parse(stack_text)
    trace_record = StackTrace(
        repo_id=repo.id,
        source="SENTRY",
        raw_payload=stack_text,
        error_message=parsed["error_message"],
        error_type=parsed["error_type"],
        parsed_frames=[f.dict() for f in parsed["frames"]],
        environment=event.get("environment", "production")
    )
    db.add(trace_record)
    await db.commit()
    await db.refresh(trace_record)

    engine = RCAEngine()
    run = await engine.execute_analysis(db, trace_record, parsed["frames"])

    return {
        "status": "ANALYSIS_COMPLETED",
        "trace_id": str(trace_record.id),
        "analysis_run_id": str(run.id)
    }
