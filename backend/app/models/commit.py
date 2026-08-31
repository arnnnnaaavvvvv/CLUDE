import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base, GUID, JSONType


class Commit(Base):
    __tablename__ = "commits"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    repo_id = Column(GUID, ForeignKey("repos.id", ondelete="CASCADE"), nullable=False, index=True)
    commit_sha = Column(String(40), nullable=False, index=True)
    author_name = Column(String(255), nullable=True)
    author_email = Column(String(255), nullable=True)
    commit_message = Column(Text, nullable=False)
    committed_at = Column(DateTime(timezone=True), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    repo = relationship("Repository", back_populates="commits")
    diffs = relationship("Diff", back_populates="commit", cascade="all, delete-orphan")
    ranked_candidates = relationship("RankedCandidate", back_populates="commit")


class Diff(Base):
    __tablename__ = "diffs"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    commit_id = Column(GUID, ForeignKey("commits.id", ondelete="CASCADE"), nullable=False, index=True)
    file_path = Column(Text, nullable=False, index=True)
    change_type = Column(String(20), nullable=False)
    patch_content = Column(Text, nullable=True)
    parsed_hunks = Column(JSONType, nullable=False, default=list)
    token_count = Column(Integer, default=0)

    commit = relationship("Commit", back_populates="diffs")
