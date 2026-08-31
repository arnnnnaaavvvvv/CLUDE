import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.repo import Repository
from app.models.rca import StackTrace, AnalysisRun, RankedCandidate
from app.models.commit import Commit
from app.schemas.rca import (
    StackTraceRequest,
    AnalysisRunResponse,
    RankedCandidateResponse,
    CandidateCommit,
    ParsedStackFrame
)
from app.services.stack_trace_parser import StackTraceParser
from app.services.rca_engine import RCAEngine

router = APIRouter(prefix="/rca", tags=["Root Cause Analysis"])


@router.post("/analyze", response_model=AnalysisRunResponse)
async def analyze_stack_trace(
    payload: StackTraceRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Ingest a stack trace / error log, correlate against indexed commits,
    and use LLM reasoning to rank candidate commits by causal likelihood.
    """
    repo = await db.get(Repository, payload.repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    # 1. Parse Stack Trace across languages
    parsed = StackTraceParser.parse(payload.raw_trace)

    # 2. Persist Stack Trace Record
    trace_record = StackTrace(
        repo_id=repo.id,
        source=payload.source,
        raw_payload=payload.raw_trace,
        error_message=parsed["error_message"],
        error_type=parsed["error_type"],
        parsed_frames=[f.dict() for f in parsed["frames"]],
        environment=payload.environment
    )
    db.add(trace_record)
    await db.commit()
    await db.refresh(trace_record)

    # 3. Execute LLM Causal Analysis Engine
    engine = RCAEngine()
    analysis_run = await engine.execute_analysis(
        session=db,
        trace_record=trace_record,
        frames=parsed["frames"],
        time_window_days=payload.time_window_days
    )

    # 4. Reload and return formatted response
    return await _format_analysis_run_response(db, analysis_run.id)


@router.get("/runs/{run_id}", response_model=AnalysisRunResponse)
async def get_analysis_run(run_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Retrieve an existing root cause analysis run by UUID."""
    return await _format_analysis_run_response(db, run_id)


async def _format_analysis_run_response(db: AsyncSession, run_id: uuid.UUID) -> AnalysisRunResponse:
    query = (
        select(AnalysisRun)
        .options(
            selectinload(AnalysisRun.stack_trace),
            selectinload(AnalysisRun.ranked_candidates).selectinload(RankedCandidate.commit)
        )
        .where(AnalysisRun.id == run_id)
    )
    res = await db.execute(query)
    run = res.scalar_one_or_none()

    if not run:
        raise HTTPException(status_code=404, detail="Analysis run not found")

    trace = run.stack_trace
    frames = [ParsedStackFrame(**f) for f in (trace.parsed_frames or [])]

    ranked_items: List[RankedCandidateResponse] = []
    # Sort candidates by rank position
    sorted_candidates = sorted(run.ranked_candidates, key=lambda x: x.rank_position)

    for rc in sorted_candidates:
        commit_obj = rc.commit
        candidate_commit = CandidateCommit(
            sha=commit_obj.commit_sha,
            author_name=commit_obj.author_name,
            author_email=commit_obj.author_email,
            commit_message=commit_obj.commit_message,
            committed_at=commit_obj.committed_at
        )
        ranked_items.append(RankedCandidateResponse(
            rank=rc.rank_position,
            causal_score=float(rc.causal_score),
            commit=candidate_commit,
            plain_english_reasoning=rc.plain_english_reasoning,
            reproduction_hypothesis=rc.reproduction_hypothesis,
            suggested_fix=rc.suggested_fix,
            matched_files=rc.matched_files or []
        ))

    return AnalysisRunResponse(
        analysis_run_id=run.id,
        trace_id=trace.id,
        repo_id=trace.repo_id,
        status=run.status,
        error_type=trace.error_type,
        error_message=trace.error_message,
        parsed_frames=frames,
        execution_duration_sec=float(run.execution_duration_sec) if run.execution_duration_sec else None,
        model_used=run.model_used,
        ranked_candidates=ranked_items,
        created_at=run.created_at
    )
