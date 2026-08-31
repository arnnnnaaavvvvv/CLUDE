from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field


class ParsedStackFrame(BaseModel):
    file_path: str = Field(..., description="Normalized relative file path in repository")
    line_number: int = Field(..., description="Line number of exception call")
    column_number: Optional[int] = None
    function_name: Optional[str] = None
    raw_frame_text: str


class StackTraceRequest(BaseModel):
    repo_id: UUID = Field(..., description="Target repository UUID")
    raw_trace: str = Field(..., description="Raw text of the stack trace or error log")
    environment: str = Field(default="production", description="Environment e.g. production, staging")
    source: str = Field(default="MANUAL", description="Source of the error log")
    time_window_days: int = Field(default=14, description="Days of git history to correlate against")
    stream: bool = Field(default=False, description="Whether to stream LLM reasoning tokens via SSE")


class CandidateCommit(BaseModel):
    sha: str
    author_name: Optional[str] = None
    author_email: Optional[str] = None
    commit_message: str
    committed_at: datetime


class RankedCandidateResponse(BaseModel):
    rank: int
    causal_score: float = Field(..., ge=0.0, le=1.0)
    commit: CandidateCommit
    plain_english_reasoning: str
    reproduction_hypothesis: Optional[str] = None
    suggested_fix: Optional[str] = None
    matched_files: List[str] = []


class AnalysisRunResponse(BaseModel):
    analysis_run_id: UUID
    trace_id: UUID
    repo_id: UUID
    status: str
    error_type: Optional[str] = None
    error_message: Optional[str] = None
    parsed_frames: List[ParsedStackFrame] = []
    execution_duration_sec: Optional[float] = None
    model_used: str
    ranked_candidates: List[RankedCandidateResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True
