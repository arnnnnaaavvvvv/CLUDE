import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, BigInteger, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base, GUID


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    repos = relationship("Repository", back_populates="organization", cascade="all, delete-orphan")


class Repository(Base):
    __tablename__ = "repos"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    org_id = Column(GUID, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    github_repo_id = Column(BigInteger, unique=True, nullable=False)
    full_name = Column(String(255), nullable=False, index=True)
    default_branch = Column(String(100), default="main")
    is_private = Column(Boolean, default=True)
    encrypted_access_token = Column(Text, nullable=True)
    
    indexing_status = Column(String(50), default="PENDING")
    last_indexed_sha = Column(String(40), nullable=True)
    last_indexed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization", back_populates="repos")
    commits = relationship("Commit", back_populates="repo", cascade="all, delete-orphan")
    embeddings = relationship("CodeEmbedding", back_populates="repo", cascade="all, delete-orphan")
    stack_traces = relationship("StackTrace", back_populates="repo", cascade="all, delete-orphan")
    walkthroughs = relationship("OnboardingWalkthrough", back_populates="repo", cascade="all, delete-orphan")
