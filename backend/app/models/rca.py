import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base


class StackTrace(Base):
    __tablename__ = "stack_traces"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repo_id = Column(UUID(as_uuid=True), ForeignKey("repos.id", ondelete="CASCADE"), nullable=False, index=True)
    source = Column(String(50), default="MANUAL") # MANUAL, SENTRY, DATADOG, GENERIC_WEBHOOK
    raw_payload = Column(Text, nullable=False)
    error_message = Column(Text, nullable=True)
    error_type = Column(String(255), nullable=True)
    parsed_frames = Column(JSONB, nullable=False, default=list)
    environment = Column(String(50), default="production")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    repo = relationship("Repository", back_populates="stack_traces")
    analysis_runs = relationship("AnalysisRun", back_populates="stack_trace", cascade="all, delete-orphan")


class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trace_id = Column(UUID(as_uuid=True), ForeignKey("stack_traces.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="INITIALIZING") # INITIALIZING, RETRIEVING, REASONING, COMPLETED, FAILED
    model_used = Column(String(100), nullable=False)
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    execution_duration_sec = Column(Numeric(6, 2), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    stack_trace = relationship("StackTrace", back_populates="analysis_runs")
    ranked_candidates = relationship("RankedCandidate", back_populates="analysis_run", cascade="all, delete-orphan")


class RankedCandidate(Base):
    __tablename__ = "ranked_candidates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_run_id = Column(UUID(as_uuid=True), ForeignKey("analysis_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    commit_id = Column(UUID(as_uuid=True), ForeignKey("commits.id", ondelete="CASCADE"), nullable=False)
    causal_score = Column(Numeric(4, 3), nullable=False) # 0.000 to 1.000
    rank_position = Column(Integer, nullable=False)
    plain_english_reasoning = Column(Text, nullable=False)
    reproduction_hypothesis = Column(Text, nullable=True)
    suggested_fix = Column(Text, nullable=True)
    matched_files = Column(JSONB, nullable=False, default=list)

    analysis_run = relationship("AnalysisRun", back_populates="ranked_candidates")
    commit = relationship("Commit", back_populates="ranked_candidates")
